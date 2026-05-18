# Developer Productivity with Claude

**Total Questions:** 60
**Domain Distribution:** Domain 1 (25), Domain 2 (17), Domain 3 (18)

---

## Question 1

You are building a developer productivity agent that uses the Read, Grep, and Bash tools to explore a legacy Java codebase. After each tool call, the agent correctly appends the tool result to conversation history and calls the API again. However, you notice the agent sometimes stops mid-exploration and returns a partial answer even when there are clearly more files to investigate. Examining your loop control logic, you find this code: `if "I have gathered enough information" in response.content[0].text: break`. What is the most likely cause of the premature termination?

A) The loop is terminating based on natural language signals in assistant text content rather than on the `stop_reason` field, causing false positives.
B) The Grep and Read tools need to be called in a specific order, and the agent is violating this ordering constraint.
C) The tool results are not being appended to the conversation history correctly, causing the model to forget what it has already explored.
D) The agent is running out of context window space and needs a larger model with more tokens.

**Answer:** A

**Explanation:** The code checks for a natural language phrase in the assistant's response text to decide whether to stop — this is a classic agentic loop anti-pattern. The model may produce phrases like "I have gathered enough information" as part of its reasoning even when it intends to continue and call more tools. The correct termination signal is `stop_reason == "end_turn"`, which is set by the API when the model has actually decided to finish. Option B is incorrect because the built-in tools have no mandatory ordering constraints. Option C would cause the model to repeat previous work, not stop early. Option D is a possible issue in other scenarios but nothing in the question indicates context exhaustion.
---

## Question 2

Your codebase exploration agent processes the following loop: it sends a request, receives `stop_reason: "tool_use"` with a `Grep` tool call, executes Grep, and then starts the next iteration by sending only the original system prompt again. Engineers report the agent always returns generic answers that ignore the actual grep results. What is the root cause?

A) The tool result is not being appended to the conversation history before the next API call, so the model never sees the search results.
B) The Grep tool is returning malformed output that the model cannot interpret.
C) The agent is using the wrong `stop_reason` check and should be checking for `"tool_result"` instead of `"tool_use"`.
D) The system prompt is too long and is pushing the tool results out of the context window.

**Answer:** A

**Explanation:** The agentic loop lifecycle requires that after executing a tool, the tool result must be appended to the conversation history as a `tool_result` message before calling the API again. If the agent starts fresh with only the system prompt, the model never sees the Grep output and cannot incorporate the findings into its next response. Option B is possible but the question describes a consistent failure pattern pointing to architecture, not tool behavior. Option C is incorrect because `"tool_result"` is not a valid `stop_reason` value — only `"tool_use"` and `"end_turn"` are used for loop control. Option D is a real concern but would cause degraded output rather than consistently ignoring tool results entirely.
---

## Question 3

A developer productivity agent is tasked with generating a comprehensive dependency map for a 120,000-line microservices codebase. You implement a maximum iteration cap of 15 as the primary stopping mechanism, reasoning that 15 tool calls should be sufficient. After deployment, the agent consistently produces incomplete maps that miss 30–40% of service dependencies, but never exceeds the cap. Engineers escalate the issue. What is the fundamental design problem?

A) The iteration cap is being used as the primary stopping mechanism instead of `stop_reason == "end_turn"`, causing the agent to terminate before the model decides it has sufficient information.
B) The agent needs a subagent to handle cross-service dependency analysis while the main agent handles individual services.
C) The iteration cap is too low; increasing it to 50 iterations will give the agent enough calls to complete the task.
D) The Glob tool should be used instead of Grep for dependency discovery because it is more efficient at finding import patterns.

**Answer:** A

**Explanation:** Using an arbitrary iteration cap as the primary termination mechanism is a documented anti-pattern. The model knows when it has enough information to complete the task and signals this via `stop_reason == "end_turn"`. When an iteration cap fires before the model reaches `end_turn`, the agent terminates with incomplete work. The correct pattern is to continue looping while `stop_reason == "tool_use"` and stop only when the model produces `stop_reason == "end_turn"`, with the cap serving only as a safety backstop for runaway loops. Option B is a valid architectural pattern for scale but doesn't fix the termination logic bug. Option C treats the symptom (too few iterations) rather than the root cause (wrong stopping signal). Option D is incorrect because Grep is the right tool for searching file contents for import patterns.
---

## Question 4

Your team builds a coordinator-subagent system for codebase analysis. The coordinator spawns a "dependency analysis" subagent and a "code quality" subagent. After deployment, the dependency subagent correctly identifies that three services depend on a deprecated library, but when the code quality subagent runs, it has no knowledge of this finding and produces recommendations that conflict with the deprecated library constraint. What is the most likely cause?

A) The subagents are running in parallel when they should be running sequentially, causing a race condition on shared state.
B) The coordinator is routing inter-subagent communication incorrectly; the quality subagent is receiving messages from the wrong agent.
C) Subagents do not automatically inherit the coordinator's conversation history, so the quality subagent never received the dependency findings.
D) The coordinator needs to enable shared memory between subagents so they can communicate directly without the coordinator as an intermediary.

**Answer:** C

**Explanation:** In hub-and-spoke architecture, subagents operate with isolated context — they do not automatically inherit the coordinator's conversation history or findings from other subagents. The coordinator must explicitly pass the dependency findings in the code quality subagent's prompt. Option A describes a valid concurrency concern but the question shows the subagents completed correctly in isolation — the issue is missing context, not race conditions. Option B assumes incorrect routing, but the actual problem is that the coordinator never forwarded the findings at all. Option D describes a non-existent shared memory mechanism; the correct pattern is explicit context passing through the coordinator.
---

## Question 5

You are designing a coordinator agent for a code review system. The coordinator receives a pull request and must decide whether to invoke only a "style check" subagent, only a "security scan" subagent, or both, based on the nature of the changes. You consider two approaches: (A) always route through the full pipeline invoking both subagents regardless of PR content, or (B) have the coordinator analyze the PR and dynamically select which subagents to invoke. A PR that only changes CSS formatting files is submitted. Which design produces better outcomes and why?

A) Approach B, because the coordinator can recognize CSS-only changes as requiring style checks but not security scanning, avoiding unnecessary subagent invocations and reducing latency and cost.
B) Approach A, because it guarantees complete coverage; security scanning CSS-only changes costs little and ensures nothing is missed.
C) Approach A, because dynamic routing adds coordinator reasoning overhead that outweighs the cost of unnecessary subagent calls.
D) Approach B, but only when the PR is larger than 10 files; for small PRs the full pipeline is more efficient.

**Answer:** A

**Explanation:** A coordinator that dynamically selects subagents based on query complexity and content is more efficient and accurate. Invoking a security scan on pure CSS formatting files wastes compute, adds latency, and produces irrelevant output that the coordinator must then filter. The coordinator's value is precisely this intelligent dispatch. Option B is defensible for simplicity but the question asks which produces "better outcomes," and unnecessary subagent invocations degrade throughput and cost. Option C is incorrect because the reasoning overhead of one additional LLM decision is vastly cheaper than running an unneeded security scan subagent. Option D introduces an arbitrary file-count threshold with no theoretical basis.
---

## Question 6

Your multi-agent developer productivity system has a coordinator and three subagents: a "file discovery" agent, a "code analysis" agent, and a "recommendation" agent. You observe that the recommendation agent occasionally calls Grep directly to verify facts from the analysis agent, then routes the verification results back to the analysis agent — bypassing the coordinator entirely. This produces inconsistent results. What architectural violation is occurring?

A) Subagents are communicating directly with each other rather than routing through the coordinator, violating hub-and-spoke architecture and degrading observability and error handling.
B) The coordinator needs a larger context window to track the full communication graph between all three subagents.
C) The recommendation agent should cache verification results so it does not need to call Grep multiple times for the same query.
D) The recommendation agent is violating the principle of least privilege by using Grep, which should be restricted to the file discovery agent only.

**Answer:** A

**Explanation:** Hub-and-spoke architecture requires all inter-subagent communication to be routed through the coordinator. When subagents communicate directly, the coordinator loses observability, cannot apply consistent error handling, and cannot control information flow — creating the inconsistent results observed. The fix is to have the recommendation agent return verification requests to the coordinator, which invokes the appropriate subagent and routes the result back. Option B misdiagnoses the problem; context window size is irrelevant to routing violations. Option C addresses efficiency but not the architectural violation. Option D addresses tool access policy, a secondary concern — the core violation is direct communication.
---

## Question 7

You want to spawn two subagents in parallel: one to analyze the `src/api/` directory and one to analyze the `src/database/` directory. Your coordinator currently emits one `Task` tool call per response turn, waits for the result, then emits the next `Task` call. Engineers report the workflow takes 45 seconds when each subagent analysis only takes 12 seconds. How should you restructure the coordinator to achieve near-optimal performance?

A) Increase the subagent timeout from 12 seconds to 60 seconds so the coordinator has more time to process results.
B) Emit both `Task` tool calls in a single coordinator response turn rather than across separate turns, enabling parallel subagent execution.
C) Use a separate coordinator for each directory so both analyses run simultaneously.
D) Switch from the `Task` tool to direct API calls so the coordinator can manage parallelism at the HTTP layer.

**Answer:** B

**Explanation:** Parallel subagent spawning is achieved by emitting multiple `Task` tool calls in a single coordinator response, not across separate turns. When multiple tool calls appear in one response, the SDK executes them in parallel. Sequential emission forces serial execution: 12s + 12s = 24s minimum. Parallel emission achieves approximately max(12s, 12s) = 12s. Option A addresses timeouts, not parallelism. Option C creates an unnecessary architectural split for a problem solved by a single coordinator emitting parallel calls. Option D is an over-engineered workaround that bypasses the SDK's built-in parallel execution support.
---

## Question 8

A subagent for legacy code analysis must receive findings from a prior "dependency graph" subagent in order to produce accurate recommendations. You need to pass 847 dependency relationships (source file, target file, relationship type) between agents. What is the most effective context-passing approach?

A) Concatenate all 847 relationships into a single prose paragraph and include it in the subagent's system prompt.
B) Summarize the 847 relationships into a 3-sentence description of the overall dependency pattern and pass only the summary.
C) Pass a structured data format (e.g., JSON array) that separates content from metadata, preserving source file, target file, and relationship type fields so the receiving subagent can reason about individual relationships.
D) Store the dependency data in a temporary file and pass only the file path to the subagent, trusting it will read the file independently.

**Answer:** C

**Explanation:** Structured data formats preserve the individual relationships the analysis subagent needs, while keeping source attribution clean. A JSON array maintains the separation between content and metadata (file paths, relationship type) that the receiving agent can query. Option A destroys the structured nature of the data, making it nearly impossible for the model to reason about individual relationships. Option B loses 95%+ of detail — a 3-sentence summary of 847 relationships cannot support accurate recommendations. Option D introduces a dependency on the subagent's willingness to read the file; explicit context passing in the prompt is more reliable.
---

## Question 9

You need the `Task` tool available to your coordinator agent so it can spawn subagents. After implementing the coordinator, you observe that all `Task` calls fail silently and no subagents are ever spawned. Examining your coordinator's `AgentDefinition`, you find `allowedTools: ["Read", "Grep", "Glob", "Bash"]`. What is the problem?

A) The `Task` tool requires a special API key scope that must be enabled separately in the agent configuration.
B) The coordinator's `allowedTools` list does not include `"Task"`, so the coordinator cannot invoke subagents.
C) The `Task` tool is not supported in coordinator agents; subagents must be spawned using the `Spawn` tool instead.
D) The `allowedTools` field only controls which tools subagents can use, not which tools the coordinator itself can use.

**Answer:** B

**Explanation:** The `Task` tool is the mechanism for spawning subagents, and it must be explicitly included in `allowedTools` for the coordinator to use it. The current configuration lists Read, Grep, Glob, and Bash but omits `Task`, which is why all subagent spawn attempts fail. Option A describes a non-existent API key scope requirement. Option C is incorrect; `Task` is the correct and only tool for spawning subagents. Option D is incorrect; `allowedTools` in the coordinator's `AgentDefinition` controls what the coordinator itself can call.
---

## Question 10

Your coordinator agent's `AgentDefinition` specifies a system prompt that says: "First identify all entry points. Then map all dependencies. Then generate the refactoring plan." Engineers find that subagents consistently produce generic output rather than adapting to the specific codebase they analyze. What is the most likely issue with the coordinator prompt design?

A) The system prompt is too short; it should provide more detailed step-by-step instructions for each stage.
B) The coordinator prompt specifies step-by-step procedural instructions rather than research goals and quality criteria, which limits subagent adaptability.
C) The coordinator should issue a separate prompt for each step in a separate subagent invocation rather than combining all steps.
D) Subagents cannot follow natural language instructions and require tool-call sequences to be pre-configured in `AgentDefinition`.

**Answer:** B

**Explanation:** Coordinator prompts should specify goals and quality criteria (e.g., "produce a complete refactoring plan that covers all circular dependencies and identifies performance bottlenecks") rather than step-by-step procedures. Procedural instructions constrain the subagent to a fixed sequence even when the codebase characteristics call for a different approach. A goal-oriented prompt enables the subagent to adapt its strategy. Option A is incorrect; more procedural instructions amplify the problem rather than fixing it. Option C adds overhead without addressing the root cause. Option D is entirely false; LLM-based subagents follow natural language instructions.
---

## Question 11

Your developer productivity workflow requires that static analysis (`run_linter`) always runs before test generation (`generate_tests`), because the test generator uses linter output to identify which functions need test coverage. In production, in 8% of cases the agent calls `generate_tests` before `run_linter` completes, producing low-quality tests. You currently enforce ordering via the system prompt: "Always run the linter before generating tests." What change would eliminate the 8% failure rate?

A) Implement a programmatic prerequisite that blocks `generate_tests` from being called until `run_linter` has returned a result and that result has been appended to the conversation.
B) Strengthen the system prompt by adding emphasis: "CRITICAL: You MUST ALWAYS run the linter before generating tests without exception."
C) Add few-shot examples to the system prompt showing the correct tool call sequence so the model learns the pattern.
D) Replace the system prompt instruction with an in-context reminder injected immediately before each `generate_tests` call.

**Answer:** A

**Explanation:** Prompt-based instructions for workflow ordering have a non-zero failure rate — the 8% failure rate confirms this. When deterministic compliance is required (test quality depends on linter output), programmatic enforcement is necessary. A prerequisite gate that checks whether `run_linter` has completed before allowing `generate_tests` to proceed provides a 100% guarantee. Options B and C both rely on probabilistic LLM compliance; adding emphasis or examples may reduce the failure rate but cannot eliminate it. Option D injects a reminder still subject to the same probabilistic failure.
---

## Question 12

Your codebase exploration workflow has three stages: (1) directory structure scan, (2) entry point identification, and (3) dependency tracing. You need to generate a structured handoff document when escalating an incomplete analysis to a senior engineer who lacks access to the conversation transcript. What should the handoff document include?

A) The full conversation transcript so the engineer can see every tool call and response.
B) A structured summary including: the codebase path analyzed, which stages completed successfully, what was discovered in each completed stage, what remains unexplored, and recommended next steps.
C) Only the final incomplete result, since the engineer can re-run the analysis from the beginning.
D) A list of all files that were read during the analysis so the engineer knows what was already covered.

**Answer:** B

**Explanation:** A structured handoff for mid-process escalation must include everything the receiving engineer needs to continue without access to the transcript: what was accomplished (stages completed), what was discovered (findings per stage), what remains (unexplored areas), and what to do next (recommended actions). Option A is impractical — conversation transcripts are verbose and unstructured. Option C wastes the senior engineer's time re-running completed stages. Option D provides one piece of the handoff (what was covered) but omits findings, remaining work, and recommendations.
---

## Question 13

You implement a `PostToolUse` hook in your developer productivity agent to normalize file metadata returned by an MCP code search tool. The tool returns timestamps in three formats depending on server version: Unix epoch (`1715000000`), ISO 8601 (`"2024-05-06T12:00:00Z"`), and a legacy format (`"06/May/2024 12:00:00"`). What is the correct use of a hook for this normalization?

A) Add an instruction to the system prompt telling the model to handle all three timestamp formats when reasoning about file dates.
B) Use a `PostToolUse` hook to intercept the tool result and transform all timestamp formats into a consistent ISO 8601 representation before the model processes the result.
C) Use a `PreToolUse` hook to intercept the search query and add a `format=iso8601` parameter before the tool is called.
D) Upgrade the MCP server to always return ISO 8601 timestamps, eliminating the need for normalization at the agent layer.

**Answer:** B

**Explanation:** `PostToolUse` hooks are designed exactly for this use case: intercepting tool results and transforming heterogeneous data formats before the model processes them. This provides deterministic normalization regardless of which server version returned the data. Option A relies on the model to correctly parse and compare three different date formats in its reasoning, which is error-prone. Option C is incorrect because `PreToolUse` intercepts outgoing calls before execution, and adding a format parameter may not work on legacy server versions. Option D is the ideal long-term solution but may not be feasible if servers are outside the team's control.
---

## Question 14

Your agent must enforce a policy preventing automatic refactoring of files marked as "frozen" in a `code-ownership.json` registry. You implement this via a system prompt instruction: "Never refactor files listed as frozen in code-ownership.json." Compliance monitoring shows the instruction is followed 96% of the time. The remaining 4% of violations could corrupt production configurations. What is the most appropriate fix?

A) Implement a `PreToolUse` hook that intercepts Write and Edit tool calls, checks whether the target file is in the frozen registry, and blocks the call if it is.
B) Require human approval for every file modification to eliminate violations entirely.
C) Improve the system prompt with more detailed descriptions of the frozen file policy and its consequences.
D) Add a post-execution review step where a second Claude call audits all file modifications and flags violations.

**Answer:** A

**Explanation:** When business rules require guaranteed compliance — especially for production-critical constraints — hooks provide deterministic enforcement that prompt instructions cannot. A `PreToolUse` hook that intercepts Write and Edit calls and checks the frozen registry before execution prevents 100% of violations. Option B is overly restrictive and defeats the purpose of an autonomous productivity agent. Option C addresses a 96% compliance rate with more prompting, which cannot achieve 100%. Option D is a post-hoc detection mechanism; it identifies violations after they occur but doesn't prevent them.
---

## Question 15

When should you use prompt chaining versus dynamic adaptive decomposition for a developer productivity task?

A) Prompt chaining when the task requires more than 10 tool calls; dynamic decomposition for simpler tasks.
B) Dynamic decomposition always, because it is more flexible and produces better results than fixed sequences.
C) Prompt chaining for tasks affecting a single file; dynamic decomposition for tasks affecting multiple files.
D) Prompt chaining for predictable multi-step reviews with fixed stages; dynamic decomposition for open-ended investigation tasks where intermediate findings determine next steps.

**Answer:** D

**Explanation:** The selection criterion is workflow predictability. Prompt chaining is appropriate when the pipeline stages are known upfront and fixed — each stage runs regardless of intermediate findings. Dynamic adaptive decomposition is for open-ended investigations where what you discover at each step determines what to investigate next. Option A uses tool call count as a proxy, which doesn't capture the structural difference. Option B is incorrect; prompt chaining is more efficient and reliable for predictable workflows. Option C uses file count, which is also not the relevant criterion.
---

## Question 16

You are implementing a task to add comprehensive test coverage to a legacy 80,000-line Python codebase. The agent has no existing knowledge of the codebase structure. What decomposition approach produces the highest quality test suite?

A) First map the codebase structure to identify high-impact areas (critical business logic, untested paths), then create a prioritized testing plan, then adapt the plan as dependencies and shared fixtures are discovered.
B) Immediately generate tests for all 200+ modules in parallel using subagents, one per module.
C) Prompt chain the task into three equal batches of 66 modules each, processing each batch sequentially.
D) Start generating tests for randomly selected modules and build coverage incrementally until the target percentage is reached.

**Answer:** A

**Explanation:** For open-ended tasks in unfamiliar codebases, the correct decomposition is: (1) explore to understand structure, (2) identify high-impact areas, (3) create a prioritized plan, and (4) adapt as dependencies are discovered. This avoids writing redundant tests for low-impact code while missing coverage in critical paths. Option B parallelizes before understanding the codebase, risking duplicate fixture code and inconsistent patterns. Option C's equal batch division ignores that modules have wildly different criticality and complexity. Option D's random selection is inefficient and produces poor coverage distribution.
---

## Question 17

Your team uses a "code review" multi-agent system to analyze pull requests. A PR modifies 23 files across `src/payments/`, `src/auth/`, and `src/reporting/`. Running a single-pass review on all 23 files produces inconsistent depth — some files get 8 detailed comments while others get 1 superficial comment. How should you restructure the review?

A) Limit reviews to PRs with 10 or fewer files to ensure consistent attention.
B) Run the review three times on all 23 files and average the findings to smooth out inconsistencies.
C) Use a larger model with a 200K context window to process all 23 files at once without attention dilution.
D) Split into per-file analysis passes to ensure consistent depth per file, then run a separate cross-file integration pass to catch data-flow issues that span module boundaries.

**Answer:** D

**Explanation:** Attention dilution occurs when many files compete for the model's attention in a single pass. Splitting into per-file local analysis passes ensures each file receives consistent depth. A separate integration pass then specifically targets cross-file issues (shared data structures, API contracts, authentication flow) that cannot be identified by looking at files in isolation. Option A shifts the problem to developers rather than solving it. Option B averaging is nonsensical for qualitative findings and could suppress real bugs. Option C misdiagnoses the problem; context window size and attention quality are different — more context doesn't guarantee uniform attention distribution.
---

## Question 18

You have a named session called `auth-module-investigation` from two weeks ago containing a thorough analysis of the authentication module. Since then, three files were modified: `AuthService.java`, `TokenValidator.java`, and `SessionManager.java`. A new bug report implicates the session management logic. What is the best approach for continuing the investigation?

A) Start a completely new session from scratch, re-exploring the entire authentication module.
B) Resume the `auth-module-investigation` session using `--resume auth-module-investigation`, then explicitly inform the agent about the three modified files so it can re-analyze them specifically.
C) Resume the `auth-module-investigation` session without additional context, trusting the agent to detect what has changed.
D) Create a fork of the `auth-module-investigation` session for each modified file and analyze them in parallel.

**Answer:** B

**Explanation:** When prior session context is mostly valid but specific files have changed, resuming with targeted information about the changes is the most efficient approach. Explicitly informing the resumed session about the three modified files triggers focused re-analysis rather than re-exploring everything. Option A is wasteful — it throws away two weeks of valid analysis context. Option C is incorrect because agents cannot detect file changes since the last session; they must be told. Option D creates unnecessary parallel forks for what is likely a sequential investigation (the three files probably interact in the bug's root cause).
---

## Question 19

You need to compare two architectural approaches for refactoring a legacy service registry: approach A uses a centralized in-memory store, and approach B uses event-sourced distributed state. Both require substantial codebase exploration first. How should you use session management to support this comparison most efficiently?

A) Run a shared codebase exploration phase, establish an analysis baseline session, then use `fork_session` to create independent branches for each approach from that shared baseline.
B) Combine both approaches into a single session and have the agent explore them sequentially.
C) Create two separate new sessions from scratch, one for each approach, and run them independently.
D) Use `--resume` to continue the same session for both approaches, using in-session notes to track which approach is being evaluated at each point.

**Answer:** A

**Explanation:** `fork_session` is designed for this exact scenario: when multiple approaches share a common exploration baseline, forking avoids duplicating the exploration work. Both forks start with identical knowledge of the codebase and diverge only in approach-specific exploration. Option B is inefficient and risks contamination — findings from approach A may influence approach B's analysis. Option C duplicates the full exploration cost. Option D uses session resumption for parallel independent exploration, which compounds context and risks cross-contamination.
---

## Question 20

A developer productivity agent analyzed a 40,000-line Ruby on Rails codebase two months ago. Since then, the team performed a major gem upgrade affecting 85% of dependency files, renamed `app/services/` to `app/domain/`, and refactored the authentication flow across 30 files. An engineer wants to resume the old session to continue the analysis. What is the best recommendation?

A) Resume the old session — the agent can detect stale tool results automatically and will re-execute them.
B) Resume the old session and provide a detailed summary of all changes so the agent can update its mental model.
C) Start a fresh session and inject a structured summary of the prior analysis findings along with information about the major structural changes, because the prior tool results are too stale to be reliable.
D) Resume the old session but disable all previously cached tool results to force re-execution of every prior analysis step.

**Answer:** C

**Explanation:** When prior tool results are stale due to major structural changes (85% of dependencies changed, directory renamed, 30 files refactored), starting fresh with an injected summary is more reliable than resuming. The prior session's tool results reference a codebase structure that no longer exists. Option A is incorrect; agents cannot automatically detect stale tool results. Option B is reasonable for minor changes but the magnitude described here makes prior tool results fundamentally unreliable. Option D is not a supported mechanism and would be equivalent to starting fresh anyway.
---

## Question 21

Your developer productivity agent uses a `PostToolUse` hook to normalize exit codes, stdout, and stderr from Bash tool outputs. In production, the hook also runs on results from Read, Grep, and Glob tool calls, attempting to parse file contents as shell output and producing errors. What is the most likely cause?

A) The hook registration did not specify a `tools` filter, causing it to intercept results from all tools rather than only Bash.
B) The Bash tool is returning results in an undocumented format that conflicts with Read, Grep, and Glob output formats.
C) The hook execution order is incorrect; `PostToolUse` hooks run before tool results are appended to conversation history.
D) The SDK version is outdated and contains a bug causing hook routing to ignore tool type filters.

**Answer:** A

**Explanation:** `PostToolUse` hooks must specify which tools they intercept. If the hook registration does not include a `tools` filter restricting it to `["Bash"]`, the hook runs on results from every tool call in the agent's execution. This explains why Read, Grep, and Glob results are being processed by the shell output parser. Option B is incorrect; the described pattern points to routing rather than output format issues. Option C is incorrect; `PostToolUse` by definition runs after the tool result is available. Option D is possible but the root cause is clearly the missing tool filter.
---

## Question 22

You need to implement a workflow for documenting an unfamiliar API client library. The agent should: (1) locate the source files, (2) read the main module, (3) trace all public API methods, (4) generate documentation. Steps 1–3 always execute in the same order, and step 4 takes the combined output of all three prior steps. How would you classify this workflow?

A) Dynamic adaptive decomposition, because the agent must adapt to different library structures.
B) Parallel subagent execution, because steps 1–3 can run simultaneously.
C) Fork-based exploration, because step 4 might produce multiple valid documentation styles.
D) Prompt chaining, because the steps are fixed, sequential, and each step's output feeds into the next with predictable structure.

**Answer:** D

**Explanation:** This workflow has fixed, known stages (locate → read → trace → document), each step has predictable output, and each feeds into the next. This is the canonical description of prompt chaining: a sequential pipeline where the output of each step becomes the input of the next. Option A is incorrect; dynamic decomposition is for tasks where intermediate findings determine what to investigate next — this workflow's steps are predetermined. Option B is incorrect; steps 1–3 are explicitly sequential (you must locate files before reading them). Option C is incorrect; forking is for exploring divergent approaches from a shared baseline, not for generating alternative output formats.
---

## Question 23

Your multi-agent code review system produces a final synthesis report with contradictory findings: the security subagent flags a SQL query as vulnerable while the performance subagent approves the same query for use in hot paths. The coordinator synthesizes both findings without resolving the contradiction. What should the coordinator's iterative refinement loop do?

A) Accept both findings and include them in the report, letting developers resolve the contradiction manually.
B) Merge both findings into a single hedged statement: "The query may be vulnerable but performs well."
C) Evaluate the synthesis output for contradictions, identify the specific conflicting findings, and re-delegate targeted verification queries to the relevant subagents before producing the final report.
D) Discard the finding from the lower-priority subagent based on a predefined ranking of subagent authority.

**Answer:** C

**Explanation:** The coordinator's iterative refinement role includes evaluating synthesis output for gaps and contradictions, then re-delegating targeted queries to resolve them before finalizing the report. A security-vs-performance conflict on the same query requires additional investigation to determine which finding is correct. Option A passes the contradiction to developers, negating the purpose of the coordinator's synthesis role. Option B produces an ambiguous hedged statement less useful than either original finding. Option D applies an arbitrary authority ranking that may be wrong in this specific case.
---

## Question 24

Your developer productivity agent terminates the entire workflow when a code analysis subagent times out (30-second timeout), losing all work from previously completed subagents. What error propagation design would best enable recovery?

A) Suppress the timeout and return an empty result to the coordinator, marking the subagent's analysis as complete.
B) Catch the timeout within the subagent, attempt a single retry with a smaller scope, and if the retry also fails, return structured error metadata (partial results, attempted scope, failure type) to the coordinator rather than propagating the exception.
C) Propagate the timeout exception directly to a top-level handler so the error is never hidden from the caller.
D) Increase the subagent timeout from 30 to 120 seconds to prevent timeouts from occurring.

**Answer:** B

**Explanation:** The correct error propagation pattern is: attempt local recovery within the subagent (retry with reduced scope), and if recovery fails, return structured error metadata to the coordinator along with partial results. This gives the coordinator the information needed to make intelligent decisions while preserving all work from successfully completed subagents. Option A suppresses the error by marking failure as success, preventing recovery. Option C is the current broken behavior — throwing away all prior work on a single failure. Option D treats the symptom rather than designing for resilience.
---

## Question 25

An engineer runs `--resume legacy-auth-analysis` to continue investigating an authentication bug. The session was saved three days ago. The engineer has since fixed two of the three suspected issues. The session resumes and the agent begins proposing fixes for issues already resolved, wasting time. What should the engineer have done differently when resuming?

A) Started a new session from scratch because resumed sessions cannot be updated with new information.
B) Resumed the session and provided a targeted update explaining which two issues were already fixed and confirmed resolved, so the agent could focus on the remaining open issue.
C) Used `fork_session` to create a branch exploring each remaining suspect independently.
D) Added the two resolved issues to the system prompt blocklist so the agent would not investigate them.

**Answer:** B

**Explanation:** When resuming a session, the engineer should inform the agent about changes since the last session — in this case, which issues have been resolved. This allows the agent to reorient toward the remaining open issue rather than re-investigating closed ones. `--resume` is most effective when combined with targeted context updates about what has changed. Option A is wrong; resumed sessions absolutely can and should be updated with new information. Option C is premature — forking is for comparing approaches, not for a case where one issue remains. Option D describes a non-existent "blocklist" mechanism.
---

## Question 26

Your developer productivity agent has two tools: `search_codebase` (described as "Searches through code files") and `search_documentation` (described as "Searches through project files"). Production logs show the agent frequently uses `search_documentation` to find function definitions and `search_codebase` to look up API documentation comments. What is the root cause?

A) The tool descriptions are nearly identical and do not differentiate their purpose, expected inputs, outputs, or when to use one versus the other.
B) The two tools should be merged into a single `search_all` tool to eliminate the ambiguity.
C) The agent needs more examples of codebase searches in its system prompt to learn the correct tool usage pattern.
D) The agent requires a routing classifier that detects query intent before selecting a search tool.

**Answer:** A

**Explanation:** The descriptions "Searches through code files" and "Searches through project files" are functionally indistinguishable — both describe searching files without specifying the content type or when to use each. The fix is to write descriptions that clearly differentiate each tool: what it searches, what queries it handles, and what it returns. Option B consolidating the tools is more disruptive than simply improving descriptions. Option C adds examples but doesn't fix the ambiguous descriptions that are the root cause. Option D adds infrastructure complexity when the problem is a description-writing issue.
---

## Question 27

You are adding three new tools to your codebase analysis agent: `extract_function_signatures`, `summarize_module_purpose`, and `verify_api_contract`. The current agent has a generic `analyze_code` tool whose description overlaps significantly with all three. What is the most effective approach to prevent misrouting?

A) Keep `analyze_code` and add the three new tools alongside it; the model will naturally prefer more specific tools.
B) Split `analyze_code` into the three purpose-specific tools with distinct input/output contracts, and explicitly state in each tool's description when to use it versus the alternatives.
C) Add a system prompt section that maps query types to tool names so the model has explicit routing instructions.
D) Rename `analyze_code` to `analyze_code_legacy` to signal that it should be deprecated in favor of the new tools.

**Answer:** B

**Explanation:** Splitting a generic tool into purpose-specific tools with defined input/output contracts is the recommended approach to eliminate functional overlap. Each new tool should describe exactly what it does, what input it expects, what it returns, and when to use it versus the alternatives. Option A is incorrect; models do not automatically prefer more specific tools when a generic alternative exists with overlapping descriptions. Option C adds routing instructions that compensate for poor tool design rather than fixing the design. Option D is cosmetic and doesn't resolve the overlap problem.
---

## Question 28

Your MCP code search tool returns error responses that all look like: `{"error": "Operation failed"}`. The agent retries failed tool calls up to 3 times. Monitoring shows the agent retrying file-not-found errors infinitely (which will never succeed) while giving up too quickly on transient network errors (which would succeed on retry). What structured error response design fixes both problems?

A) Return HTTP status codes (404, 503) in the error response so the agent can infer retryability from standard web conventions.
B) Increase the retry limit to 10 for all errors so transient failures eventually succeed.
C) Log all errors to a monitoring system and rely on human operators to intervene when retry loops are detected.
D) Return structured error metadata including `errorCategory` (`"transient"` / `"validation"` / `"not_found"`), `isRetryable` boolean, and a human-readable description of what went wrong.

**Answer:** D

**Explanation:** Structured error metadata with `errorCategory` and `isRetryable` fields gives the agent the information it needs to make correct retry decisions: skip retries when `isRetryable: false` (file-not-found), retry with backoff when `isRetryable: true` (transient network error). Generic error messages prevent distinguishing between these cases. Option A relies on HTTP conventions that may not translate cleanly to tool error responses and still requires inference. Option B wastes budget retrying non-retryable errors. Option C converts a code design problem into a human monitoring problem.
---

## Question 29

Your multi-agent system has a "semantic analysis" subagent with access to Grep, Bash, `fetch_repository_metadata`, and `query_issue_tracker`. The subagent is spending 60% of its processing time on repository metadata and issue tracker queries — tools intended for the coordinator's planning phase. What is the most effective fix?

A) Add instructions to the semantic analysis subagent's system prompt telling it to focus on code analysis.
B) Create a new "metadata analysis" subagent to handle all repository metadata queries.
C) Restrict the semantic analysis subagent's tool access to only Grep and Bash, removing access to repository metadata and issue tracker tools.
D) Give the semantic analysis subagent access to all available tools so it can handle any task without tool limitation errors.

**Answer:** C

**Explanation:** Restricting each subagent's tool set to only those needed for its role is the correct solution. Agents with access to tools outside their specialization tend to misuse them. Removing `fetch_repository_metadata` and `query_issue_tracker` from the subagent's allowed tools prevents the misuse deterministically. Option A relies on prompting to not use tools that are accessible — probabilistic and likely already the intended behavior. Option B creates additional infrastructure when the fix is simply removing tool access. Option D is the opposite of best practice; too many tools degrade selection reliability.
---

## Question 30

You want to ensure your code documentation agent always calls `extract_metadata` as its first tool call for every request, before any enrichment or analysis tools. How should you configure `tool_choice` to enforce this?

A) Set `tool_choice: "any"` to guarantee the model calls a tool rather than returning text, and rely on the tool description to make `extract_metadata` the natural first choice.
B) Set `tool_choice: {"type": "tool", "name": "extract_metadata"}` for all turns so the model always calls `extract_metadata` regardless of what other tools are needed.
C) Set `tool_choice: "auto"` and add a system prompt instruction: "Always call extract_metadata first."
D) Set `tool_choice: {"type": "tool", "name": "extract_metadata"}` to force `extract_metadata` in the first turn, then use `tool_choice: "auto"` for subsequent turns.

**Answer:** D

**Explanation:** Forced tool selection (`{"type": "tool", "name": "..."}`) ensures the specified tool is called first. After the first turn, switching to `"auto"` allows the model to freely choose subsequent tools. Option A uses `"any"` which guarantees a tool is called but does not guarantee which tool. Option B forces `extract_metadata` on every turn, causing redundant calls on turns 2, 3, etc. when other tools should be used. Option C uses prompting, which is probabilistic.
---

## Question 31

Your team has an MCP semantic code search tool that queries a 500,000-line codebase in 1.2 seconds with semantic understanding. The agent consistently uses the built-in Grep tool instead, performing keyword searches that take 8+ seconds and miss semantic matches. The MCP tool's description reads: "Searches code." What is the most effective fix?

A) Remove the Grep tool from the agent's allowed tools so it has no choice but to use the MCP tool.
B) Add a `PreToolUse` hook that intercepts Grep calls and redirects them to the MCP tool automatically.
C) Enhance the MCP tool's description to explain its semantic search capability, performance advantage, example queries it handles well, and when to prefer it over Grep.
D) Increase the Grep tool's timeout so it doesn't feel slower than the MCP tool to the model.

**Answer:** C

**Explanation:** Tool descriptions are the primary mechanism LLMs use for tool selection. A description of "Searches code" provides no information about semantic search capability, performance, or when to prefer this tool over alternatives. Enhancing the description gives the model the context to make the right selection. Option A is overly restrictive — Grep is a valid fallback for exact pattern matching. Option B implements a redirect hook that bypasses the model's selection entirely, which is more fragile than fixing the description. Option D is irrelevant — the agent isn't choosing based on speed perception.
---

## Question 32

You are configuring an MCP GitHub server for your developer productivity agent. The server requires a personal access token. You need to ensure the token is not committed to version control while still allowing the team-shared configuration to be in the repository. What is the correct approach?

A) Store the token directly in `.mcp.json` and add `.mcp.json` to `.gitignore` so it is never committed.
B) Use environment variable expansion in `.mcp.json` with `${GITHUB_TOKEN}`, and document that developers must set this variable in their environment.
C) Store the token in `~/.claude.json` under the user's personal MCP configuration where it is never version-controlled.
D) Hardcode the token in the MCP server's command arguments and rotate the token quarterly to reduce exposure risk.

**Answer:** B

**Explanation:** Environment variable expansion in `.mcp.json` (e.g., `"env": {"GITHUB_TOKEN": "${GITHUB_TOKEN}"}`) allows the configuration to be committed to version control without exposing the actual token. Each developer sets `GITHUB_TOKEN` in their environment. Option A prevents sharing the configuration with the team. Option C moves the configuration to personal scope, defeating the goal of sharing it via the repository. Option D hardcoding credentials is a security violation regardless of rotation frequency.
---

## Question 33

Your team wants to add a Jira integration to the developer productivity agent so engineers can look up tickets, add comments, and transition issue states. You are evaluating whether to build a custom MCP server or use an existing community Jira MCP server. What is the best guidance?

A) Always build custom MCP servers for production use; community servers have unknown quality and security profiles.
B) Use the community Jira MCP server only for prototyping; replace it with a custom implementation before production deployment.
C) Build a custom server because it gives full control over the API surface and avoids external dependencies.
D) Use an existing community Jira MCP server for standard Jira operations, reserving custom server development for workflows specific to your team's processes that no existing server covers.

**Answer:** D

**Explanation:** The principle is to use existing community MCP servers for standard integrations and reserve custom server development for team-specific workflows. Jira is a standard system with established community MCP implementations. Building a custom server duplicates significant effort for no gain on standard functionality. Option A is unnecessarily cautious; established community servers are widely vetted. Option B creates a two-phase development plan with redundant effort. Option C prioritizes control over practicality — the extra control is rarely needed for standard Jira operations.
---

## Question 34

An MCP documentation search tool returns an empty array `[]` when no documents match a query. However, the agent treats this identically to a timeout error and marks the search as failed, asking the user to rephrase. How should the MCP tool distinguish these two cases?

A) Return `null` for empty results and `[]` for errors, using the absence of the array as the error signal.
B) Return the same response format for both cases and rely on the agent to determine from context whether the empty result indicates a failure or a successful search with no matches.
C) Always return a non-empty result array; include a "no results found" sentinel object in the array instead of returning empty.
D) Return a success response with `results: []` and `matched: 0` for genuine empty results, and use the MCP `isError` flag with `errorCategory: "transient"` and `isRetryable: true` for timeout failures.

**Answer:** D

**Explanation:** Empty results and errors are semantically different outcomes: empty results mean the search succeeded but found nothing (a valid answer), while a timeout means the search failed and may be retried. Using the MCP `isError` flag for actual failures and a successful response with `results: []` for genuine empty results gives the agent the correct signal. Option A uses `null` vs `[]` as a signal — unconventional and easy to confuse. Option B delegates the distinction to agent reasoning, which will be unreliable. Option C pollutes the result format with sentinel objects that complicate downstream processing.
---

## Question 35

Your developer productivity agent has access to 22 tools spanning file operations, code analysis, test generation, and documentation. Monitoring shows the agent frequently selects the wrong tool — documentation tools for code analysis tasks and vice versa. What restructuring approach best addresses the reliability issue?

A) Distribute tools across specialized subagents by role (file operations, code analysis, test generation, documentation), each with access only to the tools relevant to its role.
B) Reduce the total tool count to 5 by merging similar tools into generic multi-purpose alternatives.
C) Keep all 22 tools but add a routing system prompt section that maps request types to specific tools.
D) Remove all tools except the 5 most commonly used, based on usage logs.

**Answer:** A

**Explanation:** Giving an agent access to too many tools degrades tool selection reliability. The solution is to distribute tools across specialized subagents, each with a focused tool set. An agent with 4–6 tools relevant to its specific role will make far more accurate selections than a single agent with 22 tools. Option B merging into generic tools creates exactly the ambiguity problem — overly generic tools must cover too many cases in their descriptions. Option C adds routing instructions to compensate for poor architecture, a band-aid approach. Option D arbitrarily removes tools based on frequency, potentially removing tools critical for specific high-value tasks.
---

## Question 36

You want your developer productivity agent to find all TypeScript test files across a large codebase. Which built-in tool and pattern is correct?

A) Use Grep with pattern `*.test.ts` to search file paths for the test extension.
B) Use Read to load the directory structure and manually filter for `.test.ts` files.
C) Use Bash with `find . -name "*.test.ts"` because Glob does not support recursive directory traversal.
D) Use Glob with a pattern like `**/*.test.ts` to find all files matching the test file naming convention by path pattern.

**Answer:** D

**Explanation:** Glob is the correct tool for finding files by name or extension pattern. The pattern `**/*.test.ts` matches any `.test.ts` file recursively throughout the codebase. Option A is incorrect — Grep searches file *contents* for patterns, not file paths by extension. Option B uses Read to explore directory structure, which is extremely inefficient for finding files by extension across a large codebase. Option C is incorrect; Glob does support recursive traversal via `**` glob patterns, and Bash is not needed for this task.
---

## Question 37

Your developer productivity agent needs to find all functions that call `authenticateUser()` across a 300-file codebase, then read each calling function's implementation to assess security implications. What is the most efficient approach?

A) Use Glob to find all source files, then use Read on each file and manually search the loaded content for `authenticateUser`.
B) Use Read to load all 300 files upfront so the agent has full codebase context before beginning the search.
C) Use Grep to find all files and line numbers containing `authenticateUser()` calls, then use Read to load only the specific files identified by Grep for deeper analysis.
D) Use Bash with `grep -r "authenticateUser"` and capture all output at once, then parse the terminal output to identify files.

**Answer:** C

**Explanation:** The efficient pattern is: use Grep to identify which files contain the target pattern (fast, targeted), then use Read on only those specific files for deep analysis. This avoids loading irrelevant files. Option A uses Glob to get all files and then Read on every file — loading all 300 files regardless of whether they contain the target, which is extremely wasteful. Option B loading all 300 files upfront consumes enormous context window space unnecessarily. Option D using Bash is a valid approach but is less idiomatic than using the built-in Grep tool designed for this purpose.
---

## Question 38

When your developer productivity agent uses the Edit tool to modify a frequently used utility function with a short 3-line body that appears identically in 12 different test files, the Edit tool fails with a "non-unique match" error. How should the agent handle this?

A) Give up and ask the developer to make the change manually because the Edit tool cannot handle non-unique matches.
B) Use Read to load the full content of the target file, make the necessary modification in the loaded content, then use Write to write the updated content back — using Read + Write as a reliable fallback when Edit cannot find a unique anchor.
C) Use Grep to find the exact line numbers of the function in each file, then use Edit with line number anchors.
D) Increase the Edit tool's search context by providing more surrounding lines to create a unique match.

**Answer:** B

**Explanation:** When Edit fails due to non-unique text matches, the documented fallback pattern is Read + Write: load the full file, make the targeted modification in the loaded content, then write the complete updated content back. This is reliable regardless of how many times the target text appears in the codebase because it operates on one specific file. Option A is defeatist and incorrect. Option C is incorrect — the Edit tool does not support line number anchors; it uses text matching. Option D providing more context is valid when surrounding context differs, but when the same function appears identically in 12 test files, even more context may still be non-unique.
---

## Question 39

Your developer productivity agent encounters a codebase with 847 files. An engineer asks the agent to "understand the authentication module." What is the most efficient codebase exploration strategy?

A) Use Bash to run a static analysis tool across all 847 files to generate a complete dependency graph before starting.
B) Use Glob to list all 847 files, then use Read to load them all sequentially before beginning analysis.
C) Use Read to load the main entry file, then ask the developer which files are part of the authentication module.
D) Use Grep to find authentication-related entry points (files importing auth modules or defining auth classes), then use Read to follow the import chain incrementally through the authentication module.

**Answer:** D

**Explanation:** Building codebase understanding incrementally is the correct approach: start with Grep to find entry points related to authentication, then use Read to follow imports and trace the auth flow, loading only relevant files. Option A adds an unnecessary static analysis phase before any targeted investigation. Option B loads all 847 files, extremely wasteful for a module-scoped investigation. Option C loads only one file and defers scope determination to the developer, abdicating the agent's analysis capability.
---

## Question 40

Your team's MCP server exposes a resource catalog of the project's documentation hierarchy (150 documents organized by topic). Developers report that the agent makes 8–12 exploratory tool calls before finding relevant documentation because it doesn't know what documents exist. How should MCP resources address this?

A) Reduce the documentation library to 20–30 documents to make exploration faster.
B) Add a Glob pattern tool that searches the documentation directory structure.
C) Cache the results of the first document search and reuse them for subsequent searches in the same session.
D) Expose the documentation catalog as an MCP resource so the agent can read the full hierarchy at connection time, enabling it to navigate directly to relevant documents without exploratory calls.

**Answer:** D

**Explanation:** MCP resources are designed for exactly this use case: exposing content catalogs to give agents visibility into available data without requiring exploratory tool calls. When the agent can see the full documentation hierarchy at the start of a session, it can navigate directly to the relevant section. Option A reduces capability to solve a discoverability problem that should be solved architecturally. Option B adds a Glob-like search capability, which still requires multiple exploratory calls to discover structure. Option C caching helps with repeat queries but doesn't address the initial 8–12 exploratory calls.
---

## Question 41

You configure your developer productivity agent's MCP server in `~/.claude.json` rather than `.mcp.json`. A new team member joins and reports the MCP integration doesn't work for them. What is the most likely explanation?

A) `~/.claude.json` has a syntax error that prevents the server from loading on their machine.
B) The configuration in `~/.claude.json` is user-scoped and applies only to your personal installation; new team members need the configuration in the project-scoped `.mcp.json` to receive it automatically.
C) The MCP server requires a restart after configuration changes and the new team member hasn't restarted Claude Code.
D) The new team member needs to manually copy `~/.claude.json` to their own home directory.

**Answer:** B

**Explanation:** `~/.claude.json` is the user-level configuration file that applies only to the individual developer's personal installation and is not shared via version control. For MCP servers the whole team should use, the configuration belongs in the project-scoped `.mcp.json` in the repository root, where it is committed and automatically available to anyone who clones the repository. Option A is possible but doesn't explain why it works for you but not for the new team member. Option C applies equally to both developers. Option D is a workaround that defeats the purpose of shared project configuration.
---

## Question 42

Your developer productivity agent handles two types of queries: "find all usages of this function" (requires content search) and "list all configuration files" (requires file path matching). Both are handled by a single `search_codebase` tool. The tool frequently fails to distinguish these cases and applies the wrong search strategy. How should you redesign the tool interface?

A) Add natural language examples to the system prompt showing correct `search_codebase` invocations for each query type.
B) Keep the single `search_codebase` tool but add a `search_type` parameter with values `"content"` and `"path"` so the tool can be explicitly directed.
C) Create a routing function that analyzes the query before calling `search_codebase` and transforms it based on detected intent.
D) Split into two tools: `search_code_content` (for finding patterns within files, using Grep semantics) and `find_files_by_pattern` (for finding files by name/extension, using Glob semantics), with descriptions explaining when to use each.

**Answer:** D

**Explanation:** Splitting a generic tool into purpose-specific tools with distinct input/output contracts is the recommended pattern. Content search and file path pattern matching are fundamentally different operations. Separate tools with clear descriptions allow the model to make the correct selection. Option A adds examples to compensate for ambiguous tool design rather than fixing the design. Option B adds a parameter to a single tool — this still requires the model to correctly identify the search type in every call. Option C adds a pre-processing layer more complex than simply having two well-described tools.
---

## Question 43

Your team's CLAUDE.md at the project root contains comprehensive coding standards for a monorepo with four packages: `api-service`, `web-frontend`, `data-pipeline`, and `shared-utils`. Engineers working on `data-pipeline` report that Claude applies React component conventions from the frontend package when generating Python data processing code. What is the most effective configuration fix?

A) Remove the React conventions from the root CLAUDE.md and let Claude Code infer appropriate conventions from existing code.
B) Create package-specific CLAUDE.md files in each package directory using `@import` to include only the conventions relevant to that package.
C) Add a section header "Data Pipeline Conventions" in the root CLAUDE.md and rely on Claude to apply the correct section based on the current working directory.
D) Create a single unified CLAUDE.md listing all conventions under package headers and instruct Claude to use the file path to determine which apply.

**Answer:** B

**Explanation:** Package-specific CLAUDE.md files with `@import` syntax allow each package to include only the standards relevant to its domain. The `data-pipeline/CLAUDE.md` imports Python data processing standards; the `web-frontend/CLAUDE.md` imports React conventions. This is the correct use of the CLAUDE.md hierarchy and `@import` for modular organization in a monorepo. Option A passively loses important conventions. Options C and D both rely on Claude to infer which section applies — the exact behavior producing the current cross-contamination bug.
---

## Question 44

A developer added their personal null safety preference to `~/.claude/CLAUDE.md` six months ago and assumed it would apply to all team projects. A new team member on the same project has never set up their personal `~/.claude/CLAUDE.md` and gets inconsistent null safety behavior. What is the correct diagnosis and fix?

A) The developer should re-add the null safety instruction to `~/.claude/CLAUDE.md` because it was likely lost in an update.
B) User-level configuration in `~/.claude/CLAUDE.md` only applies to that developer's machine; move the null safety requirement to the project-level CLAUDE.md so all developers receive it consistently.
C) Use the `/memory` command to verify which memory files are loaded and re-import the null safety configuration.
D) The inconsistency is caused by model updates; add explicit null safety instructions to every prompt.

**Answer:** B

**Explanation:** User-level configuration in `~/.claude/CLAUDE.md` applies only to that individual developer's machine and is not shared via version control. Any coding standard that should apply consistently across the team must live in the project-level CLAUDE.md. Option A misdiagnoses the cause. Option C describes a valid diagnostic step but not a complete fix — the core issue is configuration scope. Option D introduces a workaround for what is fundamentally a configuration scoping issue.
---

## Question 45

You need to diagnose why Claude Code is not applying your team's API error handling conventions when generating code in `src/api/`. Another engineer reports it works correctly on their machine. What is the most direct diagnostic approach?

A) Re-read all CLAUDE.md files in the project to check for typos or formatting errors.
B) Add the API error handling conventions directly to the system prompt of every Claude invocation as a workaround.
C) Use the `/memory` command to verify which memory files are currently loaded, and compare the loaded files between your machine and the other engineer's machine to identify the configuration discrepancy.
D) Delete all CLAUDE.md files and recreate them from scratch to rule out corruption.

**Answer:** C

**Explanation:** The `/memory` command displays which CLAUDE.md and configuration files are currently loaded, making it the direct diagnostic tool for inconsistent behavior across sessions or developers. Comparing the loaded file lists between machines immediately reveals whether the difference is a missing user-level file, a path resolution issue, or a missing `@import` reference. Option A is manual and time-consuming. Option B is a workaround that treats the symptom. Option D is destructive and unnecessary.
---

## Question 46

Your project CLAUDE.md has grown to 450 lines covering testing standards, API conventions, deployment procedures, database patterns, and security guidelines. Engineers report Claude Code is applying irrelevant sections and the context seems cluttered. What is the best refactoring approach?

A) Compress each section using shorter language to reduce the total CLAUDE.md length to under 100 lines.
B) Move deployment procedures to a separate file and `@import` it at the bottom of CLAUDE.md so it loads last.
C) Split the CLAUDE.md into topic-specific files in `.claude/rules/` with path-specific activation where applicable, keeping only universal standards in the root CLAUDE.md.
D) Create five separate CLAUDE.md files in different subdirectories, one for each topic area.

**Answer:** C

**Explanation:** Splitting a large monolithic CLAUDE.md into focused topic-specific files in `.claude/rules/` is the recommended refactoring approach. Rules files can use path-specific activation to load only when editing relevant file types (e.g., deployment rules only when editing CI/CD configuration). Universal standards remain in the root CLAUDE.md. Option A loses detail through condensing — brevity doesn't fix the irrelevant-loading problem. Option B moves one section but doesn't solve the structural problem for the other four. Option D creates directory-bound files which cannot handle conventions spanning multiple directories.
---

## Question 47

Your team wants to create a `/analyze-legacy` slash command that performs in-depth exploration of a legacy module, producing 3,000+ lines of discovery output. This command should be available to all team members, and its verbose output should not pollute the main conversation context. How should you configure this?

A) Create the command in `.claude/commands/` and instruct developers to clear their context window after running it.
B) Create the command in `.claude/commands/` without isolation settings; the 3,000+ lines of output will be compressed automatically.
C) Create the command in `~/.claude/commands/` with `context: fork` and share it with the team via a separate configuration repository.
D) Create the command as a skill in `.claude/skills/` with `context: fork` in the SKILL.md frontmatter, so it runs in an isolated sub-agent context that returns a summary without polluting the main session.

**Answer:** D

**Explanation:** Skills with `context: fork` in SKILL.md frontmatter run in an isolated sub-agent context, preventing verbose discovery output from polluting the main conversation. The skill completes, returns a summary to the main session, and the 3,000+ lines of exploration context are discarded. Placing it in `.claude/skills/` within the repository ensures version-controlled team availability. Option A uses commands without isolation, requiring manual context management. Option C uses user-scoped `~/.claude/commands/` — not shared via the repository. Option B is incorrect; output is not automatically compressed.
---

## Question 48

You are creating a `/generate-migration` skill that generates database migration scripts. The skill should prompt developers for the target schema and migration type when invoked without arguments. Which frontmatter configuration enables this behavior?

A) Add `required-args: true` to the frontmatter so the skill errors unless all arguments are provided.
B) Add `argument-hint: "Usage: /generate-migration <schema-name> <migration-type>"` to the SKILL.md frontmatter so developers are prompted for the required parameters when invoking without arguments.
C) Add `interactive: true` to the frontmatter to enable interactive parameter collection.
D) Handle missing arguments internally by reading them from a configuration file rather than prompting the developer.

**Answer:** B

**Explanation:** The `argument-hint` frontmatter field in SKILL.md is the mechanism for prompting developers with usage instructions when they invoke a skill without required arguments. Option A describes a `required-args` field that does not exist in the skill configuration schema. Option C describes an `interactive` frontmatter field that does not exist. Option D silently reads from a config file, requiring separate configuration file management and giving developers no guidance on expected parameters.
---

## Question 49

Your developer productivity agent's skill for generating boilerplate code (`/generate-boilerplate`) is currently in `~/.claude/skills/`. Team members report they cannot find or use this skill. What change is needed?

A) The skill needs to be added to the project's `.mcp.json` to make it accessible to all team members.
B) Publish the skill to a shared registry so team members can install it individually.
C) Move the skill to `.claude/skills/` in the project repository so it is version-controlled and available to all developers when they clone the repo.
D) The skill directory path is wrong; it should be in `.claude/commands/` instead of `.claude/skills/`.

**Answer:** C

**Explanation:** Skills in `~/.claude/skills/` are user-scoped personal skills visible only to the individual developer. For team-wide availability, skills must be placed in the project-scoped `.claude/skills/` directory within the repository, where they are version-controlled and automatically available when the repo is cloned. Option A is incorrect; `.mcp.json` is for configuring MCP servers, not skills. Option B describes a non-existent registry mechanism. Option D is incorrect; skills go in `.claude/skills/` — both locations are valid for different constructs.
---

## Question 50

Your monorepo has TypeScript test files matching `**/*.test.ts` spread across 12 packages. You want Claude to automatically apply testing conventions (Jest matchers, mock patterns, fixture organization) whenever it edits any test file, regardless of which package. What is the most maintainable configuration?

A) Create a CLAUDE.md in each of the 12 package directories containing the testing conventions.
B) Add the testing conventions to the root CLAUDE.md so they are always loaded regardless of file type.
C) Create a skill `/apply-test-conventions` that engineers invoke before editing test files.
D) Create a `.claude/rules/testing-conventions.md` file with YAML frontmatter `paths: ["**/*.test.ts"]` containing the testing conventions so they load conditionally when editing any test file.

**Answer:** D

**Explanation:** Path-specific rules in `.claude/rules/` with YAML frontmatter glob patterns apply conventions to files by type regardless of directory location. `paths: ["**/*.test.ts"]` matches all TypeScript test files across all 12 packages with a single rule file. Option A requires creating and maintaining identical CLAUDE.md files in all 12 packages, creating maintenance duplication. Option B always loads the conventions even when editing non-test files, adding unnecessary context. Option C requires manual invocation rather than automatic application.
---

## Question 51

You have Terraform files in `terraform/environments/`, `terraform/modules/`, and `terraform/shared/`. You want Terraform best practices (resource naming, state management, module structure) to load only when editing those files, not when editing application code. How should you configure this?

A) Create a `.claude/rules/terraform-conventions.md` with frontmatter `paths: ["terraform/**/*"]` so the Terraform rules load only when editing files matching that path pattern.
B) Create a `terraform/CLAUDE.md` for the conventions; subdirectory CLAUDE.md files load automatically for all files in that directory.
C) Add the Terraform conventions to the root CLAUDE.md with a header "Terraform Section" and rely on Claude to apply them only when working in the Terraform directory.
D) Create three separate CLAUDE.md files in each of the three Terraform subdirectories.

**Answer:** A

**Explanation:** A `.claude/rules/` file with `paths: ["terraform/**/*"]` activates conditionally only when editing files under the `terraform/` directory, keeping rules out of context when working on application code. Option B using `terraform/CLAUDE.md` is a valid approach but only applies to the root `terraform/` directory — subdirectories need their own CLAUDE.md files. Option C relies on Claude to infer which conventions to apply — the same cross-contamination problem described in Q43. Option D requires maintaining three files.
---

## Question 52

An engineering team is planning to migrate their API layer from REST to GraphQL, modifying 67 controller files, creating 23 new schema files, updating 45 test files, and modifying the CI/CD pipeline. Which mode should Claude Code use?

A) Direct execution mode, starting with the most frequently used endpoint and migrating controllers incrementally.
B) Direct execution mode with a comprehensive upfront instruction listing all 135 files to be modified.
C) Plan mode, to explore the codebase, understand dependencies, evaluate migration approaches, and design an implementation plan before making any modifications.
D) Direct execution mode for controller modifications; plan mode only for the schema design phase.

**Answer:** C

**Explanation:** Plan mode is explicitly designed for complex tasks involving large-scale changes (135+ files), multiple valid approaches (schema-first vs. code-first GraphQL, coexistence period vs. hard cutover), and architectural decisions. Exploring the codebase in plan mode before committing to changes prevents costly rework when interdependencies are discovered. Option A starts modifying files before understanding the full scope — high risk for a 135-file change. Option B uses direct execution with a pre-specified file list that may be incorrect before exploration. Option D applies plan mode to only one phase when the entire migration involves architectural decisions.
---

## Question 53

A developer needs to fix a bug where a user-facing API endpoint returns a 500 error instead of a 400 when an invalid date format is passed. The stack trace points to line 47 of `src/api/user-controller.js`. No other files are affected. Which mode should the developer use?

A) Plan mode, to analyze the full user management module for related date handling issues before fixing this one.
B) Plan mode, because any change to a controller file could have API contract implications that need to be evaluated.
C) Direct execution mode, because this is a well-scoped, single-file change with a clear root cause and no architectural implications.
D) Plan mode, to verify there are no other date parsing locations in the codebase that need the same fix.

**Answer:** C

**Explanation:** Direct execution is appropriate for well-understood changes with clear scope: a single-file fix at a specific line with a known root cause. Plan mode is overhead for this scenario — the stack trace already provides everything needed. Option A adds unnecessary scope (the bug report doesn't suggest related issues). Option B is over-cautious; a date validation change is a well-contained change with obvious, bounded scope. Option D describes a separate concern that is a distinct task from fixing the reported bug.
---

## Question 54

During a task to document a 180-file payment processing system, the agent exhausted the context window after exploring 60 files, losing all gathered information. How should you restructure this to prevent context exhaustion?

A) Increase the system prompt's compression instructions to keep responses shorter.
B) Split the task into 3 batches of 60 files each and run them as separate sessions.
C) Reduce the exploration depth by only reading file headers and class declarations instead of full implementations.
D) Use an Explore subagent for the verbose discovery phase — it performs file exploration and returns a structured summary to the main session, preventing context window exhaustion in the main conversation.

**Answer:** D

**Explanation:** The Explore subagent is specifically designed for isolating verbose discovery output. It runs exploration in isolation and returns a focused summary (key findings, architecture overview, critical dependencies) to the main session, rather than filling the main context with raw tool results from 180 files. Option A compresses responses but doesn't address the fundamental issue that exploring 180 files generates too much raw context. Option B creates three disconnected sessions without an integrated view. Option C loses critical implementation details needed for accurate documentation.
---

## Question 55

A developer asks Claude to implement a caching layer for a database query service, describing it only as "add caching to make it faster." After the first implementation, the developer rejects it because it didn't consider cache invalidation on write operations, TTL configuration, or distributed cache consistency. Before the second implementation attempt, how should the developer best use Claude Code to surface these considerations?

A) Provide a more detailed written specification of all caching requirements and ask Claude to re-implement.
B) Show Claude examples of other caching implementations in the codebase as reference patterns.
C) Use the interview pattern — ask Claude to interview you about the caching requirements before implementing, so it surfaces considerations like cache invalidation, TTL, and distributed consistency that you may not have anticipated.
D) Ask Claude to list its assumptions before implementing, then manually review and correct the list.

**Answer:** C

**Explanation:** The interview pattern involves having Claude ask targeted questions before implementation, surfacing considerations the developer may not have anticipated — exactly what happened here. This is more effective than the developer trying to enumerate all requirements upfront (Option A), which led to the initial underspecified request. Option B references existing patterns but may not have caching implementations addressing the specific requirements. Option D (listing assumptions) is similar but less dynamic — Claude interviewing you is more likely to uncover domain-specific considerations you didn't know to think about.
---

## Question 56

You are iterating on a data transformation function that should convert snake_case database field names to camelCase for API responses. After two iterations, Claude Code handles `user_name` → `userName` but fails on edge cases: `_leading_underscore` should become `leadingUnderscore` and `double__underscore` should become `doubleUnderscore`. What is the most effective next step?

A) Write a longer prose description of the transformation rules with special emphasis on the edge cases.
B) Ask Claude to add more conditional branches to the existing implementation until it handles the edge cases.
C) Provide 2–3 concrete input/output examples covering the specific failing edge cases, paired with a brief explanation of the rule.
D) Rewrite the entire function specification from scratch to ensure the edge cases are clearly covered.

**Answer:** C

**Explanation:** Concrete input/output examples are the most effective way to communicate expected transformation behavior when prose descriptions produce inconsistent results. After two failed iterations with description, examples make the expected behavior unambiguous: `_leading_underscore` → `leadingUnderscore` immediately shows what "leading underscore handling" means without relying on interpretation of prose rules. Option A continues using prose, which has already failed twice. Option B asks Claude to add branches without understanding the correct behavior, likely producing more incorrect code. Option D is excessive — the concept is understood; only the specific edge case behavior needs clarification.
---

## Question 57

Your team wants to implement a feature for generating integration tests for a legacy API client library. Before starting, you want to ensure generated tests don't duplicate coverage already in `tests/integration/`. What technique should you use?

A) Generate tests and then manually review them against existing tests.
B) Delete all existing integration tests and have Claude regenerate them from scratch for consistency.
C) Provide the existing test files in context when prompting for new test generation, instructing Claude to review the existing coverage before generating new tests to avoid duplication.
D) Generate tests in a separate directory and use a diff tool to find duplicates.

**Answer:** C

**Explanation:** Providing existing test files in context and explicitly instructing Claude to avoid duplicating existing scenarios is the documented technique for preventing test duplication. The model can see what is already covered and generate complementary tests. Option A is manual review after the fact — effort is wasted generating tests that will be discarded. Option B is destructive and loses intentional test design decisions. Option D is a post-processing workaround that duplicates effort.
---

## Question 58

Your CI/CD pipeline runs `claude "Review this PR for security issues and output findings as JSON with severity and description fields"` but the pipeline fails because Claude Code waits for interactive input. After fixing the interaction issue, you also need the output to be machine-parseable for automated posting as GitHub PR comments. What is the correct two-part fix?

A) Set `CLAUDE_BATCH=true` environment variable, and pipe the output through `jq` to parse it.
B) Add the `-p` flag to run in non-interactive mode, and use `--output-format json` with `--json-schema` to enforce structured JSON output that can be parsed programmatically.
C) Add `--headless` flag for non-interactive mode, and wrap the prompt in a JSON template to get structured output.
D) Use `--no-input` to suppress interactive prompts, and add `--format json` to get JSON output.

**Answer:** B

**Explanation:** The `-p` (or `--print`) flag is the documented way to run Claude Code in non-interactive mode in CI/CD pipelines. Combined with `--output-format json` and `--json-schema` (which provides the schema definition for the desired output structure), this produces machine-parseable structured findings. Options A, C, and D reference non-existent flags or environment variables (`CLAUDE_BATCH`, `--headless`, `--no-input`, `--format`).
---

## Question 59

Your CI/CD pipeline runs a Claude Code security review on every PR commit. After 3 commits on a PR, the pipeline has posted the same 4 findings as PR comments on each commit, resulting in 12 duplicate comments. Developers are ignoring the review because of the noise. How should you fix the duplicate comment problem?

A) Configure the pipeline to delete all previous review comments before posting new ones.
B) Run the review only on the final commit before merge rather than on every commit.
C) Include the prior review findings in context when re-running the review after new commits, and instruct Claude to report only issues that are new or still unaddressed since the last review.
D) Use Claude to diff the new findings against prior findings programmatically and filter duplicates before posting.

**Answer:** C

**Explanation:** The documented pattern for avoiding duplicate CI review comments is to include prior review findings in context and instruct Claude to report only new or still-unaddressed issues. This way, if the original 4 findings were posted after commit 1, commits 2 and 3 only generate comments for new issues or original issues not yet fixed. Option A deletes and recreates comments, losing threading history and notification context. Option B reduces review frequency, creating a gap where intermediate commits receive no feedback. Option D is a valid approach but more complex than the direct technique of providing context.
---

## Question 60

Your team's CLAUDE.md documents that unit tests should use `pytest` with specific fixture patterns, mock conventions, and a naming convention (`test_<function_name>_<scenario>`). However, CI-generated tests frequently use `unittest`, different mock patterns, and generic names like `test_1`, `test_2`. The CI pipeline invokes: `claude -p "Generate tests for the modified files"`. What is the most likely cause and fix?

A) The `-p` flag disables CLAUDE.md loading in CI contexts; use `--with-memory` to re-enable it.
B) The CLAUDE.md is loaded but the prompt doesn't reference it; add "follow CLAUDE.md testing standards" to the prompt.
C) The CLAUDE.md is a project-level file that only loads in interactive sessions; create a separate CI-specific configuration file.
D) The CLAUDE.md testing standards documentation lacks concrete examples of fixture patterns and naming conventions, and the existing test files are not provided in context; Claude is generating tests without seeing the established patterns.

**Answer:** D

**Explanation:** CLAUDE.md is the mechanism for providing project context to CI-invoked Claude Code. The issue is that (1) the CLAUDE.md testing standards documentation may lack concrete examples, and (2) existing test files are not provided in context so Claude cannot see established patterns in practice. The fix is to document testing standards with concrete examples in CLAUDE.md and provide existing test files in context. Option A is incorrect; `-p` does not disable CLAUDE.md loading. Option B is unnecessary if CLAUDE.md is properly written. Option C is incorrect; CLAUDE.md loads in both interactive and CI contexts.
---
