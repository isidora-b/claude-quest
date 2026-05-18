# Quiz App — Implementation Steps

## Foundation
1. ✅ Create `src/types/quiz.ts` — define `Question`, `Scenario`, `QuizSession`, `QuizResult` types
2. ✅ Create `src/lib/parseQuestions.ts` — MD file parser using `fs/promises` + regex
3. ✅ Create `src/lib/quizEngine.ts` — random scenario + question selection (Fisher-Yates)
4. ✅ Create `/questions/` folder and define expected MD format

## Pages & UI
5. ✅ Update `src/app/globals.css` — add shared CSS variables for quiz theme
6. ✅ Update `src/app/page.tsx` — replace default template with landing/start screen
7. ✅ Create `src/app/quiz/page.tsx` — Server Component that reads files and selects questions
8. ✅ Create `src/app/quiz/QuizClient.tsx` — full quiz UI: one question at a time, navigation, `useReducer` state
9. ✅ Create `src/app/quiz/quiz.module.css` — quiz styles
10. ✅ Create `src/app/results/page.tsx` — Results Server Component shell
11. ✅ Create `src/app/results/ResultsClient.tsx` — score, pass/fail banner, wrong answer review
12. ✅ Create `src/app/results/results.module.css` — results styles

## Timer
13. ✅ Wire up 90-minute countdown in `QuizClient.tsx` — fixed header bar, red at <10 min, auto-submit at 0:00

## Wiring & Testing
14. ✅ Connect quiz finish → `sessionStorage` → results page
15. ✅ Drop 6 MD files into `/questions/` and do end-to-end verification
