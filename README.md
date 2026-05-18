# Claude Quest

A timed practice exam app for the **Claude Certified Architect** certification. Randomly selects questions from scenario-based question banks and simulates the real exam experience.

## What it does

- Randomly picks 4 out of 6 scenarios per session
- Selects 15 questions from each selected scenario (60 questions total)
- 90-minute countdown timer that auto-submits when it runs out
- Answers lock after submission — correct answer and explanation shown immediately
- Scenario transition screen between each group of 15 questions
- Results page with score, pass/fail verdict (72% threshold), and a full review of incorrect and unanswered questions grouped by scenario

## Requirements

- Node.js 20.9+
- Yarn

## Getting started

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Adding question files

Place your Markdown question files in the `/questions` folder at the project root. The app expects **at least 4 files** (one per scenario), each with at least 15 questions.

### File format

Each file must follow this structure:

```markdown
# Scenario Name

## Question 1

Question text goes here?

A) Option one
B) Option two
C) Option three
D) Option four

**Answer:** B

**Explanation:** Why B is correct and the other options are not.

## Question 2
...
```

Rules:
- First line must be a `#` heading — this becomes the scenario name shown during the quiz
- Each question starts with `## Question N`
- Options use `A)` `B)` `C)` `D)` format
- Correct answer is `**Answer:** X` where X is A, B, C, or D
- `**Explanation:**` is optional but recommended — shown after the answer is locked

### Converting existing files

If your question files use a different format, a conversion script is included:

```bash
node scripts/convert-questions.js
```

This converts from the original `**Question N:**` inline format to the `## Question N` heading format. Backups are created as `*.bak` files before any changes are made.

## How the exam works

1. Click **Start Exam** on the landing page
2. Answer each question and click **Check answer** to lock it and see the explanation
3. Click **Next →** to move to the next question
4. A transition screen appears between scenarios
5. Use **Finish Exam** at any time — a confirmation dialog will show how many questions remain unanswered
6. The results page shows your score, pass/fail status, and a full review of every question you got wrong or skipped

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- React 19
- TypeScript
- CSS Modules (no UI framework)
