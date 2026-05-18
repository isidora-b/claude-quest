import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.badge}>Claude Certified Architect</div>
        <h1 className={styles.title}>Practice Exam</h1>
        <p className={styles.description}>
          60 questions · 4 random scenarios · 90 minutes
        </p>
        <ul className={styles.details}>
          <li>15 questions selected randomly from each scenario</li>
          <li>Passing score: 72% (44 / 60 correct)</li>
          <li>Timer auto-submits when time runs out</li>
          <li>Full review of wrong answers after submission</li>
        </ul>
        <Link href="/quiz" className={styles.startButton}>
          Start Exam
        </Link>
      </div>
    </main>
  )
}
