import fs from 'fs/promises'
import path from 'path'
import type { Option, Question, Scenario } from '@/types/quiz'

const QUESTIONS_DIR = path.join(process.cwd(), 'questions')

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function parseScenarioFile(content: string, filename: string): Scenario {
  // Extract scenario name from "# NAME" (first heading)
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const name = titleMatch ? titleMatch[1].trim() : filename.replace('.md', '')
  const slug = slugify(name)

  // Split on "## Question N" headings
  const blocks = content.split(/^##\s+Question\s+\d+\s*$/m).slice(1)

  const questions: Question[] = blocks.map((block, index) => {
    const text = extractQuestionText(block)
    const options = extractOptions(block)
    const answer = extractAnswer(block)
    const explanation = extractExplanation(block)

    return {
      id: `${slug}-${index + 1}`,
      scenarioName: name,
      text,
      options,
      answer,
      explanation,
    }
  }).filter(q => q.text && q.answer && Object.keys(q.options).length === 4)

  return { name, slug, questions }
}

function extractQuestionText(block: string): string {
  // Text is everything before the first option line "A) ..."
  const optionStart = block.search(/^[A-D]\)\s/m)
  const raw = optionStart === -1 ? block : block.slice(0, optionStart)
  return raw.trim()
}

function extractOptions(block: string): Record<Option, string> {
  const options: Partial<Record<Option, string>> = {}
  const optionRegex = /^([A-D])\)\s+(.+)$/gm
  let match: RegExpExecArray | null

  while ((match = optionRegex.exec(block)) !== null) {
    options[match[1] as Option] = match[2].trim()
  }

  return options as Record<Option, string>
}

function extractAnswer(block: string): Option {
  const match = block.match(/\*\*Answer:\*\*\s*([A-D])/)
  return (match?.[1] as Option) ?? 'A'
}

function extractExplanation(block: string): string | undefined {
  const match = block.match(/\*\*Explanation:\*\*\s*([\s\S]+?)(?:\n---|\n##|$)/)
  return match?.[1]?.trim()
}

export async function loadScenarios(): Promise<Scenario[]> {
  let files: string[]

  try {
    files = await fs.readdir(QUESTIONS_DIR)
  } catch {
    throw new Error(`Could not read questions directory at: ${QUESTIONS_DIR}`)
  }

  const mdFiles = files.filter(f => f.endsWith('.md')).sort()

  if (mdFiles.length === 0) {
    throw new Error('No .md files found in /questions/ directory')
  }

  const scenarios = await Promise.all(
    mdFiles.map(async filename => {
      const content = await fs.readFile(path.join(QUESTIONS_DIR, filename), 'utf-8')
      return parseScenarioFile(content, filename)
    })
  )

  return scenarios.filter(s => s.questions.length >= 15)
}
