import { execSync } from "child_process";
import fs from "fs";
import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TOKEN_GITHUB     = process.env.TOKEN_GITHUB;
const REPO             = process.env.GITHUB_REPOSITORY;
const PR_NUMBER        = process.env.PR_NUMBER;

function run(command) {
  return execSync(command, { stdio: ["pipe", "pipe", "ignore"] })
    .toString()
    .trim();
}

function getChangedFiles() {
  try {
    const diffCmd = "git diff --name-only --diff-filter=ACMRT origin/main...HEAD";
    const diffOutput = run(diffCmd);
    return diffOutput
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f);
  } catch (err) {
    console.error("❌ Error running git diff:", err.message);
    throw err;
  }
}

async function getFileContent(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File not found: ${filePath}, skipping…`);
    return `// WARNING: File not found: ${filePath}`;
  }

  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    console.warn(`⚠️ Cannot read file: ${filePath}`, err.message);
    return `// ERROR: Cannot read file: ${filePath}`;
  }
}

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "(no response)";
}

async function commentOnPR(body) {
  const url = `https://api.github.com/repos/${REPO}/issues/${PR_NUMBER}/comments`;
  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN_GITHUB}`,
      "Accept": "application/vnd.github+json",
    },
    body: JSON.stringify({ body }),
  });
}

async function runReview() {
  const files = getChangedFiles();
  if (!files.length) {
    console.log("✅ No changed files");
    return;
  }

  let prompt = `You are an experienced code reviewer, AI level Copilot X. Review the following files.
    Your task:
    - Check logic, style, architecture.
    - Compare with official documentation and articles from MDN, Google, Microsoft.
    - Give specific and brief comments.
    - Don't write the obvious.
    - Write only the important.
    - If you are not sure about something, state it explicitly (Confidence: Low).
    Start analysis:
  `;

  for (const file of files) {
    const content = await getFileContent(file);
    prompt += `\n\nFile: ${file}\n\`\`\`\n${content.slice(0, 100000)}\n\`\`\``;
  }

  console.log("📝 Sending prompt to Gemini...");
  const review = await callGemini(prompt);
  console.log("📄 Gemini Review:\n", review);

  await commentOnPR("💡 **Gemini Review**:\n\n" + review);
}

runReview().catch((err) => {
  console.error("❌ Error running review:", err);
  process.exit(1);
});
