import { execSync } from 'child_process';
import fetch from 'node-fetch';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TOKEN_GITHUB = process.env.TOKEN_GITHUB;
const REPO = process.env.GITHUB_REPOSITORY;
const PR_NUMBER = process.env.PR_NUMBER;

function run(command) {
  return execSync(command).toString().trim();
}

function getChangedFiles() {
  try {
    const diffOutput = run('git diff --name-only origin/main...HEAD');
    return diffOutput.split('\n').filter(Boolean);
  } catch (err) {
    console.error('❌ Error running git diff:', err.message);
    throw err;
  }
}

async function getFileContent(filePath) {
  return run(`cat ${filePath}`);
}

async function callGemini(prompt) {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '(no response)';
}

async function commentOnPR(body) {
  const url = `https://api.github.com/repos/${REPO}/issues/${PR_NUMBER}/comments`;
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN_GITHUB}`,
      'Accept': 'application/vnd.github+json'
    },
    body: JSON.stringify({ body })
  });
}

async function runReview() {
  const files = getChangedFiles();
  if (!files.length) {
    console.log('✅ No changed files');
    return;
  }

  let prompt = 'Act as a strict and concise senior code reviewer. Point out only important issues in the following files:\n';

  for (const file of files) {
    const content = await getFileContent(file);
    prompt += `\n\nFile: ${file}\n\`\`\`\n${content.slice(0, 3000)}\n\`\`\``;
  }

  const review = await callGemini(prompt);
  console.log('📄 Gemini Review:\n', review);
  await commentOnPR('💡 **Gemini Review**:\n\n' + review);
}

runReview().catch(err => {
  console.error('❌ Error running review:', err);
  process.exit(1);
});
