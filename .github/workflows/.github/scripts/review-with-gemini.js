const { GoogleGenerativeAI } = require('@google/generative-ai');
const { execSync } = require('child_process');
const { Octokit } = require("@octokit/rest");

const apiKey = process.env.GEMINI_API_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const prNumber = process.env.PR_NUMBER;
const repo = process.env.GITHUB_REPOSITORY;

if (!prNumber || !repo) {
  console.error("Missing PR_NUMBER or GITHUB_REPOSITORY env vars");
  process.exit(1);
}

const [owner, repoName] = repo.split("/");

const genAI = new GoogleGenerativeAI(apiKey);
const octokit = new Octokit({ auth: githubToken });

async function runReview() {
  const diff = execSync('git diff origin/main...HEAD').toString();

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
You are a technical code reviewer. Be concise and to the point.
Comment only on meaningful issues: architecture, performance, readability, bugs, or style violations.

Here is a Git diff from a GitHub Pull Request:
${diff}
`;

  console.log("Generating review...");
  const result = await model.generateContent(prompt);
  const reviewText = result.response.text();

  // Post as PR comment
  await octokit.issues.createComment({
    owner,
    repo: repoName,
    issue_number: parseInt(prNumber),
    body: `🤖 **Gemini Review**\n\n${reviewText}`
  });

  console.log("✅ Review comment posted to PR!");
}

runReview().catch(err => {
  console.error("❌ Error running review:", err);
  process.exit(1);
});
