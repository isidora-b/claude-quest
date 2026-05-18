// Converts question MD files from the original format to the parser-friendly format.
// Run with: node scripts/convert-questions.js
// Creates backups at questions/*.md.bak before overwriting.

const fs = require('fs')
const path = require('path')

const QUESTIONS_DIR = path.join(__dirname, '..', 'questions')

function convertFile(content) {
  const lines = content.split('\n')
  const output = []
  let i = 0

  // Step 1: Extract and simplify the title line
  // "# Practice Questions — Scenario N: NAME" → "# NAME"
  if (lines[0].startsWith('# ')) {
    const titleMatch = lines[0].match(/^#\s+.+?:\s+(.+)$/)
    output.push(titleMatch ? `# ${titleMatch[1].trim()}` : lines[0])
    i = 1
  }

  // Step 2: Skip metadata block (Total Questions, Domain Distribution, ---)
  while (i < lines.length) {
    const line = lines[i]
    if (
      line.startsWith('**Total Questions:**') ||
      line.startsWith('**Domain Distribution:**') ||
      line.trim() === '---'
    ) {
      i++
      continue
    }
    break
  }

  // Step 3: Process the rest line by line
  while (i < lines.length) {
    const line = lines[i]

    // Skip domain section headers: "## Domain N: ..."
    if (/^##\s+Domain\s+\d+/.test(line)) {
      i++
      // Also skip the blank line and --- that follow domain headers
      while (i < lines.length && (lines[i].trim() === '' || lines[i].trim() === '---')) {
        i++
      }
      continue
    }

    // Convert "**Question N:** Question text" → "## Question N\n\nQuestion text"
    const questionMatch = line.match(/^\*\*Question\s+(\d+):\*\*\s*(.*)$/)
    if (questionMatch) {
      const num = questionMatch[1]
      const text = questionMatch[2].trim()
      output.push(`## Question ${num}`)
      output.push('')
      if (text) output.push(text)
      i++
      continue
    }

    // Convert "**Correct Answer: X**" → "**Answer:** X"
    const answerMatch = line.match(/^\*\*Correct Answer:\s*([A-D])\*\*$/)
    if (answerMatch) {
      output.push(`**Answer:** ${answerMatch[1]}`)
      i++

      // The next non-empty paragraph is the explanation — prefix it
      // Skip blank lines between answer and explanation
      while (i < lines.length && lines[i].trim() === '') {
        i++
      }

      // If the next line is explanation text (not a new question, option, or ---)
      if (
        i < lines.length &&
        lines[i].trim() !== '' &&
        lines[i].trim() !== '---' &&
        !lines[i].startsWith('**Question') &&
        !lines[i].startsWith('## ')
      ) {
        output.push('')
        // Collect all lines of the explanation paragraph
        const explanationLines = []
        while (
          i < lines.length &&
          lines[i].trim() !== '---' &&
          !lines[i].startsWith('**Question') &&
          !lines[i].startsWith('## Question')
        ) {
          explanationLines.push(lines[i])
          i++
        }
        // Trim trailing blank lines from explanation
        while (explanationLines.length && explanationLines[explanationLines.length - 1].trim() === '') {
          explanationLines.pop()
        }
        if (explanationLines.length) {
          output.push(`**Explanation:** ${explanationLines[0].trim()}`)
          for (let j = 1; j < explanationLines.length; j++) {
            output.push(explanationLines[j])
          }
        }
      }
      continue
    }

    output.push(line)
    i++
  }

  // Clean up: collapse 3+ consecutive blank lines into 2
  return output
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd() + '\n'
}

function main() {
  const files = fs.readdirSync(QUESTIONS_DIR).filter(f => f.endsWith('.md'))

  if (files.length === 0) {
    console.error('No .md files found in /questions/')
    process.exit(1)
  }

  for (const filename of files) {
    const filepath = path.join(QUESTIONS_DIR, filename)
    const original = fs.readFileSync(filepath, 'utf-8')

    // Write backup
    fs.writeFileSync(filepath + '.bak', original)

    const converted = convertFile(original)
    fs.writeFileSync(filepath, converted)

    // Quick sanity check: count ## Question headings
    const questionCount = (converted.match(/^## Question \d+/gm) || []).length
    console.log(`✓ ${filename} — ${questionCount} questions converted (backup: ${filename}.bak)`)
  }

  console.log('\nDone. Review the output, then delete *.bak files when happy.')
}

main()
