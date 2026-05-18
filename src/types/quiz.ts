export type Option = 'A' | 'B' | 'C' | 'D'

export interface Question {
  id: string
  scenarioName: string
  text: string
  options: Record<Option, string>
  answer: Option
  explanation?: string
}

export interface Scenario {
  name: string
  slug: string
  questions: Question[]
}

export interface QuizSession {
  questions: Question[]
  answers: Record<string, Option | null>
  startedAt: number
  durationMs: number
}

export interface QuizResult {
  questions: Question[]
  answers: Record<string, Option | null>
  timeTakenMs: number
  durationMs: number
}
