# Claude Code for Continuous Integration

**Total Questions:** 60
**Domain Distribution:** Domain 3 (30), Domain 4 (30)

---

## Question 1

Your CI pipeline invokes Claude Code to review pull requests, but a new backend engineer reports that Claude is ignoring your team's API error-handling conventions entirely. You confirm the conventions are documented in `~/.claude/CLAUDE.md` on your own machine. Why is the new engineer not receiving these instructions, and what is the correct fix?

A) User-level `~/.claude/CLAUDE.md` is personal and never shared via version control; move the API error-handling conventions to the project-level `CLAUDE.md` at the repository root.
B) The `~/.claude/CLAUDE.md` file requires explicit `@import` statements in the project root to be activated; add those imports to the project CLAUDE.md.
C) CI environments do not read CLAUDE.md files at all; the conventions must be passed as inline prompt text with the `-p` flag.
D) The new engineer needs to run `claude /memory sync` to pull the latest user-level configuration from the team's shared account.

**Answer:** A

**Explanation:** User-level `~/.claude/CLAUDE.md` files are stored in the user's home directory and are deliberately personal — they are never committed to version control and cannot be shared with teammates. The conventions must live in the project-level `CLAUDE.md` (at the repository root or in `.claude/CLAUDE.md`) so they are available to every developer who clones the repo. Option B is incorrect because `@import` is a modularity mechanism within CLAUDE.md files, not an activation mechanism between user-level and project-level files. Option C is a misconception; CI-invoked Claude Code does read project-level CLAUDE.md. Option D references a `/memory sync` command that does not exist.
---

## Question 2

Your project CLAUDE.md has grown to over 800 lines covering API conventions, testing standards, deployment procedures, database migration rules, and security policies. Developers report that Claude occasionally applies deployment instructions when editing test files. Which approach best addresses this while keeping all conventions accessible?

A) Delete the long CLAUDE.md and put all conventions in the system prompt of each `-p` invocation.
B) Reduce the CLAUDE.md to a brief summary and move detailed conventions to a shared internal wiki linked in a comment.
C) Split the file into topic-specific files in `.claude/rules/` (e.g., `testing.md`, `deployment.md`, `security.md`) and use YAML frontmatter `paths` fields so each file loads only for matching file contexts.
D) Create a separate CLAUDE.md in every subdirectory of the project, each containing only the conventions relevant to that directory.

**Answer:** C

**Explanation:** The `.claude/rules/` directory with YAML frontmatter `paths` fields is precisely the mechanism designed for this problem: topic-specific rule files that load conditionally based on glob patterns, preventing deployment rules from appearing when Claude is editing test files. Option A loses project-level context and creates maintenance overhead duplicating prompts across every CI invocation. Option B moves authoritative information outside the repository where Claude cannot read it. Option D works only for directory-contained conventions — it cannot handle cross-directory concerns like test files spread throughout the codebase.
---

## Question 3

Your monorepo's CLAUDE.md contains security review criteria, coding standards, and test generation guidelines all in one 600-line file. Different teams (security, QA, backend) need to own and update their sections independently without merge conflicts. What is the recommended Claude Code mechanism?

A) Store each team's conventions as environment variables that are injected by the CI runner at job time.
B) Create a `.claude/config.json` with a `rules_owners` map that assigns file sections to teams.
C) Duplicate the full CLAUDE.md into each team's subdirectory so they can edit it independently.
D) Use `@import` syntax in the root CLAUDE.md to reference separate files for each team's conventions, storing those files under `.claude/rules/`.

**Answer:** D

**Explanation:** The `@import` syntax is Claude Code's built-in mechanism for referencing external files from within CLAUDE.md, enabling modular, team-owned convention files that can be updated independently. Each team edits their own file; the root CLAUDE.md simply imports them, avoiding conflicts. Option A is not a supported pattern for convention loading — environment variables are for secrets and runtime configuration. Option B describes a configuration format that does not exist in Claude Code. Option C creates N copies of conventions that diverge over time.
---

## Question 4

After a refactor, developers report that Claude Code behaves inconsistently across sessions: sometimes it enforces your PR review criteria and sometimes it ignores them. The project CLAUDE.md exists at the repository root and looks correct when you read it. What command should you run first to diagnose which memory files are actually being loaded?

A) `claude --debug-config`
B) `cat ~/.claude/CLAUDE.md && cat .claude/CLAUDE.md`
C) `claude /memory`
D) `claude --list-rules`

**Answer:** C

**Explanation:** The `/memory` command in Claude Code is the documented tool for verifying which memory files are currently loaded in a session. It surfaces the active CLAUDE.md files and any imported rules so you can diagnose discrepancies between what you expect to be loaded and what Claude is actually reading. Option A references a flag that does not exist. Option B manually reads files but does not show what Claude is actually loading — there could be import errors or hierarchy conflicts. Option D references a flag that does not exist.
---

## Question 5

You want to create a `/ci-review` slash command that runs your team's standard pull request review checklist. The command must be available automatically when any developer clones the repository, without requiring any manual setup step. Where should you create this command file?

A) `.claude/commands/ci-review.md` in the project repository
B) `CLAUDE.md` under a `## Commands` heading at the project root
C) `~/.claude/commands/ci-review.md` on a shared network drive that all developers mount
D) `.claude/config.json` under a `"slash_commands"` key

**Answer:** A

**Explanation:** Project-scoped custom slash commands stored in `.claude/commands/` are version-controlled alongside the project code. Every developer who clones the repository immediately has access to the command without any manual setup. Option B is the project context file, not a command definition store; Claude Code does not parse CLAUDE.md for slash command definitions. Option C relies on a shared network drive — not version control — and breaks for remote developers. Option D references a configuration format that does not exist in Claude Code.
---

## Question 6

Your CI pipeline uses a `/security-scan` skill that runs an exhaustive recursive analysis of every imported module across the entire repository. When invoked during a review session, it floods the conversation with thousands of lines of dependency tree output, making subsequent review instructions difficult for Claude to follow. What frontmatter option should you configure in the skill's `SKILL.md` to prevent this?

A) `context: fork` to run the skill in an isolated sub-agent context so its output does not pollute the main conversation
B) `output-limit: 500` to cap the number of output lines
C) `allowed-tools: []` to prevent the skill from using any tools that produce verbose output
D) `priority: low` so the skill's output is deprioritized in the context window

**Answer:** A

**Explanation:** The `context: fork` frontmatter option runs the skill in an isolated sub-agent context. Its verbose output is contained within that sub-agent and only a summary is returned to the main conversation, preventing context pollution. This is explicitly the use case `context: fork` is designed for. Option B describes an `output-limit` field that does not exist in SKILL.md frontmatter. Option C uses `allowed-tools` to restrict what actions the skill can take — not how much output it returns. Option D describes a `priority` field that does not exist.
---

## Question 7

A developer on your team created a personal variant of the `/security-scan` skill that adds extra checks specific to their experimental branch. They want to use this personal variant without affecting their teammates' experience. Where should they place this personal skill file?

A) `.claude/skills/security-scan-personal.md` in the project repository, with `context: personal` in the frontmatter
B) `~/.claude/skills/` in their home directory with a distinct name to avoid overriding the project-level skill
C) `.claude/skills/security-scan.md` but with an `owner` frontmatter field set to their username
D) `~/.claude/commands/` as a slash command override that shadows the project-level skill

**Answer:** B

**Explanation:** Personal skill variants belong in `~/.claude/skills/` in the developer's home directory. Using a distinct name avoids overriding the shared project-level skill and keeps the personal customization entirely out of version control. Option A would commit the personal skill to the repository, making it visible to teammates. Option C describes an `owner` frontmatter field that does not exist. Option D uses the commands directory (not skills) and shadowing project-level skills through commands is not a supported pattern.
---

## Question 8

Your CI job invokes Claude Code with a custom `/generate-tests` skill. The skill requires a file path as an argument, but developers frequently invoke it without providing one. Which skill frontmatter field should you configure to prompt the developer for the required argument before the skill runs?

A) `argument-hint: "Provide the path to the file you want to generate tests for"`
B) `required-args: ["file_path"]`
C) `validate-input: true`
D) `prompt-on-missing: file_path`

**Answer:** A

**Explanation:** The `argument-hint` frontmatter field is the Claude Code mechanism that prompts the user for required parameters when a skill is invoked without arguments. When a developer types `/generate-tests` without a path, Claude Code displays the hint text and waits for input. Options B, C, and D describe frontmatter fields that do not exist in the SKILL.md specification.
---

## Question 9

Your team has conventions for React components (functional style with hooks), API handlers (async/await with structured error handling), and infrastructure code (Terraform declarative patterns) all in the root CLAUDE.md. When Claude reviews a Terraform file, it occasionally suggests React hook patterns. What is the best structural fix?

A) Add `<!-- apply only to React files -->` HTML comments before each React section in CLAUDE.md to create conditional sections.
B) Move all conventions to a single expanded system prompt injected by the CI runner so the runner can select which section to include.
C) Create a separate repository for infrastructure code so it has its own CLAUDE.md isolated from React conventions.
D) Create `.claude/rules/terraform.md` with `paths: ["terraform/**/*", "infra/**/*.tf"]` in the YAML frontmatter so Terraform rules load only when editing matching files.

**Answer:** D

**Explanation:** Path-specific rules in `.claude/rules/` with YAML frontmatter glob patterns are the correct mechanism for conditional rule loading. A `terraform.md` rule file with `paths: ["terraform/**/*", "infra/**/*.tf"]` ensures Terraform conventions load only when editing matching files, eliminating cross-contamination from React conventions. Option A is not a supported CLAUDE.md parsing feature — HTML comments do not create conditional sections. Option B loses path-awareness entirely and forces the CI runner to manually select conventions. Option C is an extreme architectural change that adds repository management overhead for what is a configuration problem.
---

## Question 10

Your `.claude/rules/` directory has rule files for React components and API handlers. Test files are named `*.test.tsx` and are colocated with their component files throughout `src/`. You want test conventions to apply to all test files regardless of directory. What glob pattern should `tests.md` use?

A) `paths: ["src/tests/**/*"]`
B) `paths: ["src/**/*.test.tsx", "src/**/*.spec.tsx"]`
C) `paths: ["**/*.test.*"]`
D) `paths: ["src/components/**/*.test.tsx"]`

**Answer:** B

**Explanation:** The pattern `src/**/*.test.tsx` matches all `.test.tsx` files anywhere within the `src/` directory tree, regardless of subdirectory depth — exactly right for colocated test files. Adding `src/**/*.spec.tsx` covers the alternate naming convention. Option A assumes test files are consolidated in a `src/tests/` folder, which contradicts the colocated structure described. Option C is overly broad and would match test files in `node_modules/` and other non-source directories. Option D restricts matching to only `src/components/`, missing test files colocated with API handlers and other modules.
---

## Question 11

You need to apply database migration conventions to files in `migrations/` and `db/seeds/`, but these conventions must NOT apply to `.ts` source files even if they contain SQL strings. What is the most precise path pattern for `.claude/rules/db-migrations.md`?

A) `paths: ["**/*.sql"]`
B) `paths: ["migrations/**/*.sql", "db/seeds/**/*.sql"]`
C) `paths: ["db/**/*", "migrations/**/*"]`
D) `paths: ["*.sql"]`

**Answer:** B

**Explanation:** `paths: ["migrations/**/*.sql", "db/seeds/**/*.sql"]` precisely targets only the two directories containing SQL migration and seed files, with the `.sql` extension filter ensuring TypeScript files with embedded SQL strings are excluded. Option A uses `**/*.sql` which could match any `.sql` file anywhere in the repo, including test fixtures or documentation examples. Option C matches all files in `db/` and `migrations/` regardless of extension, including README files. Option D with `*.sql` matches only in the root directory, not subdirectories.
---

## Question 12

Your CI pipeline runs `claude "Review this PR for security issues"` and the job hangs for 45 minutes before timing out. Logs show the process is waiting at a prompt. What single flag resolves this problem?

A) `-p` (or `--print`)
B) `--timeout 60`
C) `--no-interactive`
D) `--ci-mode`

**Answer:** A

**Explanation:** The `-p` (or `--print`) flag runs Claude Code in non-interactive mode: it processes the prompt, writes output to stdout, and exits without waiting for user input. This is the documented mechanism for CI/CD pipeline usage. Options B, C, and D reference flags that do not exist in Claude Code's CLI specification. The `-p`/`--print` flag is the correct and only supported solution.
---

## Question 13

Your CI pipeline generates test cases for new functions. In a review of 200 generated test cases, 47 are exact duplicates of tests already in the existing test suite. What context should you provide when invoking Claude Code to eliminate duplicates?

A) Include the existing test files in the context so Claude knows which test scenarios are already covered and avoids suggesting duplicates.
B) Pass `--deduplicate-tests` to filter output before it is written.
C) Add `--output-format json` and parse the output to remove duplicate test names programmatically.
D) Instruct Claude with "generate only unique tests" in the prompt text.

**Answer:** A

**Explanation:** Task Statement 3.6 explicitly states: "Providing existing test files in context so test generation avoids suggesting duplicate scenarios already covered by the test suite." Giving Claude the existing test files allows it to understand what is already covered and generate only additive tests. Option B references a flag that does not exist. Option C addresses programmatic deduplication after the fact, but does not help Claude generate better tests — it just filters output and may remove valid tests with similar names. Option D is a vague instruction far less effective than providing the actual test files as evidence.
---

## Question 14

Your pipeline runs automated PR reviews. A developer pushes three additional commits to address issues flagged in the first review. When Claude re-reviews the PR, it posts all the original findings again as new comments, even for issues that were fixed. What is the correct approach?

A) Include the prior review findings in the context when re-running the review, and instruct Claude to report only new or still-unaddressed issues.
B) Add `--skip-reviewed` to the Claude Code CLI invocation to filter previously seen findings.
C) Store all reviewed findings in a database and use a post-processing script to deduplicate comments before posting.
D) Require developers to close all review comments manually before the re-review runs.

**Answer:** A

**Explanation:** Task Statement 3.6 explicitly addresses this: "Including prior review findings in context when re-running reviews after new commits, instructing Claude to report only new or still-unaddressed issues to avoid duplicate comments." Providing Claude with what it already flagged and asking it to surface only unresolved or new issues solves the problem at the model level. Option B references a flag that does not exist. Option C is a fragile post-processing workaround that requires maintaining external state. Option D shifts burden to developers and does not address the technical problem.
---

## Question 15

Your CLAUDE.md currently contains only API conventions and security rules. Test generation quality is poor: Claude generates trivial happy-path tests and ignores the rich fixture library your QA team has built. What should you add to CLAUDE.md to improve test generation?

A) Testing standards, descriptions of valuable test criteria (edge cases, error paths, performance bounds), and documentation of available fixtures.
B) The full source code of every fixture file so Claude has complete context.
C) A requirement that every generated test must use at least one fixture.
D) A list of all fixture file paths with a note that they are available for use in tests.

**Answer:** A

**Explanation:** Task Statement 3.6 specifies: "Documenting testing standards, valuable test criteria, and available fixtures in CLAUDE.md to improve test generation quality and reduce low-value test output." This gives Claude the vocabulary and criteria to generate meaningful tests. Option B bloats CLAUDE.md with source code — Claude should know fixtures exist and when to use them, not be given the full implementation. Option C is a rigid rule that forces fixture use even when a pure unit test would be more appropriate. Option D provides file paths but no guidance on when and why to use fixtures or what makes a test valuable.
---

## Question 16

Your CI pipeline posts review findings as PR comments. Currently, the pipeline parses Claude's plain-text output with regex to extract file paths, line numbers, and issue descriptions. This breaks frequently when Claude's prose format changes. What CLI flags should you add to produce machine-parseable output?

A) `--structured-output` combined with `--schema-file`
B) `--output-format json` combined with `--json-schema` pointing to your findings schema
C) `--format machine-readable` combined with `--fields file,line,issue`
D) `--emit-json` combined with `--validate-schema`

**Answer:** B

**Explanation:** Task Statement 3.6 explicitly names `--output-format json` and `--json-schema` as the CLI flags for enforcing structured output in CI contexts. Using these flags produces machine-parseable JSON that conforms to a defined schema, eliminating fragile regex parsing. Options A, C, and D describe flag combinations that do not exist in the Claude Code CLI specification.
---

## Question 17

Your team runs two Claude Code workflows: (1) a pre-merge security scan that blocks merging until complete, and (2) a weekly security posture report generated every Sunday night for review Monday morning. Your manager wants to cut API costs using the Message Batches API for both. What is your recommendation?

A) Use the Message Batches API only for the weekly report; keep synchronous real-time calls for the pre-merge scan.
B) Use the Message Batches API for both; add a 30-minute polling loop for the pre-merge scan to wait for results.
C) Keep synchronous calls for both; the 50% cost savings do not justify the architectural complexity of batch processing.
D) Use the Message Batches API for both and accept that pre-merge latency will increase to up to 24 hours.

**Answer:** A

**Explanation:** The Message Batches API provides 50% cost savings but has no guaranteed latency SLA and processing times up to 24 hours. A blocking pre-merge scan requires timely completion — developers cannot wait up to 24 hours before merging. The weekly report is latency-tolerant (overnight generation for Monday review), making it ideal for batch processing. Option B is wrong because no guaranteed SLA means polling may not return results in time to unblock developers. Option D explicitly accepts unacceptable developer experience degradation. Option C unnecessarily foregoes cost savings on the latency-tolerant workflow.
---

## Question 18

Your pipeline generates a separate review instance for each PR independently. A senior developer notices that the CI reviewer flagged a design pattern as "anti-pattern" in PR #142, but the same pattern was accepted without comment in PR #139 by the same developer earlier that day. What does domain knowledge recommend?

A) Use the same session across PRs to build consistent context and reduce inconsistency.
B) Claude Code loaded different CLAUDE.md files for each PR; standardize on a single CLAUDE.md.
C) The model's behavior varies across independent invocations; this is expected and acceptable for code review.
D) Address this with explicit review criteria in CLAUDE.md that define what constitutes an anti-pattern, rather than attempting to share sessions across PRs.

**Answer:** D

**Explanation:** Independent instances without shared context will produce some variance, which is a known characteristic of the architecture. The correct mitigation per domain knowledge is explicit review criteria in CLAUDE.md defining what constitutes an anti-pattern, rather than sharing sessions across PRs. Option A is counterproductive — sharing sessions across PRs would pollute review context with previous PR content, violating the session isolation principle. Option B may help consistency but is not the most likely cause when CLAUDE.md is the same for all PRs. Option C accepts the problem without addressing it.
---

## Question 19

A large refactoring PR touches 22 files across the authentication module. Your automated review analyzes all 22 files in a single pass. Files 1–8 receive high-quality feedback; files 9–16 get generic comments; files 17–22 receive almost no feedback. A cross-file security issue (an authentication token passed through an insecure intermediate) is missed entirely. What architectural change most directly fixes both problems?

A) Increase the model's max token output to ensure all files receive full analysis.
B) Require developers to submit refactoring PRs as a series of smaller PRs no larger than 8 files each.
C) Randomize the file order on each run so all files get attention across multiple runs.
D) Split the review: run individual focused passes per file for local issues, then run a separate integration pass focused on cross-file data flow and security boundaries.

**Answer:** D

**Explanation:** Task Statement 4.6 directly addresses this: multi-pass review splits large reviews into per-file local analysis passes plus cross-file integration passes to avoid attention dilution. Files 17–22 receive poor feedback because attention dilutes over the full 22-file context. The cross-file security issue is missed because a single pass cannot maintain focused attention on data flow while also reviewing individual files. Option A increases output budget but does not address attention dilution across a large context. Option B shifts burden to developers rather than improving the pipeline. Option C distributes quality problems randomly but does not solve them.
---

## Question 20

You are migrating your build system from Gradle to Maven. This affects build scripts, CI configuration, dependency declarations, and documentation across 48 files. You have not used Maven in this project context before. Which Claude Code mode should you use for the initial investigation phase?

A) Plan mode to explore the codebase, understand the current Gradle configuration, and design a migration approach before making changes.
B) Direct execution with a single comprehensive instruction listing all 48 files to update.
C) Direct execution starting with one file as a proof of concept, then using the result to guide remaining changes.
D) The interview pattern in direct execution to have Claude ask you questions about your Maven preferences before starting.

**Answer:** A

**Explanation:** Task Statement 3.4 specifies that plan mode is appropriate for tasks with architectural implications, library migrations affecting many files, and situations involving multiple valid approaches with different infrastructure requirements. A Gradle-to-Maven migration across 48 files clearly meets all three criteria. Plan mode enables safe codebase exploration before committing to changes, preventing costly rework. Option B risks committing to a wrong approach across all 48 files at once. Option C is exploratory but still executes changes before understanding the full scope. Option D describes the interview pattern within direct execution — useful for design questions but not equivalent to a full exploration of a 48-file dependency graph.
---

## Question 21

Your CI pipeline uses plan mode to analyze a proposed microservice decomposition. After the plan is complete, you want to execute the implementation. Which combination of modes is appropriate?

A) Use plan mode throughout — it handles both planning and execution seamlessly.
B) Use plan mode for implementation and direct execution only for simple cleanup tasks afterward.
C) Use direct execution throughout — switching modes adds unnecessary overhead in CI.
D) Use plan mode for the investigation and architectural design phase, then switch to direct execution for the implementation phase once the approach is decided.

**Answer:** D

**Explanation:** Task Statement 3.4 describes this explicitly as a valid combination: "Combining plan mode for investigation with direct execution for implementation (e.g., planning a library migration, then executing the planned approach)." Plan mode is designed for exploration and design; direct execution is appropriate for well-scoped changes once the approach is determined. Option A is incorrect because plan mode is for exploration and design, not for executing file changes. Option B inverts the appropriate usage. Option C loses the benefits of structured planning for a complex architectural task.
---

## Question 22

Your pipeline has a bug fix task: a stack trace pinpoints a null pointer exception on line 47 of `PaymentProcessor.java` caused by an uninitialized `currencyFormatter` field. The fix is well-understood and affects only one function. Which mode should you use?

A) Direct execution, because the fix is well-scoped, single-file, and the root cause is clearly identified.
B) Plan mode, because any change to payment processing requires careful architectural analysis.
C) Direct execution with the interview pattern to discover potential side effects.
D) Plan mode with the Explore subagent to ensure no transitive dependencies are affected.

**Answer:** A

**Explanation:** Task Statement 3.4 specifies direct execution for "simple, well-scoped changes (e.g., a single-file bug fix with a clear stack trace, adding a date validation conditional)." The stack trace pinpoints the exact location and cause; the fix is in one function of one file. Option B applies plan mode to any payment change — an overly conservative heuristic that ignores actual scope. Option C uses the interview pattern for a bug whose cause is already fully known. Option D uses the Explore subagent for a problem that has already been scoped by the stack trace.
---

## Question 23

A failing database migration script works on 95% of records but fails on records where a legacy field contains null values. You have fixed three individual issues sequentially but each fix reveals a new null-handling problem in a different code path. What iterative refinement technique should you use?

A) Describe all edge cases in a single message and ask Claude to fix them all at once.
B) Use the interview pattern to have Claude ask about your null-handling philosophy before proceeding.
C) Provide a concrete input/output example with a record containing null values in the problematic field, specifying exactly what the output should be for that input.
D) Write a comprehensive test suite covering all null variants first, then share failing tests iteratively to guide fixes.

**Answer:** C

**Explanation:** Task Statement 3.5 specifies: "Providing specific test cases with example input and expected output to fix edge case handling (e.g., null values in migration scripts)." When the problem is a specific edge case with known inputs and expected behavior, a concrete input/output example is more precise than prose descriptions or test-driven iteration. Option A groups multiple issues, but the scenario describes sequential discovery of independent null-handling cases — a focused example for the current one is most efficient. Option B uses the interview pattern for a problem where the expected behavior (handle null gracefully) is already understood. Option D is a valid general approach but adds overhead for a targeted, well-understood edge case.
---

## Question 24

Your team is implementing a new caching layer for the CI results database. You have never designed a caching system for this type of workload before, and you are unsure what cache invalidation strategies, failure modes, and consistency guarantees are relevant. Which iterative refinement technique from Task Statement 3.5 is most appropriate before beginning implementation?

A) Write a test suite covering expected cache behavior and iterate from failing tests.
B) Use the interview pattern to have Claude ask questions that surface design considerations you may not have anticipated.
C) Provide three input/output examples showing cache hit and miss behavior.
D) Give Claude a single comprehensive message covering all requirements at once.

**Answer:** B

**Explanation:** Task Statement 3.5 explicitly identifies the interview pattern for exactly this scenario: "Using the interview pattern to surface design considerations (e.g., cache invalidation strategies, failure modes) before implementing solutions in unfamiliar domains." When you do not know the relevant considerations, the interview pattern helps surface them before you commit to an approach. Option A assumes you know what to test before you understand the design space. Option C requires you to already know the correct input/output behavior. Option D provides a comprehensive message, but if you have not anticipated the relevant considerations, the message will be incomplete.
---

## Question 25

Your team discovers that Claude produces inconsistent error message formatting in generated code — sometimes `{code: "E001", message: "..."}`, sometimes `{error: "E001", detail: "..."}`, and sometimes a plain string. Natural language instructions saying "use consistent error objects" have not helped. What iterative refinement technique would most effectively resolve this?

A) Add `--output-format json` to the CLI invocation to enforce structured output.
B) Create a `.claude/rules/errors.md` file listing the error schema.
C) Provide 2-3 concrete before/after examples showing exactly how error objects should be structured, including one example of the incorrect format being converted to the correct format.
D) Use the interview pattern to ask Claude what error format it prefers before generating code.

**Answer:** C

**Explanation:** Task Statement 3.5 states: "Concrete input/output examples as the most effective way to communicate expected transformations when prose descriptions are interpreted inconsistently." The team has already tried prose instructions without success, making concrete examples the correct next step. Option A addresses output format of Claude's response JSON, not the error object format in generated code. Option B documents the schema but without examples may still produce inconsistent results — the domain knowledge specifically names examples as more effective than prose for consistency. Option D inverts the relationship: Claude should follow your convention, not choose its own.
---

## Question 26

Your CI pipeline uses the Explore subagent to discover all test dependencies for a new feature before generating test cases. After the exploration phase, the main Claude session runs the test generation with context from the Explore output. What advantage does this architecture provide over running exploration and generation in a single pass?

A) It reduces API latency because the Explore subagent uses a faster model tier.
B) The Explore subagent has access to filesystem tools that the main session does not.
C) It enables parallel execution, running exploration and generation simultaneously.
D) The Explore subagent isolates verbose discovery output and returns only a summary, preventing context window exhaustion in the main session during the generation phase.

**Answer:** D

**Explanation:** Task Statement 3.4 describes the Explore subagent as "isolating verbose discovery output and returning summaries to preserve main conversation context." A full dependency tree for a large codebase can produce thousands of lines of output. If this runs in the main session, it consumes context window capacity needed for the generation phase. The Explore subagent contains this verbosity and returns only the relevant summary. Option A is incorrect — the Explore subagent does not use a different model tier. Option B is incorrect — tool access is configured via `allowed-tools` in SKILL.md, not inherent to the Explore type. Option C is incorrect — the Explore subagent runs sequentially to provide context for the subsequent step.
---

## Question 27

A developer wants a custom skill to run a codebase complexity analysis producing a 5,000-line dependency report. They want to use this output to ask follow-up questions without the report cluttering the main conversation. Which SKILL.md configuration achieves this?

A) `allowed-tools: [read_file]` to restrict the skill to read-only operations.
B) `output-format: summary` to automatically truncate the output to key findings.
C) `argument-hint: "Enter a summary depth level (1-3)"` to let the user control verbosity.
D) `context: fork` so the skill runs in an isolated sub-agent; only its summary is returned to the main conversation.

**Answer:** D

**Explanation:** `context: fork` is the SKILL.md frontmatter option that runs the skill in an isolated sub-agent context. The 5,000-line dependency report stays within that sub-agent; only a summary is returned to the main conversation, leaving it uncluttered for follow-up questions. Option A limits what tools the skill can use (read-only), which is a useful security constraint but does not address output volume. Option B describes an `output-format: summary` field that does not exist in SKILL.md frontmatter. Option C gives the user control over verbosity but does not isolate the output from the main conversation context.
---

## Question 28

Your pipeline runs two workflows: (1) test generation that requires multi-turn conversation — generating tests, running them, reading failures, and iterating — and (2) overnight security posture reports analyzing all merged commits from the past week. For which workflow is the Message Batches API unsuitable and why?

A) Batch API is unsuitable for overnight reports because results expire before morning.
B) Batch API is unsuitable for test generation because it does not support multi-turn tool calling within a single request.
C) Batch API is unsuitable for both; all CI workflows require real-time responses.
D) Batch API is unsuitable for security reports because they require sequential processing of commits.

**Answer:** B

**Explanation:** Task Statement 4.5 states: "The batch API does not support multi-turn tool calling within a single request (cannot execute tools mid-request and return results)." Test generation that requires generating tests, running them, reading failures, and iterating is inherently multi-turn with tool execution between turns. The overnight security report is a single analysis pass on existing data — exactly the latency-tolerant, single-pass workload the Batch API is designed for. Option A is incorrect — batch results are available for retrieval well beyond overnight windows. Option C is a blanket rejection that contradicts domain knowledge about appropriate batch use cases. Option D is incorrect — sequential analysis of individual commits in a batch is a valid batch use case.
---

## Question 29

Your CI system processes test generation for 300 pull requests per week. You want to run analysis overnight and retrieve results the following morning. To guarantee results within a 30-hour SLA from when the last PR of the week merges, how should you design batch submission?

A) Submit all 300 PRs as one batch on Friday night and poll for results Saturday morning.
B) Submit all PRs in real-time using the synchronous API to guarantee sub-minute results for each PR.
C) Submit smaller batches throughout the week so each PR's analysis enters the batch queue within 6 hours of the PR merging, guaranteeing that even the last PR has a 24-hour processing window within the 30-hour SLA.
D) Use the batch API with a 48-hour polling window as a fallback for the 30-hour SLA.

**Answer:** C

**Explanation:** Task Statement 4.5 provides the calculation framework: with a 24-hour batch processing window, to guarantee a 30-hour SLA, each batch must be submitted within 6 hours of when results are needed. Submitting throughout the week within 6 hours of each PR merge ensures the 24-hour processing window fits within the 30-hour SLA. Option A creates a large single batch submitted on Friday; if processing takes close to 24 hours, results may not be available until Saturday night — missing the 30-hour SLA for early-week PRs. Option B uses real-time calls, forgoing the 50% cost savings entirely. Option D proposes a 48-hour polling window that exceeds the 30-hour SLA.
---

## Question 30

Your CI pipeline runs independent Claude Code review instances for each PR. A developer points out that the same Claude session that generated the code for a feature branch is being used to review the resulting PR. Why is this problematic, and what is the fix?

A) There is no problem; using the same session improves review quality because Claude remembers the original intent behind design decisions.
B) The same session may have cached incorrect context from the generation phase; clear the session cache before reviewing.
C) The same session will have higher token costs due to accumulated context; start a new session to reduce costs.
D) A session that generated the code retains the reasoning context from that generation, making it less likely to question its own decisions; use a separate, independent review instance with no prior context about the PR.

**Answer:** D

**Explanation:** Task Statement 3.6 explicitly states: "Session context isolation: why the same Claude session that generated code is less effective at reviewing its own changes compared to an independent review instance." The reasoning context from code generation makes the model less likely to question its own design decisions. An independent review instance with no prior context provides more objective assessment. Option A is the exact misconception the domain knowledge is designed to correct. Option B describes a cache-clearing mechanism that does not exist in Claude Code. Option C is a cost consideration but misses the core issue of review objectivity.
---

## Question 31

Your automated PR review pipeline has a 23% false positive rate on "comment accuracy" checks — flagging comments that actually match the code behavior. Developers have started ignoring all automated review comments, including accurate security and bug findings. What is the most effective first intervention?

A) Temporarily disable the comment accuracy category from automated review to restore developer trust, while working on more precise criteria for that category.
B) Add "only report high-confidence findings" to the prompt to filter out uncertain comment accuracy findings.
C) Add a disclaimer to all review output: "These findings may contain false positives; use your judgment."
D) Reduce the severity of all comment accuracy findings to "info" so developers see them without being alarmed.

**Answer:** A

**Explanation:** Task Statement 4.1 states: "Temporarily disabling high false-positive categories to restore developer trust while improving prompts for those categories." When one category has a high false positive rate, it undermines confidence in accurate categories. Restoring trust by disabling the problematic category while improving its prompts is the correct tactic. Option B uses a confidence-based filter, which Task Statement 4.1 explicitly identifies as ineffective: "general instructions like 'be conservative' or 'only report high-confidence findings' fail to improve precision." Option C formalizes the noise problem rather than fixing it. Option D reduces severity but does not address the false positive volume — developers will still see incorrect findings.
---

## Question 32

Your PR review prompt says: "Review the code and flag any issues you find." You observe a 31% false positive rate, with most false positives being minor style deviations and local naming conventions. You want Claude to focus only on bugs and security vulnerabilities. Which prompt change most directly reduces false positives?

A) Add "be conservative and only flag issues you are very confident about" to the existing prompt.
B) Add "ignore minor issues and focus on important problems" to the existing prompt.
C) Replace the vague instruction with explicit criteria: "Flag only: (1) code whose behavior contradicts its documentation, (2) SQL injection or authentication bypass vulnerabilities, (3) null pointer dereferences that will cause runtime crashes. Do NOT flag: naming conventions, whitespace, comment style, or patterns specific to this codebase."
D) Add a post-processing step that filters findings with confidence scores below 0.8.

**Answer:** C

**Explanation:** Task Statement 4.1 specifies: "Writing specific review criteria that define which issues to report (bugs, security) versus skip (minor style, local patterns) rather than relying on confidence-based filtering." Explicit categorical criteria with concrete examples of what to flag and what to skip directly address the root cause. Options A and B use vague, subjective filters ("conservative," "important") that Task Statement 4.1 explicitly identifies as ineffective. Option D is a post-processing filter using confidence scores — also identified as ineffective compared to specific criteria, and the threshold is arbitrary.
---

## Question 33

Your CI review prompt defines severity levels as "critical," "major," and "minor." Analysis of 500 findings shows that 40% of "critical" findings are actually style issues, while genuine security vulnerabilities are being classified as "major." What prompt addition would most effectively fix severity classification?

A) Replace severity labels with numeric scores (1-10) for more granular classification.
B) Define explicit severity criteria with concrete code examples for each level: "Critical: remote code execution, authentication bypass, SQL injection — example: `query = 'SELECT * FROM users WHERE id=' + user_input`; Major: data loss, incorrect business logic — example: total price calculation missing tax; Minor: style, naming."
C) Add "classify severity conservatively; prefer lower severity when uncertain" to the prompt.
D) Reduce to two severity levels ("actionable" and "informational") to reduce classification ambiguity.

**Answer:** B

**Explanation:** Task Statement 4.1 specifies: "Defining explicit severity criteria with concrete code examples for each level to achieve consistent classification." Abstract severity labels produce inconsistent results; concrete code examples anchor each severity level to recognizable patterns. Option A changes the label format but does not provide classification guidance. Option C uses conservative classification, which Task Statement 4.1 identifies as ineffective for improving precision. Option D reduces the granularity of the classification system but does not fix the underlying criterion ambiguity.
---

## Question 34

Your CI review pipeline produces findings in inconsistent formats. Some findings include file path, line number, issue description, and a suggested fix. Others include only a description with no location. Your team needs all findings to include location, issue type, severity, and a concrete suggested fix for automated comment posting. Detailed instructions have not resolved the inconsistency. What technique does domain knowledge identify as most effective?

A) Switch to `--output-format json` to force structured output regardless of content.
B) Add more detailed prose instructions specifying every required field with its expected format.
C) Add a validation step that rejects findings missing required fields and asks Claude to regenerate them.
D) Provide 2-4 few-shot examples demonstrating exactly formatted findings with location, issue type, severity, and suggested fix — including one example showing an incomplete finding being corrected.

**Answer:** D

**Explanation:** Task Statement 4.2 states: "Few-shot examples as the most effective technique for achieving consistently formatted, actionable output when detailed instructions alone produce inconsistent results." The scenario explicitly says "Detailed instructions have not resolved the inconsistency" — this is the precise trigger for switching to few-shot examples. Option A enforces JSON structure but does not ensure the right fields are populated. Option B has already been tried ("detailed instructions") and failed. Option C uses validation-retry but does not teach the model the desired format as effectively as examples.
---

## Question 35

Your automated review flags "ambiguous test coverage" issues — situations where a branch may have uncovered edge cases. Developers dismiss many findings as noise, but some represent genuine test gaps. You want Claude to distinguish: "zero coverage" (clear gap), "partial coverage, edge cases unverified" (ambiguous), and "fully covered by N tests" (adequate). Which technique most effectively teaches this three-way distinction?

A) Add a severity field with values "high," "medium," "low" to the findings schema.
B) Add a confidence score to each finding so developers can filter by confidence.
C) Create 3 few-shot examples — one for each category — showing the code pattern, the existing test coverage context, and the correct classification with reasoning for why each case was classified as it was.
D) Define the three categories in prose in the system prompt with a paragraph of explanation for each.

**Answer:** C

**Explanation:** Task Statement 4.2 specifies: "The role of few-shot examples in demonstrating ambiguous-case handling (e.g., branch-level test coverage gaps)" and "Creating 2-4 targeted few-shot examples for ambiguous scenarios that show reasoning for why one action was chosen over plausible alternatives." Three examples, one per category, with reasoning directly address the three-way distinction. Option A adds a severity field but does not teach the classification logic. Option B uses confidence scores, which are unreliable and do not encode the categorical distinction. Option D uses prose explanation — the domain knowledge specifically says few-shot examples outperform detailed instructions for achieving consistent output.
---

## Question 36

Your pipeline uses Claude to recommend a testing tool for new services: unit testing framework, integration test harness, or end-to-end testing suite. Requests often contain signals for multiple tools (e.g., "a service with a REST API, business logic, and external payment processor calls"), and Claude inconsistently picks one tool while ignoring the others. What is the most targeted fix?

A) Add all three tool descriptions to the prompt with detailed explanations of each tool's purpose.
B) Force Claude to always recommend all three tools and let the developer decide.
C) Create few-shot examples for ambiguous multi-signal requests that show reasoning for why one tool was recommended as primary versus the others as secondary, demonstrating how to handle cases that partially match multiple tool criteria.
D) Add a multi-label output field so Claude can select multiple tools simultaneously.

**Answer:** C

**Explanation:** Task Statement 4.2 states: "The role of few-shot examples in demonstrating ambiguous-case handling (e.g., tool selection for ambiguous requests)" and "Creating 2-4 targeted few-shot examples for ambiguous scenarios that show reasoning for why one action was chosen over plausible alternatives." Few-shot examples that demonstrate the reasoning process for multi-signal inputs teach Claude how to generalize judgment to novel patterns. Option A adds descriptions without demonstrating how to resolve ambiguity when multiple signals are present. Option B always recommends all tools, making the recommendation useless. Option D changes the output schema to multi-label but does not teach Claude how to reason about which tools are appropriate.
---

## Question 37

Your CI pipeline extracts structured findings from Claude's review output. You call Claude with `tool_choice: "auto"` and a single `report_findings` tool. In 15% of API calls, Claude returns a prose summary instead of calling the tool. What is the correct fix?

A) Change `tool_choice` from `"auto"` to `"any"` to require Claude to always call a tool.
B) Add "always use the report_findings tool" to the system prompt.
C) Change the tool name to something more directive like `must_report_findings`.
D) Add a retry that detects prose output and re-prompts with "you must call the tool."

**Answer:** A

**Explanation:** Task Statement 4.3 explains the distinction: `tool_choice: "auto"` allows the model to return text instead of calling a tool — which explains the 15% prose responses. Setting `tool_choice: "any"` requires the model to always call a tool, guaranteeing structured output. Option B adds a prose instruction that may not be consistently followed — this is exactly the reliability gap that `tool_choice` is designed to close. Option C changes the tool name, which has no effect on tool selection behavior. Option D implements retry logic that addresses the symptom rather than the root cause.
---

## Question 38

Your pipeline processes three document types: pull request descriptions, commit messages, and issue tracker tickets, each with a different extraction schema (`extract_pr`, `extract_commit`, `extract_ticket`). Documents arrive in a mixed queue and you do not know the document type before calling Claude. What `tool_choice` configuration guarantees structured output while allowing Claude to choose the appropriate schema?

A) `tool_choice: "auto"` with all three tools available.
B) `tool_choice: {"type": "tool", "name": "extract_pr"}` as the default extraction tool.
C) `tool_choice: "any"` with all three tools available.
D) Call Claude three times — once per schema — and use the result with the highest confidence.

**Answer:** C

**Explanation:** Task Statement 4.3 specifies: "Setting `tool_choice: 'any'` to guarantee structured output when multiple extraction schemas exist and the document type is unknown." `"any"` requires Claude to call one of the available tools (guaranteeing structured output) while allowing it to select the appropriate schema based on document content. Option A (`"auto"`) allows Claude to return prose instead of calling any tool. Option B forces a specific tool — if a commit message arrives, Claude would be forced to use the PR schema, producing incorrect extraction. Option D triplicates API cost and introduces a confidence comparison that is unreliable.
---

## Question 39

Your structured extraction pipeline uses tool use with a JSON schema. Analysis shows that 8% of extracted findings have the correct JSON structure but contain semantic errors: the `file_path` field contains a line number and the `line_number` field contains a file path. The JSON validates successfully. Which statement best characterizes the situation and the appropriate response?

A) The schema is incorrect; add type validation to prevent strings from appearing in numeric fields.
B) Tool use with JSON schemas eliminates syntax errors but does not prevent semantic errors such as values placed in wrong fields; address this with clearer field descriptions and few-shot examples showing correct field mapping.
C) This is a model hallucination issue; use a larger model with better instruction following.
D) Add a post-processing validator that checks whether `line_number` contains only digits to catch transposed fields.

**Answer:** B

**Explanation:** Task Statement 4.3 explicitly states: "Strict JSON schemas via tool use eliminate syntax errors but do not prevent semantic errors (e.g., line items that don't sum to total, values in wrong fields)." Transposed field values are a semantic error — the JSON structure is valid but the content is wrong. The solution is clearer field descriptions and few-shot examples demonstrating correct field mapping. Option A attempts type constraints, but both `file_path` and `line_number` may be strings in some schemas — line numbers stored as strings would not fail type validation. Option C attributes the error to model capability rather than prompt clarity. Option D detects one symptom but does not teach correct field assignment.
---

## Question 40

You are designing a schema to extract code review findings. Some findings have a clear issue type (bug, security, performance), but others fall into domain-specific categories unique to your codebase. You want to capture all findings without forcing Claude to fabricate a category for unusual patterns. What schema design best handles this?

A) Make the `issue_type` field a required string with no constraints, accepting any value.
B) Use an enum for `issue_type` with values `["bug", "security", "performance", "style"]` and mark the field as required.
C) Use an enum with values `["bug", "security", "performance", "style", "other"]`, add a companion `issue_type_detail` string field that is optional (present when `issue_type` is `"other"`), and make the whole field nullable when the category is unclear.
D) Remove `issue_type` from the schema and capture all categorization in a free-text `description` field.

**Answer:** C

**Explanation:** Task Statement 4.3 specifies: "Adding enum values like 'unclear' for ambiguous cases and 'other' + detail fields for extensible categorization." The `"other"` + `issue_type_detail` pattern allows structured capture of all findings — common types in the enum, unusual types via the detail field — without requiring Claude to force-fit an incorrect enum value or fabricate a category. Option A accepts any string, losing the structure benefits of an enum. Option B's closed enum forces Claude to pick the closest match for domain-specific patterns, producing incorrect categorization. Option D loses issue type structure entirely, making automated routing and filtering impossible.
---

## Question 41

Your CI pipeline extracts the line number of each code finding from Claude's analysis. Some files have unusual formatting where Claude occasionally returns line ranges (e.g., "lines 142-187") instead of a single integer. The schema requires `line_number: integer`. What schema and prompt design addresses this?

A) Make `line_number` a string field to accept both integers and ranges.
B) Keep `line_number: integer` for the primary location, add an optional `line_range_end: integer` field, and include a format normalization rule in the prompt: "If a finding spans a range, use the first line as `line_number` and the last line as `line_range_end`."
C) Add a post-processing regex to extract the first number from whatever Claude returns.
D) Instruct Claude to "always provide a single line number, never a range."

**Answer:** B

**Explanation:** Task Statement 4.3 specifies: "Including format normalization rules in prompts alongside strict output schemas to handle inconsistent source formatting." The schema handles the structured representation (two integer fields) while the prompt provides explicit normalization instructions for how to handle range inputs. Option A changes the schema to accept ranges, but then downstream tools expecting integers will break. Option C is a fragile post-processing workaround that may extract incorrect line numbers from complex range expressions. Option D instructs Claude to compress a range into a single number, losing the end-line information needed for inline comment placement.
---

## Question 42

Your automated review pipeline processes 500 PRs per day. After 30 days, you discover that Claude flags a particular use of `Optional.get()` without `isPresent()` checks 40% of the time but misses it 60% of the time. You want to systematically understand which code contexts trigger the finding and which do not. What field should you add to your structured findings schema?

A) `confidence_score: float` to track how confident Claude is in each finding.
B) `detected_pattern: string` to capture the specific code construct or pattern that triggered the finding, enabling analysis of which patterns are consistently detected versus missed.
C) `review_pass: integer` to track which review pass generated the finding.
D) `model_version: string` to correlate findings with model version changes.

**Answer:** B

**Explanation:** Task Statement 4.4 states: "Adding `detected_pattern` fields to structured findings to enable analysis of false positive patterns when developers dismiss findings." A `detected_pattern` field captures what specific code construct Claude identified, enabling systematic analysis — you can see whether `Optional.get()` in method chains is detected differently than `Optional.get()` after a ternary. Option A adds confidence scores, which Task Statement 4.1 identifies as unreliable for precision improvement. Option C tracks review pass number — operational metadata that does not help diagnose detection inconsistency. Option D tracks model version, useful for regression analysis but not for understanding detection patterns within a version.
---

## Question 43

Your pipeline extracts test coverage data from CI reports. Validation shows that in 12% of cases, `covered_lines + uncovered_lines ≠ total_lines`. The JSON schema validates successfully. What self-correction flow design addresses this?

A) Add a required `covered_lines` field and make `total_lines` optional to eliminate the constraint.
B) Instruct Claude to "ensure all line counts are mathematically consistent."
C) Add a post-processing step that sets `total_lines = covered_lines + uncovered_lines` to force consistency.
D) Extract `covered_lines`, `uncovered_lines`, and `total_lines` separately, then add a `calculated_total: integer` field alongside `stated_total`, and add a `conflict_detected: boolean` field that flags discrepancies for follow-up correction.

**Answer:** D

**Explanation:** Task Statement 4.4 specifies: "Designing self-correction validation flows: extracting `'calculated_total'` alongside `'stated_total'` to flag discrepancies, adding `'conflict_detected'` booleans for inconsistent source data." This design makes discrepancies visible and traceable without silently modifying values. Option A removes the constraint that makes the discrepancy detectable. Option B uses a prose instruction that has not reliably prevented the error (12% still fail). Option C silently overrides `total_lines` with the calculated value — this may be wrong if `covered_lines` or `uncovered_lines` was extracted incorrectly; discrepancies should be flagged, not hidden.
---

## Question 44

Your pipeline retries failed structured extractions with appended error messages. One category of retry always fails on the second attempt: cases where the source PR description references a linked design document but does not reproduce its content. Claude repeatedly extracts `null` for the `architecture_decision` field even after retries with error feedback. What should you do?

A) Increase the number of retry attempts to 5 to give Claude more chances to find the information.
B) Recognize that retries are ineffective when the required information is absent from the source document; update the schema to make `architecture_decision` an optional field and accept null values when the PR description does not include the design document content.
C) Switch to a larger model that may be able to infer the architecture decision from context.
D) Add "never return null for architecture_decision" to the retry prompt.

**Answer:** B

**Explanation:** Task Statement 4.4 specifies: "The limits of retry: retries are ineffective when the required information is simply absent from the source document (vs format or structural errors)." When the PR description links to an external design document but does not include its content, the information is not in the provided context — retrying cannot manufacture absent information. The correct response is to make the field optional and accept null values. Option A wastes API budget on retries that will not succeed. Option C switching to a larger model does not solve an absence of information. Option D instructs Claude never to return null, which will cause it to fabricate a plausible-sounding value — a hallucination.
---

## Question 45

Your pipeline retries extraction when required fields are missing. A finding extraction fails because `suggested_fix` is empty. Your retry prompt currently says: "Try again." After the retry, `suggested_fix` is still empty. What should the retry prompt include?

A) "Generate a suggested fix for this finding."
B) "The previous attempt failed. Please be more thorough."
C) A new temperature setting to increase creativity in the retry.
D) The original document, the failed extraction result, and the specific validation error: "The `suggested_fix` field is required but was returned empty. Based on the identified issue at line 47 where `user_input` is concatenated directly into the SQL query, provide a concrete code example showing the parameterized query replacement."

**Answer:** D

**Explanation:** Task Statement 4.4 specifies: "Implementing follow-up requests that include the original document, the failed extraction, and specific validation errors for model self-correction." A retry with specific context — the original document, the failed output, and an explicit description of what is missing and why — gives the model the guidance needed to self-correct. Option A is only slightly better than "Try again" and lacks the original context. Option B is vague and does not identify what was wrong. Option C adjusts a generation parameter rather than providing corrective context.
---

## Question 46

Your CI pipeline generates weekly security audit reports covering all 847 merged PRs from the past week. Each PR needs a single-pass analysis for credential exposure and dependency vulnerabilities. Reports are reviewed by the security team Monday morning. Processing runs Sunday night. Which API approach is optimal?

A) Synchronous API with parallel requests for all 847 PRs simultaneously.
B) Message Batches API, submitting all 847 PRs as a batch on Sunday night for Monday morning review.
C) Synchronous API with sequential processing to avoid rate limits.
D) Synchronous API with a dedicated high-throughput endpoint for security-critical workloads.

**Answer:** B

**Explanation:** Task Statement 4.5 identifies the Message Batches API as appropriate for "overnight reports, weekly audits, nightly test generation" — latency-tolerant, non-blocking workloads. The 847-PR weekly security audit processed Sunday night for Monday morning review is the canonical batch use case: 50% cost savings, results available within 24 hours, non-blocking. Option A makes 847 simultaneous synchronous calls — expensive and likely to hit rate limits. Option C is prohibitively slow — sequential processing of 847 PRs may take many hours. Option D describes a "dedicated high-throughput endpoint" that does not exist in the Anthropic API.
---

## Question 47

You submit a batch of 300 PR analyses. Results show 287 successes and 13 failures. Examining the failure responses, you see 11 failed with `"error": "context_length_exceeded"` and 2 failed with `"error": "invalid_request"`. You need all 300 results. What is the correct handling approach?

A) Use the `custom_id` fields to identify the 13 failed PRs; for the 11 context length failures, chunk each PR diff into smaller segments and resubmit; for the 2 invalid request failures, inspect and fix the request format before resubmitting.
B) Resubmit all 300 PRs as a new batch.
C) Mark the 13 failures as unavailable and proceed with the 287 successful results.
D) Increase the batch size timeout and resubmit only the 13 failures without modification.

**Answer:** A

**Explanation:** Task Statement 4.5 specifies: "Handling batch failures: resubmitting only failed documents (identified by `custom_id`) with appropriate modifications (e.g., chunking documents that exceeded context limits)." The `custom_id` field enables precise identification of failed requests. Context length failures require chunking; invalid request failures require format correction. Option B resubmits all 300, wasting budget on the 287 already-successful analyses. Option C leaves the security audit incomplete. Option D resubmits without modification and will produce the same errors.
---

## Question 48

You are preparing to batch-process 5,000 pull request descriptions for a quarterly code quality analysis. You have not run this prompt at this scale before and are concerned about the first-pass success rate. What does domain knowledge recommend before submitting the full batch?

A) Submit the full batch immediately; use the `custom_id` to identify and resubmit failures afterward.
B) Submit the batch in 10 equal sub-batches of 500 to limit the failure blast radius.
C) Refine the prompt on a representative sample of 20-50 PRs using the synchronous API before submitting the full 5,000-PR batch, to maximize first-pass success rates and reduce iterative resubmission costs.
D) Use a stricter JSON schema to reduce the probability of extraction failures at scale.

**Answer:** C

**Explanation:** Task Statement 4.5 specifies: "Using prompt refinement on a sample set before batch-processing large volumes to maximize first-pass success rates and reduce iterative resubmission costs." Testing on a small representative sample reveals prompt issues before they affect 5,000 requests. Option A is the naive approach that wastes the batch budget on preventable failures. Option B splits the batch but does not improve the prompt — the same failure rate applies across all sub-batches. Option D tightens the schema, which may actually increase failures for edge-case documents rather than decreasing them.
---

## Question 49

Your CI pipeline has two review workflows. Workflow A: Claude reviews a PR and immediately posts inline comments that block the merge. Workflow B: Claude analyzes all merged PRs from the last sprint and generates a trend report for the weekly engineering retrospective. The team proposes using the Message Batches API for Workflow A to reduce costs. What is the correct analysis?

A) Agree: the batch API's `custom_id` field enables reliable result correlation, so both workflows can use batch processing.
B) Agree: both workflows benefit equally from the 50% cost savings of the batch API.
C) Disagree: the batch API cannot post inline PR comments, so Workflow A must use the synchronous API for comment posting regardless of cost.
D) Disagree: Workflow A is a blocking pre-merge check requiring timely completion; the batch API has no guaranteed latency SLA and can take up to 24 hours, making it unsuitable; Workflow B is latency-tolerant and ideal for batch processing.

**Answer:** D

**Explanation:** Task Statement 4.5 explicitly contrasts these use cases: "Batch processing is appropriate for non-blocking, latency-tolerant workloads (overnight reports, weekly audits) and inappropriate for blocking workflows (pre-merge checks)." Workflow A is a blocking pre-merge check — developers cannot wait up to 24 hours to merge. Workflow B is a sprint retrospective report — a latency-tolerant, weekly batch workload. Option A is wrong because `custom_id` correlation does not address the latency problem. Option B ignores the latency constraint. Option C introduces a false constraint — comment posting happens after extraction and is done by the pipeline, not the batch API itself.
---

## Question 50

Your security team wants to calculate the cost impact of switching the weekly security posture report (currently 2,400 synchronous API calls per week at $0.15 per call) to the Message Batches API. What is the expected weekly cost after the switch?

A) $360 (no change — batch API has the same pricing for security-sensitive workloads)
B) $120 (67% reduction due to batch optimization of security-focused prompts)
C) $72 (80% reduction due to batch consolidation)
D) $180 (50% reduction from the batch API's 50% cost savings)

**Answer:** D

**Explanation:** Task Statement 4.5 states the Message Batches API provides "50% cost savings." Current cost: 2,400 calls × $0.15 = $360/week. After batch API: $360 × 0.50 = $180/week. The 50% savings figure is a stated characteristic of the batch API, not dependent on workload type. Options A, B, and C apply incorrect discount percentages — the domain knowledge states a flat 50% discount.
---

## Question 51

Your CI system uses the same Claude instance session to generate a feature's code and then immediately review that same code for security vulnerabilities. The security team reports that reviews never catch the design-level vulnerabilities that are actually present, even though the same vulnerabilities are found when a human reviews the same code. What architectural change does domain knowledge recommend?

A) Add more security-specific instructions to the review prompt to compensate for the session familiarity effect.
B) Run the security review 48 hours after code generation, allowing the session to "forget" the generation context.
C) Use a second independent Claude instance for the review, initialized without the code generation context, so it approaches the code without the generator's reasoning assumptions.
D) Have the generation instance produce a security summary alongside the code, which the review instance then verifies.

**Answer:** C

**Explanation:** Task Statement 4.6 states: "Self-review limitations: a model retains reasoning context from generation, making it less likely to question its own decisions in the same session" and "Independent review instances (without prior reasoning context) are more effective at catching subtle issues." An independent review instance initialized fresh will evaluate the code without the design rationale from the generation phase. Option A adds instructions but cannot overcome the inherent bias of retained generation context. Option B misunderstands the problem — it is not about time or memory decay but about session context isolation. Option D has the generator pre-explain the security properties, which anchors the reviewer to the same reasoning.
---

## Question 52

A pull request modifies 31 files across four modules: authentication, payment processing, notification service, and audit logging. Your single-pass review produces contradictory findings: the same JWT validation pattern is flagged as a security risk in `auth/validator.js` but approved in `payment/token_checker.js`. What review architecture resolves this?

A) Run three independent single-pass reviews of all 31 files and only flag issues that appear in at least two reviews.
B) Split the review into focused per-file passes (each file analyzed independently for local issues) followed by a separate cross-module integration pass that explicitly examines token validation consistency across all modules.
C) Increase the context window by summarizing each module before running the full review.
D) Process modules in alphabetical order to ensure authentication is reviewed before payment, establishing consistent precedent.

**Answer:** B

**Explanation:** Task Statement 4.6 specifies: "Multi-pass review: splitting large reviews into per-file local analysis passes plus cross-file integration passes to avoid attention dilution and contradictory findings." Per-file passes ensure consistent depth; the integration pass examines the JWT validation pattern across modules explicitly, resolving the contradiction. Option A uses majority voting which would suppress findings caught in only one of three passes — exactly the subtle bugs most likely to be missed. Option C summarization compresses context but does not address attention dilution across 31 files. Option D creates precedent through order of processing rather than explicit cross-module analysis.
---

## Question 53

Your CI pipeline review generates findings for each PR. You want to route high-confidence findings directly to required changes and lower-confidence findings to suggestions visible to developers but not blocking. Which multi-pass technique supports this routing?

A) Run the review twice with different temperature settings and use the intersection of findings as high-confidence.
B) Run a verification pass where Claude self-reports a confidence level alongside each finding, then route findings above a threshold to required changes and below to suggestions.
C) Use a separate classifier model trained on historical dismissed findings to predict confidence.
D) Run independent review instances and treat findings appearing in all instances as high-confidence.

**Answer:** B

**Explanation:** Task Statement 4.6 specifies: "Running verification passes where the model self-reports confidence alongside each finding to enable calibrated review routing." Self-reported confidence enables routing without requiring multiple full review passes or external classifiers. Option A uses temperature variation to simulate confidence, but temperature affects randomness, not calibration. Option C is over-engineered and requires labeled training data. Option D would suppress many genuine findings that are caught intermittently.
---

## Question 54

Your CI prompt for detecting hard-coded credentials currently says: "Check for any security issues." This produces a 28% false positive rate, flagging environment variable names, encrypted values, and configuration keys as credentials. You want to reduce false positives while ensuring real credentials (API keys, passwords, tokens in string literals) are still caught. What prompt change is most effective?

A) Replace the vague instruction with a specific criterion: "Flag ONLY string literals that appear to be live credentials (API keys, auth tokens, passwords) assigned directly in code — e.g., `API_KEY = 'sk-live-abc123'`. Do NOT flag: environment variable references (`os.environ['KEY']`), encrypted blobs, placeholder strings (`'your-key-here'`), or test fixture values."
B) Add "be conservative about security findings" to filter out uncertain flags.
C) Create a separate tool call for credential detection with a strict JSON schema.
D) Add "only flag hard-coded credentials, not environment variables" to the existing prompt.

**Answer:** A

**Explanation:** Task Statement 4.1 specifies writing "specific review criteria that define which issues to report versus skip rather than relying on confidence-based filtering." The revised prompt gives categorical yes/no criteria with concrete examples for both what to flag (live credentials in string literals) and what to skip (environment variable references, encrypted blobs). Option B uses "be conservative," which Task Statement 4.1 explicitly identifies as ineffective for improving precision. Option C uses structured output but does not address the root cause of the false positives, which is imprecise detection criteria. Option D is partially specific but does not enumerate the full set of false-positive-prone patterns.
---

## Question 55

Your team provides review findings to developers as inline PR comments. Analysis of 3 months of data shows that developers dismiss 67% of "potential performance issue" findings as irrelevant. You want to understand what code patterns are generating false positives in the performance category. What should you add to the structured findings schema?

A) `developer_satisfaction_score: integer` collected from a post-review survey.
B) `review_model_version: string` to correlate dismissal rates with model updates.
C) `false_positive_probability: float` estimated by Claude for each finding.
D) `detected_pattern: string` capturing the specific code construct that triggered the performance finding, so dismissed findings can be analyzed to identify which patterns generate false positives.

**Answer:** D

**Explanation:** Task Statement 4.4 specifies: "Adding `detected_pattern` fields to structured findings to enable analysis of false positive patterns when developers dismiss findings." With `detected_pattern` data from 67% of dismissed performance findings, you can cluster patterns like "nested loops over small collections" or "database calls in loops without N+1 actually occurring" — and use this to refine the performance review criteria. Option A requires external survey infrastructure and has low response rates. Option B helps with regression analysis but not pattern analysis within a model version. Option C has Claude estimate its own false positive rate, which is unreliable and does not provide the pattern data needed for systematic improvement.
---

## Question 56

Your pipeline builds a monthly security posture report from individual PR findings. In 9% of reports, `critical_finding_count + major_finding_count + minor_finding_count ≠ total_finding_count`. The JSON validates correctly. How should you redesign the extraction to make discrepancies visible and correctable?

A) Add a validation rule that sets `total_finding_count = sum(critical + major + minor)` automatically.
B) Remove `total_finding_count` and require downstream systems to sum the individual counts.
C) Add a `calculated_total` field (sum of individual counts) alongside `stated_total`, and add a `count_conflict_detected: boolean` field; include a prompt instruction: "If `calculated_total ≠ stated_total`, set `count_conflict_detected: true` and double-check all counts."
D) Make the individual count fields optional so missing data does not cause conflicts.

**Answer:** C

**Explanation:** Task Statement 4.4 specifies: "Designing self-correction validation flows: extracting `'calculated_total'` alongside `'stated_total'` to flag discrepancies, adding `'conflict_detected'` booleans for inconsistent source data." The `calculated_total`/`stated_total` comparison makes the discrepancy explicit and the `count_conflict_detected` flag enables automated triage. Option A silently overwrites `total_finding_count` — if one individual count was extracted incorrectly, you lose the evidence needed to diagnose the error. Option B removes a data point rather than reconciling it. Option D makes fields optional, increasing null values without addressing the root inconsistency.
---

## Question 57

Your CI pipeline ingests PR descriptions to extract `affected_components`, `breaking_changes`, and `test_coverage_approach`. For 22% of PRs, `test_coverage_approach` returns null even though PR descriptions contain phrases like "covered by the existing integration suite" and "no new tests needed — existing tests exercise this path." What is the most likely cause, and what fix does domain knowledge recommend?

A) The model is refusing to extract test coverage information; add "always populate test_coverage_approach" to the prompt.
B) Add few-shot examples showing correct extraction from PRs that describe coverage indirectly rather than explicitly stating a formal test plan.
C) Make `test_coverage_approach` an optional field to accept null values for these cases.
D) Add a retry that specifically asks for test coverage extraction when the first pass returns null.

**Answer:** B

**Explanation:** Task Statement 4.2 specifies: "The effectiveness of few-shot examples for reducing hallucination in extraction tasks (e.g., handling informal measurements, varied document structures)" and "Adding few-shot examples showing correct extraction from documents with varied formats to address empty/null extraction of required fields." Informal coverage descriptions ("covered by the existing integration suite") are valid test coverage information that the prompt has not demonstrated how to extract. Few-shot examples showing how to extract from indirect phrasing solve the root cause. Option A adds a directive that may cause fabrication when coverage is genuinely absent. Option C accepts the null values rather than improving extraction. Option D uses retry, which will not help if the issue is the model not recognizing informal coverage descriptions.
---

## Question 58

You are designing the extraction schema for PR metadata. The `deployment_environment` field identifies where changes will be deployed. In practice, PRs may specify `"production"`, `"staging"`, `"development"`, custom environment names like `"eu-prod"` or `"us-staging-2"`, or may not mention deployment context at all. How should you design this field?

A) `deployment_environment: string (required)` — require Claude to always provide a value.
B) `deployment_environment: enum ["production", "staging", "development"] (required)` — restrict to standard values only.
C) `deployment_environment: { "type": string, "enum": ["production", "staging", "development", "other"], "nullable": true }` with a companion `deployment_environment_detail: string (optional)` for non-enum values and a nullable marker when deployment context is not mentioned.
D) `deployment_environment: array<string>` — allow multiple values for multi-environment deployments.

**Answer:** C

**Explanation:** Task Statement 4.3 specifies: "Schema design considerations: required vs optional fields, enum fields with 'other' + detail string patterns for extensible categories" and "Designing schema fields as optional (nullable) when source documents may not contain the information, preventing the model from fabricating values." The design handles standard environments (enum), custom environments (`"other"` + `detail`), and absent context (nullable). Option A requires Claude to always provide a value — it will fabricate a deployment environment for PRs that don't mention one. Option B has a closed enum that cannot represent `"eu-prod"` or `"us-staging-2"`. Option D allows arrays but does not handle the absent-context case.
---

## Question 59

Your CI review prompt asks Claude to classify code review findings into three severity levels. After analyzing 1,000 findings, you notice that the same `NullPointerException`-prone pattern is classified as "critical" in 55% of cases and "major" in 45% — with no discernible difference in the code context. What technique most directly resolves this inconsistency?

A) Switch to a stricter JSON schema with an enum for severity values.
B) Run each finding through two independent review instances and use the majority severity classification.
C) Add "classify consistently" to the prompt.
D) Add explicit severity criteria with concrete code examples: "Critical: NPE that will crash the application under normal usage — example: `user.getAddress().getCity()` without null check where `user` comes from untrusted input; Major: NPE that occurs only under edge-case conditions — example: `config.getOptionalField()` called without guard, where `config` is null only on first startup."

**Answer:** D

**Explanation:** Task Statement 4.1 specifies: "Defining explicit severity criteria with concrete code examples for each level to achieve consistent classification." The inconsistency is caused by ambiguous severity boundaries — both "critical" and "major" apply to NPEs without distinguishing factors. Concrete examples anchoring "critical" to NPEs under normal usage versus "major" to edge-case NPEs give Claude the distinctions needed for consistent classification. Option A enforces the enum format but does not define when to choose each value. Option B uses consensus classification, adding cost without providing the criteria needed for consistency. Option C is a vague instruction that does not provide the classification criteria needed.
---

## Question 60

Your pipeline produces PR review findings via tool use with a JSON schema. You want to post these as GitHub PR comments. Two downstream consumers exist: (1) the GitHub API poster, which needs `file_path`, `line_number`, and `comment_text`; (2) the analytics database, which needs `finding_id`, `severity`, `detected_pattern`, and `pr_number`. You currently run two separate Claude calls with two different schemas. A colleague suggests using `tool_choice: "any"` with both tools available so Claude selects the appropriate schema automatically. Is this correct?

A) Yes — `tool_choice: "any"` with both tools available allows Claude to select the appropriate schema based on context, producing the right output for each consumer.
B) No — `tool_choice: "any"` requires Claude to call one tool but cannot guarantee it calls a specific tool; for use cases requiring a specific schema, force the specific tool using `tool_choice: {"type": "tool", "name": "extract_analytics_finding"}`.
C) Yes — `tool_choice: "any"` with both tools will cause Claude to call both tools simultaneously, producing output for both consumers in a single API call.
D) No — you should use `tool_choice: "auto"` instead, which selects the most appropriate tool based on context automatically.

**Answer:** B

**Explanation:** Task Statement 4.3 clarifies the distinction: `tool_choice: "any"` requires Claude to call a tool but allows it to choose which one — it does not guarantee a specific tool is called. When a specific schema is required for a downstream system (like the analytics database needing `finding_id` and `pr_number`), use `tool_choice: {"type": "tool", "name": "extract_analytics_finding"}` to force that specific tool. The colleague's suggestion would work only for cases where either schema is acceptable, not when specific schema compliance is required. Option A is wrong because "any" allows choice, not guaranteed specific selection. Option C is incorrect — `"any"` requires exactly one tool call, not both simultaneously. Option D uses `"auto"`, which allows text responses instead of tool calls, losing schema guarantees.
---
