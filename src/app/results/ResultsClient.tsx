'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { QuizResult, Option } from '@/types/quiz'
import styles from './results.module.css'

const PASS_THRESHOLD = 0.72
const OPTIONS: Option[] = ['A', 'B', 'C', 'D']

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

export default function ResultsClient() {
  const router = useRouter()
  const [result, setResult] = useState<QuizResult | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('quizResult')
    if (!raw) {
      router.replace('/')
      return
    }
    setResult(JSON.parse(raw))
  }, [router])

  if (!result) return null

  const { questions, answers, timeTakenMs, durationMs } = result
  const correct = questions.filter(q => answers[q.id] === q.answer).length
  const total = questions.length
  const percentage = Math.round((correct / total) * 100)
  const passed = correct / total >= PASS_THRESHOLD

  const incorrectCount = questions.filter(q => answers[q.id] !== null && answers[q.id] !== q.answer).length
  const unansweredCount = questions.filter(q => answers[q.id] === null).length

  const byScenario = questions.reduce<Record<string, typeof questions>>((acc, q) => {
    if (!acc[q.scenarioName]) acc[q.scenarioName] = []
    acc[q.scenarioName].push(q)
    return acc
  }, {})

  return (
    <div className={styles.page}>
      {/* Score card */}
      <div className={styles.scoreCard}>
        <div className={`${styles.verdict} ${passed ? styles.pass : styles.fail}`}>
          {passed ? 'Pass' : 'Fail'}
        </div>

        <div className={styles.score}>
          <span className={styles.scoreNumber}>{correct}</span>
          <span className={styles.scoreTotal}>/ {total}</span>
        </div>

        <div className={styles.percentage}>{percentage}%</div>

        <div className={styles.meta}>
          <span>Passing score: {Math.round(PASS_THRESHOLD * 100)}%</span>
          <span>·</span>
          <span>Time used: {formatTime(timeTakenMs)} / {formatTime(durationMs)}</span>
        </div>

        <button
          className={styles.restartBtn}
          onClick={() => {
            sessionStorage.removeItem('quizResult')
            router.push('/')
          }}
        >
          Start New Exam
        </button>
      </div>

      {/* Review section */}
      <div className={styles.review}>
          <h2 className={styles.reviewTitle}>
            Review — {correct} correct{incorrectCount > 0 && `, ${incorrectCount} incorrect`}{unansweredCount > 0 && `, ${unansweredCount} unanswered`}
          </h2>

          {Object.entries(byScenario).map(([scenario, items]) => (
            <div key={scenario} className={styles.scenarioGroup}>
              <h3 className={styles.scenarioName}>{scenario}</h3>

              {items.map(q => {
                const userAnswer = answers[q.id]
                const isUnanswered = userAnswer === null
                const questionNumber = questions.findIndex(x => x.id === q.id) + 1

                return (
                  <div key={q.id} className={`${styles.questionCard} ${isUnanswered ? styles.questionCardUnanswered : ''}`}>
                    <div className={styles.questionCardHeader}>
                      <p className={styles.questionText}>
                        <span className={styles.questionNumber}>{questionNumber}.</span> {q.text}
                      </p>
                      {isUnanswered && (
                        <span className={styles.unansweredBadge}>Not answered</span>
                      )}
                    </div>

                    {!isUnanswered && (
                      <div className={styles.optionsList}>
                        {OPTIONS.map(opt => {
                          const isCorrect = opt === q.answer
                          const isUser = opt === userAnswer
                          return (
                            <div
                              key={opt}
                              className={`${styles.optionRow} ${
                                isCorrect ? styles.correct : isUser ? styles.incorrect : ''
                              }`}
                            >
                              <span className={styles.optionLabel}>{opt}</span>
                              <span className={styles.optionText}>{q.options[opt]}</span>
                              {isCorrect && <span className={styles.tag}>Correct</span>}
                              {isUser && !isCorrect && <span className={styles.tag}>Your answer</span>}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {isUnanswered && (
                      <div className={styles.optionsList}>
                        {OPTIONS.map(opt => (
                          <div
                            key={opt}
                            className={`${styles.optionRow} ${opt === q.answer ? styles.correct : ''}`}
                          >
                            <span className={styles.optionLabel}>{opt}</span>
                            <span className={styles.optionText}>{q.options[opt]}</span>
                            {opt === q.answer && <span className={styles.tag}>Correct</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.explanation && (
                      <div className={styles.explanation}>
                        <span className={styles.explanationLabel}>Explanation</span>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
    </div>
  )
}
