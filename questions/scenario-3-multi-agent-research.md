# Multi-Agent Research System

**Total Questions:** 60
**Domain Distribution:** Domain 1 (27), Domain 2 (18), Domain 5 (15)

---

## Question 1

You are implementing the agentic loop for the web search subagent. After sending a request to Claude, you receive a response with `stop_reason: "tool_use"`. Your current loop logic logs the result and exits. Users report the subagent consistently stops mid-research without completing its assigned search tasks. What is the correct control flow fix?

A) Check whether the assistant's text content contains phrases like "search complete" or "done" to decide when to terminate the loop.
B) Set a maximum iteration cap of 10 turns as the primary termination mechanism, exiting early if Claude is taking too long.
C) Treat every `stop_reason` value other than `"end_turn"` as an error condition and reinitiate a fresh request from the start.
D) Continue the loop when `stop_reason` is `"tool_use"`, executing the requested tools, appending results to conversation history, and iterating; terminate only when `stop_reason` is `"end_turn"`.

**Answer:** D

**Explanation:** The agentic loop lifecycle requires continuing iteration whenever `stop_reason` is `"tool_use"`: execute the tool, append the result to conversation history so Claude can reason about the next action, and send the updated history back. The loop terminates only when Claude signals completion via `"end_turn"`. Option A is an anti-pattern—parsing natural language for loop termination is unreliable because Claude may use similar phrases mid-task. Option B uses an arbitrary iteration cap as the primary stopping mechanism, which truncates legitimate multi-step searches. Option C discards all accumulated context on each restart, preventing the agent from building on prior search results.
---

## Question 2

Your document analysis subagent's loop is working correctly for simple documents. However, when analyzing a 200-page technical report requiring multiple tool calls (extract sections, run OCR on figures, cross-reference citations), the subagent's later tool calls seem to ignore conclusions from earlier steps. Logs confirm all tool results are returned with status 200. What is the most likely root cause?

A) The subagent's system prompt does not explicitly instruct Claude to build on prior tool results, so it treats each step independently.
B) Tool results from earlier iterations are not being appended to the conversation history before subsequent requests are sent, so Claude cannot reason about them.
C) The subagent is being spawned with a new `AgentDefinition` on each tool call, resetting its context.
D) The document analysis tool returns results too quickly for the agentic loop to process them in order.

**Answer:** B

**Explanation:** For model-driven decision-making to work across multiple iterations, each tool result must be appended to the conversation history before the next API request is made. Without this, Claude has no awareness of what prior tool calls returned and cannot incorporate new information into its reasoning. Option A misunderstands how the loop works—Claude's reasoning ability depends on context, not explicit prompt instructions to "remember." Option C is a valid concern but contradicts the logs showing the loop is "working correctly for simple documents," implying the `AgentDefinition` is stable. Option D describes a timing issue that does not exist—tool execution and history appending are sequential operations.
---

## Question 3

The coordinator agent is responsible for deciding whether to invoke just the web search subagent, just the document analysis subagent, or both, depending on query complexity. However, production logs show it always routes every query through all four subagents (web search → document analysis → synthesis → report generation), even for narrow factual lookups like "What year was the Kyoto Protocol signed?" This adds 8–12 seconds of unnecessary latency. What design principle is being violated?

A) The coordinator should use a fixed sequential pipeline to ensure consistent output quality regardless of query complexity.
B) Simple factual lookups should be handled by a dedicated fast-path subagent separate from the main research pipeline.
C) The coordinator should dynamically analyze query requirements and selectively invoke only the subagents relevant to each query.
D) The coordinator's system prompt is too long, causing it to miss the routing logic defined at the end of the prompt.

**Answer:** C

**Explanation:** A well-designed coordinator analyzes each query's requirements and dynamically selects which subagents to invoke rather than always routing through the full pipeline. A factual lookup like "What year was the Kyoto Protocol signed?" needs only a web search with no deep document analysis, synthesis of conflicting findings, or multi-page report generation. Option A describes a fixed sequential pipeline, which is appropriate for predictable multi-step tasks but wastes resources on simple queries. Option B adds architectural complexity (a fourth pipeline) to solve a problem that proper coordinator logic should handle. Option D points to prompt length as the cause, but the issue is a design flaw in routing logic, not a position-of-information problem.
---

## Question 4

You notice the synthesis subagent produces reports that seamlessly blend findings from multiple sources but consistently omits key statistics and citations from documents that were analyzed second in the pipeline—after the web search results. The document analysis subagent is completing successfully and its output contains all expected data. What is the most likely cause?

A) The coordinator is only passing web search results to the synthesis subagent's prompt and not including the document analysis outputs.
B) The synthesis subagent's context window is too small to hold both web search results and document analysis outputs simultaneously.
C) The synthesis subagent's system prompt deprioritizes document-derived findings compared to web search findings.
D) The document analysis subagent is returning findings in a format incompatible with the synthesis subagent's input parser.

**Answer:** A

**Explanation:** Subagents do not inherit the coordinator's conversation history automatically—context must be explicitly provided in the subagent's prompt. If the coordinator invokes the synthesis subagent but only includes web search results in the prompt, the synthesis agent has no awareness of document analysis outputs, regardless of how complete those outputs were. Option B may be a contributing factor in extreme cases but is not the most likely root cause when the coordinator controls what context each agent receives. Option C is speculative and would cause partial use of document findings rather than complete omission. Option D describes a parsing issue, which would typically produce errors or garbled output rather than silent omission.
---

## Question 5

Your coordinator agent's `allowedTools` is configured as: `["web_search", "analyze_document", "synthesize_findings", "generate_report"]`. You have implemented subagent spawning using the `Task` tool, but when the coordinator attempts to spawn any subagent, it returns an error: `"Tool 'Task' not permitted."` What is the fix?

A) Add `"Task"` to the coordinator's `allowedTools` list.
B) Add the `Task` tool invocation to the coordinator's system prompt as an allowed action.
C) Move the subagent definitions from `AgentDefinition` configuration into the coordinator's context window.
D) Remove all domain-specific tools from the coordinator's `allowedTools` since coordinators should only use orchestration tools.

**Answer:** A

**Explanation:** The `Task` tool is the mechanism for spawning subagents, and it must be explicitly included in the coordinator's `allowedTools` for the coordinator to invoke subagents. Without `"Task"` in `allowedTools`, any attempt to spawn a subagent will be rejected. Option B incorrectly assumes that mentioning the `Task` tool in a system prompt grants permission to use it—tool permissions are enforced at the configuration level, not through prompts. Option C misunderstands `AgentDefinition`—moving definitions into context does not grant the coordinator the ability to invoke them. Option D would leave the coordinator unable to perform any domain work, which is not appropriate for a coordinator that may also perform direct analysis.
---

## Question 6

When the synthesis subagent is invoked, it needs to combine findings from two prior steps: web search results (containing URLs, article titles, and key statistics) and document analysis outputs (containing page references, extracted quotes, and methodology notes). The coordinator invokes synthesis but only passes a narrative summary: "The web search found several relevant articles about renewable energy costs, and the document analysis extracted data from three reports." The synthesis agent produces vague, unsupported claims. What should the coordinator change?

A) Instruct the synthesis agent to ask follow-up questions to the coordinator when it needs more detail.
B) Have the synthesis agent re-invoke the web search and document analysis tools independently to gather its own raw data.
C) Include the complete structured outputs from both the web search and document analysis subagents directly in the synthesis subagent's prompt, preserving source metadata.
D) Increase the synthesis subagent's token budget so it can request and receive more detail from the coordinator.

**Answer:** C

**Explanation:** Subagent context must be explicitly provided in the prompt—subagents do not automatically inherit or query prior results. The coordinator must include complete findings (including source URLs, document names, page numbers, statistics, and quotes) directly in the synthesis subagent's prompt. Passing only a narrative summary strips the structured data needed for accurate attribution and specific claims. Option A creates an unsupported back-channel communication pattern—synthesis subagents communicate through the coordinator, not by asking follow-up questions. Option B has the synthesis agent duplicate work already completed, wasting compute and potentially getting different results. Option D misidentifies the problem as a token budget issue; the coordinator has the data and is simply not passing it.
---

## Question 7

Your research system explores two possible synthesis strategies for a complex policy topic: (A) combine all sources into a single unified narrative, or (B) maintain separate sections by source type (academic, government, news). You want to compare the quality of both approaches from the same document analysis baseline without re-running the expensive analysis step. Which session management feature is most appropriate?

A) Use `--resume <session-name>` to continue the coordinator session and run both strategies sequentially.
B) Save the document analysis output to a file and start two separate fresh sessions, each loading the saved output.
C) Run both strategies in the same session by appending the second strategy's instructions to the coordinator's conversation history after the first completes.
D) Use `fork_session` to create two independent branches from the shared document analysis baseline, then explore each synthesis strategy in its respective branch.

**Answer:** D

**Explanation:** `fork_session` is designed exactly for this scenario: creating independent branches from a shared analysis baseline to explore divergent approaches. Both branches start from identical document analysis context, allowing a direct quality comparison without re-running the expensive step. Option A uses `--resume` to continue sequentially, but this means the second strategy runs after seeing the first strategy's output, contaminating the comparison. Option B achieves the same result as `fork_session` but requires significantly more manual work (saving, reloading, context reconstruction) for no benefit. Option C runs the strategies in the same context window, meaning the second strategy is influenced by the first strategy's outputs and the comparison is not clean.
---

## Question 8

After modifying the document analysis subagent to use a new citation extraction algorithm, you resume the coordinator session (named `research-climate-policy`) using `--resume research-climate-policy`. The resumed session reuses prior document analysis results without re-running analysis, so the final report still reflects the old algorithm's citation format. What should you do when resuming after this type of change?

A) Resume the session and explicitly inform the agent about the changed files and the nature of the change, requesting targeted re-analysis of the affected documents.
B) Start a completely fresh session with a new session name and re-run the entire workflow from scratch.
C) Resume the session and delete the prior document analysis results from the conversation history to force re-analysis.
D) Resume the session with an increased token budget to allow the agent to reload all prior tool results.

**Answer:** A

**Explanation:** When resuming a session after code modifications, the agent must be informed about the specific changes so it can perform targeted re-analysis rather than reusing stale tool results. This approach combines the efficiency of session resumption (preserving prior valid context) with accuracy (refreshing only the affected components). Option B discards all valid prior context (web search results, coordinator reasoning) unnecessarily—the change only affects document analysis. Option C manually deleting history is risky and may corrupt the conversation structure in ways that cause errors. Option D misidentifies the problem as a token budget issue; the agent has sufficient context but is simply using cached results.
---

## Question 9

Your multi-agent research system runs a fixed pipeline: web search always runs first, then document analysis, then synthesis, then report generation—regardless of the input query. A user submits the query "Summarize this uploaded PDF on climate data." The system spends 45 seconds running web search (finding irrelevant articles) before reaching document analysis. What decomposition pattern would better serve queries that vary significantly in nature?

A) Add a preprocessing classifier that assigns queries to one of three pre-defined pipeline variants (web-only, document-only, mixed).
B) Implement prompt chaining that always routes through all four stages but skips empty outputs.
C) Create a separate fixed pipeline for document-only queries that skips the web search stage.
D) Use dynamic adaptive decomposition where the coordinator analyzes each query first and generates an execution plan appropriate to the query's requirements.

**Answer:** D

**Explanation:** Dynamic adaptive decomposition enables the coordinator to analyze each query and create an appropriate execution plan, selecting only the subagents relevant to the request. A PDF summarization query needs only document analysis and report generation—no web search. Option B still runs all stages, wasting resources on irrelevant steps. Option C creates a second fixed pipeline, which scales poorly as more query types emerge (requiring a new pipeline variant for each type). Option A is similar to C but adds a classifier layer—this is over-engineered when the coordinator itself can perform this routing based on the query.
---

## Question 10

During a 3-hour research session on "global semiconductor supply chains," your system has completed web search and document analysis. The coordinator is about to invoke the synthesis subagent when it encounters an out-of-memory error caused by excessive tool result accumulation. You need to recover and continue without losing the research already completed. What is the best recovery approach?

A) Restart the entire session from scratch with a higher memory allocation.
B) Start a fresh synthesis session and manually re-enter a summary of what was researched.
C) Use `--resume` to reload the session, then use `/compact` to reduce context usage before invoking the synthesis subagent.
D) Invoke the synthesis subagent directly with a compressed version of the research findings injected into its initial prompt, bypassing the coordinator's inflated context.

**Answer:** C

**Explanation:** Session resumption with `/compact` is the designed recovery path for sessions where context has filled with verbose discovery output. `--resume` reloads the named session, and `/compact` reduces context usage by summarizing accumulated tool results, making room to continue the workflow. Option A discards all completed research unnecessarily. Option B uses a "fresh session with injected summary" approach—valid in principle, but the question specifies that `--resume` is available and the prior tool results are stale only due to memory pressure, not invalidation. Option D bypasses the coordinator, losing its orchestration logic and error handling for the synthesis step.
---

## Question 11

The coordinator agent is given this system prompt: "You are a research coordinator. Step 1: Call the web search subagent. Step 2: Call the document analysis subagent. Step 3: Call synthesis. Step 4: Generate report." On a query about "recent earnings calls from major semiconductor companies," the coordinator rigidly follows the four-step sequence even when web search results are comprehensive and document analysis finds no additional documents. How should the coordinator's prompt be improved?

A) Add explicit conditional logic to the prompt: "If step 2 returns no results, skip to step 3."
B) Remove the coordinator's system prompt entirely and rely on the coordinator's default reasoning to determine the pipeline.
C) Convert the coordinator prompt to a decision tree with branches for each possible subagent output combination.
D) Replace the step-by-step procedural instructions with a prompt specifying research goals and quality criteria, enabling the coordinator to adaptively decide which subagents to invoke.

**Answer:** D

**Explanation:** Coordinator prompts should specify research goals and quality criteria rather than step-by-step procedural instructions, enabling subagent adaptability. When the coordinator is told what constitutes good research output (comprehensive coverage, cited sources, verified claims) rather than which steps to execute, it can reason about whether each subagent adds value for the specific query. Option A patches one specific case (empty document analysis) but doesn't address the fundamental rigidity—new edge cases will keep emerging. Option B removing the system prompt entirely is worse, leaving the coordinator with no guidance. Option C creates a combinatorial decision tree that is brittle and hard to maintain as new subagents are added.
---

## Question 12

You are running three parallel research tracks on subtopics of "AI in healthcare": (1) diagnostic imaging, (2) drug discovery, (3) administrative automation. To maximize throughput, you want all three web search subagents to run simultaneously rather than sequentially. How do you implement parallel subagent spawning?

A) Configure the coordinator with `parallelism: 3` in its `AgentDefinition` to allow concurrent subagent spawning.
B) Invoke the `Task` tool three times in separate coordinator turns, each spawning one web search subagent.
C) Use three separate coordinator agents, each responsible for one subtopic, and aggregate their outputs in a parent coordinator.
D) Emit all three `Task` tool calls in a single coordinator response, which the SDK interprets as parallel execution requests.

**Answer:** D

**Explanation:** Parallel subagent spawning is achieved by emitting multiple `Task` tool calls in a single coordinator response. The SDK processes these as concurrent execution requests, running all three web search subagents simultaneously. Option B spawns subagents sequentially (one per turn), which serializes the work and eliminates the throughput benefit. Option A references a `parallelism` configuration that does not exist in the `AgentDefinition` spec. Option C creates unnecessary architectural complexity—three coordinators and a parent coordinator—when the existing coordinator can spawn parallel subagents natively.
---

## Question 13

Your research pipeline has an explicit ordering requirement: the synthesis subagent must never run before both the web search subagent and the document analysis subagent have completed and returned results. In testing, you find the synthesis agent occasionally starts with incomplete inputs when one subagent returns faster than expected. Which enforcement approach provides the strongest guarantee?

A) Add "Do not begin synthesis until web search AND document analysis are complete" to the synthesis subagent's system prompt.
B) Add few-shot examples showing the coordinator always waiting for both subagents before invoking synthesis.
C) Implement a programmatic prerequisite gate in the coordinator that blocks the `Task` tool call for synthesis until both prior subagents have returned confirmed results.
D) Set `tool_choice: "any"` on the synthesis subagent to ensure it always requests additional inputs before proceeding.

**Answer:** C

**Explanation:** When deterministic workflow ordering is required, programmatic enforcement is the correct approach. A prerequisite gate in the coordinator that checks for confirmed results from both prior subagents before allowing the synthesis `Task` call provides a guarantee—it cannot be circumvented by model behavior. Option A relies on probabilistic LLM compliance with a prompt instruction, which has a non-zero failure rate. Option B similarly relies on few-shot examples influencing behavior without enforcing it. Option D misuses `tool_choice`—setting it to `"any"` on the synthesis agent would make it call a tool when it might not need to, which is unrelated to the ordering problem.
---

## Question 14

The report generation subagent is the final stage in your pipeline. It must always call `format_report` before calling `export_to_pdf`, because `export_to_pdf` requires a formatted report object as input. Production logs show that in 3% of cases, `export_to_pdf` is called with raw markdown text directly, causing PDF export failures. What is the most reliable fix?

A) Add an instruction to the report generation subagent's prompt: "Always call `format_report` before `export_to_pdf`."
B) Configure the report generation subagent with `tool_choice: {"type": "tool", "name": "format_report"}` to force `format_report` as the first call.
C) Add `format_report` output validation to the `export_to_pdf` tool's input schema to reject raw markdown.
D) Implement a `PreToolUse` hook that intercepts `export_to_pdf` calls and checks whether `format_report` has already been called in the current session, blocking the call if the prerequisite is not met.

**Answer:** D

**Explanation:** A `PreToolUse` hook provides deterministic enforcement by intercepting `export_to_pdf` calls and verifying the prerequisite has been met before allowing execution. This eliminates the 3% failure rate caused by probabilistic LLM compliance. Option A is a prompt instruction with a non-zero failure rate—already demonstrated by the 3% failure rate in production. Option B forces `format_report` as the first call, which is helpful but does not prevent `export_to_pdf` from being called before `format_report` in subsequent turns. Option C adds validation to the wrong tool—it would generate better error messages but still allow the failure to occur rather than preventing it.
---

## Question 15

After research is collected, the coordinator passes all findings to the synthesis subagent. You observe that source attributions (URLs, document names, page numbers) collected by the web search and document analysis subagents are frequently lost in the synthesis output, even though they were present in the inputs. The synthesis subagent's output contains claims without citations. What is the most effective structural fix?

A) Have the coordinator re-append source metadata to the synthesis output after the subagent completes, using a post-processing step.
B) Instruct the synthesis subagent in its system prompt: "Always include citations for every claim you make."
C) Have the document analysis subagent embed citations directly into the text of its findings so they cannot be separated during synthesis.
D) Pass findings to the synthesis subagent using structured data formats that explicitly separate content from metadata (source URLs, document names, page numbers), and require the synthesis subagent to preserve these mappings in its output.

**Answer:** D

**Explanation:** Using structured data formats that separate content from metadata when passing context between agents is the key technique for preserving attribution. When source metadata is structured alongside each claim (rather than embedded in prose), the synthesis subagent can maintain claim-source mappings through the synthesis process. Option B relies on a prompt instruction that the synthesis agent is already apparently ignoring—the problem is structural, not instructional. Option A adds a post-processing step that can only re-add metadata the coordinator already has, not attribute specific synthesized claims to their original sources. Option C embeds citations in prose, making them harder to maintain consistently across synthesis—structured separation is more reliable.
---

## Question 16

Your research system is tasked with analyzing a company's competitive position. The coordinator needs to research: (1) the company's financial performance, (2) competitor product releases, and (3) market size data. You estimate each research track takes 30 seconds when run sequentially. A colleague suggests always running them sequentially to avoid "race conditions." What is the correct approach?

A) Spawn all three research tracks as parallel subagents in a single coordinator response to reduce total latency from ~90 seconds to ~30 seconds.
B) Run all three tracks sequentially to avoid any risk of one subagent's output affecting another's results.
C) Run financial performance and competitor research in parallel, then run market size research after those complete, since market size may depend on the others.
D) Use a single web search subagent with three sequential search queries to avoid the overhead of spawning multiple subagents.

**Answer:** A

**Explanation:** When research tracks are independent of each other (financial performance, competitor products, and market size data can all be gathered without knowledge of the others), spawning them as parallel subagents reduces total latency from the sum of sequential times (~90 seconds) to the maximum of parallel times (~30 seconds). There are no "race conditions" in this context—each subagent writes to its own isolated output that the coordinator aggregates afterward. Option B incurs 3x the latency for no benefit. Option C introduces artificial sequencing that doesn't reflect actual data dependencies. Option D serializes the work through a single agent, which prevents parallelism and may confuse the agent's context across three different research domains.
---

## Question 17

The coordinator agent has completed research on "renewable energy investment trends" and now needs to invoke synthesis. The coordinator's invocation looks like this: `Task(agent="synthesis", prompt="Please synthesize the research.")` The synthesis subagent returns a generic placeholder: "Unable to synthesize without research inputs." What is missing from the coordinator's `Task` invocation?

A) The synthesis subagent's `AgentDefinition` is not registered, so it cannot be spawned.
B) The synthesis prompt must explicitly state the output format (e.g., "Return synthesis as JSON") for the subagent to understand what to produce.
C) The coordinator must call synthesis using `allowedTools: ["synthesize_findings"]` rather than the `Task` mechanism.
D) The prompt is missing the actual research findings—the coordinator must include complete outputs from the web search and document analysis subagents in the synthesis prompt.

**Answer:** D

**Explanation:** Subagents do not inherit the coordinator's conversation history or any prior subagent outputs automatically. The prompt passed to the synthesis subagent via `Task` must include the complete research findings (web search results, document analysis outputs, source metadata) for the subagent to work with. The placeholder response confirms it received an empty prompt with no inputs. Option A is contradicted by the fact that the synthesis subagent responded (if it weren't registered, the `Task` call would fail). Option C misunderstands the architecture—`Task` is the correct spawning mechanism; `allowedTools` restricts what the subagent can do, not how it's spawned. Option B addresses output format, which is secondary to having any input to synthesize.
---

## Question 18

A senior engineer proposes having each subagent communicate directly with other subagents to reduce coordinator bottlenecks. For example, the document analysis subagent would send its output directly to the synthesis subagent rather than routing through the coordinator. What is the primary risk of this architecture?

A) Bypassing the coordinator eliminates centralized observability, consistent error handling, and controlled information flow, making the system harder to debug and monitor.
B) Direct communication would make it impossible to run subagents in parallel, since each would need to wait for messages from sibling subagents.
C) Direct subagent communication would require all subagents to have the `Task` tool, increasing their tool sets and degrading tool selection reliability.
D) Direct communication between subagents would violate the `allowedTools` configuration, causing permission errors.

**Answer:** A

**Explanation:** Routing all subagent communication through the coordinator is a key architectural principle specifically because it provides observability (the coordinator can log all information flow), consistent error handling (failures are managed centrally), and controlled information flow (the coordinator decides what each subagent sees). Direct subagent-to-subagent communication creates distributed state that is difficult to trace and debug. Option C is a real concern but secondary—the primary issue is loss of observability and error handling. Option B is incorrect; parallelism is not incompatible with structured communication patterns. Option D is a practical concern but not the primary architectural risk.
---

## Question 19

Your system completes a first synthesis pass on "global trade policy changes." The coordinator reviews the synthesis output and identifies that the Southeast Asia region is covered only superficially despite being a significant focus of the original query. What should the coordinator do next?

A) Invoke the report generation subagent immediately, noting the coverage gap in the report's limitations section.
B) Ask the end user to clarify whether Southeast Asia coverage is required before proceeding.
C) Re-invoke the synthesis subagent with a broader prompt instructing it to expand coverage of all regions equally.
D) Re-delegate to the web search and document analysis subagents with targeted queries specifically about Southeast Asia trade policy, then re-invoke synthesis with the augmented findings.

**Answer:** D

**Explanation:** Iterative refinement loops are a core coordinator skill: when synthesis output has gaps, the coordinator evaluates the gap, re-delegates to search and analysis subagents with targeted queries, and re-invokes synthesis with the augmented findings until coverage is sufficient. This is more effective than asking the synthesis agent to "expand" with no new data. Option A accepts a known quality gap rather than addressing it. Option C re-invokes synthesis with the same data—asking it to "expand coverage" without providing new sources produces hallucination risk, not real coverage. Option B escalates to the user unnecessarily when the coordinator can resolve the gap autonomously through its normal workflow.
---

## Question 20

You are building a hook to normalize data formats received from different sources. The web search subagent returns article publication dates as Unix timestamps (e.g., `1699920000`), while the document analysis subagent returns dates in ISO 8601 format (e.g., `"2023-11-14"`). Both formats are passed to the synthesis subagent, which sometimes misinterprets Unix timestamps as document page numbers. Which hook pattern should you implement?

A) A `PreToolUse` hook that intercepts synthesis invocations and converts timestamps before the subagent is called.
B) A prompt instruction to the synthesis subagent explaining the difference between Unix timestamps and page numbers.
C) A validation layer in the coordinator that rejects tool results containing Unix timestamps and re-requests ISO 8601 format from the source subagents.
D) A `PostToolUse` hook that intercepts tool results and normalizes all date formats to ISO 8601 before the model processes them.

**Answer:** D

**Explanation:** A `PostToolUse` hook intercepts tool results and transforms them before the model processes them—exactly the right pattern for normalizing heterogeneous data formats across tools. By converting Unix timestamps to ISO 8601 in the hook layer, the synthesis subagent always receives dates in a consistent format regardless of which tool produced them. Option A (`PreToolUse`) intercepts outgoing tool calls, not incoming results—it cannot transform data returned by other agents. Option B relies on probabilistic LLM compliance with a prompt instruction, which is insufficient given the model is already misinterpreting the data. Option C creates a round-trip to re-request data in a different format, adding latency and requiring source subagents to support format selection.
---

## Question 21

The coordinator needs to enforce a business rule: research reports containing conclusions marked as "preliminary" must be reviewed by a human editor before export. Currently, this is handled by a prompt instruction to the report generation subagent. Over one month, 7% of reports with preliminary conclusions are exported without human review. What change would most reliably eliminate this error rate?

A) Implement a `PreToolUse` hook that intercepts `export_to_pdf` calls, checks whether the report contains preliminary conclusions, and blocks the export with a human review request if found.
B) Add more prominent formatting to the prompt instruction—use ALL CAPS for the preliminary review requirement.
C) Add few-shot examples showing the report generation subagent always flagging preliminary conclusions before export.
D) Add a post-export audit that scans exported PDFs for "preliminary" language and flags them for retroactive review.

**Answer:** A

**Explanation:** When business rules require deterministic compliance, hooks provide programmatic guarantees that prompt-based approaches cannot. A `PreToolUse` hook that blocks `export_to_pdf` when preliminary conclusions are detected eliminates the 7% failure rate—the export cannot proceed without the review flag being cleared. Options B and C both rely on probabilistic LLM compliance; the current 7% failure rate already demonstrates that prompt-based enforcement is insufficient. Option D is a retroactive measure that allows non-compliant exports to occur, which is the opposite of prevention.
---

## Question 22

Your research system handles two types of queries: (A) specific factual lookups ("What is the GDP of Singapore?") and (B) open-ended research topics ("Analyze the geopolitical implications of Arctic resource extraction"). Which task decomposition pattern is appropriate for each?

A) Use prompt chaining for both types—it provides predictable, auditable output quality.
B) Use dynamic decomposition for both types—adaptability is always superior to fixed pipelines.
C) Use prompt chaining for type A (predictable multi-step with defined outputs) and dynamic adaptive decomposition for type B (open-ended with findings that generate new research directions).
D) Use dynamic decomposition for type A (to find the most efficient path) and prompt chaining for type B (to ensure all aspects are covered systematically).

**Answer:** C

**Explanation:** Task decomposition strategy should match query type. Simple factual lookups have predictable steps (search, extract, format) that suit prompt chaining's sequential efficiency. Open-ended research topics require dynamic decomposition because intermediate findings reveal new subtopics, contradictions, and gaps that could not be anticipated upfront. Option A's fixed pipeline for open-ended research misses the adaptive investigation that complex topics require. Option B's dynamic decomposition for simple factual lookups adds overhead and indeterminism without benefit. Option D inverts the correct assignment—dynamic decomposition for a simple factual lookup is wasteful, and chaining for a complex geopolitical analysis would miss the adaptive branching that makes it effective.
---

## Question 23

Your coordinator is analyzing a research query about "global water scarcity." It identifies eight distinct subtopics: agricultural usage, industrial consumption, climate-driven droughts, infrastructure gaps, policy frameworks, desalination technology, groundwater depletion, and transboundary water disputes. A colleague suggests assigning all eight subtopics to a single web search subagent in sequence. What is the risk of this approach?

A) A single subagent cannot perform more than three sequential searches due to tool call limits.
B) Sequential execution of all eight subtopics in one subagent maximizes latency and risks topic overlap, duplication, and attention dilution across a single agent's context.
C) The web search subagent will refuse to run if it detects that subtopics are related, requiring separate agents per topic.
D) Assigning multiple subtopics to one subagent violates the `AgentDefinition` schema, which requires a 1:1 topic-to-agent mapping.

**Answer:** B

**Explanation:** Running eight sequential searches in a single subagent creates three problems: (1) maximum latency—all searches are serial rather than parallel; (2) topic overlap risk—without partition coordination, the agent may search for similar themes multiple times; (3) attention dilution—as the agent's context grows with eight topics' worth of results, later searches receive less focused attention. The coordinator should partition scope across multiple subagents and spawn them in parallel. Option A invents a tool call limit that does not exist. Option C describes behavior that does not occur—subagents do not detect topic relationships and refuse work. Option D invents a schema restriction that does not exist.
---

## Question 24

Your coordinator is writing the research plan for "impact of mRNA vaccines on infectious disease mortality." It generates these subtasks: (1) "find studies about vaccines," (2) "find studies about mRNA," (3) "find studies about diseases." The final synthesis cannot connect the findings into a coherent analysis. What is the most likely root cause?

A) The synthesis subagent lacks access to a medical knowledge base tool.
B) The web search subagent is returning too many results, overwhelming the synthesis agent's context.
C) The coordinator's task decomposition is overly narrow and fails to assign research scope covering the intersection of the concepts; each subtask covers one concept in isolation rather than their combined impact.
D) The report generation subagent is not configured with the correct output template for medical research.

**Answer:** C

**Explanation:** Overly narrow task decomposition is a key coordinator risk. Splitting "mRNA vaccine impact on infectious disease mortality" into three separate single-concept searches produces isolated findings about vaccines, mRNA, and diseases—but none about their combined effect. Good coordinator decomposition would assign subtasks like "mRNA vaccine efficacy in reducing infectious disease mortality—clinical trial data" and "population-level mortality trends post-mRNA vaccine rollout." Option A introduces an external dependency irrelevant to the root cause. Option B describes a downstream problem that may result from too many results, but the root cause is the decomposition strategy. Option D has nothing to do with research decomposition quality.
---

## Question 25

After completing a 2-hour research session on "quantum computing commercial applications" (session name: `qc-research-2024`), you take a 3-day break. During those 3 days, several key source papers are updated with new data and two company announcements referenced in your research are superseded by new press releases. When you return, should you `--resume qc-research-2024` or start a fresh session?

A) Resume `qc-research-2024`—the existing session has all context and the tool results are still valid.
B) Resume `qc-research-2024` and delete all tool results from the conversation history before proceeding.
C) Start a fresh session with a structured summary of what was researched, since prior tool results referencing specific documents and press releases are now stale.
D) Resume `qc-research-2024` and run a diff between the prior tool results and current source documents to identify stale information.

**Answer:** C

**Explanation:** When prior tool results are stale—particularly when specific documents and press releases that were directly cited have been updated or superseded—starting a new session with a structured summary is more reliable than resuming with outdated content. The summary preserves the analytical framework and research direction while prompting fresh tool calls against current sources. Option A incorrectly asserts the tool results are still valid when the question explicitly states they are stale. Option B manually deleting history risks corrupting conversation structure and is inferior to a structured fresh start. Option D imagines a diff capability that does not exist in the session system.
---

## Question 26

Your research system tackles a query: "Provide a comprehensive analysis of global semiconductor supply chain vulnerabilities, including geopolitical risks, manufacturing concentration, and technology dependencies." The coordinator initially decomposes this into two subtasks: "semiconductor supply chain" and "vulnerabilities." Synthesis returns a shallow report. How should the coordinator's decomposition strategy be improved?

A) Reduce the decomposition to a single subtask covering the full topic to preserve context coherence.
B) Use the broad query directly as the synthesis subagent's prompt without decomposition.
C) Decompose into multiple targeted subtasks aligned with the query's explicit dimensions: geopolitical risks (US-China semiconductor restrictions, export controls), manufacturing concentration (TSMC market share, fab geographic distribution), and technology dependencies (rare earth materials, EDA toolchain suppliers), assigning distinct research scope to separate subagents.
D) Decompose into exactly four subtasks matching the four pipeline stages, regardless of the topic's actual dimensions.

**Answer:** C

**Explanation:** Effective task decomposition must align with the actual dimensions of the research topic. The original query explicitly names three dimensions: geopolitical risks, manufacturing concentration, and technology dependencies. Each should become a targeted subtask with specific research scope assigned to separate subagents. Two generic subtasks ("supply chain" and "vulnerabilities") fail to capture the topic's nuance. Option A reduces coverage further, producing an even shallower result. Option B skips decomposition entirely, expecting synthesis to handle a broad topic without targeted inputs. Option D creates artificial four-part decomposition based on pipeline stages rather than topic structure.
---

## Question 27

Your system has a workflow where the document analysis subagent processes a 500-page industry report. You plan to use a single session that reads the entire report in sequence. During testing, the subagent's analysis quality degrades noticeably after the first 200 pages—later sections receive superficial treatment, and key statistics from the middle of the report are missed. What decomposition strategy should you apply?

A) Split the report into logical sections and analyze each section individually with focused attention, then run a cross-section integration pass to identify patterns and connections, rather than processing the full report in a single pass.
B) Instruct the subagent to focus on all sections equally with equal attention distribution.
C) Increase the subagent's context window to 1 million tokens to hold the entire report.
D) Use a higher-tier model with better long-document comprehension to avoid quality degradation.

**Answer:** A

**Explanation:** Splitting large documents into per-section analysis passes followed by a cross-section integration pass directly addresses the attention dilution problem. Each section receives focused, undiluted attention from an analysis pass, and the integration pass captures cross-section patterns without requiring the model to hold 500 pages in active attention simultaneously. Option C increases the context window size but does not solve the attention quality issue—larger context doesn't guarantee proportional attention across all content. Option B is a prompt instruction that cannot change the model's attention distribution. Option D switches models without addressing the root cause—attention dilution affects all models at sufficient document lengths.
---

## Question 28

Your research system has two tools: `analyze_content` (described as "Analyzes content and extracts key information") and `analyze_document` (described as "Analyzes documents and extracts key information"). Production logs show the web search subagent randomly calls `analyze_document` after fetching web pages, and the document analysis subagent randomly calls `analyze_content` when processing PDFs. Both tools have identical behavior. What is the most effective fix?

A) Remove one of the two tools and consolidate their functionality into the remaining tool.
B) Add explicit routing logic in the system prompt: "Use `analyze_content` for web pages and `analyze_document` for PDFs."
C) Rename `analyze_content` to `extract_web_results` with a description specifying it processes web page text, and rename `analyze_document` to `extract_document_data` with a description specifying it processes uploaded files, PDF paths, or document IDs, with explicit boundaries explaining when to use each.
D) Add few-shot examples to each subagent's system prompt showing the correct tool being called for each content type.

**Answer:** C

**Explanation:** When tools have near-identical descriptions, the model cannot reliably distinguish between them. Renaming the tools to accurately reflect their scope and rewriting descriptions to include input format, expected use cases, and explicit "use this vs. that" boundaries directly resolves the ambiguity. Option A (consolidation) is a valid architectural choice but requires more refactoring effort than description improvements and may lose the performance benefits of specialized tools. Option B adds prompt-level routing that must be duplicated across multiple subagents and can conflict with tool descriptions. Option D adds examples without fixing the root cause—ambiguous descriptions—meaning the examples may not generalize to novel content types.
---

## Question 29

The synthesis subagent has been given a generic tool called `analyze_document` that can extract data points, summarize content, or verify claims. Production logs show the synthesis agent uses `analyze_document` for every task, including ones where it should be verifying a specific claim against a source document but instead produces broad summaries. What tool design change would best address this?

A) Add more detailed instructions in the synthesis subagent's prompt about when to use each mode of `analyze_document`.
B) Add a `mode` parameter to `analyze_document` (e.g., `mode: "verify"`, `mode: "summarize"`) to guide the agent toward the correct behavior.
C) Add validation to `analyze_document` that detects the content type and automatically applies the appropriate analysis mode.
D) Split `analyze_document` into three purpose-specific tools: `extract_data_points` for numerical extraction, `summarize_content` for narrative summaries, and `verify_claim_against_source` for targeted claim verification, each with clear input/output contracts.

**Answer:** D

**Explanation:** A generic multi-mode tool forces the model to determine the correct mode through prompting, which is unreliable when modes have similar-sounding purposes. Splitting into purpose-specific tools with defined input/output contracts allows the model to select the correct tool directly based on what it needs to accomplish—and the tool description itself guides selection. Option A adds prompt complexity without resolving the fundamental tool design problem. Option B adds a `mode` parameter, which is better than a single tool but still requires the model to correctly parameterize the mode—a second decision point that can fail. Option C adds automatic mode detection, which may not correctly infer intent when the model provides ambiguous inputs.
---

## Question 30

Your web search subagent occasionally returns `{"results": []}` when a query finds no matching articles. The coordinator interprets this as a timeout or access failure and re-routes to the document analysis subagent as a fallback. This causes wasted document analysis cycles when web results are genuinely empty (no relevant articles exist) versus when the search service is actually unavailable. How should the web search tool differentiate these cases?

A) Return structured error responses that distinguish access failures (service unavailable, timeout) from valid empty results (successful query with no matching documents), including metadata such as `errorCategory` and `isRetryable`.
B) Return HTTP status 404 for empty results and HTTP status 503 for service unavailability, and have the coordinator check status codes.
C) Log the distinction to a monitoring system and have the coordinator poll the log to determine which case occurred.
D) Always return a non-empty result set by including low-relevance fallback results when no relevant articles are found.

**Answer:** A

**Explanation:** Structured error responses that distinguish access failures from valid empty results are the correct pattern. When the coordinator can see `{"status": "success", "results": [], "message": "No articles found for query"}` versus `{"status": "error", "errorCategory": "transient", "isRetryable": true, "message": "Search service timeout"}`, it can make appropriate recovery decisions—retry for timeouts, accept empty results as valid for no-match cases. Option B uses HTTP status codes, which are not natively supported in the MCP tool result structure and require the coordinator to parse status codes rather than semantic fields. Option D corrupts search quality by including irrelevant fallback results. Option C introduces polling complexity and latency where a direct response field suffices.
---

## Question 31

The coordinator receives the following error from the web search subagent: `{"error": "Operation failed"}`. The coordinator cannot determine whether to retry, fall back to document analysis, or abort the research task. What structured error format would best enable coordinator recovery decisions?

A) `{"error": "timeout", "retryAfter": 30}`
B) `{"error": true, "message": "Search unavailable, please try again"}`
C) `{"isError": true, "errorCategory": "transient", "isRetryable": true, "attemptedQuery": "mRNA vaccine mortality studies 2020-2023", "partialResults": [...], "alternativeApproach": "Try splitting query into two narrower searches"}`
D) `{"success": false, "code": 500, "details": "Internal server error in search backend"}`

**Answer:** C

**Explanation:** Structured error context enabling intelligent coordinator recovery should include: the MCP `isError` flag, error category (transient/validation/permission), whether the error is retryable, what was attempted (the specific query), any partial results already gathered, and potential alternative approaches. This gives the coordinator everything it needs to make a recovery decision. Option B provides a human-readable message but no structured fields for programmatic decision-making. Option A provides retry timing but not category, attempted query, partial results, or alternatives. Option D provides an HTTP-style status code but is missing the key recovery-enabling fields like partial results and alternative approaches.
---

## Question 32

The synthesis subagent is given 18 tools: web search, document retrieval, citation formatting, language translation, image description, sentiment analysis, entity extraction, topic modeling, fact verification, source ranking, content summarization, claim extraction, contradiction detection, confidence scoring, metadata enrichment, section outlining, quote identification, and export formatting. Production logs show the synthesis agent frequently calls `topic_modeling` and `sentiment_analysis` when it should be calling `claim_extraction` and `fact_verification`. What is the primary cause?

A) The `claim_extraction` and `fact_verification` tools have incomplete descriptions that fail to differentiate them from the mislabeled tools.
B) The synthesis agent requires a separate routing classifier to pre-select tools before each invocation.
C) Giving an agent 18 tools increases decision complexity to the point where tool selection reliability degrades; the synthesis agent should only receive tools relevant to its synthesis role.
D) The synthesis subagent's system prompt does not explicitly forbid using `topic_modeling` and `sentiment_analysis`.

**Answer:** C

**Explanation:** Giving an agent access to too many tools degrades tool selection reliability by increasing decision complexity. When a synthesis agent has 18 tools—many outside its core synthesis function—the model struggles to select the right tool from a large set of potentially applicable options. The synthesis agent should receive only the 4-5 tools relevant to synthesis (claim extraction, fact verification, content summarization, contradiction detection, confidence scoring), and tools outside its specialization should be removed. Option D suggests adding prohibitions to the prompt, which adds complexity without addressing the root cause. Option A may be a contributing factor but doesn't explain the specific pattern of misuse across all 18 tools. Option B adds infrastructure that wouldn't be needed with proper tool scoping.
---

## Question 33

You want to ensure that when the report generation subagent begins, it always calls `extract_metadata` first before any other tool—regardless of how complex the report request is. This is a strict operational requirement. Which `tool_choice` configuration achieves this?

A) Set `tool_choice: "auto"` and add "Call `extract_metadata` first" to the system prompt.
B) Set `tool_choice: {"type": "tool", "name": "extract_metadata"}` for the report generation subagent's first invocation, forcing `extract_metadata` to be called, then process subsequent steps with `tool_choice: "auto"` in follow-up turns.
C) Set `tool_choice: "any"` to ensure the subagent calls some tool; it will naturally select `extract_metadata` first.
D) Remove all tools except `extract_metadata` for the first turn, then add remaining tools in subsequent turns.

**Answer:** B

**Explanation:** Forced tool selection via `tool_choice: {"type": "tool", "name": "extract_metadata"}` guarantees `extract_metadata` is called first, fulfilling the strict operational requirement. After this forced first call, `tool_choice: "auto"` is set for subsequent turns to allow normal reasoning. Option A uses `tool_choice: "auto"` with a prompt instruction, which is probabilistic—the model may not always follow the instruction. Option C uses `tool_choice: "any"` which guarantees a tool is called but does not guarantee which tool, meaning other tools might be selected first. Option D dynamically modifying tool sets between turns is cumbersome and may not be supported in all SDK configurations.
---

## Question 34

Your team is adding a new external data source: a proprietary research database that requires an API key for authentication. Multiple team members will use this data source in the research system. The API key must not be committed to the repository. How should you configure the MCP server for this data source?

A) Store the API key in a `.env` file, add it to `.gitignore`, and load it at runtime using `os.environ`.
B) Configure the MCP server in the project-scoped `.mcp.json` file using environment variable expansion (e.g., `"apiKey": "${RESEARCH_DB_TOKEN}"`) so the key is referenced from each developer's environment without being committed.
C) Configure the MCP server in each developer's user-scoped `~/.claude.json` file with their individual API keys.
D) Hardcode the API key in the `.mcp.json` file and restrict repository access to prevent external exposure.

**Answer:** B

**Explanation:** Project-scoped `.mcp.json` with environment variable expansion is the correct pattern for shared team MCP servers requiring credentials. The file is version-controlled (enabling team collaboration), the variable expansion references each developer's local environment variable (preventing credential commits), and all team members configure their own `RESEARCH_DB_TOKEN` environment variable. Option A works for application code but is not the MCP-specific pattern—`.mcp.json` supports native environment variable expansion. Option C uses user-scoped configuration, which is appropriate for personal/experimental servers but doesn't enable the project-level sharing the question requires. Option D commits the API key, which is a critical security violation.
---

## Question 35

Your research system's MCP setup includes a `research_database` server configured in `.mcp.json`. The document analysis subagent is configured with the `web_search`, `fetch_url`, and `analyze_text` tools. However, when the document analysis subagent attempts to query the research database, it uses `fetch_url` with the database's REST endpoint rather than the dedicated `research_database` MCP tool. What is most likely causing this?

A) The `research_database` MCP tool is not available to the document analysis subagent because it's not in the subagent's `allowedTools`.
B) The `research_database` MCP tool's description is insufficient—it doesn't clearly explain its capabilities relative to `fetch_url`, causing the agent to prefer the familiar generic alternative.
C) The MCP server is not connected at agent initialization, so the tool is not discovered.
D) The document analysis subagent's system prompt explicitly instructs it to use `fetch_url` for all external queries.

**Answer:** B

**Explanation:** When an MCP tool's description doesn't clearly explain its capabilities and advantages over built-in alternatives, agents default to familiar generic tools like `fetch_url`. Enhancing the `research_database` tool's description to explain what it provides (authenticated access, structured query results, citation metadata, rate limit management) versus `fetch_url` (raw HTTP requests requiring manual parsing) prevents this preference for built-in alternatives. Option A is a valid concern but would cause an error when the tool is called, not a preference for a different tool—the agent wouldn't "attempt" to use an unavailable tool. Option C would also cause errors, not silent fallback to another tool. Option D adds an explicit instruction conflict that contradicts the problem description.
---

## Question 36

Your team has two new MCP integrations in development: (1) a standard GitHub integration for tracking research paper repositories (a common use case), and (2) a custom integration with your team's internal research annotation workflow system. How should you approach building these two integrations?

A) Build both as custom MCP servers to ensure full control over behavior and error handling.
B) Use an existing community GitHub MCP server for the GitHub integration; build a custom MCP server only for the internal annotation system.
C) Use the GitHub API directly via `fetch_url` for the GitHub integration and build a custom MCP server for the annotation system.
D) Use an existing community MCP server for both integrations if any community servers are available.

**Answer:** B

**Explanation:** The principle is to choose existing community MCP servers for standard integrations and reserve custom server development for team-specific workflows. GitHub is a standard integration with well-maintained community MCP servers; using one saves development time and benefits from community maintenance. The internal research annotation system is team-specific with no community server available, making custom development appropriate. Option A builds both from scratch, wasting effort on a standard integration with existing solutions. Option C uses a raw API call instead of an MCP tool for GitHub, losing the benefits of structured tool interfaces (error handling, tool descriptions, consistent patterns). Option D overextends community server usage by trying to use one for a proprietary internal system that won't have a community server.
---

## Question 37

The synthesis subagent needs to access a catalog of 2,000 research documents stored in your system. Currently, the subagent calls `list_available_documents` at the start of each synthesis task, which returns all 2,000 document titles and metadata in a single tool call result. This consumes significant context budget and the subagent often hits context limits before completing synthesis. What MCP feature would best address this?

A) Pre-filter the document list to the 50 most relevant documents before the synthesis task begins.
B) Increase the synthesis subagent's context window to accommodate the full document catalog.
C) Add pagination to the `list_available_documents` tool, returning 50 documents per call.
D) Expose the document catalog as an MCP resource so the synthesis agent can browse available documents without consuming tool call context budget.

**Answer:** D

**Explanation:** MCP resources are designed specifically for exposing content catalogs (document summaries, database schemas, issue hierarchies) to agents without consuming tool call context budget. Resources give the agent visibility into available data through a lightweight interface, preventing the context explosion caused by loading 2,000 document entries into conversation history via tool calls. Option C adds pagination, which reduces per-call cost but still accumulates context as the agent browses through multiple pages. Option A pre-filtering is a reasonable complementary optimization but requires a pre-filter mechanism; MCP resources solve the broader problem more elegantly. Option B increasing context window is an expensive workaround that doesn't address the inefficiency of loading irrelevant document metadata.
---

## Question 38

The document analysis subagent has access to both a `load_document` tool (which validates that the input is a registered document URL, handles authentication, and returns structured content) and a generic `fetch_url` tool (which makes raw HTTP requests). Logs show that when analyzing documents, the subagent frequently calls `fetch_url` for document URLs, bypassing authentication and receiving 403 errors. What is the most targeted fix?

A) Remove `fetch_url` from the document analysis subagent's `allowedTools` and replace it with `load_document`, which validates document URLs and handles authentication.
B) Add a prompt instruction: "Always use `load_document` instead of `fetch_url` for document access."
C) Configure `fetch_url` to automatically redirect to `load_document` when it detects a document URL pattern.
D) Add authentication headers to the `fetch_url` tool so both tools work for document access.

**Answer:** A

**Explanation:** Replacing a generic tool (`fetch_url`) with a constrained, purpose-specific alternative (`load_document`) for agents that work exclusively with documents eliminates the misuse pattern at the tool access level. If `fetch_url` is not in the document analysis subagent's `allowedTools`, it cannot be misused. Option B adds a prompt instruction that can still be overridden by model behavior—the current misuse pattern (calling `fetch_url`) already shows the model doesn't reliably follow such guidance. Option C adds complexity to `fetch_url` rather than simply removing it from the agent's toolset. Option D adds authentication to the wrong tool; the problem is that the agent is bypassing the right tool, not that the wrong tool lacks credentials.
---

## Question 39

You need the web search subagent to always call at least one tool rather than returning conversational text (e.g., "I don't have enough context to search effectively"). Some queries are ambiguous, and without forcing a tool call, the subagent occasionally responds with text instead of performing a search. Which configuration guarantees the subagent always calls a tool?

A) Remove all non-search tools from the web search subagent so it has only one tool to call.
B) Set `tool_choice: "auto"` and add "You must always call a search tool" to the system prompt.
C) Set `tool_choice: "any"` to guarantee the model calls at least one tool from its available set rather than returning conversational text.
D) Set `tool_choice: {"type": "tool", "name": "web_search"}` to force the web search tool to always be called.

**Answer:** C

**Explanation:** `tool_choice: "any"` guarantees the model calls at least one tool from the available set, preventing conversational text responses. This is the appropriate setting when the requirement is "always call some tool" without constraining which tool must be called. Option B uses `"auto"` which allows the model to decide whether to call a tool at all—exactly the behavior causing the problem. Option D forces a specific tool (`web_search`), which may not always be appropriate if the subagent also has clarification tools for genuinely ambiguous queries. Option A limits the tool set to one option, which works but removes flexibility the subagent might need for edge cases.
---

## Question 40

The web search subagent's `search_web` tool returns results in this format: `{"results": [{"url": "...", "title": "...", "snippet": "...", "published_date": "...", "domain_authority": 0.87, "reading_level": "graduate", "word_count": 2400, "language": "en", "content_type": "article", "paywall_detected": false, "ad_density": 0.12}]}`. The synthesis subagent receives these results and frequently makes decisions based on `reading_level` and `ad_density` fields that are irrelevant to research synthesis. What is the best fix?

A) Update the synthesis subagent's system prompt to explain what each field means and when to use it.
B) Modify the `search_web` tool to return different fields based on which subagent is calling it.
C) Add a prompt instruction to the synthesis subagent to ignore `reading_level` and `ad_density` fields.
D) Implement a `PostToolUse` hook that trims the search results to only the fields relevant to synthesis (url, title, snippet, published_date) before the agent processes them.

**Answer:** D

**Explanation:** A `PostToolUse` hook that trims verbose tool outputs to only relevant fields before they accumulate in the synthesis agent's context solves both the behavioral problem (agent making decisions based on irrelevant fields) and the context efficiency problem (irrelevant fields consuming tokens). The hook intercepts the tool result and returns only `url`, `title`, `snippet`, and `published_date` to the synthesis agent. Option C relies on probabilistic LLM compliance with a prompt instruction, but the model is already making decisions based on these fields, suggesting the instruction won't reliably work. Option A adds complexity by explaining irrelevant fields rather than removing them. Option B adds caller-awareness to the `search_web` tool, creating tight coupling between the tool implementation and agent identities.
---

## Question 41

Your research system's document analysis MCP tool was recently updated to return results with a new `confidence_score` field (0.0–1.0) alongside existing fields. The synthesis subagent, which was working well before the update, now sometimes requests re-analysis of documents with confidence scores above 0.9 (high confidence) while accepting low-confidence results without verification. What is the most likely cause?

A) The synthesis subagent's `allowedTools` needs to be updated to include the new confidence scoring tool.
B) The `confidence_score` field description in the tool's output schema is missing or ambiguous—the synthesis agent is misinterpreting higher scores as indicating uncertainty rather than confidence.
C) The synthesis subagent's context window is too small to hold both the new `confidence_score` fields and the existing analysis data.
D) The MCP server needs to be restarted to propagate the schema update to the synthesis subagent.

**Answer:** B

**Explanation:** When a new field is added to a tool's output without a clear description, the model interprets the field based on its training and context. `confidence_score: 0.9` without explicit documentation about whether high values mean "high confidence" or "high uncertainty" can lead to inverted interpretation. A well-documented output schema with a clear description ("confidence_score: 0.0 = unreliable, 1.0 = highly reliable") would prevent this misinterpretation. Option A is irrelevant—the tool is already being called successfully (the synthesis agent is using the confidence score data). Option C is a resource concern unrelated to the behavioral inversion. Option D is an operational step that doesn't address the semantic interpretation problem.
---

## Question 42

Your team's research system uses a shared MCP server for academic paper access. A new team member is testing an experimental citation graph tool they're building locally. Where should the experimental citation graph MCP server be configured, and where should the production academic paper server be configured?

A) Both in the project-scoped `.mcp.json` file, using different environment variable names to distinguish them.
B) The production academic paper server in project-scoped `.mcp.json`; the experimental citation graph server in the developer's user-scoped `~/.claude.json`.
C) Both in the developer's user-scoped `~/.claude.json` to avoid polluting the shared project configuration.
D) The experimental server in a separate `.mcp-experimental.json` file alongside the production `.mcp.json`.

**Answer:** B

**Explanation:** Project-scoped `.mcp.json` is for shared team tooling that all developers need; it's version-controlled and applies to everyone who clones the project. User-scoped `~/.claude.json` is for personal or experimental servers that shouldn't affect other team members. The production academic paper server belongs in `.mcp.json` (shared, stable, team-wide); the experimental citation graph server belongs in `~/.claude.json` (personal, experimental, isolated). Option A puts the experimental server in the shared configuration, potentially disrupting other team members. Option C moves the production server to user-scoped configuration, meaning other team members would lose access to it when they don't have it in their personal config. Option D invents a `.mcp-experimental.json` file that is not a supported MCP configuration format.
---

## Question 43

The web search subagent's tool for retrieving academic papers is named `fetch_url` with the description "Fetches content from a URL." The research database also has an MCP tool named `get_paper` with the description "Retrieves a paper from the research database." Production logs show the subagent consistently uses `fetch_url` for paper retrieval even when `get_paper` would provide richer metadata, structured abstracts, and citation counts. What is the most effective fix?

A) Rename `fetch_url` to `fetch_raw_url` to make it sound less authoritative.
B) Add a system prompt instruction: "Prefer `get_paper` over `fetch_url` when retrieving academic papers."
C) Update `get_paper`'s description to explicitly state what it provides over `fetch_url`: structured paper metadata, citation counts, full abstract, author affiliations, journal impact factor, and related papers—and specify that it should be preferred over `fetch_url` for any paper DOI or database URL.
D) Remove `fetch_url` from the web search subagent entirely.

**Answer:** C

**Explanation:** Tool descriptions are the primary mechanism for tool selection. When `get_paper` has a generic description that doesn't convey its advantages over `fetch_url`, the model naturally gravitates toward the familiar, clearly-named generic alternative. Enhancing `get_paper`'s description to explain its specific outputs, advantages, and when to prefer it over `fetch_url` gives the model the information it needs to select correctly. Option A makes `fetch_url` sound slightly less authoritative but doesn't explain why `get_paper` is better. Option B adds a prompt instruction that is less reliable than well-written tool descriptions for selection decisions. Option D removes a tool that may be legitimately needed for non-paper URLs; a targeted fix to descriptions is more surgical.
---

## Question 44

You are building a tool for the synthesis subagent called `verify_claim`. It will be used to check specific claims against source documents. You need to write its description. Which description would most reliably guide the synthesis agent to call this tool correctly?

A) "Verifies a claim."
B) "Checks if information is accurate."
C) "Verifies a specific factual claim (a statement asserting a fact, statistic, or attribution) against a referenced source document or URL. Input: `claim` (the exact statement to verify), `source_url` or `document_id` (the source to check against). Output: `verified` (boolean), `supporting_excerpt` (the relevant passage from the source), `confidence` (0.0–1.0). Use this tool when the synthesis output contains a specific claim that can be traced to a source document—not for general quality review or claim generation."
D) "Use this tool to verify claims by checking source documents. Accepts claim text and source information."

**Answer:** C

**Explanation:** An effective tool description includes: what the tool does (verify a specific claim against a source), input formats with parameter names and types (claim, source_url/document_id), expected outputs (verified, supporting_excerpt, confidence), and explicit boundary guidance (when to use this vs. other similar tools). Option A's "Verifies a claim" is too minimal for reliable selection among multiple analysis tools. Option B is similarly vague and doesn't differentiate from general quality review tools. Option D is better than A/B but still lacks the detailed input/output contracts and explicit boundary guidance that prevent misuse.
---

## Question 45

Your research system's report generation subagent has access to `summarize_findings`, `format_as_table`, `format_as_prose`, `create_citation_list`, and `export_to_pdf`. During testing, when generating a financial analysis report, the subagent formats all content as prose—including numeric tables of investment data that should be formatted as tables. The tool descriptions are detailed and accurate. What additional configuration might improve tool selection for content-type-appropriate formatting?

A) Add prompt instructions specifying when to use `format_as_table` versus `format_as_prose`.
B) Add few-shot examples to the report generation subagent showing financial data being formatted as tables and narrative findings formatted as prose, demonstrating content-type-appropriate rendering choices.
C) Remove `format_as_prose` from the subagent and make `format_as_table` the default.
D) Add a `content_type` field to the `summarize_findings` output so downstream formatting tools know which format to use.

**Answer:** B

**Explanation:** When tool descriptions are already detailed and accurate but the model still makes suboptimal selection choices (especially for nuanced formatting decisions), few-shot examples that demonstrate the correct tool selection for specific content types provide the clearest guidance. Examples showing "investment returns data → `format_as_table`" and "analyst commentary → `format_as_prose`" teach the pattern through demonstration rather than abstract description. Option A adds instructions that duplicate what the tool descriptions likely already convey. Option C removes a needed tool and forces all content into table format, which is inappropriate for narrative findings. Option D adds a data field that still requires the downstream agent to correctly interpret and act on `content_type`, which was the original problem.
---

## Question 46

Your synthesis subagent receives findings from five web searches and three document analyses in a single context window. The synthesis output for a report on "global battery supply chains" correctly covers content from the first three web searches but consistently omits findings from searches four and five, which happened to be placed in the middle of the combined input. What is the most likely explanation and mitigation?

A) The synthesis subagent's `allowedTools` list is missing tools for processing the last two web search results.
B) The "lost in the middle" effect: models reliably process information at the beginning and end of long inputs but may underweight or omit findings from middle sections. Mitigation: place a key findings summary at the beginning and organize results with explicit section headers to reduce position-dependent omission.
C) The synthesis subagent is running out of tokens before processing all inputs; the fix is to increase the token limit.
D) The web search subagent formatted searches four and five differently from the others, causing a parsing failure in the synthesis agent.

**Answer:** B

**Explanation:** The "lost in the middle" effect is a well-documented model behavior where inputs in the middle of long context receive less reliable attention than inputs at the beginning or end. Placing key findings summaries at the start and using explicit section headers helps direct model attention to middle-section content. Option A is unrelated—tool availability doesn't affect how the model attends to its input context. Option C incorrectly frames this as a token limit issue rather than an attention distribution problem; the model processes all tokens but doesn't give them equal analytical weight. Option D would produce parsing errors or garbled output rather than the systematic omission of specific positioned sections.
---

## Question 47

The coordinator agent's context window contains 14 accumulated tool results from various subagents, totaling approximately 45,000 tokens. Of these, 8 results are from intermediate web searches that contributed to the document selection step but are no longer relevant to the current synthesis stage. The coordinator begins producing inconsistent summaries and occasionally references "typical research patterns" rather than the specific findings gathered. What is the most appropriate intervention?

A) Extract the key findings that are still relevant into a structured "research findings" block, trim the intermediate web search results that have served their purpose, and place the structured findings at the beginning of the coordinator's context before the synthesis step.
B) Switch to a higher-tier model with better long-context comprehension.
C) Increase the coordinator's context window to accommodate all accumulated results.
D) Start a fresh coordinator session with only the current stage's inputs.

**Answer:** A

**Explanation:** Context degradation in extended sessions (producing inconsistent answers and referencing "typical patterns" rather than specific discovered facts) is addressed by extracting relevant key findings into a structured persistent block and trimming accumulated intermediate results that are no longer needed. This preserves the valuable current-state information while reducing context noise. Option C increases capacity without addressing the degradation—more context doesn't improve attention quality across 45,000 tokens. Option D discards valid context from earlier stages; the coordinator should preserve the findings, not start fresh. Option B switches models without addressing the fundamental context management problem.
---

## Question 48

During a research session, the web search subagent encounters a DNS timeout while querying for semiconductor supply chain data. It catches the exception and returns `{"results": [], "status": "success"}` to avoid alarming the coordinator. The coordinator continues the workflow, produces a report, and the end user receives an incomplete analysis missing semiconductor supply chain data—with no indication that a failure occurred. What principle does this violate, and what should the subagent do instead?

A) It violates the single-responsibility principle; error handling should be delegated to a dedicated error management subagent.
B) It violates the principle of minimal footprint; the subagent should have retried three times before reporting any status.
C) It violates the principle of graceful degradation; the subagent should return whatever partial results it has and continue.
D) It violates the principle of transparent error propagation; the subagent should return a structured error response indicating the failure type (transient DNS timeout), that results are empty due to failure (not a valid no-results query), and potential alternative approaches (retry with different DNS, use cached results).

**Answer:** D

**Explanation:** Silently suppressing errors by returning empty results marked as successful is an explicit anti-pattern. The coordinator made a consequential decision (continuing research without semiconductor supply chain data) based on false information. The subagent should return structured error context: the failure type (transient DNS timeout), that the empty results represent a failure rather than a valid empty query, partial results if any, and potential alternative approaches. Option B describes retry behavior, which is a valid local recovery mechanism but doesn't address the problem of false success status. Option C describes partial results behavior—valid, but the problem is specifically the false success status. Option A invents an error management subagent pattern that is not standard; error context should flow through the normal result channel.
---

## Question 49

Your synthesis subagent receives findings from both the web search and document analysis subagents. After synthesis completes, the report generation subagent receives a prose summary without any source URLs, document names, or page references. The final report contains specific statistics and claims with no citations. Tracing back through logs, you find the original source data was present in web search and document analysis outputs. Where in the pipeline is attribution being lost?

A) The report generation subagent is stripping citations during PDF formatting.
B) The synthesis subagent is summarizing findings into prose without preserving the claim-source mappings from the input structured data, and the coordinator is passing synthesis prose (not structured outputs) to the report generation subagent.
C) The web search subagent is not including source URLs in its output format.
D) The coordinator is not configured to retain tool result metadata between pipeline stages.

**Answer:** B

**Explanation:** Source attribution is typically lost during summarization steps when synthesis compresses findings into prose without preserving claim-source mappings. When the synthesis subagent converts structured input (with URLs, document names, statistics paired with their sources) into a prose narrative, citations disappear unless the output format explicitly requires structured claim-source mappings. The fix is to require synthesis output to preserve structured mappings. Option A blames the wrong stage—attribution loss happens during synthesis, not PDF rendering. Option C is contradicted by the logs showing source data was present in web search outputs. Option D invents a "tool result metadata retention" configuration that doesn't address where in the pipeline the data disappears.
---

## Question 50

Two credible sources cited in your research report give conflicting statistics on renewable energy investment: Source A (International Energy Agency, 2023) reports $1.74 trillion invested globally, while Source B (BloombergNEF, 2023) reports $1.1 trillion for the same year. The synthesis agent picks Source A's figure and discards Source B without annotation. A stakeholder later challenges the report's accuracy. What synthesis approach should have been used?

A) Always prefer the higher-credibility source (IEA over BloombergNEF) and cite only that source.
B) Average the two figures and report $1.42 trillion as a consensus estimate.
C) Escalate to the coordinator to request additional research before proceeding with synthesis.
D) Annotate both statistics in the synthesis output with their sources and note the methodological differences (e.g., IEA may include different investment categories than BloombergNEF), preserving original source characterizations rather than arbitrarily selecting one value.

**Answer:** D

**Explanation:** When credible sources present conflicting statistics, the correct approach is to annotate the conflict with source attribution—preserving both values, their sources, and any methodological context that explains the difference—rather than arbitrarily selecting one. This allows readers to understand the discrepancy and make informed judgments. Temporal data and methodological differences (like different definitions of "investment") are common reasons credible sources conflict. Option A arbitrarily prioritizes one source without examining why they differ. Option B averages figures that use different methodologies, creating a number that neither source would endorse. Option C over-escalates a manageable synthesis challenge—reporting conflicts with annotation is within the synthesis agent's capability.
---

## Question 51

The document analysis subagent processes research papers and returns findings as a dense 800-word prose summary per paper. The synthesis subagent receives 12 such summaries (9,600 words total) and must synthesize them into a coherent analysis. The coordinator observes that synthesis quality degrades significantly when more than 6 papers are included, and the synthesis agent begins missing findings from papers 7–12. What upstream change would most improve synthesis quality?

A) Modify the document analysis subagent to return structured data (key claims with citations, quantitative findings with page references, relevance scores) instead of dense prose summaries, reducing the per-paper context footprint while preserving the most synthesis-relevant information.
B) Limit the research system to processing no more than 6 papers per synthesis task.
C) Have the synthesis subagent request papers in two batches of 6 to avoid context overload.
D) Switch the synthesis subagent to a model with a larger context window.

**Answer:** A

**Explanation:** When downstream agents have limited context budgets, modifying upstream agents to return structured data (key facts, citations, relevance scores) instead of verbose prose summaries is the appropriate solution. A structured output of 5–10 key claims with citations per paper would consume far less context than an 800-word prose summary while providing the synthesis agent with the specific high-value information it needs. Option B artificially limits research scope instead of fixing the representation problem. Option C creates batches that clear context, but the problem is representation density, not total paper count—batching doesn't fix per-paper context cost. Option D increases context capacity without addressing the density problem; the synthesis agent would still struggle with dense prose.
---

## Question 52

Your research system has been running for 4 hours on a deep investigation into pharmaceutical pricing policy. The coordinator has spawned 23 subagents across multiple research phases. The coordinator's context is now 180,000 tokens, consisting largely of verbose intermediate outputs from early subagents that are no longer relevant. The coordinator is beginning to reference "standard pharmaceutical research approaches" rather than the specific pricing data gathered. What is the best intervention?

A) Increase the coordinator's context window allocation to 500,000 tokens.
B) Spawn a new coordinator subagent and pass all 180,000 tokens to it via a `Task` tool call.
C) Use `/compact` to reduce context usage, then summarize key findings from the current exploration phase into a structured "research state" block that the coordinator injects into each subsequent agent prompt.
D) Terminate the session and restart with fresh context.

**Answer:** C

**Explanation:** `/compact` reduces context usage during extended exploration sessions when context fills with verbose discovery output. After compaction, summarizing key findings into a structured state block and injecting it into subsequent agent prompts preserves essential research continuity while eliminating the context bloat causing degradation. Agents maintaining scratchpad-style state blocks counteract the "referencing typical patterns rather than discovered specifics" symptom. Option D discards 4 hours of research progress unnecessarily. Option B passes 180,000 tokens to a new agent, which doesn't reduce context—it moves the problem. Option A increases capacity without addressing the degradation; the model would still lose focus across 180,000 tokens of verbose intermediate output.
---

## Question 53

Your research system's synthesis output confidence is high (average 0.94 out of 1.0) according to the model's self-reported scores. Based on this, your team reduces human review to only 5% of synthesis outputs. Over the following month, a content audit reveals that 18% of synthesis outputs contain unsupported claims or misattributed statistics—far above the 5% expected. What was wrong with the team's approach?

A) The confidence threshold of 0.94 was too low; it should have been set at 0.98 or higher.
B) Aggregate confidence scores mask poor performance on specific synthesis scenarios; the team should have validated accuracy by source type and claim category using stratified sampling before reducing review rates, and should have used labeled validation sets to calibrate the confidence thresholds.
C) The synthesis subagent's confidence scores are incorrectly computed; a bug fix is needed in the scoring algorithm.
D) Human review should never be reduced for AI-generated research synthesis regardless of confidence scores.

**Answer:** B

**Explanation:** Self-reported aggregate accuracy metrics can mask poor performance on specific document types, claim categories, or synthesis scenarios. Before reducing human review based on confidence scores, the team should have stratified the sample by synthesis type and source category, measured error rates in each segment, and calibrated confidence thresholds using labeled validation sets. A 94% average confidence may hide 40% error rates on conflicting-source synthesis scenarios. Option A adjusting the threshold without stratified validation would not catch segment-specific errors. Option C assumes a technical bug, but the problem is methodological—aggregate metrics hiding segment-level failure. Option D takes an absolutist position that is not practical or necessary when proper calibration and stratified sampling are applied.
---

## Question 54

The coordinator is about to escalate a research query to a human expert because it cannot determine which of two conflicting peer-reviewed studies on drug efficacy is more methodologically sound. The user has not requested a human expert—the coordinator has decided this is beyond its capability. Which escalation behavior is appropriate?

A) Escalate immediately since the coordinator has identified a complexity threshold it cannot handle.
B) The coordinator should report both studies with their methodological differences annotated, indicate which conclusions are well-supported versus contested, and present findings clearly—escalating only if the user explicitly requests expert judgment or if the system's policy is silent on how to handle methodological disputes.
C) The coordinator should select the more recent study and proceed, as recency is a reliable proxy for methodological advancement.
D) The coordinator should spawn additional research subagents to gather more studies until a consensus emerges.

**Answer:** B

**Explanation:** The synthesis skill covers presenting conflicting findings with annotations—this is within the system's capability. Escalating to human experts should be triggered by explicit user requests, policy gaps, or inability to make meaningful progress—not by the coordinator's self-assessment of complexity. Presenting both studies with methodological context (sample size, study design, publication venue, funding source) and clearly distinguishing well-established from contested findings is the appropriate resolution. Option A escalates based on self-reported complexity assessment, which is an unreliable proxy. Option C arbitrarily resolves the conflict using recency heuristic, which is not methodologically sound. Option D spawns more research to find consensus, which may not exist for genuinely contested scientific questions.
---

## Question 55

The web search subagent returns the following error to the coordinator after failing to retrieve search results: `{"status": "error", "message": "Search service temporarily unavailable"}`. The coordinator cannot determine whether to (a) retry immediately, (b) wait and retry, (c) use an alternative search strategy, or (d) proceed without web results. What structured error information is the subagent failing to provide?

A) The failure type (transient service outage vs. invalid query vs. rate limit), whether the error is retryable, the specific query that was attempted, any partial results gathered before the failure, and suggested alternative approaches.
B) The coordinator's request ID for correlation with monitoring dashboards.
C) The HTTP status code and server response time.
D) The subagent's current resource utilization and memory state.

**Answer:** A

**Explanation:** Intelligent coordinator recovery requires structured error context: the failure type (service outage suggests waiting and retrying; rate limit suggests different timing; invalid query suggests reformulating), `isRetryable` boolean, the specific attempted query (for reformulation), partial results if any were gathered, and alternative approaches. Without these fields, the coordinator's four recovery options are all equally plausible, preventing informed decision-making. Option C's HTTP status codes provide partial information (503 hints at transient, 400 hints at validation) but lack the query context, partial results, and alternative suggestions. Option D provides internal metrics unrelated to recovery decisions. Option B provides operational correlation data irrelevant to recovery strategy.
---

## Question 56

Your synthesis subagent receives document analysis findings that include a publication date field, but this field is often omitted when the document analysis subagent determines the date is "not directly relevant to the analysis." As a result, the synthesis agent combines a 2019 study (showing 12% renewable energy adoption) and a 2024 study (showing 31% adoption) as if they describe current conditions, producing a synthesis claiming "renewable energy adoption rates are between 12% and 31%." What structural change prevents this?

A) Instruct the synthesis subagent to look up publication dates for all sources independently.
B) Have the coordinator check all publication dates before passing findings to synthesis.
C) Require the document analysis subagent to always include publication or data collection dates in its structured output—making dates a mandatory field—so temporal differences are preserved through synthesis rather than treated as contradictions.
D) Configure the synthesis subagent to reject inputs without publication dates and request re-analysis.

**Answer:** C

**Explanation:** Publication and data collection dates must be required fields in subagent structured outputs to prevent temporal differences from being misinterpreted as contradictions or ranges. When date fields are optional, subagents omit them based on relevance judgments that may be incorrect in downstream contexts—the synthesis agent cannot know that a missing date would have been critical for temporal interpretation. Making dates mandatory ensures they always flow through the pipeline. Option A adds a lookup burden to the synthesis agent, which is less efficient than requiring dates at the source. Option B adds a coordinator validation step that is helpful but doesn't fix the root cause—the document analysis subagent should provide dates. Option D rejects inputs and requests re-analysis, which is a less efficient feedback mechanism than requiring dates upfront.
---

## Question 57

After a prolonged research session on "global rare earth supply chains," the coordinator's context has degraded and it is summarizing findings without the numerical specifics that were carefully extracted in early research phases. Key data points like "China produces 60% of rare earth elements" and "processing capacity is concentrated in three facilities" have been replaced with vague generalizations. What mechanism most effectively preserves these critical facts across context boundaries?

A) Re-run the early research phases whenever critical data points are needed.
B) Extract transactional facts—specific statistics, quantities, facility names, percentages, and source citations—into a persistent structured "research facts" block that is included in every subsequent prompt, kept outside the summarized session history.
C) Instruct the coordinator to "remember all numerical facts and specific statistics."
D) Compress the entire research history into a dense summary at each context boundary.

**Answer:** B

**Explanation:** Extracting critical facts (numerical values, specific statistics, attributions, percentages) into a persistent structured block that is included in each prompt—outside of the summarized history that gets compressed—ensures these high-value specifics survive context boundaries. Progressive summarization risks are highest for numerical values and specific data points, which get replaced by generalizations. A dedicated "research facts" block is injected verbatim regardless of how much the narrative history gets compressed. Option C is a prompt instruction that cannot resist context compression. Option D's dense summary is exactly the pattern that loses numerical specifics. Option A re-runs expensive research phases as a workaround rather than preserving the findings.
---

## Question 58

A user submits a query: "Find me research on climate change." After the web search returns 47 articles, the coordinator begins routing all 47 to the document analysis subagent. When you check the document analysis subagent's tool results, each call returns a result object with 60+ fields per document, only 8 of which are relevant to climate research synthesis. After 20 documents, the document analysis subagent's context budget is exhausted. What is the primary context management fix?

A) Trim the document analysis tool's output to only the 8 relevant fields before appending results to the subagent's conversation history, preventing irrelevant fields from accumulating in context.
B) Limit web search to returning 10 articles maximum.
C) Increase the document analysis subagent's context window.
D) Have the document analysis subagent process documents in batches of 5, clearing its context between batches.

**Answer:** A

**Explanation:** Tool results that accumulate in context should be trimmed to only relevant fields before they are appended, preventing irrelevant data from disproportionately consuming context tokens. When a 60-field result can be reduced to 8 relevant fields, the context cost per document drops by ~87%, allowing significantly more documents to be processed before hitting limits. Option B artificially caps research coverage as a workaround rather than fixing the representation inefficiency. Option C increases capacity without addressing the density problem—the same exhaustion will occur with more documents. Option D creates batches that clear context, but this loses cross-document patterns needed for coherent analysis across all 47 documents.
---

## Question 59

Your research team implements an automated pipeline where the synthesis subagent produces output with an overall accuracy of 96% (measured on a test set of 500 synthesis tasks). Based on this strong performance, the team removes all human review. Two weeks later, users report that synthesis outputs on government policy documents contain systematic errors—misattributed policy positions and incorrect legislative references—while synthesis of academic papers continues to perform well. What evaluation failure led to this outcome?

A) The team measured aggregate accuracy without stratifying by document type or source category; the 96% aggregate masked poor performance specifically on government policy documents, which should have been evaluated as a separate segment before removing human review.
B) The test set of 500 tasks was too small to measure 96% accuracy reliably.
C) Human review should have been maintained permanently; removing it is always inadvisable regardless of accuracy.
D) The synthesis subagent needs fine-tuning on government policy documents to address the systematic errors.

**Answer:** A

**Explanation:** Aggregate accuracy metrics can mask poor performance on specific document types. A 96% overall accuracy that includes 400 academic paper tasks (99% accurate) and 100 government policy tasks (84% accurate) would appear strong in aggregate while hiding a systematic gap. Before automating synthesis and removing human review, the team should have analyzed accuracy by document type, verifying consistent performance across all segments. Option B suggests the sample size is the problem; 500 is a reasonable test set, and stratification—not size—was the missing element. Option C takes an absolute position that contradicts the value of AI automation when properly validated. Option D addresses improvement after the fact; the question asks about the evaluation failure that led to premature review removal.
---

## Question 60

The web search subagent times out on 3 out of 12 search queries for a research task on "deep-sea mining regulations." It successfully completes 9 queries. Rather than propagating the failures to the coordinator, it returns all 12 results with the 3 failed queries represented as `{"results": [], "query": "..."}`. The coordinator proceeds to synthesis, which produces a report noting "no existing regulations found" for the exact subtopics covered by the 3 failed queries. What error propagation strategy should have been used?

A) The subagent should replace failed query results with cached results from similar prior queries to maintain complete coverage.
B) The subagent should abort the entire task when any query fails, forcing the coordinator to restart with a different approach.
C) The subagent should have retried failed queries indefinitely until they succeeded.
D) The subagent should implement local recovery for transient failures (retry 2–3 times with backoff). If recovery fails, propagate structured error context to the coordinator—including failure type, attempted query, partial results (the 9 successful results), and a coverage annotation noting which subtopics have gaps—so the coordinator can make informed decisions about proceeding or re-routing.

**Answer:** D

**Explanation:** The correct pattern for transient failures in subagents combines local recovery (retry for transient issues) with structured error propagation when local recovery fails. The subagent should attempt retries, but when they fail, it must communicate this to the coordinator with: failure type (transient timeout), specific queries that failed, partial results (the 9 successful results), and coverage annotations indicating which subtopic areas have gaps. This enables the coordinator to choose whether to retry, re-route, or proceed with acknowledged gaps—rather than silently producing an incomplete report. Option C retries indefinitely, blocking the pipeline without limit. Option B aborts the entire task, discarding 9 successful results unnecessarily. Option A fabricates data by substituting cached results, which is more harmful than reporting the gap—it hides the limitation behind potentially inaccurate data.
---
