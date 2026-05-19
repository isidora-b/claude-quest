'use client'

import { useReducer, useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Question, Option, QuizResult } from '@/types/quiz'
import styles from './quiz.module.css'

interface Props {
  questions: Question[]
  durationMs: number
}

interface State {
  current: number
  answers: Record<string, Option | null>
  locked: Record<string, boolean>
  timeLeftMs: number
  finished: boolean
  transition: { completedScenario: string; nextScenario: string; nextIndex: number } | null
}

type Action =
  | { type: 'ANSWER'; questionId: string; option: Option }
  | { type: 'NAVIGATE'; index: number; questions: Question[] }
  | { type: 'DISMISS_TRANSITION' }
  | { type: 'TICK' }
  | { type: 'FINISH' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ANSWER':
      if (state.locked[action.questionId]) return state
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.option },
      }
    case 'NAVIGATE': {
      const currentId = action.questions[state.current].id
      const goingForward = action.index > state.current
      const alreadyLocked = state.locked[currentId]

      // First Next click: lock current question and show feedback, don't move yet
      if (goingForward && !alreadyLocked) {
        return {
          ...state,
          locked: { ...state.locked, [currentId]: true },
        }
      }

      const locked = goingForward
        ? { ...state.locked, [currentId]: true }
        : state.locked

      const from = action.questions[state.current]
      const to = action.questions[action.index]
      const crossingBoundary = goingForward && from.scenarioName !== to.scenarioName

      if (crossingBoundary) {
        return {
          ...state,
          locked,
          transition: {
            completedScenario: from.scenarioName,
            nextScenario: to.scenarioName,
            nextIndex: action.index,
          },
        }
      }

      return { ...state, current: action.index, locked }
    }
    case 'DISMISS_TRANSITION':
      if (!state.transition) return state
      return { ...state, current: state.transition.nextIndex, transition: null }
    case 'TICK':
      if (state.timeLeftMs <= 1000) return { ...state, timeLeftMs: 0, finished: true }
      return { ...state, timeLeftMs: state.timeLeftMs - 1000 }
    case 'FINISH':
      return { ...state, finished: true }
    default:
      return state
  }
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const OPTIONS: Option[] = ['A', 'B', 'C', 'D']

export default function QuizClient({ questions, durationMs }: Props) {
  const router = useRouter()

  const [state, dispatch] = useReducer(reducer, {
    current: 0,
    answers: Object.fromEntries(questions.map(q => [q.id, null])),
    locked: {},
    timeLeftMs: durationMs,
    finished: false,
    transition: null,
  })

  const [confirming, setConfirming] = useState(false)
  const [paused, setPaused] = useState(false)
  const finish = useCallback(() => dispatch({ type: 'FINISH' }), [])

  useEffect(() => {
    if (state.finished || paused) return
    const interval = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(interval)
  }, [state.finished, paused])

  useEffect(() => {
    if (!state.finished) return
    const result: QuizResult = {
      questions,
      answers: state.answers,
      timeTakenMs: durationMs - state.timeLeftMs,
      durationMs,
    }
    sessionStorage.setItem('quizResult', JSON.stringify(result))
    router.push('/results')
  }, [state.finished, questions, state.answers, state.timeLeftMs, durationMs, router])

  const isWarning = state.timeLeftMs <= 10 * 60 * 1000
  const answered = Object.values(state.answers).filter(a => a !== null).length

  // Scenario transition screen
  if (state.transition) {
    const { completedScenario, nextScenario } = state.transition
    return (
      <div className={styles.layout}>
        <header className={styles.header}>
          <span className={styles.progress} />
          <span className={`${styles.timer} ${isWarning ? styles.timerWarning : ''}`}>
            {formatTime(state.timeLeftMs)}
          </span>
          <button className={styles.finishBtn} onClick={() => setConfirming(true)}>Finish Exam</button>
        </header>
        <main className={styles.transitionScreen}>
          <div className={styles.transitionCard}>
            <div className={styles.transitionDone}>✓ Scenario complete</div>
            <p className={styles.transitionCompleted}>{completedScenario}</p>
            <div className={styles.transitionDivider} />
            <p className={styles.transitionUpNext}>Up next</p>
            <p className={styles.transitionNext}>{nextScenario}</p>
            <button
              className={styles.transitionBtn}
              onClick={() => dispatch({ type: 'DISMISS_TRANSITION' })}
            >
              Continue →
            </button>
          </div>
        </main>
      </div>
    )
  }

  const question = questions[state.current]
  const isLocked = !!state.locked[question.id]
  const userAnswer = state.answers[question.id]
  const isCorrect = userAnswer === question.answer

  return (
    <div className={styles.layout}>
      {confirming && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Finish exam?</h2>
            <p className={styles.modalBody}>
              {answered < questions.length
                ? `You have ${questions.length - answered} unanswered question${questions.length - answered !== 1 ? 's' : ''}. Unanswered questions will be marked incorrect.`
                : 'All questions answered. Ready to submit?'}
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setConfirming(false)}>
                Continue exam
              </button>
              <button className={styles.modalConfirm} onClick={finish}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <span className={styles.progress}>
          Question {state.current + 1} / {questions.length}
        </span>
        <span className={`${styles.timer} ${isWarning ? styles.timerWarning : ''}`}>
          {formatTime(state.timeLeftMs)}
        </span>
        <div className={styles.headerActions}>
          <button className={styles.pauseBtn} onClick={() => setPaused(p => !p)}>
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button className={styles.finishBtn} onClick={() => setConfirming(true)}>
            Finish Exam
          </button>
        </div>
      </header>

      {paused && (
        <div className={styles.pauseOverlay}>
          <div className={styles.pauseCard}>
            <p className={styles.pauseTitle}>Exam paused</p>
            <p className={styles.pauseSubtitle}>Timer is stopped. Resume to continue.</p>
            <button className={styles.pauseResumeBtn} onClick={() => setPaused(false)}>
              ▶ Resume
            </button>
          </div>
        </div>
      )}

      <main className={styles.main} style={{ pointerEvents: paused ? 'none' : undefined }}>
        <div className={styles.meta}>{question.scenarioName}</div>

        <p className={styles.questionText}>
          <span className={styles.questionNumber}>{state.current + 1}.</span> {question.text}
        </p>

        <div className={styles.options}>
          {OPTIONS.map(opt => {
            const isSelected = userAnswer === opt
            const isCorrectOpt = opt === question.answer

            let optClass = styles.option
            if (isLocked) {
              if (isCorrectOpt) optClass = `${styles.option} ${styles.optionCorrect}`
              else if (isSelected) optClass = `${styles.option} ${styles.optionIncorrect}`
            } else if (isSelected) {
              optClass = `${styles.option} ${styles.optionSelected}`
            }

            return (
              <button
                key={opt}
                className={optClass}
                onClick={() => dispatch({ type: 'ANSWER', questionId: question.id, option: opt })}
                disabled={isLocked}
              >
                <span className={styles.optionLabel}>{opt}</span>
                <span className={styles.optionText}>{question.options[opt]}</span>
                {isLocked && isCorrectOpt && (
                  <span className={styles.optionTag}>Correct</span>
                )}
                {isLocked && isSelected && !isCorrectOpt && (
                  <span className={styles.optionTag}>Your answer</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Explanation — shown on locked questions only */}
        {isLocked && question.explanation && (
          <div className={`${styles.explanation} ${isCorrect ? styles.explanationCorrect : styles.explanationIncorrect}`}>
            <span className={styles.explanationLabel}>
              {isCorrect ? '✓ Correct' : '✗ Incorrect'} — Explanation
            </span>
            <p>{question.explanation}</p>
          </div>
        )}

        <footer className={styles.footer}>
          <button
            className={styles.navBtn}
            onClick={() => dispatch({ type: 'NAVIGATE', index: state.current - 1, questions })}
            disabled={state.current === 0}
          >
            ← Previous
          </button>

          <span className={styles.answeredCount}>
            {answered} / {questions.length} answered
          </span>

          {isLocked && state.current === questions.length - 1 ? (
            <button
              className={`${styles.navBtn} ${styles.navBtnAccent}`}
              onClick={() => setConfirming(true)}
            >
              See Results →
            </button>
          ) : (
            <button
              className={styles.navBtn}
              onClick={() => dispatch({ type: 'NAVIGATE', index: state.current + 1, questions })}
              disabled={userAnswer === null}
            >
              {!isLocked && userAnswer !== null ? 'Check answer' : 'Next →'}
            </button>
          )}
        </footer>
      </main>
    </div>
  )
}
