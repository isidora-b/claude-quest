# Customer Support Resolution Agent

**Total Questions:** 60
**Domain Distribution:** Domain 1 (27), Domain 2 (18), Domain 5 (15)

---

## Question 1

Your customer support agent's agentic loop is processing a refund dispute. After calling `process_refund`, your loop's control logic checks whether the model's response text contains the phrase "refund processed" to determine whether to terminate. In production, you notice that 8% of successful refund flows loop indefinitely, while another 5% exit prematurely before the refund completes. What is the most likely cause of this behavior?

A) The `process_refund` tool is returning inconsistent response formats that confuse the loop logic.
B) The loop is using natural language signal detection rather than inspecting `stop_reason` to determine when to terminate.
C) The agent's system prompt lacks instructions about when to end the conversation after completing a refund.
D) The model is hallucinating confirmation text without actually calling the tool, causing false positives.

**Answer:** B

**Explanation:** The loop should terminate when `stop_reason` is `"end_turn"` and continue when it is `"tool_use"` — these are deterministic, machine-readable signals. Parsing the assistant's natural language output ("refund processed") for loop control is an anti-pattern: phrasing varies between turns, the model may omit or rephrase confirmation, and the signal is unreliable by nature. Option A is plausible but the tool response format affects what Claude says, not the structural `stop_reason` signal the loop should be checking. Option C is a real improvement but addresses the quality of the conversation, not the structural bug causing infinite/premature loops. Option D is a separate concern and would not explain systematic patterns tied to loop control logic.
---

## Question 2

Your agentic loop calls `get_customer`, then `lookup_order`, then `process_refund` across three iterations. After the second tool call returns the order details, you notice the agent re-verifies the customer identity it already retrieved in the first iteration — adding latency and an unnecessary API call. What is the most direct cause of this behavior?

A) The tool descriptions for `get_customer` and `lookup_order` overlap, causing the model to conflate their purposes.
B) The tool result from `get_customer` was not appended to the conversation history before the next iteration, so the model cannot reason from it.
C) The system prompt does not specify that customer verification should only happen once per session.
D) The `lookup_order` tool is returning a customer ID field that prompts the model to re-verify identity.

**Answer:** B

**Explanation:** In an agentic loop, tool results must be appended to the conversation history between iterations so the model can incorporate the information into its reasoning on the next step. If the `get_customer` result is discarded or not returned as a `tool_result` block, the model has no memory of the verification step and will repeat it. Option A describes a tool description problem that would affect which tool is selected, not whether prior results are remembered. Option C would reduce the symptom probabilistically but doesn't fix the structural missing-history bug. Option D describes a scenario that might prompt re-verification but would still not occur if the prior customer result was properly present in context.
---

## Question 3

You are implementing the agentic loop for the customer support agent. A junior engineer on your team proposes capping the loop at exactly 10 iterations as the primary mechanism to prevent infinite loops. In production, some legitimate billing dispute resolutions require 12–15 tool calls (multiple order lookups, a customer fetch, fraud checks, and a refund). What is wrong with this approach?

A) Ten iterations is too low a cap; raising it to 20 would solve the problem without changing the architecture.
B) The cap should be applied at the subagent level, not the top-level loop, to give each agent its own budget.
C) Using an arbitrary iteration cap as the primary stopping mechanism causes legitimate workflows to fail; termination should be driven by `stop_reason` with the cap as a safety net only.
D) Iteration caps are unnecessary because the model will always emit `stop_reason: "end_turn"` before any infinite loop can occur.

**Answer:** C

**Explanation:** An arbitrary cap as the *primary* stopping mechanism creates hard cutoffs that interrupt legitimate, complex workflows. The correct pattern is to drive termination by inspecting `stop_reason`: continue on `"tool_use"`, stop on `"end_turn"`. A high-value safety cap (e.g., 50 iterations) can exist as a secondary guard against runaway loops, but should never be the primary logic. Option A treats the symptom (too-low cap) without fixing the architectural error. Option B is a design consideration but doesn't address the fundamental misuse of the cap as the primary control. Option D is incorrect — `end_turn` is not guaranteed to prevent infinite agentic loops; tool results can cause the model to continue indefinitely if error conditions cycle.
---

## Question 4

Your multi-agent customer support system has a coordinator agent and three specialized subagents: a VerificationAgent (calls `get_customer`), a BillingAgent (calls `lookup_order`, `process_refund`), and an EscalationAgent (calls `escalate_to_human`). A customer submits a billing dispute. Logs show the VerificationAgent succeeds, but the BillingAgent proceeds to call `lookup_order` using the customer name from the original user message rather than the verified customer ID returned by the VerificationAgent. What is the most likely root cause?

A) The BillingAgent's tool descriptions do not specify that `lookup_order` requires a verified customer ID.
B) The coordinator did not include the VerificationAgent's output in the context it passed to the BillingAgent when spawning it.
C) The BillingAgent's system prompt instructs it to prefer user-supplied identifiers for speed.
D) The coordinator agent is using hub-and-spoke architecture incorrectly by routing the request directly to both agents in parallel.

**Answer:** B

**Explanation:** Subagents do not inherit context from the coordinator or from sibling agents automatically. Context must be explicitly passed in the subagent's invocation prompt. If the coordinator spawned the BillingAgent without including the verified customer ID from the VerificationAgent's result, the BillingAgent has no knowledge of it and falls back to whatever is available in its own prompt — in this case the customer's name from the user message. Option A could cause selection errors but would not explain why the agent uses a different identifier format. Option C is speculative and not a described behavior. Option D is incorrect — running VerificationAgent first then BillingAgent with results is correct hub-and-spoke; the problem is incomplete context passing, not parallelism.
---

## Question 5

Your coordinator agent handles high-volume support requests. For simple password reset requests, logs show the coordinator is still routing through the full pipeline — VerificationAgent, BillingAgent, EscalationAgent — before returning a password reset link. This adds 4–6 seconds of unnecessary latency for a deterministic operation. What architectural change most directly fixes this?

A) Reduce subagent timeouts so the unused agents fail fast and the coordinator can proceed sooner.
B) Design the coordinator to analyze query requirements and dynamically select only the relevant subagents to invoke, rather than always routing through the full pipeline.
C) Move password reset logic into the coordinator agent directly to avoid subagent overhead.
D) Cache the output of the VerificationAgent so subsequent identical requests skip verification.

**Answer:** B

**Explanation:** A coordinator should decompose and delegate based on what a specific query actually requires. For a password reset, no order lookup or billing operation is needed — the coordinator should invoke only the VerificationAgent (if identity is needed) and then handle the reset. Routing every request through the full pipeline regardless of complexity is a key anti-pattern. Option A addresses latency superficially and would cause actual failures for legitimate complex requests. Option C collapses the architecture rather than fixing the routing logic, and makes the coordinator harder to extend. Option D helps repeated requests but doesn't fix the structural problem of over-routing single requests.
---

## Question 6

You are designing a multi-agent system where a coordinator receives customer support tickets and delegates to specialized subagents. Two subagents are working on the same complex ticket simultaneously: SubagentA is analyzing the billing history and SubagentB is checking the shipment status. The coordinator needs to synthesize both results into a resolution. What is the correct architectural pattern for managing inter-subagent communication?

A) Allow SubagentA and SubagentB to communicate directly to merge partial findings before returning to the coordinator.
B) Have both subagents post results to a shared message queue, and let whichever finishes last trigger the synthesis step.
C) Route all inter-subagent communication through the coordinator, which aggregates results and decides when to proceed to synthesis.
D) Give both subagents read access to a shared state object so each can see what the other has found in real time.

**Answer:** C

**Explanation:** Hub-and-spoke architecture requires all inter-subagent communication to flow through the coordinator. This ensures observability, consistent error handling, and controlled information flow. Direct subagent-to-subagent communication bypasses these controls, making failure handling difficult and creating implicit dependencies. Option A creates coupling between subagents that violates the hub-and-spoke pattern and makes error propagation unpredictable. Option B introduces a shared queue that creates race conditions and loses the coordinator's ability to handle partial failures. Option D introduces shared state, which creates coordination complexity and makes individual subagent behavior harder to reason about and test.
---

## Question 7

You are configuring a coordinator agent that must spawn subagents using the `Task` tool. In testing, the coordinator generates well-structured subagent invocations but the `Task` tool is never actually called — the coordinator describes what it *would* do but takes no action. What is the most likely configuration error?

A) The subagent `AgentDefinition` objects are missing `system_prompt` fields.
B) The coordinator's `allowedTools` list does not include `"Task"`, preventing it from invoking subagents.
C) The coordinator's system prompt is too verbose, causing the model to prefer explanation over action.
D) The `Task` tool requires `tool_choice: "any"` to be set, which has not been configured.

**Answer:** B

**Explanation:** The `Task` tool is the mechanism for spawning subagents, and a coordinator can only invoke it if `"Task"` is explicitly included in its `allowedTools` list. Without this permission, the coordinator agent cannot call `Task` regardless of how well it reasons about needing to do so. Option A would affect subagent behavior once spawned but not whether the coordinator can invoke the `Task` tool at all. Option C is speculative; a verbose system prompt might reduce efficiency but the described behavior (structured reasoning, no action) is more diagnostic of a missing tool permission. Option D is incorrect — `tool_choice: "any"` forces the model to call *some* tool but is not required for `Task` specifically; the problem is the tool not being available.
---

## Question 8

Your coordinator spawns a VerificationSubagent to confirm a customer's identity before processing a $750 refund. The subagent is spawned with the following prompt: "Please verify the customer identity." The subagent calls `get_customer` with the customer's name but returns a generic verification status without the customer ID or account tier. The coordinator then cannot proceed with the refund correctly. What should be changed?

A) The subagent's `AgentDefinition` should include a stricter system prompt restricting it to only identity verification tasks.
B) The coordinator's prompt to the subagent should include the customer's details from the original ticket and specify exactly what structured data to return (e.g., verified customer ID, account tier, verification status).
C) The `get_customer` tool should be modified to always return a structured JSON object instead of variable-format responses.
D) The coordinator should parse the subagent's natural language response to extract the customer ID using a regex pattern.

**Answer:** B

**Explanation:** Subagents do not inherit context, so the coordinator must provide all necessary inputs in the prompt, including the customer's details needed for the lookup. The prompt must also specify the expected output format — if the coordinator needs a verified customer ID and account tier, it should say so explicitly. Option A addresses role boundaries but doesn't fix the missing input data or output specification. Option C would improve tool consistency but doesn't address the incomplete prompt that leaves the subagent without the data it needs to look up the right customer. Option D is an anti-pattern — parsing natural language output for structured data is fragile; structured output should be required from the subagent directly.
---

## Question 9

You want to spawn two subagents simultaneously — one to call `lookup_order` for billing details and another to call `get_customer` for account standing — to reduce end-to-end latency on complex tickets. How do you correctly implement parallel subagent invocation?

A) Make two sequential `Task` tool calls in separate coordinator turns, each waiting for the prior to complete before spawning the next.
B) Emit both `Task` tool calls in a single coordinator response turn, causing both subagents to be spawned and executed in parallel.
C) Use `tool_choice: "any"` with both tasks defined, and the SDK will automatically parallelize their execution.
D) Configure a `parallel: true` flag in each subagent's `AgentDefinition` to enable concurrent execution.

**Answer:** B

**Explanation:** Parallel subagent spawning is achieved by emitting multiple `Task` tool calls in a single coordinator response turn. When the coordinator returns multiple tool use blocks in one turn, the SDK executes them concurrently, and the coordinator receives both results before proceeding. Option A describes sequential spawning, which provides no latency benefit. Option C is incorrect — `tool_choice: "any"` forces the model to call *a* tool but does not parallelize execution; it doesn't affect the Task tool's concurrency behavior. Option D describes a configuration flag that does not exist in the `AgentDefinition` spec.
---

## Question 10

Your coordinator receives a complex ticket: "My last order arrived damaged, and I was also charged twice for a subscription renewal last month." The coordinator must investigate both issues before responding. Which task decomposition strategy is most appropriate?

A) Handle the issues sequentially: investigate the damaged order first, resolve it, then investigate the billing duplicate.
B) Escalate to a human agent immediately because multi-issue tickets exceed single-agent resolution capability.
C) Decompose into two concurrent investigation tasks — one for the order damage claim and one for the duplicate charge — sharing customer verification context, then synthesize a unified resolution.
D) Ask the customer to submit two separate tickets, one for each issue, to avoid context contamination between investigations.

**Answer:** C

**Explanation:** The correct approach for multi-concern requests is to decompose into distinct items and investigate each in parallel using shared context (the verified customer identity), then synthesize a unified resolution. This satisfies the 80% first-contact resolution target while handling complexity properly. Option A works but is slower — sequential investigation wastes time when the issues are independent and can be worked in parallel. Option B is premature escalation; multiple issues don't inherently require human intervention. Option D shifts burden to the customer unnecessarily, undermines first-contact resolution rates, and fragments context that should be shared.
---

## Question 11

The customer support agent is required by policy to call `get_customer` and verify a customer's account status before calling `process_refund`. Your system prompt currently states: "Always verify the customer account status before processing any refund." In production, logs show that in 3% of high-volume sessions, `process_refund` is called directly without prior `get_customer` verification, resulting in fraudulent refunds. What is the correct fix?

A) Strengthen the system prompt language: "You MUST ALWAYS verify the customer account status before processing any refund without exception."
B) Add five few-shot examples to the system prompt demonstrating the correct `get_customer` → `process_refund` sequence.
C) Implement a programmatic prerequisite that blocks `process_refund` from being called until `get_customer` has returned a verified customer ID in the current session.
D) Add a post-processing step that audits refund calls and reverses any that occurred without prior verification.

**Answer:** C

**Explanation:** When a specific workflow ordering is required for financial operations, programmatic enforcement provides the deterministic guarantee that prompt-based approaches cannot. Even the most carefully worded instruction has a non-zero failure rate when processed by an LLM — 3% at scale means thousands of fraudulent refunds. A programmatic gate that inspects session state and blocks `process_refund` until a verified customer ID exists is the only way to achieve guaranteed compliance. Option A and B both rely on probabilistic LLM compliance, which the production data has already demonstrated is insufficient. Option D is a compensating control, not a prevention — it requires reversing completed transactions and introduces operational overhead.
---

## Question 12

Your agent is handling a ticket where the customer wants to return an order, request a refund for a duplicate charge, and update their shipping address. The current implementation attempts to address all three in a single model turn. Logs show incomplete resolutions where one or two items are addressed but the third is omitted. What is the most effective structural fix?

A) Increase the max_tokens limit so the model has enough output budget to address all three items.
B) Decompose the request into three distinct items, investigate each in parallel using shared customer context, then synthesize a single unified response.
C) Ask the customer to prioritize their issues so the agent can address them one at a time in sequential turns.
D) Route multi-item tickets directly to human agents since they exceed the model's effective handling capacity.

**Answer:** B

**Explanation:** Decomposing multi-concern requests into distinct items with parallel investigation is the correct pattern. Each item can be investigated using the same customer context but through separate reasoning paths, then the findings are synthesized into one comprehensive response. This addresses the omission problem by giving each concern dedicated attention. Option A misdiagnoses the problem as output truncation; the issue is attention and planning across multiple concerns in a single pass. Option C shifts burden to the customer and degrades the support experience. Option D sets an incorrect threshold for escalation — multi-item requests are not inherently beyond autonomous resolution capability.
---

## Question 13

Your customer support system uses `PostToolUse` hooks to normalize data returned by MCP tools. The `lookup_order` tool returns `created_at` as a Unix timestamp (e.g., `1698765432`), while `get_customer` returns `account_since` as an ISO 8601 string (e.g., `"2023-10-31T14:30:00Z"`). Without normalization, the agent occasionally reasons incorrectly about date comparisons. What is the correct use of hooks here?

A) Modify the tool implementations to return a consistent date format, eliminating the need for hooks.
B) Add a note to the system prompt explaining both date formats and instructing the agent to convert them before comparing.
C) Implement `PostToolUse` hooks that intercept each tool's result and normalize all date fields to a single standard format (e.g., ISO 8601) before the model processes them.
D) Implement a `PreToolUse` hook that detects which tool is being called and injects date format instructions into the tool parameters.

**Answer:** C

**Explanation:** `PostToolUse` hooks are specifically designed to intercept tool results for transformation before the model processes them. Normalizing heterogeneous date formats (Unix timestamps, ISO 8601, numeric codes) from different MCP tools is a canonical use case — the model receives consistently formatted data and can reason correctly. Option A is better long-term but may not be feasible when integrating with external or third-party tools you don't control. Option B relies on probabilistic LLM compliance for a deterministic transformation that should be handled structurally — the model may still misinterpret values occasionally. Option D is the wrong hook type — `PreToolUse` intercepts outgoing calls, not incoming results; you can't fix return value formats on the way out.
---

## Question 14

Company policy states that refunds over $500 must be approved by a human agent before processing. You implement this rule by adding to the system prompt: "Do not call `process_refund` for amounts over $500 — escalate to human approval instead." In a penetration test, a prompt injection attack via a malicious order note causes the agent to bypass this instruction and call `process_refund` for $850. How should this compliance rule be enforced?

A) Improve the system prompt with stronger language and add a separate instruction at the end of the prompt where it is more salient.
B) Implement a `PreToolUse` hook that intercepts `process_refund` calls, inspects the `amount` parameter, and blocks calls exceeding $500 by returning an error and triggering the escalation workflow.
C) Add a few-shot example showing the agent correctly escalating a $600 refund, reinforcing the policy through demonstration.
D) Move the policy instruction to a separate guardrails model that reviews each tool call before execution.

**Answer:** B

**Explanation:** Business rules requiring guaranteed compliance — especially those with financial impact — must be enforced programmatically, not through prompt instructions that can be overridden by injection or model drift. A `PreToolUse` hook that intercepts the `process_refund` call and checks the `amount` parameter is deterministic: no model output can bypass it. Options A and C both reinforce a prompt-based approach that has already been demonstrated to be bypassable. Option D introduces a separate model review step, which is probabilistic (the guardrails model can also be manipulated) and adds latency; a deterministic hook is the correct tool for a deterministic rule.
---

## Question 15

You are reviewing the task decomposition strategy for your customer support agent. A common ticket type involves customers disputing charges on their account. The dispute workflow always requires the same three steps in order: (1) verify customer identity, (2) look up the disputed transaction, (3) determine eligibility based on policy. Which decomposition pattern is most appropriate here?

A) Dynamic adaptive decomposition: generate subtasks based on what is discovered at each step.
B) Fixed sequential pipeline (prompt chaining): define the three steps explicitly and execute them in order.
C) Parallel fan-out: execute all three steps simultaneously and merge results.
D) Recursive decomposition: have the agent break down each step into sub-steps until they are atomic actions.

**Answer:** B

**Explanation:** When a workflow has well-defined, predictable steps that always execute in the same order, a fixed sequential pipeline (prompt chaining) is the correct pattern. The dispute workflow described is deterministic — there are no branches based on intermediate findings that would justify dynamic decomposition. Option A (dynamic adaptive decomposition) is appropriate for open-ended investigation tasks where the next step depends on what was discovered, not for predictable three-step workflows. Option C would fail because step 3 depends on results from step 2, which depends on results from step 1 — these are not independent. Option D is over-engineering a straightforward sequential workflow into unnecessary complexity.
---

## Question 16

You are investigating why your agent resolves 68% of cases autonomously instead of the target 80%. Logs show the agent is frequently handling policy exception cases — requests that are not covered by the documented support policy (e.g., refund requests for purchases made 18 months ago when the policy only addresses 90-day returns). How should the agent handle such cases?

A) Attempt to resolve based on similar policy cases and inform the customer of the applied policy.
B) Apply the most restrictive interpretation of existing policy to prevent uncontrolled exceptions.
C) Escalate to a human agent when policy is ambiguous or silent on the customer's specific request.
D) Defer to the customer's requested resolution whenever policy doesn't explicitly prohibit it.

**Answer:** C

**Explanation:** When policy is ambiguous or silent on a customer's specific situation, the agent should escalate to a human rather than improvising. Autonomous agents should not make policy decisions that the organization hasn't authorized — acting on policy gaps risks both over-authorizing and under-authorizing resolutions at scale. Option A risks policy inconsistency and creates precedents the organization may not intend. Option B applies an unauthorized interpretation that may harm customers in legitimate edge cases. Option D is the opposite error — it would authorize resolutions the organization may explicitly not want, creating financial and legal risk.
---

## Question 17

Your system supports session resumption for ongoing customer cases. A customer contacts support a second time about a billing dispute that was investigated three days ago. The previous session included `lookup_order` results that showed a $200 overcharge. Since then, the billing team has manually corrected the charge in the backend system. An engineer suggests resuming the previous session with `--resume billing_dispute_case_42` to continue the investigation. Why is this risky?

A) Session resumption using named sessions is not supported in the Agent SDK.
B) The prior session's `lookup_order` tool results are stale — they show a $200 overcharge that no longer exists — and the resumed agent will reason from outdated data.
C) Session names must be unique across all customers, and reusing a name risks contaminating another customer's session.
D) Resuming a session resets the agent's context window, effectively starting a new conversation despite the session name.

**Answer:** B

**Explanation:** When tool results in a prior session are stale (the underlying data has changed), resuming that session means the model will reason from outdated information. In this case, the billing correction makes the prior `lookup_order` result incorrect — the resumed agent would continue believing there's a $200 overcharge that's already been resolved, potentially taking incorrect action. The correct approach when prior tool results are stale is to start a new session with a structured summary of what was previously found, then re-run tool calls to get current data. Option A is incorrect — named session resumption with `--resume <session-name>` is a documented feature. Options C and D describe behaviors that don't exist in the session management spec.
---

## Question 18

You are building a testing workflow for a customer support agent update. You want to compare two different escalation threshold strategies — conservative (escalate early) and aggressive (resolve more autonomously) — starting from the same baseline case analysis. Which session management feature most directly supports this exploration?

A) Create two separate sessions from scratch, replicating the baseline analysis in each.
B) Use `fork_session` to create two independent branches from the shared baseline session, then apply each strategy in its respective branch.
C) Use `--resume` twice on the same named session to run both strategies in sequence.
D) Run both strategies in the same session, separated by a system prompt injection to reset the agent's decision logic.

**Answer:** B

**Explanation:** `fork_session` is specifically designed for creating independent branches from a shared analysis baseline to explore divergent approaches. Both branches start from the same case analysis state, making the comparison clean and controlled. Option A works but is inefficient — replicating the baseline analysis wastes time and tokens, and any discrepancy between the two baselines confounds the comparison. Option C runs them sequentially in the same session, so the second run is contaminated by the state changes from the first. Option D is an anti-pattern — injecting system prompt changes mid-session creates unpredictable interactions with prior context.
---

## Question 19

After deploying a major update to your customer support agent, a senior engineer discovers that a `process_refund` call in an active session was made using an `order_id` that the agent looked up in the *previous* session before the update. The order no longer exists in the new system. The engineer wants to resume the prior session and inform the agent about the data migration. What is the correct approach?

A) Use `--resume` to continue the prior session, then explicitly tell the agent which specific data has changed so it can perform targeted re-analysis rather than full re-exploration.
B) Always start a completely fresh session after any system update, as resumed sessions are too risky.
C) Fork the prior session and apply the system update to the forked branch to isolate the impact.
D) Resume the prior session and instruct the agent to re-run all tool calls from the beginning to refresh its context.

**Answer:** A

**Explanation:** When resuming a session after changes to previously analyzed data, the correct approach is to use `--resume` and explicitly inform the agent about the specific changes (which `order_id` is invalid, what the correct mapping is post-migration) so it can perform targeted re-analysis. This is more efficient and reliable than a full re-exploration. Option B is overly conservative — not every update requires abandoning prior context; the key is being clear about what has changed. Option C uses forking for a scenario that doesn't require divergent exploration — it's just an update to existing context. Option D would unnecessarily re-run all tool calls including ones whose results are still valid, wasting tokens and time.
---

## Question 20

Your support agent uses dynamic adaptive decomposition to investigate open-ended account issues. A customer reports "something seems wrong with my account." The agent generates an initial investigation plan, discovers a pending duplicate charge, and now needs to decide the next subtask. Which approach correctly reflects adaptive decomposition for this workflow?

A) Follow the pre-defined resolution workflow regardless of what was found, to ensure consistent handling.
B) Generate the next subtask based on the finding — e.g., create a "verify duplicate charge details" subtask using `lookup_order` before deciding on remediation.
C) Complete the investigation plan before taking any action, even if the root cause becomes clear at an intermediate step.
D) Escalate to a human because open-ended investigations with unknown root causes exceed autonomous agent capability.

**Answer:** B

**Explanation:** Dynamic adaptive decomposition means generating subtasks based on what is discovered at each step, not following a pre-defined script. Discovering a duplicate charge should generate a targeted follow-up subtask to verify and investigate that specific finding. This is the defining characteristic of adaptive versus fixed decomposition. Option A is the opposite pattern — fixed pipelines are for predictable workflows, not open-ended investigation. Option C creates unnecessary latency by delaying action even when the path forward is clear. Option D sets an incorrect threshold; open-ended investigations are exactly the use case for autonomous agents with adaptive decomposition — ambiguity in the initial request does not mean the agent cannot resolve it.
---

## Question 21

Your coordinator agent receives a ticket and must decide which subagents to invoke. The ticket reads: "My last order never arrived." You have a VerificationSubagent, a ShippingSubagent, a BillingSubagent, and an EscalationSubagent. What does correct coordinator behavior look like for this ticket?

A) Invoke all four subagents in parallel to gather maximum context before synthesizing a response.
B) Invoke only the VerificationSubagent and ShippingSubagent based on the ticket content, route their results back through the coordinator, and synthesize a resolution.
C) Invoke the EscalationSubagent immediately since non-delivery cases require human investigation.
D) Invoke the BillingSubagent first, since refunds may be necessary, and defer verification until the billing status is known.

**Answer:** B

**Explanation:** The coordinator should analyze the query and dynamically select only the subagents relevant to the ticket. A non-delivery issue requires customer verification (VerificationSubagent) and shipping status investigation (ShippingSubagent). The BillingSubagent is not needed unless a refund becomes necessary, and the EscalationSubagent is not needed unless resolution fails. Option A over-invokes — running all subagents adds unnecessary latency and cost for subagents whose output will not be used. Option C is premature escalation; non-delivery is a standard resolvable case. Option D gets the dependency direction wrong — customer verification should precede order lookups, and billing is not the first step for a shipping issue.
---

## Question 22

Your team reviews coordinator prompts and finds that one coordinator prompt reads: "First, call the VerificationSubagent. Then call the BillingSubagent with its result. Then call the ShippingSubagent with the billing result. Finally, synthesize." A more senior engineer suggests replacing this with a prompt that specifies research goals and quality criteria instead. What is the advantage of the goal-oriented approach?

A) Goal-oriented prompts are shorter, reducing token usage and cost.
B) Goal-oriented prompts enable the coordinator to adapt its subagent selection and sequencing based on what each step reveals, rather than blindly following a fixed procedure that may be inappropriate for certain ticket types.
C) Goal-oriented prompts eliminate the need for error handling since the coordinator can improvise recovery steps.
D) Step-by-step procedural prompts are actually preferable when deterministic workflow ordering is required.

**Answer:** B

**Explanation:** Specifying goals and quality criteria rather than step-by-step procedures allows the coordinator to exhibit adaptive behavior — selecting different subagents, changing order, or skipping unnecessary steps based on intermediate findings. A procedural prompt makes the coordinator rigid and may be incorrect for tickets that don't fit the assumed sequence. Option A is a secondary benefit but not the primary reason for the change. Option C is incorrect — error handling must still be explicitly designed; goal-oriented prompts don't eliminate failure modes. Option D is correct in some contexts (deterministic compliance workflows), but the question is specifically about research-style coordinator behavior where adaptability is the goal, not rigid ordering.
---

## Question 23

You need to pass context from a completed VerificationSubagent run to the BillingSubagent. The verification result includes: the verified customer ID, account tier, verification timestamp, and the source tool call that produced it. How should this context be structured when passed to the BillingSubagent?

A) Summarize the verification result in a natural language sentence: "Customer verified as premium tier, ID 48291."
B) Pass the raw tool result JSON blob directly without modification.
C) Use structured data formats that separate the content fields (customer ID, tier) from metadata (verification timestamp, source tool name) to preserve attribution.
D) Pass only the customer ID, as additional context increases token usage without adding value for billing operations.

**Answer:** C

**Explanation:** Structured data formats that separate content from metadata are the correct pattern for inter-agent context passing. The BillingSubagent needs the customer ID and tier (content) to do its work, but the metadata (timestamp, source tool) supports attribution and auditability — especially important in financial workflows. Option A loses the structured fields and metadata, making downstream processing fragile. Option B passes raw tool output that may include irrelevant fields and no metadata structure, making it harder for the BillingSubagent to extract what it needs. Option D optimizes token usage at the cost of auditability, losing provenance information that is critical for dispute resolution and compliance.
---

## Question 24

Your coordinator agent is tasked with resolving a complex ticket that requires actions across three subagents. You want to give the coordinator maximum flexibility to decide how to route and sequence the work. Which coordinator prompt design principle is most appropriate?

A) Specify the exact tool call sequence: "Call VerificationSubagent, then BillingSubagent with result, then EscalationSubagent."
B) Describe the resolution goal and quality criteria (e.g., "Achieve verified, complete resolution of the customer's billing issue, confirming all affected charges have been addressed") and let the coordinator determine the appropriate subagent sequence.
C) List all possible subagents in priority order and instruct the coordinator to try each until one succeeds.
D) Provide the coordinator with a decision tree that maps ticket keywords to subagent invocation sequences.

**Answer:** B

**Explanation:** Coordinators should receive goal-oriented prompts specifying what needs to be achieved and the quality bar for completion, enabling adaptive decision-making about which subagents to invoke and in what order. This allows the coordinator to respond intelligently to intermediate findings. Option A is a procedural prescription that removes adaptability and may be incorrect for tickets that deviate from the assumed flow. Option C is a trial-and-error approach that would invoke unnecessary subagents and produce inconsistent results. Option D implements a deterministic decision tree, which is appropriate for rule-based routing but not for a coordinator that should exhibit intelligent, context-sensitive orchestration.
---

## Question 25

Your agent frequently handles the case where a customer requests a refund on a damaged item. The workflow involves five distinct steps. You are considering whether to use fixed prompt chaining or dynamic decomposition. The steps are always: (1) verify identity, (2) look up order, (3) confirm damage evidence, (4) check return policy, (5) issue refund or escalate. Which approach is correct and why?

A) Dynamic decomposition, because the outcome of step 3 (damage evidence) determines whether step 5 results in a refund or escalation.
B) Fixed sequential pipeline, because the steps are predictable, always occur in the same order, and each feeds into the next.
C) Parallel fan-out, because steps 1–4 are independent and can be gathered simultaneously before step 5.
D) Dynamic decomposition, because any multi-step process with more than three steps requires adaptive planning.

**Answer:** B

**Explanation:** This workflow has well-defined, predictable steps that always execute in the same order. The fact that step 5 has two outcomes (refund vs. escalate) based on step 3 is a branching decision *within* the pipeline, not a reason to use dynamic decomposition — the sequence of what data to gather is still fixed. Fixed prompt chaining is the correct pattern here. Option A confuses conditional outcomes with dynamic decomposition; branching logic can exist within a fixed pipeline. Option C is incorrect because step 2 depends on step 1 (need verified identity to look up the right order), and step 4 depends on step 2 (need the order to check policy) — they are not independent. Option D is false — step count alone does not determine decomposition strategy; predictability does.
---

## Question 26

Your team is debating whether `PostToolUse` hooks or system prompt instructions are more appropriate for enforcing the rule that `process_refund` should never be called with a `reason` field containing the string "test" in production. What is the correct technical reasoning for choosing hooks?

A) Hooks execute faster than prompt instruction processing, reducing end-to-end latency.
B) Hooks provide deterministic guarantees — they intercept and inspect every tool call regardless of model output, while prompt instructions are probabilistic and can be bypassed by adversarial input or model error.
C) Hooks are easier to maintain than system prompts because they don't require re-testing after model updates.
D) The system prompt is already too long, and moving enforcement logic to hooks reduces token usage.

**Answer:** B

**Explanation:** The fundamental distinction between hooks and prompt-based enforcement is determinism. A `PreToolUse` hook that inspects the `reason` parameter will catch every violation unconditionally. A system prompt instruction has a non-zero failure rate — the model may comply 99.9% of the time, but at scale that means real violations. For rules that must be guaranteed (especially in production financial systems), hooks are the correct tool. Option A is a secondary consideration that is often not even true — hook overhead is minimal but the primary reason for choosing them is correctness guarantees, not speed. Option C has some validity but is not the core technical argument. Option D is a secondary benefit, not the reason to use hooks for compliance enforcement.
---

## Question 27

During a three-day-long complex billing investigation, your agent's session has accumulated extensive context. A new engineer suggests using `fork_session` to create a branch for testing a new resolution hypothesis without affecting the main investigation. The main session is still active and the customer is waiting for a response on the original investigation path. Is `fork_session` appropriate here?

A) No — `fork_session` terminates the original session, so the main investigation would be lost.
B) Yes — `fork_session` creates an independent branch from the current state, allowing the new hypothesis to be tested without modifying the main session's context.
C) No — `fork_session` is only available for code exploration tasks, not customer support workflows.
D) Yes — but only if the original session is saved to a named checkpoint first, as forking requires a named anchor point.

**Answer:** B

**Explanation:** `fork_session` is designed exactly for this scenario: creating independent branches from a shared analysis baseline to explore divergent approaches. The original session remains intact and unmodified. The forked branch starts from the current state and can be explored independently. Option A is incorrect — forking does not terminate the original session; it creates a copy. Option C is incorrect — session forking is a general Agent SDK capability, not restricted to code exploration. Option D is incorrect — `fork_session` can be performed from the current active session state without requiring a separately named checkpoint.
---

## Question 28

Your support agent has four tools: `get_customer`, `lookup_order`, `process_refund`, and `escalate_to_human`. Their current descriptions are: "Get customer data," "Get order data," "Process a refund," and "Escalate issue." Logs show the agent calls `get_customer` for 23% of order lookup requests and `lookup_order` for 11% of customer verification requests. What is the most likely root cause and fix?

A) The tools have insufficient rate limiting, causing the agent to retry failed calls with the wrong tool.
B) The tool descriptions are too minimal — they don't include accepted input formats, example queries, edge cases, or boundaries explaining when to use each tool versus similar alternatives, leading to unreliable selection.
C) The agent's system prompt has keyword-sensitive instructions that create unintended associations between customer-related language and `get_customer`.
D) The tools should be consolidated into a single `lookup_entity` tool that accepts any identifier and internally routes to the correct backend.

**Answer:** B

**Explanation:** Tool descriptions are the primary mechanism LLMs use for tool selection. With descriptions as minimal as "Get customer data" and "Get order data," the model lacks the context to reliably differentiate when to use each. Adding input formats, example queries, and explicit boundary explanations (e.g., "Use this tool when the customer provides an account email or phone number; use `lookup_order` when they provide an order number or tracking ID") directly addresses the misrouting. Option C is possible but is a secondary issue — the primary problem is the minimal descriptions. Option A is unrelated to tool selection logic. Option D would reduce selection errors but is a heavier architectural change than simply improving descriptions, and consolidation may reduce the agent's ability to reason clearly about what each operation does.
---

## Question 29

After improving tool descriptions, you review the `process_refund` description and find it reads: "Processes a refund for an order. Accepts order_id and amount." A colleague suggests adding: "Use this tool ONLY after `get_customer` has verified the customer account and `lookup_order` has confirmed the order exists. Do NOT call this tool if the refund amount exceeds $500 — escalate instead. Returns a confirmation_id on success." What does this addition accomplish?

A) It eliminates the need for programmatic enforcement of the $500 threshold since the description now communicates the rule.
B) It improves tool selection reliability by clarifying the tool's pre-conditions, usage boundaries, and output contract, reducing the chance of premature or policy-violating invocations.
C) It creates a dependency between tools that could cause the agent to refuse all refunds if `get_customer` times out.
D) It makes the tool description too long, degrading LLM performance on tool selection due to increased context length.

**Answer:** B

**Explanation:** Adding pre-conditions, usage boundaries, output contracts, and explicit edge cases to a tool description directly improves the model's ability to use the tool correctly and in the right context. The model can see what it should have done before calling this tool and what it should do instead in edge cases. Option A is a dangerous misconception — description-based constraints are probabilistic, not guaranteed. The $500 threshold still needs programmatic enforcement for deterministic compliance. Option C is theoretically possible in a poorly designed system but well-architected tools should not create hard dependencies in their descriptions that prevent fallback behavior. Option D is false — richer descriptions improve selection accuracy; the marginal cost of longer descriptions is outweighed by improved reliability.
---

## Question 30

Your `process_refund` MCP tool encounters a policy violation when called with an amount of $750. The tool currently returns: `{"status": "failed", "message": "Operation failed."}`. The agent retries the call three times before giving up and returning a generic error to the customer. What is wrong with this error response?

A) The tool should return an HTTP 422 status code instead of a JSON error object.
B) The generic error response hides the business error type and retryability status — the agent cannot distinguish a policy violation (non-retryable) from a transient service failure (retryable), so it wastes retries and cannot communicate the real reason to the customer.
C) The tool should raise an exception rather than returning an error JSON, so the orchestration layer can catch and handle it.
D) The tool is correct to return a generic message to prevent exposing internal business logic to the agent.

**Answer:** B

**Explanation:** Structured error responses must include enough context for the agent to make appropriate recovery decisions. A policy violation (amount exceeds $500) is non-retryable — the correct response is to escalate, not retry. A transient service timeout is retryable. When both map to "Operation failed," the agent cannot distinguish them and will retry non-retryable errors, wasting resources and creating bad customer experiences. The correct response should include `errorCategory: "business_rule"`, `isRetryable: false`, and a human-readable explanation. Option A is a transport-level concern irrelevant to agent behavior. Option C introduces exception-based control flow that is harder to handle structurally in agent orchestration. Option D is incorrect — the agent needs business error context to route appropriately; hiding it degrades system behavior.
---

## Question 31

Your `lookup_order` tool returns the following error when an order ID is not found: `{"isError": true, "errorCategory": "not_found", "message": "No order found for ID ORD-99234"}`. Separately, when the order database is unreachable due to a network partition, it returns: `{"isError": true, "errorCategory": "service_unavailable", "message": "Order service temporarily unavailable", "isRetryable": true}`. An engineer argues that both should be collapsed to a single `{"isError": true, "message": "Order lookup failed"}` to simplify the tool. Why is this wrong?

A) It would make error logs harder to read for human operators.
B) It conflates access failures (needing retry decisions and alternative approaches) with valid empty results (where no order exists and retrying is meaningless), preventing the agent from making correct recovery decisions.
C) The MCP specification requires separate error codes for each failure type.
D) Collapsing errors would prevent the agent from generating accurate customer-facing messages.

**Answer:** B

**Explanation:** These are fundamentally different situations requiring different agent behaviors. "No order found" is a valid result — the agent should inform the customer and potentially ask for a different identifier. "Service unavailable" is a transient failure — the agent should retry with backoff or report a temporary service issue. Collapsing them forces the agent to treat a legitimate "no results" query as a failure requiring retry, and potentially treats service outages as "no order found" situations. Option A is a valid concern but not the core reason — the problem is incorrect agent behavior, not log readability. Option C is a process concern, not a design principle. Option D is a downstream effect, but the primary issue is incorrect recovery behavior, not just message generation.
---

## Question 32

Your BillingSubagent encounters a transient timeout while calling `lookup_order` mid-investigation. The subagent has already successfully retrieved customer data and partial order history. How should the subagent handle this error?

A) Immediately propagate the timeout exception to the coordinator with no other information, halting the workflow.
B) Silently suppress the error, return the partial order history as a complete result marked as successful.
C) Implement local retry with exponential backoff for the transient failure; if retries are exhausted, propagate to the coordinator with structured context including the failure type, what was attempted, partial results retrieved, and suggested alternative approaches.
D) Terminate the entire billing investigation and instruct the customer to try again later.

**Answer:** C

**Explanation:** The correct error handling pattern for subagents is: attempt local recovery for transient failures (retry with backoff is appropriate for timeouts), and only propagate errors that cannot be resolved locally. When propagating, include structured context — what was attempted, partial results, failure type, and alternatives — so the coordinator can make an intelligent recovery decision. Option A loses all partial results and provides no context for recovery. Option B is the worst option — marking failure as success prevents any recovery and may cause the coordinator to proceed with incomplete data, leading to incorrect resolutions. Option D terminates the workflow prematurely when recovery strategies (retry, alternative source) could succeed.
---

## Question 33

Your customer support agent has 18 tools available: the 4 core tools plus 14 additional tools for analytics, reporting, admin functions, account management, and internal tooling. Logs show the agent frequently calls `admin_reset_account` when customers ask about login issues, instead of the appropriate `get_customer` followed by account status check. What is the most effective architectural fix?

A) Add a note to the system prompt: "Only use admin tools when the customer has explicitly requested administrative actions."
B) Reduce the agent's accessible tool set to the 4–5 tools needed for customer-facing resolution tasks; route requests requiring other tools to specialized subagents or humans.
C) Improve the descriptions of all 18 tools to more clearly differentiate their purposes and expected use cases.
D) Implement a pre-call validation hook that checks whether each tool call is appropriate for the current ticket type before allowing execution.

**Answer:** B

**Explanation:** Providing an agent access to too many tools degrades tool selection reliability by increasing decision complexity. The agent has 18 tools — far more than the 4–5 needed for customer-facing resolution. Restricting the agent to only the tools relevant to its role (scoped tool access) directly addresses the misuse. Option A relies on probabilistic prompt compliance for a problem rooted in excessive tool availability — the system prompt instruction will be inconsistently followed. Option C would improve the situation but still leaves 18 tools available, maintaining the selection complexity that causes misuse. Option D adds overhead to every call but doesn't address the root cause; even with validation, the agent would still attempt inappropriate calls.
---

## Question 34

You need the customer support agent to always call `get_customer` as its first action on every new ticket, before considering any other tool. How do you configure this behavior deterministically?

A) Add to the system prompt: "Your first action on every ticket must be to call `get_customer` to verify the customer."
B) Use `tool_choice: {"type": "tool", "name": "get_customer"}` for the first API call, ensuring the model is forced to call `get_customer` before anything else, then process subsequent steps normally.
C) Set `tool_choice: "any"` to guarantee the model calls a tool rather than returning text, and rely on tool descriptions to guide it toward `get_customer`.
D) Add a few-shot example at the top of every conversation showing `get_customer` being called first.

**Answer:** B

**Explanation:** `tool_choice: {"type": "tool", "name": "get_customer"}` forces the model to call the specified tool in that turn, providing a deterministic guarantee for the first step. This is the correct use of forced tool selection. After that first call, subsequent turns can use `tool_choice: "auto"`. Option A relies on prompt instructions, which have a non-zero failure rate for this mandatory first step. Option C guarantees *some* tool is called but does not guarantee it will be `get_customer` — the model might call `lookup_order` or another tool. Option D is probabilistic; few-shot examples improve consistency but don't guarantee the first-call behavior in all cases, especially with novel or complex ticket formats.
---

## Question 35

Your organization stores the customer support agent's MCP tool configurations in a version-controlled repository. The MCP server configurations include an API key for the backend order management system. A developer has hardcoded the key directly in `.mcp.json` as `"api_key": "sk-prod-98f3a..."`. What is wrong with this and how should it be fixed?

A) The API key format is wrong; it should use a base64-encoded format for MCP compatibility.
B) Hardcoding credentials in `.mcp.json` will be committed to version control, exposing the secret. Use environment variable expansion instead: `"api_key": "${ORDER_MGMT_API_KEY}"`, and set the actual value in the deployment environment.
C) The API key should be stored in a `~/.claude.json` user-level configuration instead of the project-level `.mcp.json`.
D) MCP servers cannot accept API keys directly; they must use OAuth tokens passed via request headers.

**Answer:** B

**Explanation:** Credentials must never be hardcoded in version-controlled files. `.mcp.json` supports environment variable expansion (e.g., `${ORDER_MGMT_API_KEY}`), which allows the configuration file to be safely committed while the actual secret is injected at runtime through the deployment environment. Option A is incorrect — the format of the key string is not the issue; committing any secret value is. Option C would move the key to a user-level file that isn't version-controlled, which solves the leak problem but breaks team sharing — the project-level `.mcp.json` should be used with env var expansion. Option D is incorrect — MCP server configurations can accept API keys in various formats; the specific mechanism depends on the server implementation.
---

## Question 36

Your team is debating whether to configure the order management MCP server in the project-level `.mcp.json` file or in each developer's user-level `~/.claude.json`. The order management MCP is used by all team members working on the customer support agent, and the configuration is stable. Which choice is correct and why?

A) User-level `~/.claude.json` — each developer should manage their own MCP server configuration to avoid conflicts.
B) Project-level `.mcp.json` — shared team tooling used by all developers on a project should be version-controlled in the project repository so it's automatically available when the repo is cloned.
C) Both — configure it in `.mcp.json` for the project default and allow individual developers to override in `~/.claude.json`.
D) Neither — production MCP servers should be configured in a separate infrastructure configuration system, not in Claude configuration files.

**Answer:** B

**Explanation:** Project-scoped `.mcp.json` is designed exactly for shared team tooling that should be available to all developers. Committing it to the repository ensures every team member gets the correct configuration when they clone or pull the repo without manual setup. Option A is correct for personal or experimental servers but wrong for shared production tooling — requiring each developer to manually configure the same server is error-prone and inconsistent. Option C creates unnecessary duplication and potential conflicts between project and user configurations. Option D is overly restrictive; Claude Code's MCP configuration system is designed to handle team tooling configurations via `.mcp.json`.
---

## Question 37

Your customer support agent uses the `escalate_to_human` MCP tool. The tool's current description is: "Escalates the issue." When analyzing logs, you find that the agent rarely calls this tool even in cases that clearly warrant escalation (e.g., policy exceptions, fraud investigations). A colleague suggests the agent might be preferring to use `process_refund` with zero-dollar amounts as a workaround. What should you do first?

A) Add a system prompt instruction: "When in doubt, escalate using `escalate_to_human`."
B) Enhance the `escalate_to_human` tool description to clearly explain when to use it (specific escalation triggers), what it does, what inputs it expects, and how it differs from attempting autonomous resolution.
C) Remove `process_refund` from the agent's available tools to prevent the workaround behavior.
D) Deploy a separate classifier that monitors agent behavior and injects tool calls when escalation criteria are detected.

**Answer:** B

**Explanation:** The minimal tool description "Escalates the issue" gives the model almost no signal about when to use it. A richer description that specifies escalation triggers (e.g., "Use when: customer explicitly requests a human, policy exception is needed, fraud is suspected, or autonomous resolution has failed after 2+ attempts"), expected inputs, and contrast with autonomous resolution will directly improve selection. Option A adds a vague prompt instruction that doesn't address the root cause (unclear boundaries). Option C removes a tool the agent legitimately needs for non-escalation cases and doesn't fix the misunderstanding of when to escalate. Option D is over-engineered infrastructure for a problem that should be fixed at the tool description level first.
---

## Question 38

An engineer proposes replacing your four separate tools (`get_customer`, `lookup_order`, `process_refund`, `escalate_to_human`) with a single generic `customer_service_action` tool that accepts an `action_type` parameter. The argument is that this simplifies the tool interface. What is the primary problem with this design?

A) Generic tools with action_type parameters require more tokens to call than separate tools.
B) A single generic tool loses the differentiated descriptions that help the model select the right action, increases parameter complexity inside the tool, and makes it harder for the model to understand the distinct pre-conditions, outputs, and use cases for each operation.
C) The MCP specification does not support parameterized action types in tool definitions.
D) A single tool cannot handle the different authentication requirements for each action.

**Answer:** B

**Explanation:** Tool descriptions are the primary mechanism for LLM tool selection. When four distinct operations — each with different pre-conditions, inputs, outputs, and use cases — are collapsed into one generic tool, the model loses all the differentiation signals that make correct selection reliable. The model must now parse an `action_type` enum internally, which moves the selection logic inside the tool where it's harder to guide through descriptions. Splitting into purpose-specific tools with clear, differentiated descriptions is explicitly the recommended pattern. Option A is a minor consideration. Option C is incorrect — MCP supports parameterized tools. Option D may be valid in some implementations but is not the primary design problem with the consolidation.
---

## Question 39

You are configuring tool access for a multi-agent customer support system. The VerificationSubagent should only call `get_customer`. The BillingSubagent should only call `lookup_order` and `process_refund`. The EscalationSubagent should only call `escalate_to_human`. In testing, you observe the BillingSubagent occasionally calls `escalate_to_human` directly when it encounters an unresolvable billing issue, bypassing the coordinator. Why is this problematic and how should it be fixed?

A) Direct escalation is technically fine; the coordinator can see escalation calls in the transcript.
B) The BillingSubagent calling `escalate_to_human` directly bypasses the coordinator's error handling and decision logic. Fix by removing `escalate_to_human` from the BillingSubagent's `allowedTools` and having it return structured error context to the coordinator instead, which then decides whether to invoke the EscalationSubagent.
C) Configure the `escalate_to_human` tool to reject calls from the BillingSubagent using caller identity checks.
D) Add a system prompt instruction to the BillingSubagent: "Never call `escalate_to_human` directly; always return to the coordinator first."

**Answer:** B

**Explanation:** The hub-and-spoke pattern requires all escalation decisions to flow through the coordinator. When the BillingSubagent calls `escalate_to_human` directly, it bypasses the coordinator's ability to evaluate whether escalation is truly needed, add billing context to the escalation, or try alternative resolution paths first. The correct fix is to remove the tool from the subagent's `allowedTools` — a hard technical restriction — and design the subagent to return structured error context to the coordinator when it cannot resolve the issue. Option A is incorrect — the coordinator being able to see the call in a transcript does not mean it was involved in the decision. Option C introduces coupling between tools and calling agents, which is not the right design layer for this control. Option D relies on probabilistic prompt compliance for a structural access control problem.
---

## Question 40

Your `get_customer` MCP tool searches for customers by email. Sometimes, a search returns multiple matching records (e.g., two accounts with the same email from a merge). Currently the tool returns the first result, silently ignoring duplicates. The agent then processes refunds for the wrong customer 4% of the time. What is the correct tool behavior?

A) Return the most recently created account when duplicates exist, since it is most likely current.
B) Return the customer record with the highest account value, since it is most likely the primary account.
C) Return all matching records with a flag indicating multiple matches were found, and include guidance in the tool description that the caller should request additional identifiers from the customer to disambiguate.
D) Return an error indicating the search is ambiguous and the agent should try a different search approach.

**Answer:** C

**Explanation:** When multiple customer matches exist, the correct behavior is to surface all matches with a clear signal (e.g., `multipleMatchesFound: true`, list of results) so the agent can ask the customer for additional identifying information (phone number, order number, date of birth) to disambiguate. Silently selecting based on heuristics (most recent, highest value, first result) produces incorrect resolutions at scale. Option A and B both silently pick one record using heuristics — this is the exact pattern causing the 4% error rate. Option D returns an error that forces the agent into a failure recovery path when this is actually a normal case requiring a clarification step, not an error.
---

## Question 41

You are building a customer support agent that integrates with an existing third-party CRM via its published MCP server. You also need a custom tool that normalizes data between the CRM format and your internal order management format. How should you structure these integrations?

A) Build a single custom MCP server that wraps the third-party CRM and adds the normalization logic inside each tool.
B) Use the existing community CRM MCP server for standard CRM operations and build a small custom MCP server only for the normalization and team-specific workflow tools that the community server doesn't provide.
C) Build all tools in a single custom MCP server to avoid multiple server connection overhead.
D) Avoid MCP for third-party integrations; use direct API calls from the agent's tool handler functions instead.

**Answer:** B

**Explanation:** The correct approach is to use existing community MCP servers for standard integrations (like CRM access) and reserve custom implementations for team-specific workflows that the community server doesn't cover. Building a full custom wrapper for the CRM adds maintenance burden without adding value when a community server already exists. Option A creates unnecessary maintenance work for CRM functionality that's already available. Option C consolidates tools in one server for operational simplicity but sacrifices the maintainability benefit of using the existing CRM server. Option D rejects the MCP approach entirely without justification; MCP servers provide structured, discoverable interfaces that work well with agent tool selection.
---

## Question 42

Your customer support agent frequently makes exploratory `lookup_order` calls to understand what order types and statuses are possible before resolving a ticket. These exploratory calls add latency and token cost. You have a catalog of all possible order types, status codes, and common resolution paths. How can MCP resources help?

A) Create a `get_order_metadata` tool that returns the catalog on demand when the agent needs reference information.
B) Expose the order type catalog, status codes, and common resolution paths as MCP resources, giving the agent visibility into available data without requiring exploratory tool calls.
C) Embed the full catalog in the system prompt so the agent always has it available without any tool calls.
D) Cache the catalog in the agent's memory after the first exploratory call using a session-level variable.

**Answer:** B

**Explanation:** MCP resources are specifically designed to expose content catalogs and reference data to reduce exploratory tool calls. Resources are available at connection time as discoverable content, separate from tool calls. The agent can reference the catalog without making transactional tool calls, reducing latency and token cost. Option A still requires a tool call to retrieve the catalog, preserving the latency overhead. Option C embeds the catalog in every system prompt, consuming tokens on every request even when the catalog isn't needed — this is wasteful for large catalogs. Option D creates session state management complexity and still requires an initial exploratory call to populate the cache.
---

## Question 43

You are reviewing the tool descriptions for your MCP server. The `lookup_order` description says: "Looks up an order." The `get_customer` description says: "Gets customer information." Both tools accept a string identifier. An engineer proposes adding to each description: the specific identifier format expected, example valid inputs, what the tool returns on success, and at least two boundary conditions (e.g., "Returns multiple records if email matches multiple accounts; use customer_id for unambiguous lookup"). After this change, tool misrouting drops from 18% to 2%. What principle does this demonstrate?

A) Shorter descriptions are always better for LLM tool selection because they reduce cognitive load.
B) Tool descriptions are the primary mechanism LLMs use for tool selection; rich, specific descriptions including input formats, example queries, edge cases, and boundaries dramatically improve selection reliability.
C) Tool selection errors are primarily caused by model limitations, not description quality.
D) Boundary conditions in descriptions reduce selection accuracy by making tools seem overly restrictive.

**Answer:** B

**Explanation:** This scenario is a direct demonstration of the core principle: tool descriptions are the primary mechanism LLMs use for tool selection, and minimal descriptions lead to unreliable selection among similar tools. The dramatic improvement (18% → 2% misrouting) after adding input formats, examples, and boundary conditions validates that description quality is the primary lever for tool selection reliability. Option A is wrong — minimal descriptions are precisely what caused the 18% misrouting rate. Option C is wrong — the problem was definitively the description quality, as demonstrated by the improvement after the change. Option D is wrong — boundary conditions help the model understand when *not* to use a tool, which is essential for disambiguation.
---

## Question 44

Your support agent needs to guarantee it calls a specific verification tool before proceeding with any resolution. You've set `tool_choice: "any"` for the first API call. In 7% of cases, the agent calls `lookup_order` instead of the required `get_customer`. What configuration change would eliminate this?

A) Change `tool_choice` from `"any"` to `"auto"` to give the model more freedom to select the best first tool.
B) Change `tool_choice` to `{"type": "tool", "name": "get_customer"}` to force the model to call `get_customer` specifically on the first turn.
C) Add a system prompt instruction: "Your absolute first tool call must always be `get_customer`."
D) Move `get_customer` to the top of the tools array, since LLMs have recency bias toward earlier-listed tools.

**Answer:** B

**Explanation:** `tool_choice: "any"` guarantees the model calls *a* tool, but does not guarantee which tool it calls. The `{"type": "tool", "name": "get_customer"}` forced selection is the only `tool_choice` option that guarantees a specific tool is called. This eliminates the 7% error rate deterministically. Option A (`"auto"`) is even less restrictive than `"any"` — it allows the model to return text instead of a tool call, making the problem worse. Option C is a prompt instruction with a non-zero failure rate (the 7% case demonstrates that prompt guidance alone is insufficient). Option D is a misconception — tool array ordering does not reliably bias tool selection in LLMs.
---

## Question 45

Your `process_refund` MCP tool is being called by both the customer support agent and an internal audit agent. The support agent should be able to issue refunds up to $500. The audit agent should be able to issue refunds up to $5,000 for compliance corrections but should never be able to escalate to humans. How should you configure tool access for these two agents?

A) Create a single shared `process_refund` tool and rely on the agents' system prompts to enforce the different limits.
B) Create two versions of `process_refund` — `process_refund_support` with a $500 cap enforced in the tool implementation, and `process_refund_audit` with a $5,000 cap — and configure each agent's `allowedTools` to include only the appropriate version.
C) Create one `process_refund` tool with an `agent_role` parameter that the calling agent passes to get the appropriate limit applied.
D) Use `tool_choice` configuration to restrict each agent to its own refund limit at the SDK level.

**Answer:** B

**Explanation:** Creating purpose-specific tool variants with limits enforced in the tool implementation provides deterministic access control. Each agent gets only the tool appropriate for its role. This is the principle of scoped tool access: give agents only the tools needed for their role. Separate implementations mean limits are enforced in code, not in prompt instructions. Option A relies on system prompts to enforce financial limits, which is probabilistic and can be overridden. Option C introduces agent self-identification, which can be spoofed or mishandled; limits should not depend on a parameter the calling agent provides. Option D misuses `tool_choice`, which controls which tools are called in a given turn, not which agents have access to which tools.
---

## Question 46

Your customer support agent is handling a long billing dispute that has accumulated 47 API turns. The session began with a `get_customer` call that returned 38 fields of customer data, a `lookup_order` call that returned 52 fields, and a second `lookup_order` for a related order with another 52 fields. The agent is now reasoning incorrectly about the original overcharge amount, citing "$120" when the initial lookup showed "$240." What is the most likely cause?

A) The model's arithmetic capabilities are degrading as the context grows.
B) Verbose tool outputs (38–52 fields per lookup) are consuming a disproportionate share of the context, causing the original values to be displaced toward the middle of the context where they are most likely to be omitted — the "lost in the middle" effect.
C) The conversation has exceeded the model's maximum context window, truncating the earliest turns.
D) The `lookup_order` tool is returning inconsistent values across invocations.

**Answer:** B

**Explanation:** The "lost in the middle" effect is a well-documented phenomenon where models reliably process information at the beginning and end of long inputs but may omit findings from middle sections. With 52-field tool responses for each of two orders, the initial $240 figure is buried in the middle of a very long context, making it prone to omission during reasoning. The fix is to trim verbose tool outputs to only relevant fields before they accumulate, and to extract transactional facts into a persistent "case facts" block. Option A is not accurate — arithmetic doesn't degrade with context length. Option C is possible but the question describes specific middle-context omission, not general truncation. Option D would affect current queries, not historical values already in context.
---

## Question 47

You are building a mitigation strategy for the context management problem in Q46. Which approach best addresses the root cause?

A) Switch to a model with a larger context window to accommodate all 52-field responses.
B) Extract the key transactional facts (overcharge amount: $240, order ID: ORD-48291, original charge: $480, dispute amount: $240) into a persistent "case facts" block that is included at the beginning of each subsequent prompt, outside the summarized conversation history.
C) Summarize the tool results into a single paragraph ("Customer was charged $480 for order ORD-48291; disputed $240") to reduce context length.
D) Ask the customer to repeat the key details at regular intervals to re-introduce the information into the active context.

**Answer:** B

**Explanation:** The correct approach is to extract specific transactional facts — amounts, order numbers, statuses, dates — into a persistent structured block that is explicitly included at the start of each prompt. This keeps the critical numbers in a position of highest model attention (beginning of context) and prevents them from being diluted by verbose tool output. Option A treats the symptom with hardware, not the structural problem of how context is managed. Option C creates a summery but the problem is precisely that summaries "condense numerical values into vague summaries" — progressive summarization is a risk, not a solution. Option D is a poor user experience and not a reliable technical control.
---

## Question 48

Your customer support agent's session has been running for 90 minutes on a complex case. Midway through, you notice the agent starts referring to "typical return policies" instead of the specific 30-day return window it looked up via `get_customer` 40 turns earlier, and gives contradictory advice compared to earlier in the session. What is the most likely explanation?

A) The `get_customer` tool is returning stale data from a cache.
B) Context degradation in extended sessions — the model is no longer reliably referencing specific data from early in the context and is defaulting to generic knowledge ("typical patterns").
C) The model's temperature setting is causing inconsistent outputs over multiple turns.
D) A concurrent session from another customer is interfering with this session's context.

**Answer:** B

**Explanation:** Context degradation in extended sessions is a recognized phenomenon where models in long conversations begin giving inconsistent answers and referencing generic patterns rather than specific data retrieved earlier. The 30-day return window from `get_customer` (retrieved 40 turns ago, in the middle of context) is now in a position of reduced attention. The fix is to use scratchpad files or persistent structured state to record key findings, and to periodically re-inject critical data. Option A would affect current lookups, not previously retrieved data already in context. Option C would cause random variation, not systematic drift toward generic knowledge. Option D describes an architectural isolation failure that doesn't occur in properly designed session management.
---

## Question 49

Your customer support agent handles 200–300 turns of conversation over multi-day cases. You are designing a crash recovery system for these long sessions. An agent process crashes mid-investigation after making several `get_customer`, `lookup_order` calls. How should you design crash recovery?

A) Restart the agent from the beginning, as reconstructing partial state is too complex and error-prone.
B) Store the full conversation history in a database and reload it completely on restart.
C) Design each agent to export its structured state (verified customer ID, open issues, investigation steps completed, pending actions) to a known location periodically; on crash recovery, the coordinator loads this manifest and injects it into the restarted agent's initial context.
D) Use the `--resume` flag to continue from the last named session checkpoint.

**Answer:** C

**Explanation:** Structured state persistence for crash recovery is the correct pattern: agents periodically export their state to a known location, and the coordinator loads the manifest on resume and injects it into agent prompts. This is more efficient than replaying full conversation history and more reliable than starting over. Option A wastes all completed work and creates poor customer experience. Option B storing and replaying full conversation history is expensive and may re-execute tool calls whose results are already known. Option D (`--resume`) works for session resumption but requires that the session was cleanly named and the crash didn't corrupt session state; structured manifests are more robust for crash recovery specifically.
---

## Question 50

You are designing escalation logic for your customer support agent. A customer writes: "I need to speak with a manager right now. This is completely unacceptable." The agent's current behavior is to apologize, continue investigating the billing issue, and attempt to resolve it autonomously. The resolution takes another 3 turns before completion. Is this behavior correct?

A) Yes — the agent correctly continues to resolution, providing the best possible outcome for the customer.
B) Yes — resolving the issue autonomously is always better than escalating, even if the customer requests a human.
C) No — the agent should honor explicit requests for human agents immediately, without first attempting investigation. The correct behavior is to call `escalate_to_human` right away.
D) No — but the agent should first ask clarifying questions to confirm whether the customer truly wants a human or simply wants faster resolution.

**Answer:** C

**Explanation:** Explicit customer requests for a human agent must be honored immediately. Continuing to attempt autonomous resolution after a direct "I need to speak with a manager" request violates the customer's explicit preference and degrades their experience further. The escalation criteria include: "honor explicit customer requests for human agents immediately without first attempting investigation." Option A and B both prioritize the agent's autonomous resolution capability over the customer's expressed preference — this is wrong both ethically and functionally. Option D adds unnecessary friction with clarifying questions when the customer has already been clear; this would be appropriate only if the request were ambiguous, not when the customer says "I need to speak with a manager right now."
---

## Question 51

Your agent achieves 85% first-contact resolution, and you want to reduce unnecessary escalations for the remaining 15%. Log analysis shows the agent escalates when customers use frustrated language (e.g., "This is ridiculous," "I've been waiting for days") even when the underlying issue is straightforward and within the agent's resolution capability. What is the most targeted fix?

A) Remove sentiment detection from the escalation logic and replace it with explicit, structured escalation criteria.
B) Lower the sentiment threshold so only extreme frustration triggers escalation.
C) Add empathy training data so the agent better responds to frustrated customers without escalating.
D) Implement a two-stage escalation: first try to resolve, then escalate if the customer remains dissatisfied.

**Answer:** A

**Explanation:** Sentiment-based escalation is an unreliable proxy for case complexity. Customer frustration doesn't indicate that a case requires human escalation — it indicates the customer is frustrated. The correct escalation criteria are: customer explicitly requests a human, policy exception or gap exists, or the agent cannot make meaningful progress. Replacing sentiment-triggered escalation with explicit criteria based on case type and agent capability directly fixes the 15% unnecessary escalation rate. Option B adjusts the threshold but keeps the wrong signal — it will still escalate sentiment-based cases, just at a higher frustration level. Option C improves empathetic responses but doesn't fix the structural problem of sentiment-driven routing. Option D would work but adds latency and may still escalate if the customer's expressed frustration persists after autonomous resolution.
---

## Question 52

Your `lookup_order` tool times out 4% of the time during peak hours. Your BillingSubagent currently handles this by returning `{"status": "error", "message": "order lookup failed"}` to the coordinator. The coordinator, receiving this response, terminates the current ticket resolution and returns a generic "We're experiencing technical difficulties" message to the customer. What is wrong with this error propagation design?

A) The subagent should retry internally before propagating the error.
B) The coordinator is correct to terminate on any subagent error.
C) The error response provides no structured context (failure type, what was attempted, partial results, retry guidance), preventing the coordinator from making intelligent recovery decisions such as retrying after a delay or routing to a fallback data source.
D) The error message should be more customer-friendly before being passed to the coordinator.

**Answer:** C

**Explanation:** The subagent's error response is too generic to enable coordinator recovery. A structured response including `errorType: "timeout"`, `isRetryable: true`, `attemptedQuery: {...}`, and any partial results would allow the coordinator to decide: retry with backoff, try an alternative data source, or proceed with partial information. Terminating on a 4% transient timeout when recovery is possible is an unnecessary workflow failure. Option A is correct as a *first* step (local retry before propagating), but the question is about what the coordinator receives — the lack of structured context is the problem described. Option B is incorrect — terminating entire workflows on single failures is explicitly an anti-pattern. Option D addresses customer communication, not the coordinator recovery problem.
---

## Question 53

Your multi-agent customer support system has a coordinator and three subagents. During a complex investigation, the OrderHistorySubagent completes successfully with 12 order records, the FraudCheckSubagent encounters a service outage and returns no data, and the PolicySubagent completes with applicable policy clauses. The coordinator's current behavior is to wait until all three subagents succeed before proceeding. In the FraudCheckSubagent's outage scenario, this means the entire ticket stalls. What is the better design?

A) Remove the FraudCheckSubagent from the workflow since it causes availability problems.
B) Have the FraudCheckSubagent silently return empty results marked as successful so the coordinator can proceed.
C) Design the FraudCheckSubagent to return structured error context with partial results and failure information; design the coordinator to proceed with available results, annotating the synthesis output to indicate that fraud check data was unavailable and the case may need review.
D) Configure the coordinator to automatically escalate to human agents whenever any subagent fails.

**Answer:** C

**Explanation:** The correct pattern is to have subagents return structured error context (not suppress errors), and for coordinators to proceed with available partial results while annotating coverage gaps. This maximizes resolution capability during partial failures. Option A removes necessary functionality and would cause fraud checks to be skipped permanently. Option B is the anti-pattern of silently suppressing errors — if the fraud check was critical and fraud was present, the coordinator would never know it missed the check. Option D is overly conservative; a single subagent failure in a system with partial data should not immediately require human escalation if the available data is sufficient for resolution.
---

## Question 54

You are reviewing your agent's context management for multi-issue sessions. A customer submits a ticket covering three billing disputes from the past two months: an overcharge on Order A ($45), a duplicate subscription charge ($29.99/month × 3), and a shipping fee applied incorrectly to Order B ($12). Your agent handles Issue 1 correctly, but by Issue 3 it has forgotten the context of the original complaint and incorrectly interprets the $12 as part of the subscription dispute. What context management improvement would prevent this?

A) Process all three issues in a single pass to avoid context switching between turns.
B) Extract and persist each issue's structured data (order ID, dispute amount, status) into a separate context layer that is maintained across all turns, independent of the conversation history summary.
C) Ask the customer to submit each issue as a separate ticket to avoid context contamination.
D) Increase the model's max_tokens to ensure it has enough output budget to track all three issues simultaneously.

**Answer:** B

**Explanation:** The correct approach for multi-issue sessions is to extract structured issue data — order IDs, amounts, statuses — into a separate context layer that is explicitly maintained and included in each prompt, independent of the rolling conversation summary. This prevents issue details from being conflated or lost as the session progresses. Option A might help if done in a single turn but doesn't address the underlying context tracking problem for sessions that require back-and-forth. Option C shifts burden to the customer and fragments context that should be unified. Option D misdiagnoses the problem as output truncation; the issue is that incoming tool results are mixing with accumulated context, not that the output is too short.
---

## Question 55

Your customer support agent handles high-volume refund processing. You introduce a confidence scoring system where the agent self-reports confidence (1–10) for each resolution decision. You configure automatic processing for decisions rated 8 or above. Over three weeks, you notice that complex policy edge cases receive confidence scores of 9–10 and are processed automatically, while straightforward standard refunds receive scores of 6–7. What is the problem with this system?

A) The confidence scale should be 1–100 for better granularity.
B) LLM self-reported confidence scores are poorly calibrated — the model's expressed confidence does not reliably reflect actual accuracy or case complexity. The system is over-automating hard cases and over-reviewing easy ones.
C) The threshold of 8 is too low; raising it to 9 would fix the inversion.
D) Confidence scores should be computed by a separate evaluation model, not the agent itself.

**Answer:** B

**Explanation:** LLM self-reported confidence is a known unreliable signal. Models can be confidently wrong on hard cases (especially edge cases they haven't encountered in training or where the policy is complex) and appropriately uncertain on easy cases they've been trained to be cautious about. The resulting inversion — automating exactly the cases that need human review — is a predictable failure mode. Option A is a cosmetic change that doesn't address miscalibration. Option C adjusts the threshold but keeps the miscalibrated signal; raising the threshold might accidentally worsen the inversion for some distributions. Option D is an improvement but still doesn't guarantee calibration — the evaluation model would also need to be calibrated against labeled validation data.
---

## Question 56

You want to measure whether your customer support agent's automated refund decisions are accurate across different ticket types (standard returns, damaged goods, duplicate charges, subscription billing). Your aggregate accuracy metric shows 96% accuracy overall. Before reducing human review for high-confidence decisions, what additional validation is required?

A) Run the system on a larger sample to confirm the 96% figure is statistically significant.
B) Analyze accuracy by ticket type and decision field to verify that performance is consistent across all segments — the aggregate metric may mask poor performance on specific categories (e.g., subscription billing may be 78% accurate despite 96% overall).
C) Review the 4% error cases to identify patterns and retrain the model on those examples.
D) The 96% aggregate accuracy is sufficient validation; proceed with reducing human review.

**Answer:** B

**Explanation:** Aggregate accuracy metrics can mask poor performance on specific segments. A 96% overall accuracy could hide, for example, 78% accuracy on subscription billing cases if those cases are a small fraction of the total volume. Stratified analysis by ticket type, field type, and edge case category is required before automating high-confidence decisions, because errors on a specific category may be systematic and consequential even if they're a small share of total volume. Option A increases sample size but still produces an aggregate metric that has the same masking problem. Option C is useful for improvement but doesn't validate whether current accuracy is sufficient across all segments. Option D is the anti-pattern — acting on aggregate metrics without segment validation is explicitly called out as a reliability risk.
---

## Question 57

Your customer support agent synthesizes findings from multiple investigation steps into a final resolution message. During synthesis, the agent states: "Our records show the order was delivered on October 15th." However, the original `lookup_order` result showed the delivery date as October 22nd. The discrepancy traces to a summarization step where the agent summarized the order details and converted the date during compression. What practice would prevent this?

A) Summarize tool results immediately after receipt to reduce context length.
B) Extract specific transactional facts (dates, amounts, order numbers) into a structured "case facts" block that is passed directly to synthesis without going through summarization steps, preserving exact values.
C) Ask the customer to confirm all dates and amounts before the agent issues a resolution.
D) Use a lower temperature setting to reduce the chance of the model generating incorrect values during summarization.

**Answer:** B

**Explanation:** Progressive summarization is a known risk for numerical and transactional data — summarization steps can alter specific values, compress dates imprecisely, or introduce rounding. The correct mitigation is to extract specific transactional facts (dates, amounts, IDs) into a structured block that bypasses summarization, ensuring exact values are preserved through to the synthesis step. Option A is the exact anti-pattern being described — summarizing immediately is what caused the date corruption. Option C shifts burden to the customer and is not a reliable technical control. Option D affects creativity/variability in generation but does not address the structural problem of summarization corrupting specific values.
---

## Question 58

Your multi-agent support system aggregates findings from three subagents: one investigating shipping data, one reviewing billing history, and one checking account standing. The synthesis subagent receives combined findings but loses track of which claim came from which subagent's data. When a refund amount is disputed later, you cannot trace which tool call produced the $89 figure. What architectural change would preserve provenance?

A) Have the synthesis subagent include citations at the end of its response.
B) Require each subagent to output structured claim-source mappings — including the source tool name, tool call parameters, and relevant data excerpt — and require the synthesis subagent to preserve these mappings when combining findings rather than discarding them during synthesis.
C) Log all tool calls at the infrastructure level and cross-reference logs when provenance is needed.
D) Have the coordinator tag each subagent's output with a source identifier before passing it to the synthesis subagent.

**Answer:** B

**Explanation:** Preserving information provenance requires structured claim-source mappings that each subagent outputs and that the synthesis subagent explicitly preserves through synthesis. When findings are combined without preserving these mappings, source attribution is lost and cannot be recovered. The correct pattern is to require subagents to output `{"claim": "$89 overcharge", "source": "lookup_order", "parameters": {"order_id": "ORD-48291"}, "excerpt": "..."}` format, and require synthesis to maintain this attribution. Option A adds post-hoc citations that may not be accurate since the synthesis subagent has already lost the mappings. Option C enables retroactive tracing via logs but is operationally expensive and not useful during the live resolution process. Option D is an improvement but the coordinator tagging is less precise than the subagent directly including the source context with each claim.
---

## Question 59

Your support agent is handling a refund request where two internal systems disagree: the order management system shows the original charge as $149.99, while the billing system shows $134.99. The agent's current behavior is to use the lower value as it "seems more likely correct" and process a $134.99 refund. What is the correct behavior?

A) Use the higher value to ensure the customer receives the maximum possible benefit.
B) Average the two values and process a $142.49 refund.
C) Annotate the conflict with source attribution (which system reported which value), flag the discrepancy explicitly, and escalate to a human agent who can resolve the system discrepancy before processing the refund.
D) Use the billing system value since it is the authoritative financial record.

**Answer:** C

**Explanation:** When credible sources conflict, the correct behavior is to annotate the conflict with attribution and escalate rather than arbitrarily selecting one value. The agent cannot know which system is correct — both are "credible sources" in this context. Processing a refund based on an arbitrarily selected value exposes the company to financial error and potential fraud. The escalation criteria include policy ambiguity and inability to make meaningful progress — a data conflict that prevents a correct resolution triggers escalation. Options A and B both make arbitrary decisions when the data is unresolved. Option D assumes the billing system is authoritative, which may not be true and is not something the agent can verify without additional investigation.
---

## Question 60

Your customer support agent occasionally encounters cases where it cannot determine whether a case has been fully resolved. The agent's context is near the limit after a long investigation, and using `/compact` would reduce the verbosity. A colleague suggests using `/compact` should be a last resort because it loses important details. In what situation is using `/compact` appropriate for the customer support agent?

A) Never — `/compact` always degrades context quality and should be replaced with session forking.
B) When the context fills with verbose discovery output (e.g., large tool responses, exploratory reasoning chains) during extended investigation sessions and the agent's useful working context is being crowded out by low-relevance accumulated output.
C) Only when the customer has been idle for more than 10 minutes, indicating the session can be compressed without active need.
D) Before every tool call to keep context lean and prevent accumulation.

**Answer:** B

**Explanation:** `/compact` is appropriate when the context fills with verbose, low-relevance content — such as large tool responses, extended exploratory reasoning, or repeated intermediate steps — that is crowding out the useful working context. In a long customer support investigation, tool responses accumulate tokens rapidly; compacting the verbose portions while preserving key findings allows the session to continue productively. Option A is incorrect — `/compact` is a documented and recommended tool for managing context in extended sessions; the concern about losing details is addressed by ensuring key findings are already recorded in structured state before compacting. Option C introduces an arbitrary timing-based trigger that doesn't align with the actual use case. Option D would be counterproductive — compacting before every tool call would discard useful recent context needed for reasoning about the current step.
---
