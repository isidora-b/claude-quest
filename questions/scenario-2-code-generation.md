# Code Generation with Claude Code

**Total Questions:** 60
**Domain Distribution:** Domain 3 (34), Domain 5 (26)

---

## Question 1

Your team of 12 engineers just onboarded three new developers. Each new developer reports that Claude Code is not enforcing the API error-handling conventions described in the team's coding standards. You discover these conventions are only in your personal `~/.claude/CLAUDE.md` file, not in the repository. What is the correct fix so that all teammates — including future joiners — automatically receive these conventions?

A) Email the `~/.claude/CLAUDE.md` contents to every developer so they can copy it to their own home directories.
B) Move the API error-handling conventions into a project-level `CLAUDE.md` at the repository root so they are version-controlled and shared.
C) Create a `.env` file in the project root containing a `CLAUDE_INSTRUCTIONS` variable with the conventions.
D) Add the conventions to a README.md file so developers can reference them manually when prompting Claude.

**Answer:** B

**Explanation:** The user-level `~/.claude/CLAUDE.md` file is personal — it applies only to the individual developer and is never shared via version control. Moving the conventions to the project-level `CLAUDE.md` (at the repository root or in `.claude/CLAUDE.md`) ensures all developers receive them automatically when they clone or pull the repo. Option A is a manual workaround that breaks every time a new developer joins. Option C references a non-existent mechanism — Claude Code does not read instructions from environment variables. Option D makes instructions passive documentation rather than automatically applied context.
---

## Question 2

You maintain a large monorepo with three packages: `packages/frontend` (React), `packages/api` (Node.js REST), and `packages/infra` (Terraform). The root `CLAUDE.md` is already 800 lines and becoming hard to maintain. The frontend maintainer wants to add 120 lines of React-specific hook rules without affecting API or infrastructure developers. Which approach best keeps the configuration modular and maintainable?

A) Append the React rules to the root `CLAUDE.md` under a `## Frontend` header and instruct Claude to apply only relevant sections.
B) Use `@import` in `packages/frontend/CLAUDE.md` to reference a shared React standards file, keeping the root `CLAUDE.md` unchanged.
C) Create a `.claude/rules/react-hooks.md` file without any frontmatter and add a note in root `CLAUDE.md` explaining it exists.
D) Store the React rules in `packages/frontend/.env.claude` and configure a custom loader script.

**Answer:** B

**Explanation:** The `@import` syntax allows directory-level `CLAUDE.md` files to selectively include standards files relevant to that package, preventing unrelated context from being loaded for other packages. The frontend maintainer can create `packages/frontend/CLAUDE.md` with an `@import` pointing to a React standards file, keeping the root `CLAUDE.md` clean. Option A inflates the root file and relies on Claude to infer scope, which is unreliable. Option C creates a rules file that won't be automatically associated with React files without proper frontmatter path scoping. Option D references a non-existent mechanism in Claude Code.
---

## Question 3

A senior developer ran `/memory` during a session and noticed that the project's database connection pooling rules were not listed in the loaded memory files. A junior developer editing `src/db/pool.ts` later generates code that violates these rules. After investigation, you find the pooling rules are in a `database-rules.md` file that sits in the root directory but is not referenced anywhere in the `CLAUDE.md` hierarchy. What is the correct resolution?

A) Rename `database-rules.md` to `CLAUDE.md` and place it in the `src/db/` directory.
B) Add an `@import ./database-rules.md` directive to the root `CLAUDE.md` so the file is included in loaded memory.
C) Instruct developers to manually paste the pooling rules into each prompt when editing database files.
D) Add `database-rules.md` to the `.gitignore` file and have Claude read it on demand.

**Answer:** B

**Explanation:** The `/memory` command reveals which memory files are actually loaded. When a standards file exists but is not referenced via `@import` in the `CLAUDE.md` hierarchy, Claude Code never loads it. Adding `@import ./database-rules.md` to the root `CLAUDE.md` brings the file into the loaded memory chain so rules are always active. Option A creates a directory-level CLAUDE.md that would only load when Claude is editing files inside `src/db/`, not on project-wide tasks. Option C is a fragile manual workaround. Option D is counterproductive — gitignore removes files from version control and has no effect on Claude's memory loading.
---

## Question 4

Your project has grown to where the root `CLAUDE.md` covers testing conventions, API standards, deployment procedures, security policies, and performance guidelines — all in a single 1,200-line file. Developers report that Claude sometimes misses instructions from the middle of the file. Which refactoring approach best addresses both the maintainability and reliability concerns?

A) Split the root `CLAUDE.md` into focused topic files in `.claude/rules/` (e.g., `testing.md`, `api-conventions.md`, `deployment.md`) and remove the monolithic file.
B) Reformat the root `CLAUDE.md` as a numbered list so Claude can index into specific items more reliably.
C) Duplicate the most important instructions at both the top and bottom of the `CLAUDE.md` to counteract the "lost in the middle" effect.
D) Compress the `CLAUDE.md` to under 200 lines by removing examples, relying on Claude's general knowledge for specifics.

**Answer:** A

**Explanation:** The `.claude/rules/` directory is designed specifically for this use case — splitting large CLAUDE.md files into focused, topic-specific files. Smaller, focused files reduce the risk of middle-context instructions being overlooked and are far easier to maintain and review in isolation. Option B reformatting does not solve the length problem or the attention dilution risk. Option C is a workaround for the symptom (middle-context loss) but does not address root-cause maintainability and doubles the length. Option D sacrifices examples that are often critical for Claude to understand precise conventions.
---

## Question 5

You want every developer on the team to have a `/review` slash command available when they clone the repository. The command should run a standardized security and logic review checklist. A new hire on Linux, a senior developer on macOS, and a contractor using a company-provisioned machine should all have identical access to this command. Where should you create the command file?

A) In `.claude/commands/review.md` within the project repository
B) In `~/.claude/commands/review.md` on each developer's local machine
C) In the root `CLAUDE.md` under a `## Commands` section
D) In a `.claude/config.json` file with a `"commands"` array property

**Answer:** A

**Explanation:** Project-scoped custom slash commands live in `.claude/commands/` within the repository and are distributed via version control. Any developer who clones or pulls the repo gets the command automatically, regardless of operating system or machine configuration. Option B (`~/.claude/commands/`) is for personal, user-scoped commands that are not version-controlled and therefore not shared. Option C describes instructions context, not a command definition mechanism. Option D references a configuration schema that does not exist in Claude Code.
---

## Question 6

A developer creates a personal `/brainstorm-api` skill that generates verbose exploratory alternatives for API design decisions. During sessions, the output fills the context window with design speculation and pushes out critical code context. How should the skill be configured to prevent this pollution of the main conversation?

A) Add `context: fork` to the skill's `SKILL.md` frontmatter so it runs in an isolated sub-agent context that doesn't accumulate in the main session.
B) Add `max-output: 500` to the skill's frontmatter to cap the number of tokens it can produce.
C) Move the skill from `.claude/skills/` to `~/.claude/skills/` so its output is buffered separately.
D) Add an instruction at the end of the skill telling Claude to delete previous responses before returning results.

**Answer:** A

**Explanation:** The `context: fork` frontmatter option runs the skill in an isolated sub-agent context, returning only a summary to the main conversation. This prevents verbose exploratory output — like extensive brainstorming — from accumulating in the main session's context window. Option B references a non-existent `max-output` frontmatter key. Option C changes the skill's visibility scope (personal vs. project) but has no effect on context isolation. Option D is not a functional mechanism — Claude cannot delete prior responses or context entries.
---

## Question 7

Your team's `analyze-codebase` skill in `.claude/skills/analyze-codebase/SKILL.md` generates exhaustive dependency graphs and call trees. A team member wants to use the same analysis logic for their personal workflow but wants a version that also outputs a prioritized action list, without changing the team skill that other developers rely on. What is the correct approach?

A) Create a personal skill variant in `~/.claude/skills/analyze-codebase-personal/SKILL.md` with the additional action list output, leaving the project skill unchanged.
B) Edit the project skill at `.claude/skills/analyze-codebase/SKILL.md` and add the action list output behind a `--personal` flag.
C) Fork the project repository to a personal branch and maintain the modified skill there.
D) Add the action list generation to the root `CLAUDE.md` with an instruction to only apply it when the developer invokes the skill.

**Answer:** A

**Explanation:** User-scoped skills in `~/.claude/skills/` support personal customization without affecting teammates. Creating a personal variant with a different name (e.g., `analyze-codebase-personal`) avoids naming conflicts with the shared project skill and gives the developer their enhanced workflow privately. Option B modifies the shared project skill, affecting all teammates and adding complexity. Option C is a heavy-weight repository operation for a simple personal preference. Option D uses CLAUDE.md for purpose it's not designed for — CLAUDE.md provides universal context, not conditional skill behavior per developer.
---

## Question 8

You're building a skill for automated security scanning at `.claude/skills/security-scan/SKILL.md`. The skill needs to read files across the codebase but must never write files, delete content, or execute shell commands — only analysis tools should be available. Which frontmatter configuration achieves this constraint?

A) Add `allowed-tools: [Read, Grep, ListFiles]` to the skill's frontmatter to restrict it to read-only operations.
B) Add `readonly: true` to the skill's frontmatter to prevent any write operations during execution.
C) Add a note in the skill description instructing Claude not to use write or shell tools.
D) Create a separate `.claude/rules/security-scan-restrictions.md` file listing the prohibited tools.

**Answer:** A

**Explanation:** The `allowed-tools` frontmatter field in `SKILL.md` explicitly enumerates which tools the skill is permitted to use during execution, enforcing least-privilege access. Listing only read-oriented tools (Read, Grep, ListFiles) means write and shell tools are unavailable by definition. Option B references a `readonly` frontmatter key that does not exist in the Claude Code skill specification. Option C relies on probabilistic LLM instruction-following for a security constraint, which is unreliable. Option D creates a rules file that is not the correct mechanism for restricting tool access within a skill's execution scope.
---

## Question 9

A junior developer invokes `/generate-migration` without providing the target database table name. Instead of erroring out silently, you want Claude to prompt them with "Enter the target table name (e.g., users, orders, products)" before proceeding. Which skill frontmatter property enables this behavior?

A) `argument-hint: "Enter the target table name (e.g., users, orders, products)"`
B) `required-args: ["table-name"]` with a corresponding error message
C) `prompt-on-missing: true` combined with an `args` list
D) Adding a validation block at the top of the SKILL.md content that checks for argument presence

**Answer:** A

**Explanation:** The `argument-hint` frontmatter property in `SKILL.md` defines the prompt text displayed to the developer when they invoke the skill without providing required arguments. It allows the skill to guide users interactively rather than failing silently. Option B references a `required-args` schema that does not exist in Claude Code skill configuration. Option C references a `prompt-on-missing` property that is not part of the skill frontmatter specification. Option D embeds validation logic in the skill content, which does not trigger an interactive argument prompt — it would only be processed as instruction text by Claude.
---

## Question 10

Your team has two types of convention files: (1) `api-conventions.md` which applies every time a developer works anywhere in the codebase, and (2) `graphql-schema-rules.md` which should only apply when working in `src/graphql/**`. Which configuration approach correctly differentiates these two files?

A) Include `api-conventions.md` via `@import` in the root `CLAUDE.md`, and create `.claude/rules/graphql-schema-rules.md` with `paths: ["src/graphql/**/*"]` frontmatter.
B) Place both files in `.claude/rules/` and prefix the always-active file with `global-` so Claude knows to always apply it.
C) Place `api-conventions.md` in `.claude/rules/` without frontmatter and `graphql-schema-rules.md` with a `paths` field.
D) Include both files via `@import` in the root `CLAUDE.md` and add path guards inline within `graphql-schema-rules.md`.

**Answer:** A

**Explanation:** For always-active conventions, `@import` in the root `CLAUDE.md` ensures they are loaded in every session regardless of which files are being edited. For path-conditional rules, `.claude/rules/` files with `paths` frontmatter load only when editing matching files. Option B uses a naming convention (`global-` prefix) that has no special meaning in Claude Code — there is no mechanism that reads filename prefixes. Option C is close but incorrect: rules files in `.claude/rules/` without frontmatter path scoping behavior is not guaranteed to be always-active in the same way `@import` in `CLAUDE.md` is. Option D would load the GraphQL rules in every session, defeating the purpose of path-conditional loading.
---

## Question 11

Your codebase has Jest test files spread throughout the project: `src/components/Button.test.tsx`, `src/api/auth.test.ts`, `src/utils/formatters.test.ts`, and hundreds more. You want a single rule file that enforces consistent Jest mocking conventions (`jest.mock` placement, `beforeEach` cleanup patterns) for all test files regardless of their directory. Which configuration achieves this?

A) Create `.claude/rules/jest-conventions.md` with frontmatter `paths: ["**/*.test.tsx", "**/*.test.ts"]`
B) Create a `tests/CLAUDE.md` file with the Jest conventions since test files share common concerns
C) Add the Jest conventions to the root `CLAUDE.md` under a `## Testing` section and instruct Claude to apply them for `.test.*` files
D) Create `.claude/rules/jest-conventions.md` with frontmatter `paths: ["src/tests/**/*"]`

**Answer:** A

**Explanation:** Glob patterns in `.claude/rules/` frontmatter can match files by extension across any directory using `**/*.test.tsx` and `**/*.test.ts` patterns. This is precisely the use case path-specific rules are designed for: applying conventions to files spread throughout the codebase based on type, not location. Option B creates a CLAUDE.md in a `tests/` directory that wouldn't match test files located alongside source files in component and API directories. Option C relies on Claude inferring scope from a section header rather than deterministic path matching. Option D uses a path that doesn't match the actual test file locations spread throughout `src/`.
---

## Question 12

You want infrastructure-as-code rules to apply only when developers edit Terraform files, which exist under `infra/terraform/modules/` and `infra/terraform/environments/`. The rules include required resource tagging, naming conventions, and state file configuration. Which frontmatter configuration correctly scopes this rule file?

A) `paths: ["infra/terraform/**/*"]`
B) `paths: ["**/*.tf"]`
C) `paths: ["infra/**/*", "*.tf"]`
D) `scope: terraform` with `directory: infra/terraform/`

**Answer:** B

**Explanation:** Using `**/*.tf` applies the rules to any Terraform file regardless of its location under the `infra/terraform/` hierarchy or any future locations. Option A would work for the current structure but misses any `.tf` files added outside that path, and would also load for non-Terraform files in the terraform directories. Option B is more precise — it targets the file type specifically. Option C is overly broad (`infra/**/*` includes all infrastructure files, not just Terraform) and `*.tf` without `**/` only matches the root level. Option D references frontmatter keys (`scope`, `directory`) that do not exist in the Claude Code rules specification.
---

## Question 13

A developer is asked to fix a null pointer exception in `UserService.java` at line 143. The stack trace clearly identifies the root cause: a missing null check before calling `.getUserEmail()`. The fix is a two-line conditional guard. Which Claude Code execution mode is most appropriate?

A) Direct execution — the change is well-scoped, single-file, and the root cause is clearly identified
B) Plan mode — any change to production service classes should be planned before executing
C) Plan mode — null pointer fixes often reveal deeper architectural issues requiring exploration
D) Direct execution with the `--dry-run` flag to preview changes before applying them

**Answer:** A

**Explanation:** Direct execution is appropriate for well-scoped, simple changes where the root cause is clear and the fix is straightforward. A two-line null check in a single file with a clear stack trace meets all criteria: minimal scope, no architectural decisions, no multi-file coordination. Option B applies an overly cautious blanket rule — not every production change needs planning; plan mode is for complex, uncertain, or large-scale changes. Option C speculates about hidden complexity that the stack trace has already ruled out. Option D references a `--dry-run` flag that does not exist in Claude Code.
---

## Question 14

Your team is migrating from `moment.js` to `date-fns`. A dependency audit shows 47 files import from `moment.js` across frontend, API, and utility layers. Each usage pattern is different: some format dates for display, others calculate durations, and others parse ISO strings. Multiple valid migration approaches exist with different bundle size tradeoffs. Which execution mode should you use to begin this work?

A) Plan mode — to explore the codebase, understand all usage patterns, and design a consistent migration strategy before making changes
B) Direct execution — start migrating files alphabetically and let patterns emerge naturally
C) Direct execution — provide a comprehensive list of all `moment.js` APIs and their `date-fns` equivalents upfront
D) Plan mode — only to generate a task list, then switch to a different AI tool for the actual file edits

**Answer:** A

**Explanation:** This migration has multiple valid approaches, affects 47 files across different layers, involves architectural decisions (bundle splitting, migration order, coexistence strategy), and the diverse usage patterns mean a single transformation approach won't work uniformly. Plan mode enables safe codebase exploration and architecture design before committing to any implementation approach — exactly what this scenario requires. Option B risks inconsistent migration patterns that will need rework. Option C assumes all API mappings are known without exploring actual usage patterns. Option D artificially constrains Claude Code to only planning, missing the benefit of using the same context for implementation after planning.
---

## Question 15

You've used plan mode to design a microservices extraction strategy for your monolith. The plan identifies 6 services, their boundaries, and a 3-phase implementation sequence. You're now ready to execute Phase 1: extracting the User Authentication service. Which mode should you use for implementation?

A) Direct execution — the plan has resolved the ambiguity; implementation is now well-scoped with clear steps
B) Plan mode — re-enter plan mode for each phase to account for discoveries during implementation
C) Direct execution, but restart fresh without the planning context to avoid stale assumptions
D) Plan mode throughout — switching modes mid-project introduces inconsistency

**Answer:** A

**Explanation:** Once plan mode has resolved architectural ambiguity and produced a clear implementation plan, direct execution is appropriate for carrying out the planned work. The uncertainty that warranted planning has been addressed; what remains is executing well-defined steps. Option B re-enters plan mode unnecessarily — each phase was already planned, and re-planning without new information wastes time. Option C discards valuable planning context that should inform execution. Option D misunderstands the plan/execute workflow — they are designed to be used sequentially, with plan mode upfront and direct execution for implementation.
---

## Question 16

Your team is building a new feature: a real-time inventory dashboard with WebSocket support. The codebase has an existing REST API layer but no WebSocket infrastructure. You need to decide between three approaches: (1) native WebSocket with a custom server, (2) Socket.IO with additional library overhead, or (3) Server-Sent Events for a simpler unidirectional solution. Which Claude Code mode is appropriate for the initial investigation?

A) Plan mode with the Explore subagent to investigate the existing infrastructure and evaluate the three approaches without polluting the main context
B) Direct execution with a prompt listing all three options and asking Claude to implement the best one
C) Plan mode — write out all three implementations and then delete the two that aren't chosen
D) Direct execution — pick Socket.IO since it's the most popular and proceed with implementation immediately

**Answer:** A

**Explanation:** This scenario requires architectural decision-making before implementation: evaluating infrastructure compatibility, tradeoffs between approaches, and understanding existing patterns. Plan mode with the Explore subagent lets Claude investigate the codebase deeply and return a structured recommendation without filling the main context with verbose discovery output. Option B forces a premature implementation decision without codebase investigation. Option C misuses plan mode as a "write and delete" mechanism, which wastes tokens and still commits to implementation prematurely. Option D ignores the architectural evaluation entirely, risking rework if Socket.IO conflicts with existing infrastructure.
---

## Question 17

You ask Claude Code to implement a `formatCurrency` utility function. Your description says "format numbers as currency." Claude generates a function that formats with 2 decimal places and a `$` prefix. You run it on test data: `formatCurrency(1234567.891)` returns `"$1234567.89"` but your requirement was `"$1,234,567.89"` (with thousands separators). You re-describe the requirement in prose but get inconsistent results across three attempts. What is the most effective technique to communicate the expected behavior?

A) Provide 2-3 concrete input/output examples: `formatCurrency(1234567.891) → "$1,234,567.89"`, `formatCurrency(0.5) → "$0.50"`, `formatCurrency(-100) → "-$100.00"`
B) Write a longer prose description of the formatting requirements, including the thousands separator rule
C) Ask Claude to look at how currency is formatted in competing applications for inspiration
D) Provide the exact regex pattern you want applied to the number before formatting

**Answer:** A

**Explanation:** Concrete input/output examples are the most effective technique when prose descriptions produce inconsistent results. They eliminate ambiguity by showing exactly what transformation is expected across different input cases, including edge cases like negative values and sub-dollar amounts. Option B is more of the same approach that already failed — longer prose descriptions of the same requirement that was misunderstood will continue to produce inconsistent results. Option C introduces external reference uncertainty and delays the fix. Option D assumes the developer knows the regex, conflates implementation details with behavioral specification, and ignores cases where Claude might implement the behavior differently but correctly.
---

## Question 18

You're implementing a data migration script that transforms legacy customer records. The script fails on 3 specific test cases involving null `phone_number` fields. You've also noticed that records with non-ASCII characters in `company_name` produce garbled output, and records with future `created_at` dates cause a date calculation error. All three issues are unrelated and independent. What is the most effective way to address them with Claude Code?

A) Fix them sequentially — describe the null phone number issue first, confirm it's resolved, then address the non-ASCII issue, then the date issue
B) Provide all three issues in one message since they are interacting and compound each other
C) Fix only the null phone number issue first since it affects the most records
D) Rewrite the entire migration script from scratch with all three fixes specified upfront

**Answer:** A

**Explanation:** When issues are independent (fixing one doesn't affect the others), sequential iteration is correct — it allows verification that each fix works before proceeding, prevents fixes from interfering, and keeps each interaction focused. Option B is wrong because the domain knowledge specifies that multiple interacting issues should be addressed together, but these three issues are stated to be independent, not interacting. Option C prioritizes by impact but ignores that all three issues need to be addressed — deferring fixes creates a false sense of completion. Option D discards working code to fix bugs that are localized and addressable incrementally.
---

## Question 19

You're implementing a Redis caching layer for your API, a domain where your team has limited experience. You're concerned about cache invalidation edge cases, TTL strategies for different data types, and memory eviction policies that might affect your use case. Before writing any implementation code, what technique should you use to surface these considerations?

A) Use the interview pattern — ask Claude to ask you questions about your caching requirements before implementing, to surface design considerations you may not have anticipated
B) Use plan mode and have Claude write three different implementation approaches for comparison
C) Provide your best guess at the requirements and iterate from the first implementation
D) Search the Redis documentation manually first, then provide a comprehensive spec to Claude

**Answer:** A

**Explanation:** The interview pattern is specifically designed for situations where a developer is working in an unfamiliar domain. Having Claude ask questions first surfaces considerations — like cache stampede prevention, write-through vs write-behind strategies, cluster vs single-node behavior — that the developer may not know to specify. This prevents implementing a solution that misses critical requirements. Option B generates multiple implementations without first understanding requirements, producing wasted work. Option C risks building on incorrect assumptions that may require significant rework. Option D is a reasonable approach but misses the efficiency of letting Claude's domain knowledge guide the requirement-gathering process.
---

## Question 20

Your team's `parseDate` function has a known bug: it crashes when given dates in `MM/DD/YYYY` format from European users who input `DD/MM/YYYY`. A ticket describes this inconsistency in prose. When you share this description with Claude, the first attempt produces a fix that handles `DD/MM/YYYY` but breaks existing `MM/DD/YYYY` handling. The second attempt fixes both but misses the case where day and month are the same digit (e.g., `05/05/2024`). What technique most effectively communicates all the edge cases?

A) Provide specific test cases with explicit input and expected output: `parseDate("13/01/2024") → Date(2024-01-13)`, `parseDate("01/13/2024") → Date(2024-01-13)`, `parseDate("05/05/2024") → Date(2024-05-05)`
B) Write a comprehensive prose description of every date format variant and the disambiguation rules
C) Switch to plan mode to explore all possible date format combinations before fixing
D) Ask Claude to write its own test suite first and then self-verify the fix against those tests

**Answer:** A

**Explanation:** When natural language descriptions produce inconsistent results across multiple attempts, concrete input/output examples with specific test cases are the most effective communication mechanism. They leave no ambiguity about the expected transformation for each edge case, including the ambiguous `05/05/2024` case. Option B is more prose — which has already failed twice. Option C applies plan mode to what is fundamentally an edge case specification problem, not an architectural decision problem. Option D has Claude define its own test cases, which may not cover the edge cases you've already identified as problematic.
---

## Question 21

You're debugging a complex asynchronous race condition in your event processing pipeline. The issue involves three interacting bugs: (1) an event emitted before a listener registers, (2) a lock acquired but never released under a specific error path, and (3) a retry queue that dequeues events out of order under high load. Fixing bug 1 changes the timing and affects whether bug 2 manifests. Fixing bug 2 changes error handling that interacts with bug 3. What is the most effective approach to share these with Claude Code?

A) Provide all three issues and their interactions in a single detailed message, explaining the dependencies between them
B) Fix bug 1 first, verify it, then share bug 2 context, then bug 3 sequentially
C) Address only the most severe bug (the lock leak) since it causes a production outage
D) Rewrite the entire event processing pipeline using a different architectural pattern

**Answer:** A

**Explanation:** When bugs interact — meaning fixing one changes the conditions under which another manifests — they must be addressed together in a single message. Sequential fixes risk introducing new bugs as each fix changes the behavior that the next fix depends on. This is the canonical case for addressing interacting issues simultaneously. Option B applies sequential iteration, which is correct for independent issues but wrong here since these bugs interact. Option C solves the most urgent problem but leaves interacting bugs unresolved, potentially making them harder to fix after the lock leak is patched. Option D is over-engineered — the existing pipeline doesn't need a rewrite to fix three specific, well-understood bugs.
---

## Question 22

You're writing a test-driven implementation for a `validateEmail` function. You've written 15 test cases covering valid emails, invalid formats, edge cases with special characters, and internationalized domain names. On the third iteration, 12 tests pass but three fail: an IDN test case (`user@münchen.de`), a subdomain test case (`user@mail.company.example.com`), and a quoted local part test case (`"user@work"@example.com`). What is the most effective next step?

A) Share the three failing test cases with Claude, providing the test input, expected output, and the actual output from the current implementation
B) Write prose descriptions of what each failing case should do and ask for a fix
C) Remove the three difficult test cases and accept 80% coverage since edge cases are rare in production
D) Ask Claude to explain the RFC 5321 email specification and then rewrite the validation from specification

**Answer:** A

**Explanation:** Test-driven iteration works by sharing failing test cases — with specific input, expected output, and actual output — to guide progressive improvement. This gives Claude precise, actionable information about what the current implementation gets wrong. Option B reverts to prose descriptions after concrete test cases are already available, which is a less effective communication mechanism. Option C reduces quality requirements to avoid technical difficulty, leaving known bugs in production. Option D is academic — understanding the RFC is useful but the task is to fix three specific failing tests, and sharing those test failures is the most direct path.
---

## Question 23

Your CI/CD pipeline includes a step: `claude "Review the staged changes for code quality issues"`. During a late-night deployment, this step hangs for 45 minutes without output, blocking the release. The on-call engineer discovers the Claude Code process is waiting for interactive terminal input. What is the single change needed to prevent this in all future pipeline runs?

A) Change the command to `claude -p "Review the staged changes for code quality issues"` to run in non-interactive print mode
B) Add a `timeout 300` wrapper: `timeout 300 claude "Review the staged changes for code quality issues"`
C) Set `CLAUDE_NONINTERACTIVE=1` environment variable before the command
D) Add `--no-input` flag: `claude --no-input "Review the staged changes for code quality issues"`

**Answer:** A

**Explanation:** The `-p` (or `--print`) flag is the documented mechanism for running Claude Code in non-interactive mode. It processes the prompt, writes results to stdout, and exits without waiting for user input — which is required in any automated CI/CD context. Option B adds a timeout but does not prevent the hang — it just kills it after 5 minutes. The root cause (interactive input requirement) remains. Option C references `CLAUDE_NONINTERACTIVE` which is not a documented Claude Code environment variable. Option D references `--no-input` which is not a valid Claude Code flag.
---

## Question 24

Your team wants to generate structured JSON output from Claude Code in CI, specifically a list of security findings with `file`, `line`, `severity`, and `description` fields for each issue. The output needs to be machine-parseable for automated posting as PR comments. Which CLI configuration achieves this?

A) Use `--output-format json` combined with `--json-schema` pointing to a schema file defining the findings structure
B) Append "respond only in JSON" to the prompt and parse the text output with a JSON parser
C) Use `--structured-output` flag with a `--schema findings.json` argument
D) Set `CLAUDE_OUTPUT_FORMAT=json` environment variable and specify the schema in `CLAUDE.md`

**Answer:** A

**Explanation:** The `--output-format json` flag combined with `--json-schema` enforces machine-parseable structured output that conforms to the specified schema. This is the documented approach for producing reliable JSON output suitable for automated downstream processing like posting PR comments. Option B is fragile — Claude may include explanatory text or markdown code fences around JSON, breaking parser. Option C references `--structured-output` and `--schema` which are not valid Claude Code CLI flags. Option D references a non-existent environment variable and conflates CLAUDE.md configuration with CLI output formatting.
---

## Question 25

Your CI pipeline runs `claude -p "Review this PR for security vulnerabilities"` on every commit. A PR receives 12 inline comments in its first review. The developer fixes 8 issues and pushes a new commit. The pipeline runs again and posts 9 comments — but 6 of them are duplicates of already-addressed issues, and only 3 are new findings. How should you modify the pipeline to prevent duplicate comments?

A) Include the prior review findings in the context when re-running, and instruct Claude to report only new or still-unaddressed issues
B) Delete all existing PR comments before each review run so only the latest results appear
C) Diff the new review output against the previous output and suppress matching findings programmatically
D) Run reviews only on the first commit to a PR and skip subsequent review runs

**Answer:** A

**Explanation:** Providing prior review findings in context and explicitly instructing Claude to report only new or unaddressed issues is the correct approach. This gives Claude the awareness to distinguish resolved issues from persistent ones. Option B deletes the history of resolved issues, losing audit trail and confusing developers about what's been addressed. Option C is brittle — text matching cannot reliably determine semantic equivalence between findings about the same issue expressed differently. Option D defeats the purpose of continuous review by ignoring all post-first-commit changes.
---

## Question 26

You're configuring Claude Code to generate unit tests for new API endpoints in CI. Without any guidance, Claude generates tests that duplicate 40% of the existing test suite and misses the custom fixture patterns your team uses (e.g., `createTestUser()`, `mockDatabaseTransaction()`). What configuration change most effectively improves test generation quality?

A) Document testing standards, available fixtures, and existing test file patterns in `CLAUDE.md`, and provide existing test files in context when invoking test generation
B) Add a `-p "do not duplicate existing tests"` instruction to every CI invocation
C) Run a deduplication post-processor that compares new tests against the existing suite and removes duplicates
D) Switch to generating tests via plan mode in CI to give Claude more time to consider coverage

**Answer:** A

**Explanation:** CLAUDE.md is the mechanism for providing project context to CI-invoked Claude Code. Documenting testing standards, available fixtures, and valuable test criteria in CLAUDE.md — combined with providing existing test files in context — gives Claude the information it needs to avoid duplication and use established patterns. Option B adds a generic instruction that doesn't provide the specific fixture information needed. Option C is a post-processing workaround that doesn't improve generation quality and may remove legitimate tests. Option D misapplies plan mode to CI test generation, where non-interactive execution (`-p`) is required.
---

## Question 27

Your security review pipeline generates a report using `claude -p "Scan for SQL injection vulnerabilities"`. A new developer joins and reviews the pipeline configuration. They suggest replacing the `-p` flag with direct execution so Claude can "ask follow-up questions when it finds ambiguous code." Why is this suggestion problematic for a CI/CD context?

A) CI pipelines require non-interactive execution — the `-p` flag prevents hangs by ensuring Claude outputs results and exits without waiting for terminal input
B) The `-p` flag enables JSON output formatting, which would be lost if removed
C) Direct execution mode does not have access to the same models as `-p` mode in automated contexts
D) The `-p` flag provides pipeline-specific security tokens that authenticate Claude Code in CI environments

**Answer:** A

**Explanation:** The `-p` (print) flag is specifically designed for automated contexts where there is no human available to answer follow-up questions. Without it, Claude Code waits for interactive input that never comes, causing the pipeline to hang indefinitely. CI jobs run in headless environments without terminals attached. Option B is incorrect — `--output-format json` controls JSON output, not the `-p` flag. Option C is false — both modes use the same underlying models. Option D is false — `-p` has nothing to do with authentication.
---

## Question 28

You're reviewing Claude Code's output after running security analysis in CI. The tool identified 3 high-severity issues and 7 medium-severity issues across a PR. A colleague proposes running the same security analysis prompt in the same CI session that originally generated the code, arguing it would have more context about the implementation decisions. Why is using an independent review session more effective than using the same session that generated the code?

A) A session that generated the code is less likely to identify its own flaws due to anchoring to implementation decisions; an independent session reviews the code as written without bias toward the original intent
B) The same session would exceed its context limit by holding both generation and review content simultaneously
C) CI pipelines cannot reuse sessions from previous pipeline stages due to token authentication limits
D) An independent session uses a different model version optimized for analysis rather than generation

**Answer:** A

**Explanation:** Session context isolation is the principle at work: a Claude session that generated code has context biasing it toward the original implementation decisions, making it less likely to challenge or critically evaluate those decisions. An independent review instance approaches the code without that anchoring bias. Option B describes a potential technical constraint but is not the primary reason — even if context were available, the bias issue would remain. Option C is false — pipeline stages can share or isolate sessions based on design choice. Option D is false — Claude Code does not switch to different model versions for review vs. generation tasks.
---

## Question 29

Your team wants to use Claude Code for automated PR review but is concerned about false positives. They propose running three independent review passes and only surfacing findings that appear in at least two passes. What is the primary risk of this "consensus review" approach?

A) Real bugs that are detected intermittently — appearing in one of three passes but not two — would be suppressed, reducing the review's effective detection rate
B) Running three passes triples the token cost without improving precision
C) The `-p` flag cannot be used in parallel pipeline jobs, preventing concurrent passes
D) Independent passes would contradict each other on style issues, causing developer confusion

**Answer:** A

**Explanation:** The consensus approach systematically suppresses findings that appear in fewer than two passes. For bugs that Claude detects some of the time but not always (due to non-determinism), this means real vulnerabilities are filtered out precisely because they were harder to detect. The approach trades false positive reduction for false negative introduction, which is the wrong tradeoff for security review. Option B is true (cost triples) but is not the "primary risk." Option C is false — multiple parallel pipeline jobs can each use `-p`. Option D describes a user experience issue, not a primary risk to review effectiveness.
---

## Question 30

You've set up a `CLAUDE.md` at the project root with general TypeScript conventions. Your `packages/payments` directory handles PCI-DSS compliant code and needs additional rules about never logging card numbers, always using the internal vault client, and specific encryption helper patterns. You want these rules to apply only in the payments package and not burden other packages with payments-specific context. Which configuration is correct?

A) Create `packages/payments/CLAUDE.md` with the PCI-specific rules; it will be loaded as a directory-level config when working in that subtree
B) Add the PCI rules to the root `CLAUDE.md` under a `## Payments Package` section
C) Create `.claude/rules/payments-rules.md` with `paths: ["**/*"]` to apply it everywhere
D) Create a `.claude/skills/payments-review/SKILL.md` skill and manually invoke it whenever editing payments code

**Answer:** A

**Explanation:** Directory-level `CLAUDE.md` files are loaded when Claude works within that directory's subtree. Creating `packages/payments/CLAUDE.md` with PCI-specific rules scopes them precisely to the payments package without loading them for other packages. Option B loads the PCI rules for every package, unnecessarily increasing context for non-payments developers and potentially causing confusion. Option C applies the payments rules globally via a path pattern that matches all files. Option D requires manual invocation, which is error-prone — a developer could forget to invoke the skill before editing sensitive payments code.
---

## Question 31

A new hire reports that Claude Code is not applying the shared API testing conventions when they run it. Other team members using the same codebase do get these conventions applied. After investigation, you find the conventions are properly defined in `.claude/rules/api-testing.md` with correct path patterns. What tool would help you diagnose why the new hire's session is not loading this rule file?

A) Run `/memory` to verify which memory and rule files are loaded in the current session
B) Run `claude --list-rules` to enumerate all active rule files
C) Check `.claude/config.json` for a `disabled-rules` array that might exclude the file
D) Inspect the new hire's `~/.gitconfig` to verify they have access to the `.claude/` directory

**Answer:** A

**Explanation:** The `/memory` command is specifically designed to verify which memory files, rule files, and configurations are loaded in the current session. It helps diagnose inconsistent behavior across sessions by showing exactly what Claude Code has loaded. Option B references a `--list-rules` flag that does not exist in Claude Code. Option C references a `disabled-rules` configuration that is not part of the Claude Code specification. Option D confuses git configuration with Claude Code file access — `.claude/` visibility is a filesystem/git issue, but the rules file was confirmed to exist.
---

## Question 32

Your team uses Claude Code for automated changelog generation in CI. The pipeline calls `claude -p "Generate a changelog entry for the commits since last release"`. The output is in plain text with inconsistent formatting — sometimes bullet points, sometimes numbered lists, sometimes paragraphs. Product managers need structured output for automated insertion into `CHANGELOG.md`. Which change produces consistently structured output?

A) Add `--output-format json` with `--json-schema` pointing to a schema defining `version`, `date`, and `changes[]` fields
B) Add "format the output as JSON" to the prompt text
C) Add `--format changelog` to instruct Claude to use CHANGELOG.md conventions
D) Post-process the output with a text parser that normalizes formatting

**Answer:** A

**Explanation:** `--output-format json` combined with `--json-schema` enforces structured output at the API level, guaranteeing the response conforms to the specified schema. This is deterministic, not probabilistic. Option B adds a prose instruction to the prompt, which produces JSON-like output most of the time but cannot be relied upon for automated insertion into files. Option C references a `--format changelog` flag that does not exist in Claude Code. Option D is a fragile post-processing workaround that will fail when the text format varies — which is the problem being solved.
---

## Question 33

Your team's `CLAUDE.md` includes general TypeScript conventions, React patterns, and API standards. A developer working exclusively on database migration scripts reports that Claude keeps suggesting React component patterns during their work. Which approach best resolves the irrelevant context issue?

A) Create a `.claude/rules/` file for the database migration conventions with `paths: ["migrations/**/*"]` — path-scoped rules only load for matching files, reducing irrelevant context
B) Remove the React patterns from `CLAUDE.md` and put them in a separate file that React developers load manually
C) Create a `migrations/CLAUDE.md` that explicitly overrides the root `CLAUDE.md` by stating "ignore React patterns"
D) Ask the developer to clear their context with `/compact` before working on migrations

**Answer:** A

**Explanation:** Path-specific rules in `.claude/rules/` with glob patterns load only when editing matching files. For migration scripts under `migrations/**/*`, only migration-specific rules would load, while React rules in the root `CLAUDE.md` would still load (as they should for React work). The developer's issue is that React conventions are in the always-loaded root `CLAUDE.md` — the real fix is to move React conventions to a path-scoped rules file rather than keeping them as universal context. Option B disrupts React developers by removing always-loaded conventions they depend on. Option C adds a negative instruction that may not reliably suppress context. Option D uses `/compact` to manage context size but does not prevent the irrelevant conventions from loading in the first place.
---

## Question 34

You're designing a Claude Code workflow for a feature that requires: (1) exploring 30+ files to understand how the existing authentication middleware works, (2) evaluating three design options for adding OAuth2 support, and (3) implementing the chosen design across 8 files. You're concerned about context window exhaustion during the exploration phase polluting the implementation phase. What is the optimal workflow sequence?

A) Use the Explore subagent for the exploration phase to isolate verbose discovery output, receive a structured summary, then use plan mode to evaluate design options, and finally direct execution for implementation
B) Use direct execution for all three phases with `/compact` between phases to manage context
C) Use plan mode for the entire workflow since all three phases involve uncertainty
D) Use direct execution for exploration, plan mode for design evaluation, and plan mode again for implementation

**Answer:** A

**Explanation:** This three-phase workflow maps directly to the recommended tool for each phase: the Explore subagent isolates the verbose 30+ file exploration from the main context (returning only a summary), plan mode is designed for evaluating multiple design approaches and making architectural decisions, and direct execution is appropriate once implementation steps are clearly defined. Option B uses `/compact` as a workaround for context management but doesn't isolate exploration output as effectively as the Explore subagent. Option C applies plan mode throughout, including to well-defined implementation steps where it adds unnecessary overhead. Option D applies direct execution to the uncertain exploration phase, missing the isolation benefit of the Explore subagent.
---

## Question 35

Your Claude Code session has been running for 2 hours on a large refactoring task. You started by exploring 40 files in the authentication module, then implemented changes in 15 of them. Now you're asking Claude to verify that the refactored `TokenValidator` class is consistent with the patterns you established in `AuthService.java` three hours ago. Claude's response references "typical patterns in authentication libraries" rather than the specific `AuthService.java` implementation you showed it earlier. What is the most likely cause?

A) Context degradation — after an extended session with verbose exploration output, early findings from `AuthService.java` have been pushed out of effective processing range
B) Claude Code has a 2-hour session timeout that resets memory periodically
C) The `AuthService.java` file is too large to be held in context simultaneously with the refactoring changes
D) The `--resume` flag was not used when restarting the session, losing the file analysis

**Answer:** A

**Explanation:** Context degradation in extended sessions causes models to start referencing general patterns rather than specific earlier findings. After 2 hours of verbose exploration across 40 files and implementation in 15 files, the detailed analysis of `AuthService.java` from early in the session may have been effectively displaced. This is a known failure mode where models lose precision on early context in very long sessions. Option B is false — Claude Code does not have periodic memory resets on a timer. Option C mischaracterizes the issue — it's about context degradation, not file size limits. Option D references `--resume` which is for resuming interrupted sessions, not for maintaining context within an active session.
---

## Question 36

During a large codebase exploration session in Claude Code, you discover that early key findings — specifically which classes implement the `PaymentProcessor` interface — are no longer being referenced accurately in later responses. Claude claims `StripeGateway` implements the interface, but you know from earlier exploration that `StripeProcessor` is the correct class name. What technique best preserves key findings across context boundaries?

A) Have the agent maintain a scratchpad file recording key findings (class names, interface implementations, dependency relationships), and reference it explicitly in subsequent questions
B) Repeat the interface implementation discovery in every new prompt to re-establish the facts
C) Use plan mode exclusively for the rest of the session to prevent further context loss
D) Restart the session and re-explore only the interface implementations with a fresh context

**Answer:** A

**Explanation:** Scratchpad files provide persistent, reliable storage for key findings that survives context boundaries. When Claude drifts to incorrect class names, the scratchpad serves as ground truth that can be referenced explicitly. Unlike conversation history, scratchpad files are always accessible regardless of how much subsequent content has accumulated. Option B re-runs expensive exploration for each question rather than persisting results once. Option C misapplies plan mode — it doesn't prevent context degradation, it's used for design decisions. Option D discards the entire session's work to recover one piece of information.
---

## Question 37

You're building a multi-agent system where a primary Claude Code session coordinates three specialized subagents: one for dependency analysis, one for security scanning, and one for test coverage analysis. Each subagent generates verbose output (500-800 lines each). After all three complete, the coordinator's context window is 85% full and it hasn't started the synthesis phase. What architectural change addresses this?

A) Delegate each analysis to a subagent that returns structured summaries (key findings, severity counts, coverage percentages) rather than full verbose output, leaving the coordinator with sufficient context for synthesis
B) Increase the coordinator's context window by switching to a model with 200K tokens
C) Run the three subagents sequentially instead of in parallel so their outputs don't accumulate simultaneously
D) Use `/compact` before each subagent is invoked to clear previous results from the coordinator's context

**Answer:** A

**Explanation:** Modifying upstream subagents to return structured summaries instead of verbose content is the correct architectural fix. When downstream agents have limited context budgets, subagents should return key facts, severity counts, and relevant excerpts rather than full output and reasoning chains. This is a design principle for multi-agent systems. Option B addresses the symptom (context fullness) but doesn't fix the architectural issue — eventually even 200K tokens will fill. Option C doesn't reduce total context accumulation, just changes the order it fills. Option D uses `/compact` destructively, potentially losing important details from earlier subagent results before synthesis.
---

## Question 38

Your Claude Code session is exploring a large monorepo to understand service dependencies before a major refactoring. After 90 minutes of exploration across 60+ files, the session is near the context limit. You need to continue with a second phase of exploration covering infrastructure configuration files. What is the recommended approach to prevent context loss between phases?

A) Summarize key findings from the first exploration phase into a structured document, then use `/compact` or start a new session with those findings injected into the initial context for Phase 2
B) Use `--resume` to continue the previous session without losing any exploration output
C) Save the entire conversation history to a file and manually paste it into a new session
D) Run `/memory` to force Claude to save the session to disk before starting Phase 2

**Answer:** A

**Explanation:** The recommended pattern for multi-phase exploration is to summarize key findings before transitioning phases. Creating a structured summary document and injecting it into the Phase 2 context ensures critical information is preserved in a compact, accessible form. This is more reliable than hoping the full conversation history remains accessible. Option B `--resume` is for resuming interrupted sessions (e.g., after a crash), not for managing context between deliberate phases. Option C manually pasting full conversation history defeats the purpose of summarization and likely exceeds practical context limits. Option D `/memory` does not force a save-to-disk operation — it's a diagnostic command for viewing loaded memory files.
---

## Question 39

You're running a multi-agent code analysis pipeline that processes a large codebase overnight. The pipeline crashes at 3 AM after 5 hours of work when a network partition interrupts the dependency analysis agent. No state was persisted. You need to redesign the pipeline to support crash recovery. Which design pattern is most effective?

A) Each agent exports its state to a known location (e.g., `analysis-state/dependency-agent.json`) at checkpoints, and the coordinator loads a manifest on resume to determine which agents have completed and inject their results into remaining agents' prompts
B) Use `--resume` on each agent process to restart from the last checkpoint automatically
C) Wrap each agent in a retry loop that restarts the entire agent from the beginning if a failure is detected
D) Store intermediate results in the main Claude Code conversation history and use `--resume` on the coordinator to reload everything

**Answer:** A

**Explanation:** Structured state persistence with a coordinator manifest is the correct crash recovery design. Each agent exports its state (completed work, key findings) to a known location. On resume, the coordinator reads the manifest, identifies which agents completed successfully, and injects their results into still-pending agents' prompts — avoiding redundant recomputation. Option B misuses `--resume`, which is a session resume mechanism, not an agent checkpoint system. Option C restarts entire agents from scratch, wasting all prior work rather than resuming from the interruption point. Option D storing state in conversation history is unreliable — conversation history is not a persistent state store designed for this purpose.
---

## Question 40

During a session analyzing API performance issues, Claude Code has been running lookup queries that return 60-field JSON objects. After 20 lookups, the context is dominated by these verbose tool results. You only need `endpoint`, `avg_latency_ms`, `p99_latency_ms`, and `error_rate` from each result. What is the most effective context management strategy?

A) Trim the tool output to only the 4 relevant fields before accumulating results in context, rather than storing full 60-field responses
B) Use `/compact` after every 5 lookups to compress accumulated results
C) Store the full results in a scratchpad file and reference only the scratchpad in prompts
D) Increase the session's context window limit by passing `--context-size 200k` to the CLI

**Answer:** A

**Explanation:** Trimming verbose tool outputs to only relevant fields before they accumulate in context is the correct approach. Keeping only the 4 relevant fields from each 60-field response reduces context consumption by ~93% per lookup. This is the recommended technique for managing tool result accumulation. Option B uses `/compact` reactively — it compresses context after it fills rather than preventing irrelevant data from entering context in the first place. Option C stores full results in a scratchpad file, which doesn't prevent them from also accumulating in conversation context. Option D references `--context-size` which is not a valid Claude Code CLI parameter.
---

## Question 41

You're managing a long-running Claude Code session that has been debugging a memory leak across multiple modules. After 3 hours, you run `/compact` to reduce context usage. What is the primary risk of using `/compact` at this point?

A) `/compact` may condense or lose specific numerical details, variable names, and exact error messages that are critical for continued debugging
B) `/compact` terminates the current session and requires restarting with `--resume`
C) `/compact` reduces the available tool set for subsequent commands in the session
D) `/compact` invalidates any open file handles and requires re-reading all files from disk

**Answer:** A

**Explanation:** `/compact` performs progressive summarization, which carries the risk of condensing or losing specific facts — numerical values, variable names, exact error messages, stack trace details — into vague summaries. For a debugging session, the precise details (exact memory addresses, specific class names, error codes) are critical and should be preserved in a scratchpad file before compacting. Option B is false — `/compact` compresses context in the current session without terminating it; `--resume` is for restarting interrupted sessions. Option C is false — `/compact` does not affect tool availability. Option D is false — `/compact` operates on conversation context, not file system state.
---

## Question 42

Your Claude Code session has explored a large React codebase and discovered that the `useAuthentication` hook is imported in 23 components, three of which have custom override patterns. You're about to compact the session to continue with refactoring work. What should you do before running `/compact`?

A) Record the key findings (which 23 components import `useAuthentication`, which 3 have override patterns, and the specific override implementation details) in a scratchpad file to reference after compaction
B) Copy the entire conversation history to clipboard before running `/compact`
C) Run plan mode to formalize the findings before compaction replaces them
D) Use `--json-schema` to export the session findings as structured JSON before compacting

**Answer:** A

**Explanation:** Before running `/compact`, critical findings should be persisted in a scratchpad file. Specific data — which 23 files, which 3 have overrides, what the override patterns look like — is exactly the type of transactional detail that progressive summarization risks losing. A scratchpad file preserves these facts reliably across the compact boundary. Option B copying to clipboard is not a durable persistence mechanism and doesn't integrate with the Claude Code session context. Option C plan mode is for design decisions, not for persisting discovered facts. Option D references `--json-schema` which is a CLI flag for structured output in CI contexts, not a session state export mechanism.
---

## Question 43

A multi-agent code analysis system has a documentation extraction subagent and a code synthesis agent. The documentation agent summarizes API docs into 2-3 paragraph overviews, stripping away specific parameter types, return values, and version-introduced dates. When the synthesis agent tries to generate integration code, it produces incorrect type signatures and uses deprecated method signatures from older API versions. What is the root cause?

A) Source attribution and structured details (parameter types, return values, version dates) are being lost during the documentation agent's summarization step before reaching the synthesis agent
B) The synthesis agent lacks access to the original documentation files and needs direct file access
C) The documentation agent's prompts need to include more examples of correct API usage
D) The synthesis agent needs a larger context window to accommodate more documentation detail

**Answer:** A

**Explanation:** This is a canonical information provenance failure: summarization strips away specific structured details (types, return values, version metadata) that downstream agents need for accurate code generation. When findings are compressed without preserving claim-source mappings and specific facts, downstream agents have insufficient information to generate correct code. Option B addresses a symptom (synthesis agent could bypass documentation agent) but not the root cause (information loss in the pipeline). Option C adds examples to the documentation agent but doesn't change that it strips critical details from summaries. Option D treats context window size as the problem when the real issue is that the documentation agent is discarding relevant information.
---

## Question 44

Your research pipeline has subagents analyzing papers from 2019, 2021, 2023, and 2024 about transformer architecture improvements. The synthesis agent reports a "contradiction" between two claims about attention head efficiency. Investigation reveals one paper is from 2019 (early transformer work) and the other is from 2024 (post-Flash Attention era). The claims are actually temporally consistent — the field evolved. How should the pipeline be redesigned to prevent this misinterpretation?

A) Require subagents to include publication or data collection dates in their structured outputs so the synthesis agent can correctly interpret temporal differences as evolution rather than contradiction
B) Have the synthesis agent always defer to the most recent paper when conflicts are detected
C) Filter the research corpus to only include papers from the last 2 years to avoid temporal inconsistencies
D) Add a conflict resolution agent that votes between conflicting claims based on citation count

**Answer:** A

**Explanation:** Requiring subagents to include publication dates in structured outputs is the documented solution for preventing temporal differences from being misinterpreted as contradictions. When the synthesis agent has date metadata, it can correctly characterize a difference as temporal evolution rather than a factual conflict. Option B applies a recency bias heuristic that may be wrong — older foundational findings may be more reliable for certain claims. Option C loses historical context and evolutionary trajectory, which is often research value. Option D uses citation count as a proxy for correctness, which is unreliable and adds infrastructure complexity.
---

## Question 45

Your multi-agent research system produces a 40-page synthesis report on cloud security vulnerabilities. A colleague asks: "Where did you get the statistic that 73% of cloud breaches involve misconfigured IAM roles?" You query the synthesis agent and it cannot identify the source. The web search agent that found this statistic summarized its findings as prose paragraphs without preserving URLs or document titles. How should the pipeline be redesigned?

A) Require subagents to output structured claim-source mappings (source URLs, document names, relevant excerpts) that downstream synthesis agents must preserve rather than discard during summarization
B) Have the synthesis agent append a "Sources Reviewed" section listing all documents the search agents processed
C) Run the web search agent again with the same query to re-find the original source
D) Add a post-processing step that searches the synthesis report text against known citation databases to retroactively identify sources

**Answer:** A

**Explanation:** Source attribution is lost during summarization when subagents convert findings to prose without preserving claim-source mappings. The fix is architectural: subagents must output structured data including source URLs, document names, and relevant excerpts, and downstream agents must be instructed to preserve these mappings rather than discarding them during synthesis. Option B adds a sources section but if the search agent didn't preserve source URLs in its output, the synthesis agent cannot retroactively reconstruct them. Option C is non-deterministic — re-running a web search may not return the same document. Option D requires external citation database access and cannot reliably match statistical claims to sources.
---

## Question 46

Two of your research subagents report conflicting statistics about TypeScript adoption rates: Agent A reports 62% (from a JetBrains developer survey) while Agent B reports 41% (from a Stack Overflow developer survey). Both sources are credible. The synthesis agent arbitrarily picks 62% and discards the Stack Overflow finding. How should conflicting statistics from multiple credible sources be handled?

A) Both values should be included in the synthesis with explicit source attribution, and the difference characterized as methodological variation (different survey populations, sampling methods, time periods)
B) The synthesis agent should average the two values (51.5%) to produce a consensus estimate
C) The synthesis agent should always prefer survey data from specialized developer tools companies
D) Run a third web search to find a tiebreaker statistic that either confirms one value or provides a third data point

**Answer:** A

**Explanation:** When credible sources report conflicting statistics, the correct approach is to annotate conflicts with source attribution — presenting both values with their sources and characterizing the difference (different survey populations, methodology, time periods). This preserves the nuance and lets readers make informed judgments. Option B averaging obscures the actual data points and creates a number that neither source reported. Option C applies an arbitrary source preference heuristic without methodological justification. Option D introduces more data without resolving the methodological differences, and three conflicting values without attribution is worse than two.
---

## Question 47

Your code analysis pipeline processes security scan findings from three specialized subagents. Subagent 1 (SQL injection scan) times out after 30 seconds. Subagent 2 (XSS scan) returns empty results. Subagent 3 (dependency vulnerability scan) completes successfully with 3 findings. The coordinator receives: `{status: "error"}` from Subagent 1, `{results: []}` from Subagent 2, and `{results: [...3 findings...]}` from Subagent 3. What does the coordinator lack to make intelligent recovery decisions?

A) Subagent 1's error lacks failure type, attempted query scope, and retry guidance; Subagent 2's empty result is indistinguishable from a failed scan that returned nothing versus a successful scan with no findings
B) The coordinator needs a centralized error registry to correlate errors across subagents
C) Subagent 3 should not return results until all subagents complete to maintain result consistency
D) The coordinator needs a timeout configured to wait longer before declaring Subagent 1 as failed

**Answer:** A

**Explanation:** This is the distinction between access failures and valid empty results. `{status: "error"}` from Subagent 1 hides whether it was a timeout, an authentication failure, or a scan error — information the coordinator needs to decide whether to retry or skip. `{results: []}` from Subagent 2 is ambiguous: was it a successful scan with no XSS vulnerabilities, or did the scan fail and return an empty success? The coordinator cannot make intelligent recovery decisions without this distinction. Option B adds infrastructure (error registry) without fixing the fundamental information gap in subagent error responses. Option C creates artificial blocking dependencies. Option D addresses the timeout threshold but not the information content of the error response.
---

## Question 48

Your CI/CD pipeline uses Claude Code to review PRs for security vulnerabilities. After a security audit, you discover that a SQL injection vulnerability made it through 3 PR reviews without being flagged. Investigation shows the vulnerability was in code that appeared in the middle of a 250-line diff across 8 files. What does this suggest about how the review was structured?

A) The review was processing all 8 files in a single pass, causing attention dilution where middle-context findings were overlooked — a file-by-file review with a separate integration pass would have been more reliable
B) The SQL injection pattern was too subtle for the model to detect regardless of review structure
C) The security rules in `CLAUDE.md` were not specific enough about SQL injection patterns
D) The `-p` flag prevents Claude from performing deep analysis, requiring a streaming approach instead

**Answer:** A

**Explanation:** Processing a 250-line diff across 8 files in a single pass creates attention dilution — the "lost in the middle" effect where findings from middle sections are more likely to be overlooked. The SQL injection vulnerability appearing in the middle of a large review is consistent with this pattern. Restructuring to file-by-file passes followed by a separate integration pass ensures each file gets consistent attention depth. Option B assumes model incapability without evidence, when the evidence points to structural issues. Option C might improve detection but doesn't address the structural problem of attention dilution. Option D is incorrect — the `-p` flag enables non-interactive mode but does not reduce analysis depth.
---

## Question 49

Your multi-agent system assigns a documentation subagent to research GraphQL best practices. The subagent searches the web, reads 12 articles, and returns a 600-line detailed report with quotes, code examples, and full article summaries. The coordinator is running a synthesis task with 6 other subagents and its context is 70% full before synthesis begins. How should the upstream documentation agent be redesigned?

A) The documentation agent should return structured key findings — a list of best practices with source attribution and confidence levels — rather than full article content, since the coordinator has limited context budget
B) The coordinator should use `/compact` after receiving the documentation agent's output
C) The documentation agent should paginate its output into 3 × 200-line chunks delivered in sequence
D) The synthesis task should be split across two coordinator instances to distribute the context load

**Answer:** A

**Explanation:** When downstream agents have limited context budgets, upstream agents should return structured data — key facts, citations, relevance scores — instead of verbose content and reasoning chains. A list of best practices with source attribution is far more useful to the coordinator than 600 lines of article summaries. Option B reactively compresses after the problem has already occurred, potentially losing important details. Option C paginates verbose output rather than reducing it — 200-line chunks still sum to 600 lines total. Option D splits the coordinator rather than fixing the upstream agent's output design.
---

## Question 50

Your Claude Code session has been tracking a performance regression across a 3-hour debugging session. You've discovered that the `DatabaseConnectionPool` class has a connection leak when `maxConnections` exceeds 50, but only when the `idleTimeout` is set below 5000ms and connections are created via the async factory pattern. You need to pass these specific findings to a new session to continue work. What is the safest way to preserve these transactional facts?

A) Extract the specific facts (class name, conditions: maxConnections > 50 AND idleTimeout < 5000ms AND async factory pattern) into a structured "findings" block and include it at the beginning of the new session's prompt
B) Use `--resume` to reload the full previous session context in the new session
C) Copy the last 10 responses from the session into the new session as conversation history
D) Ask Claude to write a summary of its findings and save it to the conversation's embedded memory

**Answer:** A

**Explanation:** Transactional facts — specific class names, threshold values, conditional combinations — should be extracted into a persistent structured block placed at the beginning of the new prompt. This ensures precise details survive the session transition without risk of summarization loss. The specific conditions (`maxConnections > 50`, `idleTimeout < 5000ms`, `async factory pattern`) are exactly the kind of numerical and conditional data that gets condensed in summaries. Option B `--resume` is for resuming an interrupted session that crashed or was disconnected, not for transferring findings to a deliberately new session. Option C pasting 10 responses includes verbose context that could overwhelm the new session. Option D references "embedded memory" as a session storage mechanism that does not exist in Claude Code.
---

## Question 51

Your automated code review pipeline has been running for 3 months. You review a sample of 200 PRs and find that the overall approval rate is 94% with only 6% requiring human review. However, when you segment by PR type, you notice: (a) single-file bug fixes are approved 99% of the time, (b) feature additions are approved 95% of the time, but (c) security-sensitive PRs (touching auth, payments, cryptography) are also approved 91% of the time. What concern does this data reveal?

A) Aggregate accuracy metrics may mask poor performance on specific PR types — the 91% approval rate for security-sensitive PRs warrants segmented analysis to verify accuracy, since false approvals in those PRs carry the highest risk
B) The overall 94% approval rate is acceptable and the security-sensitive rate of 91% is within normal variance
C) The pipeline should be reconfigured to route all security-sensitive PRs to human review regardless of the approval rate
D) The 99% approval rate for bug fixes suggests the model is too permissive and the threshold should be raised across all PR types

**Answer:** A

**Explanation:** Aggregate accuracy metrics can mask poor performance on specific segments. A 91% approval rate for security-sensitive PRs means 9% are being approved with potentially undetected security issues — which is a much higher risk than 5% misclassification in bug fixes. Before concluding the pipeline is working, segmented analysis and validation of the security-sensitive approvals is essential. Option B accepts the security-sensitive rate without validating whether those approvals are correct. Option C over-corrects to 100% human review for security PRs without first measuring actual error rates. Option D conflates high approval rates with permissiveness without data on false positives vs. true approvals.
---

## Question 52

You're building a confidence-based routing system for Claude Code's code review outputs. Reviews with confidence score ≥ 0.85 are automatically merged, while lower-confidence reviews route to human developers. You've been using this system for 2 months. How should you validate that the 0.85 threshold is calibrated correctly?

A) Implement stratified random sampling of high-confidence (≥0.85) approved reviews and have humans evaluate them to measure the actual error rate at that confidence level, comparing it against acceptable thresholds
B) Use the overall PR approval accuracy (currently 94%) as a proxy for confidence calibration quality
C) Adjust the threshold based on developer complaints about incorrectly approved PRs
D) Compare the distribution of confidence scores against a normal distribution to detect miscalibration

**Answer:** A

**Explanation:** Calibrating confidence thresholds requires measuring actual error rates in high-confidence predictions using human-validated labels. Stratified random sampling of auto-approved reviews measures whether 0.85-confidence reviews are actually being decided correctly, and whether the threshold should be higher or lower. Option B uses aggregate accuracy as a proxy for confidence calibration, but aggregate accuracy doesn't tell you whether the errors are concentrated in the high-confidence band or the low-confidence band. Option C is reactive and anecdotal — developers only notice and report a subset of errors. Option D tests distributional shape but doesn't measure whether high-confidence predictions are actually correct.
---

## Question 53

Your Claude Code CI pipeline reviews PRs for type errors. After enabling TypeScript strict mode, the first pipeline run reports 47 type errors across 12 files. The developer fixes 30 of them and pushes a new commit. Your review pipeline runs again and reports 47 findings — but it was not given context about the previous review. What is the correct pipeline configuration to avoid reporting already-addressed issues?

A) Include the prior review findings (all 47 original issues) in the context of the second run, and instruct Claude to identify which issues are now resolved, which remain, and flag any new issues introduced by the fixes
B) Diff the second review output against the first and filter out matching line numbers
C) Have the pipeline track review findings in a database and join with current findings by file path and rule type
D) Lower the pipeline's sensitivity threshold so it only reports high-confidence findings in subsequent runs

**Answer:** A

**Explanation:** The correct approach is providing prior review findings in context and instructing Claude to distinguish resolved, persistent, and new issues. This gives Claude the information needed to track issue state intelligently across pipeline runs. Option B uses line number matching, which is fragile — fixing one issue may shift line numbers for other issues, causing false matches or misses. Option C adds database infrastructure for issue tracking, which is over-engineered when context-based tracking solves the problem. Option D reduces sensitivity globally, which would cause legitimate new issues to be missed.
---

## Question 54

Your security review subagent returns the following: `{"status": "timeout", "findings": []}`. The coordinator sees an empty findings list and proceeds as if the security review was clean. A deployment later reveals an SQL injection vulnerability that the security agent would have caught. What error propagation pattern would have prevented this?

A) The subagent should distinguish access failures from valid empty results: `{"status": "error", "error_type": "timeout", "attempted_scope": "auth module", "findings_before_timeout": [...], "retry_recommended": true}` vs `{"status": "success", "findings": []}`
B) The coordinator should require a cryptographic signature on all subagent results to verify they completed successfully
C) The subagent should retry indefinitely until it produces a complete result before returning
D) The coordinator should treat any empty findings list as requiring human verification regardless of status

**Answer:** A

**Explanation:** The critical failure was treating a timeout (access failure) as equivalent to a successful scan with no findings. Structured error context must distinguish: (a) access failures with error type, scope attempted, partial results, and retry recommendation vs. (b) successful empty results. This distinction enables the coordinator to route to retry, fallback, or human review rather than falsely concluding the scan was clean. Option B authentication adds overhead but doesn't solve the semantic problem of distinguishing failure from success. Option C infinite retry without backoff or escalation is an anti-pattern that can block the pipeline indefinitely. Option D over-corrects by routing all empty results to human review, including legitimate clean scans.
---

## Question 55

Your team runs a nightly Claude Code analysis of the entire codebase to identify tech debt. The pipeline has been running for 6 months. A developer reviewing a 3-month-old report asks: "This says our `OrderService` uses the deprecated `v1` payment gateway — is that still true?" The current pipeline cannot answer because findings have no timestamps. How should the pipeline be modified?

A) Require all analysis agents to include the date of analysis and the version of the codebase analyzed (git commit SHA) in structured outputs, so findings can be correctly interpreted as point-in-time observations
B) Add a separate "freshness check" agent that re-validates each finding before it's served to developers
C) Archive reports with a date-stamped filename and instruct developers to check the most recent report
D) Set a maximum finding lifetime of 30 days and auto-delete findings older than that threshold

**Answer:** A

**Explanation:** Including analysis date and codebase version (commit SHA) in structured outputs provides the temporal context needed to correctly interpret findings as point-in-time observations. A developer querying the `OrderService` finding can immediately see it's from 3 months ago at a specific commit and assess whether the code has changed. Option B adds infrastructure to re-validate findings, which may be expensive and also doesn't address the provenance question (when was this originally found?). Option C relies on developers manually checking file modification dates — this doesn't provide the codebase version context. Option D auto-deletes potentially still-valid findings and loses historical trend data.
---

## Question 56

Your codebase analysis pipeline has three subagents: (1) one that analyzes `src/api/**` files, (2) one that analyzes `src/components/**` files, and (3) one that analyzes `src/utils/**` files. The coordinator synthesizes all three results. During a session, the API analysis agent crashes at 60% completion due to an OOM error. How should the coordinator respond?

A) The API agent should return structured partial results with coverage annotation: `{"completed_files": [...], "pending_files": [...], "error_type": "OOM", "completion_percentage": 60}`, enabling the coordinator to synthesize available results with explicit gap annotation rather than failing the entire pipeline
B) The coordinator should terminate the entire pipeline and restart from the beginning
C) The coordinator should mark the entire API analysis as unavailable and exclude API findings from the synthesis report without annotation
D) The coordinator should retry the API agent three times before escalating to human review

**Answer:** A

**Explanation:** Structured partial results with coverage annotations allow the coordinator to synthesize available findings while explicitly noting that API analysis is incomplete (60% complete, specific files pending). The report can be delivered with accurate gap annotations rather than being blocked entirely. This is the correct approach: neither silently suppressing the error (returning empty results as success) nor terminating the entire workflow unnecessarily. Option B discards 60% of completed API analysis work and 100% of the other agents' completed work. Option C excludes API findings silently without annotation, which misrepresents the report's coverage to downstream consumers. Option D retrying OOM errors without memory optimization will likely reproduce the same crash.
---

## Question 57

Your multi-agent system generates a software architecture assessment report. The final synthesis contains a claim: "The authentication module has 3 critical vulnerabilities." When a security engineer asks for the original vulnerability details and which scanning tool flagged each one, the synthesis agent cannot provide them. Investigation shows the security scanning subagent summarized findings into a single count without preserving individual vulnerability details or tool attribution. What design change is needed?

A) Require the security scanning subagent to output structured claim-source mappings for each finding: `{"vulnerability_id": "...", "description": "...", "source_tool": "...", "file_path": "...", "line": ...}` that downstream synthesis agents must preserve
B) Give the synthesis agent direct access to run security scans so it can re-scan when details are requested
C) Store the security subagent's raw output in a side-channel database separate from the synthesis pipeline
D) Add a post-synthesis "detail retrieval" agent that re-runs analysis to reconstruct any lost details

**Answer:** A

**Explanation:** Source attribution is lost during summarization when subagents compress findings without preserving claim-source mappings. The fix requires the security subagent to output structured data for each finding that synthesis agents must carry through to the final report. When the synthesis says "3 critical vulnerabilities," each one must trace back to a specific tool finding with file and line. Option B adds new capabilities to the synthesis agent rather than fixing the upstream data loss. Option C adds a separate storage system when the correct fix is to not lose the information in the first place. Option D re-runs analysis to reconstruct lost details — expensive and non-deterministic when the original scan's exact state cannot be reproduced.
---

## Question 58

Your research pipeline produces synthesis reports that mix financial data, recent news summaries, and technical API documentation. The synthesis agent converts all content to flowing prose paragraphs. Reviewers complain that financial metrics are hard to scan, code examples are hard to read, and news items are hard to skim. How should the synthesis agent's output be restructured?

A) Render different content types appropriately: financial data as tables, technical API documentation as structured code blocks and lists, and news summaries as prose — rather than forcing all content into a uniform format
B) Separate the report into three separate documents: one for financial data, one for technical content, and one for news
C) Add a formatting post-processor that converts prose to the appropriate format based on content type detection
D) Switch to a different model that specializes in structured document generation

**Answer:** A

**Explanation:** Different content types should be rendered in their most appropriate format within a unified synthesis report. Financial data is clearest as tables, technical content as code blocks and structured lists, and narrative content as prose. This is a content design principle for synthesis outputs. Option B fragments the unified report into separate documents, losing the integrated analysis value. Option C adds infrastructure to fix a problem that should be addressed in the synthesis agent's output instructions. Option D assumes a model specialty distinction that doesn't exist in the relevant Claude models.
---

## Question 59

Your Claude Code CI pipeline reviews PRs for code quality. The overall accuracy across 1,000 reviews is 96%. However, a developer reports that the pipeline consistently misses issues in React components that use the new `useTransition` hook (introduced in React 18). You review 20 PRs using `useTransition` and find the pipeline flagged legitimate issues in only 3 of them. What does this indicate and what should you do?

A) Aggregate accuracy (96%) masks poor performance on a specific code pattern — the `useTransition` cases warrant segmented validation, and `CLAUDE.md` should be updated with explicit `useTransition` review criteria and examples
B) The 96% accuracy is so high that the `useTransition` pattern is likely a statistical anomaly in the 20-sample test
C) The pipeline should be retrained with more `useTransition` examples to improve detection
D) The developer's report should be escalated to Anthropic as a model capability limitation

**Answer:** A

**Explanation:** Aggregate accuracy metrics mask poor performance on specific document types or code patterns. The 96% overall accuracy hides a severe failure on `useTransition` patterns (3/20 = 15% detection rate). This is exactly the scenario where segmented accuracy analysis is required before trusting overall metrics. The fix includes documenting `useTransition`-specific review criteria in `CLAUDE.md` to improve detection quality. Option B dismisses a clear signal (15% vs 96%) as noise — 20 samples showing 3/20 correct is a meaningful pattern. Option C references "retraining" Claude, which is not available to end users configuring Claude Code. Option D escalates prematurely without attempting configuration-level remediation through `CLAUDE.md`.
---

## Question 60

Your multi-agent codebase analysis system processes findings from 5 subagents before synthesis. Three subagents complete successfully. One subagent times out on the authentication module (access failure). One subagent successfully scans the payment module and finds zero issues (valid empty result). The synthesis report states: "Authentication module: data unavailable. Payment module: no issues found." A reviewer asks: "How do I know the authentication scan actually failed versus just being clean?" What design principle does this question highlight, and what is the correct fix?

A) The synthesis report must annotate coverage gaps by distinguishing between access failures and valid empty results — the authentication entry should read "Scan failed (timeout after 30s, retry recommended)" while the payment entry reads "Scan completed — no issues detected"
B) Both authentication and payment should be marked as "data unavailable" to maintain consistent reporting when any subagent encounters issues
C) The synthesis report should omit modules where data is uncertain and only report on completed scans
D) Add a confidence score to the entire synthesis report rather than annotating individual modules

**Answer:** A

**Explanation:** This question highlights the principle of structuring synthesis output with coverage annotations that distinguish well-supported findings from gaps due to access failures. "Authentication: scan failed (timeout, retry recommended)" and "Payment: scan completed — 0 issues" convey fundamentally different information that affects the reviewer's decision about whether to approve or hold the release. Option B applies consistent uncertainty labeling to both cases, losing the distinction between a scan that failed and one that succeeded cleanly. Option C omits incomplete findings entirely, hiding the fact that authentication was not scanned and creating false confidence. Option D applies aggregate uncertainty to the whole report rather than annotating individual module coverage accurately.
---
