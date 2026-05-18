# Plan: Claude Certified Architect Quiz App

## Context

Building a timed practice quiz app inside the existing `claude-quest` Next.js 16.2.6 project. The user has 6 Markdown files (one per scenario, 60 questions each) from the Claude Certified Architect certification. The quiz randomly picks 4 of the 6 scenarios, then 15 random questions from each, producing a 60-question timed exam. Results show score, pass/fail (72% threshold = 44/60), and a wrong-answer review.

---

## Question File Format

Place 6 files in `/questions/` at the project root. Each file must follow this structure:

```markdown
# Scenario Name Here

## Question 1

Question text goes here?

A. Option one
B. Option two
C. Option three
D. Option four

**Answer: B**

**Explanation:** Optional explanation of why B is correct.

## Question 2
...
```

Rules:
- `# Title` at top = scenario name (used in results screen)
- `## Question N` marks each question block
- Options are `A.` `B.` `C.` `D.` (single letter + period + space)
- `**Answer: X**` where X is A, B, C, or D
- `**Explanation:**` is optional

---

## App Structure

```
/questions/               ← user drops 6 .md files here
src/
  types/
    quiz.ts               ← Question, Scenario, QuizSession types
  lib/
    parseQuestions.ts     ← fs + regex MD parser, returns Scenario[]
    quizEngine.ts         ← pick4Scenarios(), pick15Questions() helpers
  app/
    globals.css           ← extend with quiz-specific CSS vars
    page.tsx              ← Landing page (start screen)
    quiz/
      page.tsx            ← Server component: reads files, passes to client
      QuizClient.tsx      ← 'use client' — all quiz interaction + timer
    results/
      page.tsx            ← Server component shell
      ResultsClient.tsx   ← 'use client' — score, review, pass/fail display
```

---

## Key Implementation Details

### Types (`src/types/quiz.ts`)
```ts
type Option = 'A' | 'B' | 'C' | 'D'

interface Question {
  id: string          // `${scenarioSlug}-${index}`
  scenarioName: string
  text: string
  options: Record<Option, string>
  answer: Option
  explanation?: string
}

interface QuizSession {
  questions: Question[]
  answers: Record<string, Option | null>
  startedAt: number
  durationMs: number  // default: 90 * 60 * 1000
}
```

### File Reading (`src/lib/parseQuestions.ts`)
- Uses Node.js `fs/promises` + `path`
- Reads all `.md` files from `/questions/` at request time (Server Component safe)
- Regex parses scenario name, question blocks, options, answer, explanation
- Returns `Scenario[]` — each with `name` and `questions: Question[]`

### Selection Logic (`src/lib/quizEngine.ts`)
- `pickScenarios(scenarios, n=4)` — Fisher-Yates shuffle, take first 4
- `pickQuestions(questions, n=15)` — same shuffle per scenario
- Called inside the `quiz/page.tsx` Server Component on each page load (fresh random each visit)

### Quiz Page (`src/app/quiz/page.tsx` → `QuizClient.tsx`)
Server component reads + selects questions, passes them as props to `QuizClient`.

Client component manages:
- `useReducer` with actions: `ANSWER`, `NAVIGATE`, `FINISH`
- One question at a time, with previous/next navigation
- Question progress indicator (e.g. "12 / 60")
- Scenario label on each question
- "Finish exam" button (active after at least 1 answer, or at any time)
- Results passed via `sessionStorage` or URL search param to results page

### Timer
- Total exam countdown — default **90 minutes**
- `useEffect` with `setInterval` (1s tick), stored in reducer state
- Displayed as `MM:SS` in a fixed header bar
- Turns red in last 10 minutes
- Auto-submits when it hits 0:00

### Results Page (`src/app/results/page.tsx` → `ResultsClient.tsx`)
Reads session data from `sessionStorage`. Shows:
1. **Score** — `X / 60 (Y%)`
2. **Pass / Fail** — green/red banner; threshold is 72% = 44 correct
3. **Wrong answers review** — grouped by scenario, each card shows: question, your answer, correct answer, explanation
4. **Restart** button → back to `/`

Pass threshold note: The real exam uses difficulty-weighted scoring; 72% flat is an approximation.

### Styling
- Stick with CSS Modules (no new dependencies)
- Add a `quiz.module.css` and `results.module.css`
- Reuse existing CSS vars from `globals.css` (`--background`, `--foreground`)

---

## Files to Create
| File | Purpose |
|------|---------|
| `questions/` (folder) | Drop zone for 6 MD files |
| `src/types/quiz.ts` | Shared types |
| `src/lib/parseQuestions.ts` | MD parser |
| `src/lib/quizEngine.ts` | Random selection |
| `src/app/quiz/page.tsx` | Server component entry |
| `src/app/quiz/QuizClient.tsx` | Interactive quiz UI |
| `src/app/quiz/quiz.module.css` | Quiz styles |
| `src/app/results/page.tsx` | Results server shell |
| `src/app/results/ResultsClient.tsx` | Results UI |
| `src/app/results/results.module.css` | Results styles |

## Files to Modify
| File | Change |
|------|--------|
| `src/app/page.tsx` | Replace default template with landing/start screen |
| `src/app/globals.css` | Add a few shared quiz CSS vars |

---

## Verification
1. Drop the 6 MD files into `/questions/`
2. `yarn dev` — visit `http://localhost:3000`
3. Start screen loads; click "Start Quiz"
4. Quiz loads 60 questions (verify 4 scenarios × 15 questions in question counter)
5. Answer a few questions, check timer counts down
6. Use "Finish Exam" — results screen shows score + wrong answers
7. Restart returns to start screen
8. Reload quiz page — different random set each time
