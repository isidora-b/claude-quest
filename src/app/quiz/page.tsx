import { loadScenarios } from "@/lib/parseQuestions";
import { buildQuiz } from "@/lib/quizEngine";
import QuizClient from "./QuizClient";

export default async function QuizPage() {
  const scenarios = await loadScenarios();

  if (scenarios.length < 4) {
    return (
      <main style={{ padding: "48px", textAlign: "center" }}>
        <p>
          Not enough scenario files found. Please add at least 4 .md files to
          /questions/.
        </p>
      </main>
    );
  }

  // TEST MODE: use buildQuiz(scenarios, 2, 2) for a quick 4-question run
  const questions = buildQuiz(scenarios);

  return <QuizClient questions={questions} durationMs={90 * 60 * 1000} />;
}
