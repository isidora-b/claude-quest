import type { Question, Scenario } from '@/types/quiz'

function shuffled<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function pickScenarios(scenarios: Scenario[], n = 4): Scenario[] {
  if (scenarios.length <= n) return scenarios
  return shuffled(scenarios).slice(0, n)
}

export function pickQuestions(questions: Question[], n = 15): Question[] {
  if (questions.length <= n) return questions
  return shuffled(questions).slice(0, n)
}

export function buildQuiz(scenarios: Scenario[], scenarioCount = 4, questionsPerScenario = 15): Question[] {
  const selected = pickScenarios(scenarios, scenarioCount)
  return selected.flatMap(scenario => pickQuestions(scenario.questions, questionsPerScenario))
}
