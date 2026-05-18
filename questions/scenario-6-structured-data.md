# Structured Data Extraction

**Total Questions:** 60
**Domain Distribution:** Domain 4 (34), Domain 5 (26)

---

## Question 1

Your structured data extraction system processes insurance claim documents. Production metrics show a 94% overall extraction accuracy, but auditors complain that the system flags nearly every claim as "potentially fraudulent" — even routine fender-benders with photo evidence. Developers have begun ignoring the fraud flag entirely. What prompt change would most effectively restore trust in the fraud-detection output?

A) Add the instruction "only flag fraud when you are highly confident" to the system prompt to reduce false positives.
B) Replace the vague fraud check with explicit criteria defining which specific patterns constitute fraud (e.g., "flag only when the claimed damage location contradicts the photographic evidence, or when repair costs exceed vehicle book value by more than 20%").
C) Lower the required confidence threshold from 0.9 to 0.7 so the system flags fewer documents.
D) Add a separate post-processing classifier that re-scores fraud flags on a 1–10 scale and automatically dismisses scores below 5.

**Answer:** B

**Explanation:** Replacing a vague instruction with explicit categorical criteria directly fixes the root cause: without specific rules, the model flags any ambiguity as potential fraud. Option A ("only flag when highly confident") is the classic confidence-filtering trap — general instructions like "be conservative" do not improve precision because the model still lacks a definition of what constitutes fraud. Option C lowers a threshold that governs a different mechanism and does not address what the model flags. Option D adds infrastructure overhead without fixing the underlying missing criteria; the post-processor would still receive the same high-false-positive inputs.
---

## Question 2

Your extraction system processes medical records to populate a patient intake database. The system prompt instructs Claude to "extract all relevant clinical information." Downstream analysts report that some records produce dense, verbose outputs while others return sparse, inconsistently formatted results for identical field types. Which action most directly addresses the inconsistency?

A) Increase the model temperature to encourage more varied, creative extraction patterns.
B) Add 3–4 few-shot examples to the prompt that demonstrate the exact desired output format — field names, data types, and handling of missing values — for representative document structures.
C) Switch from a system prompt to a user-turn prompt, as system prompts are processed less consistently for formatting tasks.
D) Add the instruction "always produce consistent output" to the system prompt.

**Answer:** B

**Explanation:** Few-shot examples are the most effective technique for achieving consistently formatted output when instructions alone produce inconsistent results. Showing the model the exact structure — including how to represent missing values — allows it to generalize that format across novel document layouts. Option A (higher temperature) increases randomness and would worsen consistency. Option C is factually incorrect; system prompts are not processed less reliably for formatting. Option D is another vague instruction that gives the model no concrete definition of what "consistent" means across varied document types.
---

## Question 3

Your extraction system handles both typed PDF forms and free-text scanned letters. Metrics show typed forms extract at 99% accuracy, but scanned letters produce empty or null values for the `sender_address` field 38% of the time — even when the address is clearly present. What is the most effective first step to address this pattern?

A) Mark the `sender_address` field as optional in the JSON schema so the model is not forced to fabricate values when the address is absent.
B) Add few-shot examples showing correct extraction of `sender_address` from varied letter formats, including handwritten-style addresses, split-line layouts, and embedded address blocks.
C) Route all scanned letters to a separate OCR pre-processing pipeline before they reach Claude.
D) Switch to a higher-context model to give it more capacity to analyze scanned letter structure.

**Answer:** B

**Explanation:** The pattern — correct extraction from structured forms but failures on varied free-text formats — is a classic signal that the model needs demonstrations of the specific format variations it encounters. Few-shot examples showing correct extraction from multiple letter layouts directly address the 38% null rate. Option A (making the field optional) would reduce errors artificially without fixing extraction; addresses would simply be omitted rather than correctly extracted. Option C assumes the problem is OCR quality, but the question states the address is "clearly present," pointing to extraction logic rather than image quality. Option D conflates context window size with layout comprehension ability, which is not the limiting factor here.
---

## Question 4

Your team is evaluating why the extraction system produces high false positive rates specifically for the `contract_type` field on vendor agreements. Review of 200 flagged cases shows that 70% were flagged because the document used non-standard terminology ("renewal order" instead of "recurring contract"). What is the most appropriate prompt intervention?

A) Add examples of acceptable equivalent terminology to the extraction criteria, showing that "renewal order," "evergreen agreement," and "auto-renewal" should all map to the `recurring` enum value.
B) Expand the enum to include every possible synonym as a separate valid value.
C) Lower the confidence threshold for the `contract_type` field specifically.
D) Add a general instruction to "be flexible with terminology when classifying contract types."

**Answer:** A

**Explanation:** Providing explicit mapping examples of equivalent terminology directly teaches the model which surface forms correspond to which canonical enum values. This is a targeted, precise intervention that eliminates the false positive pattern without bloating the schema. Option B (adding every synonym as an enum value) defeats the purpose of enumeration and would force downstream systems to handle dozens of equivalent values. Option C addresses confidence scoring rather than misclassification — the model is confidently wrong, not uncertain. Option D ("be flexible") is another vague instruction that gives the model no actionable rule for mapping specific terms to specific enum values.
---

## Question 5

After deploying a new extraction prompt for purchase order documents, the system's `line_item_quantity` field now correctly extracts values 92% of the time, up from 74%. However, the `unit_price` field accuracy dropped from 96% to 88%. What does this pattern most likely indicate, and what should you do?

A) The new prompt improved one field at the expense of attention on another. Run targeted few-shot examples that jointly demonstrate correct extraction of both `line_item_quantity` and `unit_price` from the same document.
B) The model has a context window limitation and can only accurately extract a fixed number of fields. Reduce the schema to only the most critical fields.
C) The `unit_price` field schema definition needs to be changed from a number type to a string type to handle currency symbols.
D) The temperature setting is too high, causing random degradation in one field while another improves.

**Answer:** A

**Explanation:** This pattern — one field improving while a related field degrades — is a classic symptom of a prompt change that redirected model attention. The fix is few-shot examples that demonstrate the joint extraction of both fields from the same document, anchoring the model's behavior on both simultaneously. Option B (reducing schema fields) is an overreaction; the system was extracting both fields well before, so the schema is not the problem. Option C (changing type) is a schema design non sequitur — currency symbols are handled via format normalization in the prompt, and changing the type would break numeric validation. Option D incorrectly attributes field-specific accuracy changes to a temperature setting, which affects global randomness, not per-field attention.
---

## Question 6

You are building an extraction schema for financial disclosure forms. The source documents sometimes contain an `auditor_notes` field and sometimes do not. When you define `auditor_notes` as required in the schema, your extraction accuracy drops because Claude fabricates plausible-sounding notes for documents that don't contain any. What schema design change fixes this?

A) Change `auditor_notes` to an optional (nullable) field so the model can return `null` when the information is absent rather than fabricating it.
B) Add a validation step that checks whether extracted `auditor_notes` appear verbatim in the source document.
C) Add the instruction "do not hallucinate auditor notes" to the system prompt.
D) Set a minimum length constraint on `auditor_notes` to force the model to produce substantive content.

**Answer:** A

**Explanation:** Making the field optional (nullable) is the correct schema-level fix. When a field is required, the model is structurally incentivized to produce a value even when the source is silent — fabrication is the predictable consequence of a required field on absent data. Making it nullable allows the model to faithfully represent "not present." Option B (verbatim matching) would catch fabrications post-hoc but is impractical for paraphrased notes and does not prevent fabrication. Option C is a vague instruction that competes with the structural pressure of a required field — schema constraints generally win over instructions. Option D worsens the problem by adding a length minimum, which further incentivizes fabrication of longer notes.
---

## Question 7

Your extraction schema for employment contracts includes a `termination_clause_type` field with the enum values `["at-will", "for-cause", "fixed-term"]`. Legal analysts report that 12% of contracts use hybrid language that doesn't fit cleanly into any category, and the model arbitrarily picks the closest value. What schema design pattern best handles this?

A) Add an `"other"` value to the enum plus a `termination_clause_detail` string field where the model describes the hybrid language when it selects `"other"`.
B) Remove the enum constraint and allow the model to free-text describe every termination clause.
C) Add an `"unclear"` value to the enum and instruct analysts to manually review all `"unclear"` extractions.
D) Increase the number of enum values to cover every possible hybrid permutation.

**Answer:** A

**Explanation:** The `"other"` + detail field pattern is the standard schema design for extensible categorization. It preserves the benefits of enumeration (most values are machine-readable and filterable) while gracefully handling edge cases by capturing the specific language in a companion field. Option B (free-text for everything) abandons the structured benefit and makes the `termination_clause_type` field unqueryable. Option C (`"unclear"`) is better than nothing but loses information — the model knows what the clause says, just that it doesn't fit a category. The `"other"` + detail pattern captures both the classification and the explanation. Option D would require enumerating every possible hybrid, which is impractical for legal language variation.
---

## Question 8

Your extraction system uses `tool_use` with a single `extract_contract_data` tool defined in the tools array. In 8% of API responses, Claude returns a conversational text response instead of invoking the tool — explaining why it cannot extract certain fields rather than providing a structured output. Which API configuration change eliminates this behavior?

A) Set `tool_choice` to `{"type": "tool", "name": "extract_contract_data"}` to force Claude to always invoke that specific tool.
B) Set `tool_choice` to `"auto"` so Claude has more flexibility and naturally prefers structured output.
C) Remove the tool definition and instead append "respond only with valid JSON matching this schema" to the system prompt.
D) Add a retry that checks whether the response is a `tool_use` block and re-sends the request if it is not.

**Answer:** A

**Explanation:** Setting `tool_choice` to force a specific named tool guarantees that every response invokes that tool — eliminating the conversational text fallback entirely. This is the deterministic fix. Option B (`"auto"`) is exactly the current behavior — `"auto"` allows the model to choose between calling a tool and responding with text, which is why 8% of responses are text. Option C (prompt-based JSON instruction) is less reliable than `tool_use` and reintroduces the risk of JSON syntax errors that the schema-enforced tool approach eliminates. Option D (retry) is a workaround that does not prevent the underlying behavior and doubles API costs on failures.
---

## Question 9

Your system extracts data from a variety of document types: invoices, purchase orders, and shipping manifests. Each document type has its own extraction tool with a tailored schema (`extract_invoice`, `extract_purchase_order`, `extract_manifest`). The document type is not always known before the API call. Which `tool_choice` setting guarantees a structured extraction response while allowing Claude to select the appropriate schema?

A) Set `tool_choice` to `"any"` so Claude must call one of the available tools but chooses which one based on document content.
B) Set `tool_choice` to `"auto"` to give Claude maximum flexibility.
C) Set `tool_choice` to `{"type": "tool", "name": "extract_invoice"}` as the most common document type.
D) Send three separate API calls, one per tool, and use the one that returns the most complete extraction.

**Answer:** A

**Explanation:** `tool_choice: "any"` requires the model to invoke one of the defined tools but does not prescribe which one — exactly the right configuration when document type is unknown but structured output is required regardless. Option B (`"auto"`) risks the model returning a text response (e.g., "I cannot determine the document type"), which violates the structured output guarantee. Option C forces a single tool for all documents, causing invoices to be parsed with purchase order schemas and vice versa. Option D (three separate calls) triples cost, introduces latency, and requires heuristic logic to pick the "best" result — all unnecessary when `"any"` solves the problem in one call.
---

## Question 10

You are building an extraction pipeline for pharmaceutical research summaries. The first step must always extract document metadata (`doc_id`, `study_type`, `compound_name`) before any enrichment steps run. You have two tools defined: `extract_metadata` and `enrich_with_context`. How do you guarantee the metadata extraction always runs first?

A) Force the first API call with `tool_choice: {"type": "tool", "name": "extract_metadata"}`, then pass the result into a second API call that can use either tool.
B) List `extract_metadata` first in the tools array so Claude processes it first.
C) Instruct Claude in the system prompt to "always call extract_metadata before enrich_with_context."
D) Use `tool_choice: "any"` for both steps to guarantee structured output.

**Answer:** A

**Explanation:** Forcing a specific tool by name with `tool_choice: {"type": "tool", "name": "extract_metadata"}` provides a deterministic guarantee that metadata extraction runs first, independent of Claude's reasoning. The result is then passed as context to the second call. Option B (ordering in the tools array) has no documented effect on tool selection priority — Claude reads all tool definitions and selects based on content, not array position. Option C (prompt instruction) is probabilistic; model compliance with ordering instructions is not guaranteed, especially as prompt complexity grows. Option D (`"any"` for both) guarantees a tool is called but does not guarantee which tool, meaning enrichment could accidentally run before metadata extraction.
---

## Question 11

Your extraction system processes purchase orders and validates that `line_items` totals sum to the `stated_total`. After switching to `tool_use` with a strict JSON schema, JSON syntax errors dropped to zero, but the validation system still flags 6% of invoices where line item totals don't match the stated total. A developer proposes adding more JSON schema constraints to fix this. What is the correct diagnosis and response?

A) The 6% mismatch is a semantic error (values are logically inconsistent), not a syntax error. Add a `calculated_total` field to the schema alongside `stated_total`, and add validation logic that compares the two and flags discrepancies.
B) The schema is not strict enough. Add a JSON Schema `const` constraint tying `stated_total` to the sum of `line_items`.
C) The remaining 6% are JSON syntax errors that slipped through the tool use enforcement. Add a JSON parsing retry loop.
D) Set the model temperature to 0 to eliminate the arithmetic variability causing sum mismatches.

**Answer:** A

**Explanation:** JSON schemas enforce structural and type constraints but cannot express cross-field arithmetic relationships like "this field must equal the sum of another array's values." These are semantic errors that require application-layer validation. The correct design adds a `calculated_total` field (which Claude computes) alongside `stated_total` (which Claude extracts), then a validation step compares them and sets a `conflict_detected` flag. Option B is incorrect — JSON Schema's `const` keyword cannot reference dynamic computed values; you cannot constrain a field to equal the sum of an array. Option C misidentifies the error type; the tool use guarantees structural validity. Option D is irrelevant — temperature affects output variation, not arithmetic correctness.
---

## Question 12

An extraction schema for lease agreements includes a `lease_start_date` field defined as `{"type": "string", "format": "date"}`. Source documents use inconsistent date formats: "January 15, 2024," "01/15/24," and "2024-01-15T00:00:00Z." Schema validation rejects the ISO-8601 format with a time component. What is the correct approach?

A) Add a format normalization rule to the prompt instructing Claude to convert all extracted dates to ISO-8601 `YYYY-MM-DD` format before populating the schema field.
B) Change the schema type from `string` to `object` with separate `year`, `month`, and `day` fields.
C) Set `tool_choice: "auto"` so Claude can include date parsing explanation in a text response when formats are ambiguous.
D) Add all observed date format strings as enum values in the schema.

**Answer:** A

**Explanation:** Format normalization rules in the prompt are the correct complement to strict output schemas when source data is inconsistently formatted. Instructing Claude to normalize dates to `YYYY-MM-DD` before populating the field resolves both the format inconsistency and the ISO-8601 time component issue at the prompt level, keeping the schema clean and consistent for downstream consumers. Option B (object decomposition) makes date comparison and sorting dramatically harder for downstream systems and is excessive for a simple formatting problem. Option C (`"auto"`) abandons structured output for a formatting issue that a normalization rule in the prompt handles cleanly. Option D (enum for date strings) is completely wrong — there are infinite possible date strings; enumerating them is impossible.
---

## Question 13

Your extraction system returns a validation error: `"vendor_category" must be one of ["retail", "wholesale", "distributor"]` for 4% of vendor documents. On inspection, these documents describe vendors operating in multiple categories simultaneously. What is the most appropriate schema adjustment?

A) Change `vendor_category` from a string enum to an array of enums: `{"type": "array", "items": {"type": "string", "enum": ["retail", "wholesale", "distributor"]}, "uniqueItems": true}`.
B) Add a `vendor_category_notes` string field where Claude describes multi-category vendors in free text.
C) Change the field to a free-text string and add prompt instructions to use only the three category values.
D) Add a fourth enum value `"multi-category"` and add a separate prompt instruction to "use multi-category for vendors in more than one category."

**Answer:** A

**Explanation:** Changing the field to an array of enums is the correct schema design for multi-value categorical data. It preserves machine-readability (values remain filterable), reflects the actual data semantics (a vendor can have multiple categories), and enables downstream systems to query "all wholesale vendors" including those tagged `["wholesale", "retail"]`. Option B (free-text notes) abandons queryability and consistency. Option C (free-text string with instruction) is less reliable than the schema constraint and cannot prevent the model from using unexpected strings. Option D (`"multi-category"` enum) loses the specific category information — a vendor tagged `"multi-category"` is not queryable for wholesale operations.
---

## Question 14

After deploying a batch extraction run on 500 insurance claim documents, your validation pipeline rejects 47 documents due to a mismatched `claim_status` field. On inspection, the documents use the phrase "pending further review" which the model maps to `"open"` instead of the correct `"under_review"` enum value. What is the correct fix for the next batch run?

A) Add a few-shot example to the prompt demonstrating that "pending further review" and similar phrases map to the `"under_review"` enum value.
B) Add "pending further review" as a new enum value alongside `"under_review"`.
C) Remove the enum constraint from `claim_status` and add a free-text description field.
D) Implement a post-extraction dictionary mapping "open" to "under_review" for all documents in this batch.

**Answer:** A

**Explanation:** A few-shot example showing the mapping from natural language phrases to the correct enum value is the targeted, reusable fix — it trains the model on the ambiguous case and generalizes to similar phrasings in future batches. Option B (adding the phrase as an enum value) conflates source-document language with schema vocabulary; the enum represents canonical statuses, not all possible document phrasings. Option C removes the enum benefit entirely and makes status filtering unreliable. Option D (post-extraction dictionary) is a brittle workaround that only handles the exact phrase seen in this batch; the next batch could use "pending investigation" and produce the same misclassification.
---

## Question 15

Your extraction system processes grant applications and returns a validation error in 9% of documents: the `funding_amount` field contains values like "$125,000" (with dollar sign and comma) instead of the numeric `125000` the schema requires. The documents themselves are well-structured. What is the correct fix?

A) Add a format normalization rule to the extraction prompt: "Extract `funding_amount` as a plain integer with no currency symbols or comma separators. Example: '$125,000' → 125000."
B) Change the `funding_amount` schema type from `number` to `string` to accept currency-formatted values.
C) Add a post-processing regex substitution that strips dollar signs and commas from the extracted value.
D) Add a JSON Schema `pattern` constraint requiring the value to match `^\$[\d,]+$`.

**Answer:** A

**Explanation:** A format normalization rule in the prompt with an explicit transformation example is the cleanest fix — it instructs Claude to perform the transformation at extraction time, keeping the schema numerically typed and the downstream data clean. Option B (changing to string) would require all downstream consumers to parse currency strings and breaks numeric comparisons. Option C (post-processing regex) works in principle but is fragile to edge cases (e.g., "$1.5M", "€50,000") and adds infrastructure rather than fixing the extraction. Option D completely misunderstands the problem — adding a regex constraint requiring the dollar sign and comma format would cause the field to fail schema validation even more reliably.
---

## Question 16

After a batch extraction run on 1,200 legal contracts, your validation system identifies 83 documents where the `effective_date` is populated but `expiration_date` is null, even though both dates appear in the document. The retry with the original prompt produces the same null result for `expiration_date`. What is the correct next step?

A) Implement a retry-with-error-feedback: resend the original document along with the failed extraction and the specific validation error ("expiration_date extracted as null despite being present in the source document") to guide Claude toward correction.
B) Mark `expiration_date` as optional in the schema, since null values appear to be unavoidable for some documents.
C) Increase the batch size to include more context around each document.
D) Switch from `tool_use` to a prompt-based JSON extraction to give Claude more flexibility.

**Answer:** A

**Explanation:** Retry-with-error-feedback — resending the document with the specific validation error appended — is the correct mechanism for format or structural extraction failures where the information is present but was missed. The specific error message ("expiration_date null despite being present") guides Claude to re-examine the document for that field. Option B (marking optional) concedes the error without attempting recovery, producing permanently incomplete records. Option C (increasing batch size) misapplies the concept of batch size; this is a single-document extraction issue, not a batch scope issue. Option D (switching to prompt-based JSON) reintroduces syntax error risks and is a step backward in reliability without addressing the root cause.
---

## Question 17

Your validation pipeline sends failed extractions back to Claude for correction. After analyzing retry patterns over 10,000 documents, you find that 91% of retries succeed, but retries for documents flagged with "information absent from source" always fail. What does this pattern reveal, and how should you adjust the retry logic?

A) Retries are effective for format or structural errors but ineffective when the required information simply does not exist in the source document. Implement logic to skip retries for "information absent" errors and route those documents directly to human review.
B) The retry prompt is poorly constructed. Add more detailed error messages to improve the retry success rate for absent-information cases.
C) Increase the number of retry attempts from 1 to 3 for "information absent" cases, since more attempts improve the chance of extraction.
D) Relax the schema to make all fields optional, eliminating the "information absent" validation errors entirely.

**Answer:** A

**Explanation:** This is a fundamental principle of retry loop design: retries correct format mismatches and structural output errors, but they cannot materialize information that is genuinely absent from the source document. Continuing to retry these cases wastes API calls and adds latency without improving outcomes. Routing them directly to human review is the correct response. Option B misidentifies the problem — better error messages help when Claude misread the document, not when the information doesn't exist. Option C multiplies wasted API calls threefold with no improvement in success rate. Option D (making all fields optional) would suppress the error but degrade data quality by converting genuine data gaps into accepted null values.
---

## Question 18

Your team is processing 8,000 financial disclosure documents per night for regulatory reporting. Each document takes approximately 2 seconds of processing time. The regulatory system requires completed extractions by 6 AM, and processing begins at 10 PM. Your manager asks whether to use the synchronous API or the Message Batches API. What is the correct recommendation?

A) Use the Message Batches API: 8,000 documents at 2 seconds each would take ~4.4 hours synchronously, which is within the overnight window, and the Batches API provides 50% cost savings with an up-to-24-hour window that still meets the 6 AM deadline.
B) Use the synchronous API because the Message Batches API cannot guarantee delivery before the 6 AM deadline.
C) Use the Message Batches API only if you can guarantee it will complete in under 2 hours, to leave buffer time before 6 AM.
D) Use the synchronous API because it supports multi-turn tool calling, which the Batches API does not.

**Answer:** A

**Explanation:** The Message Batches API is ideal for this workload: it's a latency-tolerant overnight process with a known completion window (8-hour processing window between 10 PM and 6 AM), and the 50% cost reduction is significant at 8,000 documents per run. The 24-hour maximum processing window is a ceiling — batches typically complete much faster. Option B overstates the risk; the Batches API is designed for overnight workloads exactly like this. Option C inverts the analysis — the value of the Batches API is precisely for workloads where you have hours of tolerance, not just minutes. Option D is a true statement (Batches API does not support multi-turn tool calling) but is irrelevant here — the extraction task is a single-turn operation.
---

## Question 19

Your extraction pipeline processes contracts with a 30-hour SLA. The Message Batches API has a maximum processing window of 24 hours. You submit batches every 4 hours. A batch submitted at noon on Monday must be completed by 6 PM on Tuesday (30 hours later). What is the correct analysis of whether this schedule meets the SLA?

A) The schedule works: batches are submitted every 4 hours, and with a 24-hour maximum processing window, results are guaranteed to be available within 28 hours of document arrival — within the 30-hour SLA.
B) The schedule does not work: the 4-hour submission cadence plus the 24-hour maximum processing window gives a worst-case of 28 hours, which is within the SLA but leaves only 2 hours of buffer, which is insufficient.
C) The schedule works only if the average batch processing time is under 20 hours, since no SLA guarantee exists.
D) The schedule does not work: the Message Batches API's 24-hour window applies to each individual document, not the batch, so total time could exceed 30 hours.

**Answer:** A

**Explanation:** The SLA math is: worst-case submission delay (up to 4 hours before the next batch window) plus maximum batch processing (24 hours) = 28 hours, which satisfies the 30-hour SLA with 2 hours of buffer. This is the correct calculation for matching batch submission frequency to SLA requirements. Option B acknowledges the 2-hour buffer but incorrectly characterizes it as "insufficient" — 2 hours of buffer is a design choice, and the question asks whether the schedule "meets" the SLA, which it does. Option C mischaracterizes the batch API's processing behavior — the 24-hour window is a documented maximum, making the SLA analysis in Option A valid. Option D is factually incorrect; the 24-hour window applies to the batch, not per-document.
---

## Question 20

A batch extraction run on 2,000 supplier documents returns 150 failures. The `custom_id` field in each batch request was set to the supplier document's filename. What is the correct approach to handling the failures?

A) Use the `custom_id` values from the failed responses to identify the specific failed documents, investigate the failure type for each, and resubmit only those 150 documents — potentially with modifications (e.g., chunking documents that exceeded context limits).
B) Resubmit the entire 2,000-document batch with a modified prompt to address the failures.
C) Accept the 150 failures as an inherent limitation of batch processing and process only the 1,850 successful extractions.
D) Switch all 2,000 documents to the synchronous API for the retry, since the batch API cannot reliably handle retries.

**Answer:** A

**Explanation:** The `custom_id` field exists precisely for this use case: correlating batch responses to their source documents so that only failed requests need resubmission. This minimizes cost (reprocessing 150 instead of 2,000) and allows targeted modifications per failure type (e.g., context limit errors get chunked documents, format errors get prompt adjustments). Option B resubmits all 2,000 documents unnecessarily — the 1,850 successes would be re-extracted at cost with no benefit. Option C abandons 7.5% of the documents, which would produce an incomplete extraction dataset. Option D mischaracterizes the Batches API; retries are well-supported and cost-effective via `custom_id` identification.
---

## Question 21

Before running a new extraction prompt on a batch of 5,000 medical records, your team wants to maximize the first-pass success rate to minimize reprocessing costs. What is the correct preparation step?

A) Run the prompt on a representative sample of 50–100 documents first, analyze the failure patterns, refine the prompt, and then submit the full 5,000-document batch.
B) Submit the full 5,000-document batch immediately to discover failure patterns at scale.
C) Run the prompt synchronously on the first 100 documents before switching to batch mode for the remainder.
D) Submit the batch without a sample run, since prompt refinement is only valuable for prompts that have never been used before.

**Answer:** A

**Explanation:** Sample-first prompt refinement is the standard practice for maximizing batch first-pass success rates. Discovering failure patterns on 50–100 documents costs a small fraction of a full batch run, and fixing prompt issues before the main batch avoids expensive iterative resubmission cycles. Option B (submitting 5,000 documents to discover failures) trades low-cost sample failures for high-cost batch failures. Option C (synchronous first 100 then batch remainder) incurs synchronous API costs for the sample and misses the batch pricing discount on those documents, but more importantly, it does not include a prompt refinement step. Option D is incorrect — prompt refinement on a sample is valuable for any new document type or modified prompt, regardless of prior usage.
---

## Question 22

Your extraction system processes 14-file contract packages. A single-pass review of the entire package produces inconsistent results: detailed extraction from some files but superficial extraction from others, and contradictory classifications of identical clause types appearing in different files. Which architectural change most directly addresses this?

A) Split the extraction into two passes: a per-file local extraction pass that processes each of the 14 files individually, followed by a cross-file integration pass that reconciles conflicts and identifies relationships across extracted data.
B) Increase the context window by using a model with a larger token limit so all 14 files can be processed with adequate attention.
C) Process all 14 files in a single pass but instruct Claude to "pay equal attention to all files."
D) Have each file processed by a separate Claude instance in parallel and merge the results with a simple concatenation.

**Answer:** A

**Explanation:** The multi-pass architecture — per-file local extraction followed by a cross-file integration pass — directly addresses attention dilution when many documents are processed simultaneously. Per-file passes ensure consistent extraction depth; the integration pass catches cross-file relationships and resolves contradictions. Option B (larger context window) does not solve attention quality degradation; a larger window allows more content but does not guarantee proportional attention across all sections. Option C ("pay equal attention") is an instruction the model cannot reliably execute when attention is mechanically limited in long contexts. Option D (parallel instances + concatenation) addresses parallelism but not integration — a simple merge cannot reconcile contradictory classifications across files.
---

## Question 23

Your extraction system uses a second independent Claude instance to verify extractions before they are committed to the database. The verification instance currently receives the original document, the extracted data, and the generation instance's reasoning chain. Verification catches only 12% of errors. What change would most improve verification effectiveness?

A) Remove the generation instance's reasoning chain from the verification prompt so the second instance performs an independent review without being anchored to the first instance's conclusions.
B) Use a higher-temperature setting for the verification instance to encourage more varied evaluation.
C) Add more detailed instructions to the verification prompt describing what constitutes an extraction error.
D) Have the generation instance flag its own low-confidence extractions and only submit those to the verification instance.

**Answer:** A

**Explanation:** The verification instance receiving the generation reasoning chain is the core problem: a model reviewing output alongside the original generator's reasoning tends to anchor on that reasoning rather than independently evaluating the extraction. Self-review limitations apply here — providing prior reasoning context reduces the reviewer's ability to catch subtle errors. Removing the reasoning chain forces genuine independent review. Option B (higher temperature) increases randomness, not analytical rigor. Option C (more detailed error descriptions) may help marginally but does not address the anchoring problem caused by the reasoning chain. Option D (self-flagging low-confidence extractions) reduces the verification scope but does nothing to improve catch rate for the errors the generation instance was confident about.
---

## Question 24

Your team is designing a multi-pass extraction architecture for complex legal documents. The first pass extracts all clause data per document section. The second pass performs cross-section consistency checks. A developer proposes having the first-pass model review its own extraction outputs for errors before the second pass. Why is this approach flawed, and what is the correct alternative?

A) The first-pass model retains its generation reasoning context, making it systematically less likely to question its own extractions in the same session. Use a second independent Claude instance for review, without the first instance's reasoning chain.
B) Self-review is computationally expensive. Use deterministic schema validation instead of a second LLM pass.
C) Self-review works well for structured outputs. The problem is that the second pass should run before the first pass in the pipeline.
D) The first-pass model has already consumed too many tokens to perform effective review. Reduce the extraction schema to free up context budget.

**Answer:** A

**Explanation:** This is the core limitation of self-review in multi-instance architectures: a model generating output retains the reasoning context from that generation and is less likely to question decisions it just made. The same cognitive anchoring that causes humans to miss errors in their own writing applies here. An independent instance, reviewing without the generator's reasoning chain, is more effective at catching subtle extraction errors. Option B is partially true (schema validation catches structural errors) but misses that semantic errors require an LLM review; deterministic validation cannot evaluate whether a clause was correctly interpreted. Option C is incorrect — the second cross-section pass logically depends on first-pass per-section extractions. Option D conflates context budget management with reasoning quality; the problem is anchoring, not token count.
---

## Question 25

In a running production extraction system for 500 weekly research grant applications, accuracy on a 50-document labeled test set is 97.2%. The team wants to reduce manual review to a 5% sample rate. A senior engineer proposes first validating accuracy by grant type (NIH, NSF, DARPA, private foundation) before reducing review. Why is this the correct step?

A) Aggregate accuracy can mask poor performance on specific grant types. The 97.2% may reflect excellent performance on the majority category (e.g., NIH grants, which are 60% of volume) while specific categories like DARPA contracts may perform significantly worse.
B) 97.2% is below the 99% threshold required to safely reduce human review to 5%.
C) The 50-document test set is too small to be statistically meaningful. A 500-document test set is required before any review rate reduction.
D) Segment-level validation is only necessary when using few-shot prompting, not for tool_use-based extraction.

**Answer:** A

**Explanation:** Aggregate accuracy metrics routinely mask poor performance on minority categories or specific field types. A system with 99% accuracy on NIH grants and 80% accuracy on DARPA contracts could easily average 97.2% if NIH grants dominate the dataset. Reducing review rates based only on aggregate metrics would leave DARPA contract errors systematically undetected. Option B is an arbitrary threshold claim — the question is whether 97.2% is consistent across segments, not whether it clears a specific number. Option C misidentifies the problem; the issue is sampling strategy (stratified by grant type), not sample size. Option D is incorrect — segment-level validation is necessary regardless of extraction method.
---

## Question 26

Your extraction system reports a confidence score for each extracted field. You set a confidence threshold of 0.85: extractions above this threshold are auto-committed, and those below go to human review. After three months, analysts report that 12% of auto-committed extractions still contain errors, and some errors occur on high-confidence extractions for certain document types. What is the correct diagnostic step?

A) Analyze the error rate stratified by document type and field to identify whether the confidence scores are poorly calibrated for specific segments, then recalibrate review thresholds using a labeled validation set for each segment.
B) Lower the auto-commit threshold from 0.85 to 0.80 to send more extractions to human review.
C) Increase the model temperature to improve the calibration of confidence scores.
D) Switch from field-level confidence scores to document-level confidence scores to simplify the thresholding logic.

**Answer:** A

**Explanation:** The pattern — errors occurring on high-confidence extractions for certain document types — is a clear signal of miscalibration. Confidence scores that are well-calibrated on average can be systematically over-confident for specific document types or field combinations. The correct response is stratified analysis and threshold recalibration using a labeled validation set per segment. Option B (lowering the threshold globally) is a blunt instrument that increases human review volume across all categories without fixing the underlying miscalibration for specific segments. Option C (higher temperature) does not affect confidence calibration — confidence scores are produced by the model's output distribution and are not tuned by temperature. Option D (switching to document-level scores) loses granularity — a document may have reliable date extraction but unreliable amount extraction, which field-level scores correctly capture.
---

## Question 27

Your extraction system processes 200 documents per day. You want to run confidence-scored extractions through a human review queue. The model outputs a single document-level confidence score. Reviewers report that they spend most of their time on documents the model was highly confident about, finding few errors, while genuinely problematic documents (with multiple field-level issues) get less attention. What design change addresses this?

A) Redesign the output schema to include field-level confidence scores for each extracted value, then route documents to review based on the minimum or average field confidence rather than a single document score.
B) Increase the document-level confidence threshold to 0.95 to reduce the volume of auto-committed documents.
C) Add a second Claude pass that re-evaluates all extractions and outputs a revised document-level confidence score.
D) Use stratified random sampling to select 10% of high-confidence documents for random audit rather than confidence-based review routing.

**Answer:** A

**Explanation:** Document-level confidence scores average away field-level issues — a document with ten confident extractions and two ambiguous ones gets a high aggregate score. Field-level confidence scores expose the specific problematic fields and can route documents for review based on the worst-performing fields rather than the average. Option B (raising threshold) reduces review volume but does not fix the routing logic; reviewers would still spend time on documents with uniformly high confidence. Option C (second Claude pass for re-scoring) adds cost without redesigning the scoring granularity — a second pass producing another document-level score has the same aggregation problem. Option D (random sampling) is a valuable ongoing quality check but does not fix the targeted review routing problem.
---

## Question 28

Your extraction pipeline for pharmaceutical trial reports uses a three-pass architecture: first pass extracts raw data, second pass validates cross-field consistency, third pass enriches with external reference data. The second-pass validation step finds a conflict between `primary_endpoint_result` (marked as "statistically significant") and `p_value` (0.08, which is above the 0.05 significance threshold). What should the extraction output include?

A) A `conflict_detected: true` boolean alongside both the `primary_endpoint_result` and `p_value` values, preserving both extracted values with the conflict explicitly annotated for downstream review.
B) Override `primary_endpoint_result` to "not statistically significant" based on the `p_value`, since numeric values are more reliable than text descriptions.
C) Override `p_value` to 0.04 to align with the text description, since authors are unlikely to mislabel their primary endpoint.
D) Discard the document and request a corrected source from the data provider.

**Answer:** A

**Explanation:** The correct design for semantic conflicts is to preserve both values and flag the conflict explicitly. The source document contains an apparent inconsistency — it is not the extraction system's role to adjudicate which value is correct. A `conflict_detected` boolean alongside both values gives downstream reviewers (or human analysts) the full picture to investigate. Option B (overriding text with numeric) makes an assumption about data reliability that the extraction system is not qualified to make — the p-value might be a typo. Option C makes the opposite assumption with the same problem. Option D (discarding the document) is an overreaction to a data quality issue that should be flagged and escalated, not silently eliminated from the dataset.
---

## Question 29

You are designing a few-shot extraction prompt for court documents. The documents vary in structure: some have a formal "PARTIES" section listing plaintiffs and defendants, while others embed party information throughout the body text. Your current prompt (instructions only, no examples) achieves 91% accuracy on formal-structure documents but only 67% on embedded-structure documents. What is the most targeted fix?

A) Add 2–3 few-shot examples specifically showing correct extraction from embedded-structure documents, demonstrating how to identify party names when they appear in body text rather than in a dedicated section.
B) Add a document classification step before extraction that routes formal-structure and embedded-structure documents to separate extraction prompts.
C) Lower the schema requirement by making party-name fields optional to reduce errors on embedded-structure documents.
D) Add an instruction: "Party information may appear anywhere in the document; do not assume a dedicated PARTIES section exists."

**Answer:** A

**Explanation:** The 24-point accuracy gap between document structures is a clear signal that the model needs demonstrations of how to handle the harder format. Few-shot examples specifically targeting embedded-structure documents allow the model to generalize the extraction pattern to novel embedded layouts. Option B (classification + routing) is a valid but over-engineered solution for this stage; the simpler fix is augmenting the existing prompt with targeted examples before adding infrastructure. Option C (making fields optional) reduces errors by lowering standards — correct parties would simply be omitted from embedded documents. Option D (adding an instruction) is better than nothing but is less effective than concrete examples showing the model exactly how to identify party names in body text.
---

## Question 30

Your extraction prompt for supply chain documents uses detailed instructions but produces inconsistently formatted addresses in the `supplier_address` field — sometimes as a single string, sometimes as a structured object, and sometimes as an abbreviated form. You have added the instruction "format all addresses as a complete, single-line string" but inconsistency persists. What is the next most effective step?

A) Add 2–3 few-shot examples showing the exact desired address format for varied input formats (multi-line address, abbreviated address, address with suite numbers), demonstrating the normalization expected in each case.
B) Add a post-extraction regular expression validator that enforces address format and rejects non-conforming outputs.
C) Split `supplier_address` into five separate fields (`street`, `city`, `state`, `zip`, `country`) with individual type constraints.
D) Change the instruction to "addresses must include street, city, state, ZIP, and country separated by commas on one line."

**Answer:** A

**Explanation:** When detailed instructions alone produce inconsistent results, few-shot examples are the most effective next step. Showing the model exactly how "123 Main St, Suite 400, Chicago, IL 60601, USA" is derived from various source formats anchors the output format in a way instructions cannot. Option B (post-extraction validation) catches the problem but does not fix it — it would trigger retries without guiding the model toward the correct format. Option C (splitting into five fields) changes the data model and may be the right long-term schema design, but it does not solve the immediate inconsistency problem and changes the output structure that downstream consumers expect. Option D replaces one imprecise instruction with a more detailed one — this is an improvement but less effective than concrete examples, and the question notes that instruction-based approaches have already been tried.
---

## Question 31

A developer on your extraction team proposes using `tool_choice: "auto"` for all extraction requests, arguing that it gives Claude flexibility to ask clarifying questions when documents are ambiguous. What is the flaw in this reasoning for a production batch extraction system?

A) `tool_choice: "auto"` allows Claude to return a text response instead of calling an extraction tool, producing unconstructured output that breaks downstream schema validation and pipeline integration.
B) `tool_choice: "auto"` forces Claude to always call a tool, preventing clarifying questions entirely.
C) `tool_choice: "auto"` is not supported with the Message Batches API, making it incompatible with batch processing.
D) `tool_choice: "auto"` increases latency significantly compared to forced tool selection.

**Answer:** A

**Explanation:** `tool_choice: "auto"` is the default mode where Claude decides whether to call a tool or respond with text. In a production batch pipeline, this means ambiguous documents might produce text responses ("I need more information to extract...") instead of structured tool calls — breaking JSON parsers, failing schema validation, and requiring special-case handling. The "flexibility to ask clarifying questions" is actually a bug in automated extraction: the system has no user to answer those questions. Option B is exactly wrong — `"auto"` allows text responses, not the other way around. Option C is incorrect; `tool_choice` options are supported in batch requests. Option D has no documented basis; tool selection mode does not materially affect latency.
---

## Question 32

You are designing an extraction schema for financial transactions. The `transaction_type` field needs to handle standard categories (debit, credit, transfer) plus rare transaction types that appear in 2% of documents. A developer proposes using a free-text `transaction_type` string with prompt instructions to use standard values. What is the risk, and what is the better design?

A) Free-text fields with instructions risk inconsistent values ("Transfer", "TRANSFER", "wire transfer") that break downstream filters and reporting. Use an enum for standard values plus `"other"` with a `transaction_type_detail` string for rare types.
B) Free-text fields risk model hallucination of transaction types. Use a boolean `is_standard_transaction` flag with a separate `non_standard_description` field.
C) Free-text fields are fine because the 2% rare types are too infrequent to matter for downstream systems.
D) The risk is that instructions are ignored for the standard values. Solve this by adding few-shot examples for every standard transaction type.

**Answer:** A

**Explanation:** Free-text fields without enum constraints produce inconsistent values that break exact-match filters, case-sensitive queries, and frequency counts. The `"other"` + detail field pattern preserves schema consistency for the 98% common case while gracefully handling the 2% edge cases with interpretable detail text. Option B (boolean + description) loses the standard category classification — downstream queries for "all credit transactions" would require parsing both the boolean and description fields, adding unnecessary complexity. Option C is incorrect — even 2% inconsistency in a `transaction_type` field used for filtering and aggregation will produce unreliable reports. Option D (few-shot for every standard type) addresses model behavior but not the schema enforcement; the field would still accept any string.
---

## Question 33

Your extraction system achieves 97% accuracy on medical record documents with a standard 200-token extraction schema. Your team is extending the system to extract 45 additional fields for a research application, expanding the schema to 800 tokens. After deployment, accuracy on the original 22 core fields drops from 97% to 91%. What is the most likely cause and fix?

A) The expanded schema increases cognitive load and spreads model attention across more fields, degrading accuracy on original fields. Split into two extraction passes: the first extracts the original 22 core fields, the second extracts the 45 research fields.
B) The 800-token schema exceeds the tool definition size limit. Compress field descriptions to reduce token count.
C) The additional fields confuse the model because they have similar names to existing fields. Rename the 45 new fields to use distinct terminology.
D) Accuracy degradation is expected when adding fields. Retrain the model on documents with the extended schema.

**Answer:** A

**Explanation:** Adding 45 fields to a schema increases extraction complexity and can degrade accuracy on previously reliable fields — a form of attention dilution at the schema level. The correct architectural response is splitting into focused passes: one for core fields (preserving 97% accuracy) and one for research fields (a separate optimization target). Option B has no basis — there is no documented tool definition token size limit that would cause accuracy to drop in this way. Option C incorrectly attributes the issue to naming conflicts; the degradation affects all original fields, not just those with similar names. Option D misunderstands the problem — this is a prompting/architecture issue, not a model training issue.
---

## Question 34

Your extraction system sends follow-up validation requests when initial extractions fail schema checks. The follow-up prompt includes: (1) the original document, (2) the failed extraction output, and (3) the validation error message. After implementing this loop, 78% of failed extractions are corrected on the first retry. For the remaining 22% that still fail after retry, you observe that most involve the `regulatory_reference_number` field, which requires citing a specific regulatory code not present in the document itself. What is the correct action for this category of failures?

A) Terminate the retry loop for `regulatory_reference_number` failures and route these documents to human review with a note explaining that the required regulatory reference is not in the source document.
B) Add a third retry with a more detailed error message explaining that the regulatory reference number must follow a specific format.
C) Make `regulatory_reference_number` a required field with an explicit format constraint to force the model to look harder for the value.
D) Increase the number of retry attempts to 5 for this field category.

**Answer:** A

**Explanation:** When required information is genuinely absent from the source document, retries cannot succeed — the model cannot extract information that is not there. The 22% persistent failures with `regulatory_reference_number` are not formatting errors but rather cases where the document simply does not contain the required reference. Continuing to retry is wasteful; the correct action is to recognize the information-absent pattern and escalate to human review with a diagnostic note. Option B adds a third retry for a situation where the model is not miscounting — it's correctly reporting absent information. Option C (making the field required with format constraints) worsens the situation by adding structural pressure to fabricate a value, which is exactly the hallucination risk for required fields on absent data. Option D multiplies wasted API calls with no improvement in success rate.
---

## Question 35

Your extraction system processes multi-document legal cases, each consisting of 8–12 related contracts. During a session extracting from a 10-document case, the system begins producing summaries that reference "typical contract language" rather than the specific clause language extracted from documents 4–7 in the case. Documents 1–3 and 8–10 are cited accurately. What is the most likely explanation and the correct fix?

A) The documents in positions 4–7 are experiencing the "lost in the middle" effect: models reliably process information at the beginning and end of long inputs but may give less attention to middle-position content. Place high-priority documents (or summaries of key findings) at the beginning and end of the aggregated input, with explicit section headers.
B) The model has reached its context limit and is generating from training data rather than the provided documents. Switch to a model with a larger context window.
C) Documents 4–7 contain complex legal language that the model substitutes with simpler "typical" language. Add an instruction to preserve exact clause language.
D) The session has too many tool calls accumulated in context. Clear the conversation history and restart extraction from document 4.

**Answer:** A

**Explanation:** The pattern — accurate processing of beginning and end documents with degraded processing of middle documents — is the classic "lost in the middle" effect. The fix is architectural: reorganize inputs to place critical documents or summary findings at the beginning and end of the context window, and use explicit section headers to anchor model attention. Option B incorrectly diagnoses a context limit issue; context limits produce truncation errors, not selective middle-position degradation. Option C misattributes the problem to content complexity rather than positional effects — the model processes complex language accurately in positions 1–3 and 8–10, showing the issue is positional, not linguistic. Option D would lose extraction progress on documents 1–3 and reintroduce the same positional problem.
---

## Question 36

Your extraction pipeline processes customer complaint letters for a financial services company. Each letter triggers 3–4 tool calls to look up account details, transaction history, and regulatory records. Each tool call returns a full data payload of 40+ fields per lookup. After processing 8 letters in a session, the extraction quality on the current letter degrades significantly — the model begins confusing account numbers and transaction dates from earlier letters. What is the most effective context management fix?

A) Trim tool result payloads before they accumulate in context, retaining only the 5–8 fields relevant to the current extraction task rather than passing full 40+ field responses.
B) Process each letter in a separate, fresh API session rather than accumulating tool results across letters.
C) Add an instruction at the start of each new letter: "Focus only on the current letter; discard information from previous letters."
D) Switch to a model with a 200K token context window to accommodate the accumulated tool results.

**Answer:** A

**Explanation:** Verbose tool outputs are a primary source of context pollution in multi-document sessions. Trimming to only relevant fields before accumulation in context reduces the token burden of each tool call, allowing more letters to be processed within a manageable context budget before quality degrades. Option B (fresh session per letter) is a valid approach but throws away the business value of multi-letter session context — the system may need to track patterns across letters. Option C is an instruction-based approach to a structural problem; instructions cannot reliably suppress well-established context from interfering with current reasoning. Option D (larger context window) delays the problem but doesn't solve it — eventually, 40-field tool results will fill even a 200K context window across many letters.
---

## Question 37

Your extraction system processes long financial reports (average 80 pages). The system passes the entire report as a single user turn and requests extraction of 12 specific fields. Analysis of 300 reports reveals that fields referencing data from pages 30–50 are extracted with 71% accuracy, while fields from pages 1–20 and pages 60–80 achieve 94% accuracy. How should you redesign the extraction architecture?

A) Segment reports into sections (front matter, body sections, appendices) and run targeted per-section extractions with explicit section headers and position-anchored key findings summaries, placing each section's most critical data at the start of its extraction prompt.
B) Increase the number of few-shot examples to improve extraction from middle sections.
C) Process only the first 20 pages and last 20 pages of each report, skipping the middle pages where accuracy is low.
D) Switch to synchronous processing to give the model more time to attend to middle-section content.

**Answer:** A

**Explanation:** The accuracy pattern by page range is the "lost in the middle" effect at document scale. The structural fix is to break the document into sections and extract from each section independently, placing key content at the beginning of each section's extraction context rather than burying it in the middle of an 80-page document. Option B (more few-shot examples) addresses model behavior generally but does not fix a positional attention issue — the model would still give less attention to middle-position content. Option C (skipping middle pages) would eliminate the accuracy problem by eliminating the data — pages 30–50 likely contain critical content. Option D (synchronous vs. batch) is irrelevant to attention quality; processing mode does not affect positional attention within a single context window.
---

## Question 38

Your multi-document extraction session processes a series of purchase orders from the same supplier over 6 months. After extracting from 15 purchase orders in sequence, the system incorrectly reports the total spend as $1.2M when the correct total is $1.8M. Investigation reveals that the amounts from orders 5–9 were correctly extracted initially but were compressed to vague summaries in a progressive summarization step. What is the root cause and the correct fix?

A) Progressive summarization of numerical values creates data loss. Maintain a persistent "case facts" block containing exact transactional values (order IDs, amounts, dates) that is passed unchanged in each subsequent prompt, outside the summarized history.
B) The progressive summarization prompt needs more specific instructions to preserve all dollar amounts.
C) Increase the context window to avoid triggering the summarization step.
D) Store the total spend in a database and query it separately rather than computing from extracted values.

**Answer:** A

**Explanation:** Numerical values, dates, and precise financial figures are exactly what progressive summarization loses — condensing "$47,500 on PO-2024-0045" to "a significant purchase in Q1" eliminates the data needed for accurate aggregation. The correct pattern is a persistent "case facts" block that holds exact transactional values outside the summarized history, ensuring no numeric precision is lost through summarization. Option B (better summarization instructions) is the classic approach that fails — summarization inherently compresses, and instructions cannot prevent information loss at scale. Option C (larger context window) delays but does not eliminate the issue; eventually summarization is still needed. Option D (database totaling) is a reasonable optimization but does not address the underlying context management flaw — other aggregations would still be affected.
---

## Question 39

Your extraction agent processes claims from multiple customers in a single session to improve efficiency. After processing 10 claims, the agent begins confusing order numbers across customers — attributing Claim #7843 from Customer A to Customer B's account. What context management pattern would most effectively prevent this cross-contamination?

A) Extract and persist structured claim data (claim ID, customer ID, amounts, status) into a separate "active claims" context layer that is explicitly included in each prompt as a structured block separate from the conversational history.
B) Process each claim in a separate API session to prevent any cross-claim context contamination.
C) Add the instruction "do not mix up customer claims" to the system prompt.
D) Reduce the session to processing a maximum of 5 claims before starting a new session.

**Answer:** A

**Explanation:** Maintaining a structured "active claims" context layer — a clearly labeled block of current claim data included in each prompt — prevents the model from confusing data across claims because the authoritative claim data is always explicitly present in a structured, labeled form. This is the multi-issue session management pattern. Option B (separate sessions) would work but sacrifices efficiency (the entire reason for multi-claim sessions) and prevents cross-claim analysis. Option C (instruction to not mix claims) is ineffective against structural context contamination — the model isn't choosing to confuse claims, it's losing track in a large context. Option D (limit to 5 claims) is an arbitrary mitigation that reduces but does not eliminate the underlying problem.
---

## Question 40

During a 90-minute extraction session processing a large corpus of regulatory filings, the system begins producing extraction outputs that reference "standard regulatory language" instead of specific filing content. The extraction agent's context is now 85% full. What is the appropriate intervention?

A) Use `/compact` to reduce context usage, then inject a summary of key extraction findings made so far into the new context before continuing the session.
B) Terminate the session and reprocess all regulatory filings from the beginning in a new session.
C) Add the instruction "ignore your previous context and focus only on the current document" to the next prompt.
D) Switch to a model with a larger context window to accommodate the full session without compaction.

**Answer:** A

**Explanation:** `/compact` (or equivalent context summarization) is the designed mechanism for managing context-full sessions during extended extraction work. The critical step is injecting a summary of key findings made so far before continuing, so that previously extracted data is not lost. Option B (full restart) discards all work done in the 90-minute session. Option C (ignore previous context) is an instruction that cannot override structural context effects — the model cannot simply "ignore" its prior context. Option D (larger context window) is a longer-term architectural consideration but does not help in the current session where context is already 85% full.
---

## Question 41

Your extraction system is processing highly ambiguous government contract documents. For 7% of documents, the extraction agent correctly identifies that a key field (`award_type`) is ambiguous because the document uses both "firm-fixed-price" and "cost-plus" language for what appears to be a hybrid contract structure. What is the correct escalation pattern?

A) Have the agent flag the specific ambiguity (both values extracted with conflict noted) in a structured output field, then route these documents to a contract specialist for review rather than making an arbitrary selection.
B) Default to the first occurrence of contract type language found in the document as the `award_type` value.
C) Select the `award_type` value that appears most frequently in the document.
D) Use `tool_choice: "auto"` so Claude can ask a clarifying question in a text response when contract type is ambiguous.

**Answer:** A

**Explanation:** Ambiguous or contradictory source data should be escalated with the conflict explicitly documented, not resolved by heuristic selection. Flagging both extracted values with a conflict note in the structured output gives the human reviewer the full picture needed to make a correct determination. Option B (first occurrence) and Option C (most frequent) are both arbitrary heuristics that could produce systematically wrong classifications for hybrid contracts. Option D (`"auto"` for clarifying questions) is inappropriate for a batch processing pipeline where there is no interactive user to answer clarifying questions.
---

## Question 42

Your extraction system processes procurement documents from multiple government agencies. Some documents use identical form numbers (e.g., "Form SF-1449") but have different field layouts across agencies. When a document type is ambiguous, the agent sometimes halts and requests clarification. For a production batch system processing 500 documents per day, what is the correct escalation design for these ambiguous cases?

A) Define explicit escalation criteria in the system prompt identifying which specific ambiguity patterns (form number present but agency not identifiable, multiple conflicting layout patterns) trigger routing to human review, with few-shot examples of each escalation scenario.
B) Add the instruction "make your best guess when the form layout is ambiguous" to prevent halting.
C) Create a separate escalation model that reviews halted extractions and selects the most likely layout.
D) Process all SF-1449 documents with each of the known agency-specific schemas and return the extraction that has the fewest null values.

**Answer:** A

**Explanation:** Explicit escalation criteria with few-shot examples is the correct pattern for production extraction systems: it defines precisely when to escalate (specific ambiguity patterns) versus when to proceed (identifiable document types), preventing both over-escalation (halting on every ambiguous form) and under-escalation (guessing incorrectly on genuinely ambiguous ones). Option B ("make your best guess") eliminates appropriate escalation and will produce confidently wrong extractions for hybrid-layout documents. Option C (separate escalation model) adds infrastructure without defining when escalation is appropriate — the escalation model would face the same ambiguity. Option D (schema with fewest nulls) is a heuristic that rewards filling fields with fabricated values rather than genuinely extracting present information.
---

## Question 43

A downstream analytics system is failing because it receives empty arrays from your extraction agent's `related_document_ids` field. Investigation reveals that the extraction subagent returns empty arrays as `[]` when no related documents are found, but returns empty arrays in the same format when a database lookup times out. The analytics system cannot distinguish between "no related documents" and "lookup failed." What is the correct error propagation fix?

A) Distinguish access failures from valid empty results in the subagent's return value: return `{"related_document_ids": [], "lookup_status": "success"}` for confirmed empty results and `{"related_document_ids": null, "lookup_status": "timeout", "failure_type": "database_timeout"}` for failures.
B) Add a retry inside the subagent so it only returns empty arrays after confirming the database is actually empty.
C) Return `null` instead of `[]` for all empty or failed lookups, and update the analytics system to treat `null` as an error indicator.
D) Add a warning log entry when the lookup times out, and let the analytics system query the logs to diagnose failures.

**Answer:** A

**Explanation:** The core error propagation principle is distinguishing access failures from valid empty results so downstream consumers can make appropriate decisions. A structured response with `lookup_status` and `failure_type` fields gives the analytics system and coordinator exactly the context needed to decide whether to retry, proceed without related documents, or escalate. Option B (retry until confirmed empty) adds latency and may loop indefinitely on persistent database outages. Option C (null for both cases) conflates two semantically different states into one signal — downstream systems still cannot distinguish "confirmed empty" from "failed lookup." Option D (log-based diagnosis) requires the analytics system to query an external system for every null result, adding latency and coupling.
---

## Question 44

Your multi-agent extraction system has a coordinator agent that delegates document classification to a classification subagent and data extraction to an extraction subagent. The classification subagent encounters an API timeout on a specific document. Rather than propagating the error, the classification subagent returns `"document_type": "unknown"` as a valid classification. The extraction subagent then applies a generic schema to the document, producing low-quality output. What is the root cause, and what is the correct design?

A) Silently substituting a failure result for an error is an anti-pattern. The classification subagent should return a structured error including failure type ("api_timeout"), what was attempted, and any partial results, so the coordinator can decide whether to retry or use a fallback classifier.
B) The extraction subagent should be more resilient by using a wider generic schema that works for all document types.
C) The coordinator should automatically retry classification for all documents classified as "unknown."
D) Add a confidence score to the classification output so the extraction subagent can detect low-quality classifications.

**Answer:** A

**Explanation:** Silently converting a failure into a plausible-looking result is the fundamental error propagation anti-pattern in multi-agent systems. By returning `"unknown"` instead of an error, the classification subagent hides the failure from the coordinator, which cannot then make an informed recovery decision (retry with a different classifier, use a heuristic, or escalate). Structured error propagation — including failure type and what was attempted — is the correct design. Option B (wider generic schema) accepts degraded extraction quality as a design outcome rather than addressing the classification failure. Option C (retry all "unknown" classifications) conflates intentional "unknown" outcomes with failure-induced ones — the coordinator cannot tell the difference without structured error context. Option D (confidence score) is a partial improvement but still passes a result that looks valid when it represents a failure.
---

## Question 45

Your extraction coordinator receives a structured error from the document classification subagent: `{"failure_type": "partial_classification", "attempted_query": "classify document type from headers", "partial_results": {"document_family": "financial", "specific_type": null}, "alternative_approaches": ["classify from footer data", "classify from form number"]}`. What is the coordinator's optimal recovery action?

A) Use the partial result (`document_family: "financial"`) to narrow the extraction schema options, then retry classification using the suggested alternative approach ("classify from footer data" or "classify from form number") before proceeding to extraction.
B) Discard the partial result and retry the full classification from scratch.
C) Proceed directly to extraction using only the `document_family` partial result, skipping the `specific_type` determination.
D) Escalate immediately to human review since the classification subagent was unable to complete its task.

**Answer:** A

**Explanation:** Structured error context is designed to enable intelligent coordinator recovery — not just signal failure. The partial result narrows the search space (financial document family) while the suggested alternatives provide actionable next steps. Using both the partial result and the suggested retry approach is the optimal recovery path. Option B (full restart) discards the partial result, wasting the work done by the subagent. Option C (proceed with partial result) skips the `specific_type` determination, which may be critical for applying the correct extraction schema — financial documents have very different schemas (invoices vs. reports vs. statements). Option D (immediate escalation) is premature when structured recovery alternatives are explicitly available.
---

## Question 46

Your extraction system processes patent applications in a multi-session workflow that can span several days. A processing session is interrupted mid-way through a 200-document batch when the coordinator agent crashes. When the system restarts, it must determine which documents have been processed and which have not, to resume without reprocessing already-completed extractions. What design pattern enables reliable crash recovery?

A) Design each agent to export structured state to a known location (a manifest file per batch run) after completing each document extraction, including document IDs processed and their output locations. On restart, the coordinator loads this manifest and injects it into the agent's initial context to resume from the last checkpoint.
B) Reprocess all 200 documents from scratch on restart, since partial results may be inconsistent.
C) Use a monotonically incrementing document counter in the system prompt that agents update after each extraction.
D) Store processing state only in the coordinator's conversation history, and resume the conversation from the last turn.

**Answer:** A

**Explanation:** Structured state exports (manifests) to a known filesystem or database location are the correct crash recovery design. They persist across process boundaries and allow the coordinator to resume precisely from the last checkpoint. Option B (full restart) wastes all previously completed processing and reprocessing cost for 200 documents could be significant. Option C (counter in system prompt) fails because the system prompt is not writable at runtime — it's a static configuration, not a state store. Option D (state in conversation history) fails because conversation history is lost when the coordinator crashes; it does not persist across process restarts.
---

## Question 47

Your extraction system delegates the extraction of technical specifications from 500 engineering drawings to specialized subagents (one per drawing type: mechanical, electrical, structural). The coordinator receives results from all subagents and synthesizes a master bill of materials. After three months, engineers report that the master BOM systematically undercounts electrical components. Mechanical and structural components are accurate. What is the most likely root cause?

A) The electrical subagent's results are positioned in the middle of the coordinator's synthesis context, making them susceptible to the "lost in the middle" effect. Restructure the coordinator's input to place electrical subagent findings at the beginning or end, with an explicit section header.
B) The electrical drawings use a different file format that the subagent cannot parse correctly.
C) The electrical subagent has a smaller context window than the mechanical and structural subagents.
D) The synthesis step is applying a different extraction logic to electrical components than to mechanical and structural ones.

**Answer:** A

**Explanation:** The pattern — accurate processing of some subagent outputs but systematic undercounting from one specific source — when mechanical and structural are correct, is consistent with the "lost in the middle" effect in the synthesis context. If the electrical subagent's findings are consistently positioned in the middle of the coordinator's synthesis prompt, they receive less attention regardless of quality. The fix is positional: move electrical findings to the beginning or end and add an explicit section header. Option B (file format) would affect the electrical subagent's own accuracy, not the coordinator's synthesis — the question implies the subagents are producing results. Option C (smaller context window for one subagent) is a baseless fabrication not supported by any real architectural constraint. Option D is speculative; the synthesis logic is described as uniform across drawing types.
---

## Question 48

Your multi-agent extraction system processes merger and acquisition documents. The due diligence subagent returns very verbose outputs including full reasoning chains (3,000–5,000 tokens per document analysis) in addition to structured findings. The synthesis agent has a limited context budget of 32K tokens. After 8 documents, the synthesis agent runs out of context. What architectural change most directly addresses this?

A) Modify the due diligence subagent to return structured outputs containing only key findings, source citations, and confidence scores — not verbose reasoning chains — so the synthesis agent receives compact, information-dense inputs within its context budget.
B) Increase the synthesis agent's context budget to 200K tokens.
C) Have the synthesis agent process and summarize each subagent output as it arrives, discarding the original after summarization.
D) Reduce the batch size from 8 documents to 4 documents per synthesis pass.

**Answer:** A

**Explanation:** When downstream agents have limited context budgets, upstream agents should return structured, compact outputs rather than verbose content and reasoning chains. Returning only key findings, citations, and confidence scores from the due diligence subagent addresses the root cause — the verbosity of upstream outputs — rather than working around it. Option B (larger synthesis context) is a valid long-term scaling consideration but does not fix the architectural mismatch — verbose outputs will eventually exhaust even a 200K context. Option C (progressive summarization) risks losing precise numerical values, dates, and source attributions during compression. Option D (reducing batch size) halves throughput and does not fix the underlying verbosity issue — 4 documents at 5,000 tokens each still consumes 20K+ tokens.
---

## Question 49

Your extraction system achieves 97.4% overall accuracy across 10,000 processed documents. Your team is evaluating whether to reduce the human review rate from 15% to 3%. A data scientist proposes computing accuracy by document type before making this decision. You have five document types: standard contracts (60% of volume), amendments (20%), side letters (12%), exhibits (5%), and memoranda of understanding (3%). Which sampling strategy best validates whether 3% review is safe across all types?

A) Use stratified random sampling to draw a review sample that includes proportional representation of each document type, measuring accuracy per type rather than in aggregate, to verify consistent performance across all segments before reducing review rates.
B) Sample 3% of documents uniformly at random from all document types and measure aggregate accuracy.
C) Focus sampling on the most common document type (standard contracts at 60%) since it drives the aggregate accuracy metric.
D) Sample only from documents where model confidence is above 0.90, since these are the ones that would be auto-committed at 3% review.

**Answer:** A

**Explanation:** Stratified sampling ensures all document types are represented in the validation sample, including low-volume types like MoUs (3% of volume) that could have much lower accuracy but contribute little to the aggregate metric. The 97.4% aggregate could easily reflect 99% accuracy on standard contracts masking 85% accuracy on MoUs. Option B (uniform random) likely under-samples rare document types — at 3% of a 10,000 document corpus, only ~9 MoUs would be reviewed, insufficient to measure accuracy for that type. Option C (focus on most common) explicitly ignores the rare document types where undetected accuracy problems are most likely. Option D (high-confidence only) is the opposite of what is needed — the review should include a stratified sample of high-confidence extractions precisely to validate that high confidence correlates with actual accuracy across all types.
---

## Question 50

Your extraction system reports field-level confidence scores for all 15 extracted fields. You want to set review thresholds for each field independently. Currently, you use a uniform threshold of 0.85 across all fields. An analyst notes that the `contract_value` field (where errors are costly) has high average confidence (0.91) but a disproportionate share of costly errors — 40% of all dollar-amount errors come from this field. What is the correct response?

A) Calibrate the `contract_value` threshold separately using a labeled validation set, measuring the relationship between confidence score and actual accuracy for that field specifically, then set a higher threshold for this field based on the calibration data.
B) Lower the `contract_value` threshold from 0.85 to 0.75 to reduce costly errors by sending more to human review.
C) Add a second Claude pass specifically for `contract_value` to improve extraction accuracy before scoring.
D) Remove field-level confidence scores for `contract_value` and always route it to human review regardless of model confidence.

**Answer:** A

**Explanation:** The pattern — high average confidence but disproportionate errors — is a classic calibration problem: the model is systematically overconfident on `contract_value` extractions. The correct fix is field-level calibration using a labeled validation set, which produces an empirical relationship between confidence score and actual accuracy for that specific field. This calibration reveals what threshold actually corresponds to acceptable accuracy. Option B (lowering to 0.75) is arbitrary and based on guesswork — without calibration data, there is no principled reason to choose 0.75. Option C (second extraction pass) improves accuracy but does not fix the miscalibration of confidence scores for this field. Option D (always route to human review) is overly conservative and eliminates the efficiency benefit of the confidence scoring system for this field.
---

## Question 51

Your extraction system processes pharmaceutical trial data from multiple sources: published papers, clinical trial registry entries, and internal lab reports. A synthesis agent combines findings from all three source types. After deployment, pharmacovigilance reviewers report that the synthesis reports confidently cite statistics without indicating which source type each statistic came from, making independent verification impossible. What is the correct fix?

A) Require all subagents to output structured claim-source mappings (source document name, URL or document ID, relevant excerpt) alongside each extracted statistic, and instruct the synthesis agent to preserve and render these mappings in the final report.
B) Add a "Sources" section at the end of each synthesis report listing all documents consulted.
C) Have the synthesis agent add footnote numbers to all statistics and include a bibliography.
D) Store source metadata in a database and build a separate provenance lookup tool for pharmacovigilance reviewers.

**Answer:** A

**Explanation:** Source attribution must be preserved at the claim level, not just at the document level. A "Sources" section (Option B) tells reviewers which documents were consulted but not which statistic came from which document. The correct design is structured claim-source mappings that flow from subagents through the synthesis step, so each reported statistic is linked to its specific source document and excerpt. Option B's document-level attribution loses the claim-to-source connection. Option C (footnote bibliography) is better than Option B but relies on footnote numbers being correctly assigned during synthesis, which can fail when synthesis agents rewrite or paraphrase statistics. Option D (separate lookup tool) adds infrastructure and requires reviewers to perform additional queries for every statistic, rather than having provenance embedded in the report.
---

## Question 52

Your extraction and synthesis system analyzes clinical trial data. The document analysis subagent processes a paper and returns this output: "The study found significant improvements in patient outcomes." The synthesis agent incorporates this as a confirmed finding. A domain expert later notes that the original paper reported a p-value of 0.049 (marginally significant) with the authors explicitly cautioning about small sample size. What structural change prevents this information loss?

A) Require the document analysis subagent to output structured data including the exact statistical values (p-value: 0.049), author qualifications, sample size, and original source text — not paraphrased summaries — so the synthesis agent works from precise structured data, not prose compression.
B) Add an instruction to the document analysis subagent to "be more precise in reporting statistical findings."
C) Have the synthesis agent request the original paper to verify all summarized statistics.
D) Add a confidence score to the document analysis output so the synthesis agent knows when findings are marginal.

**Answer:** A

**Explanation:** The information loss happens at the subagent's summarization step, where precise quantitative values ("p=0.049, small sample size, authors cautioning") are compressed into vague qualitative descriptions ("significant improvements"). The structural fix is requiring subagents to output structured data including exact values and original source text, not narrative summaries. Option B (instruction to "be more precise") is an instruction-based approach to a structural problem — "significant improvements" is the subagent's reasonable interpretation of the paper's conclusion; it requires a schema change to force retention of precise values. Option C (synthesis agent requesting originals) adds round-trips and latency to fix a problem that should be addressed upstream. Option D (confidence score) helps route the finding for review but does not preserve the critical statistical details.
---

## Question 53

Your extraction system synthesizes findings from patent searches, technical papers, and competitor product documentation. Two sources report different market share figures for a competitor: a patent filing cites 23% market share, while a technical white paper cites 31%. The synthesis agent averages these to produce "approximately 27% market share." Why is this behavior problematic, and what is the correct approach?

A) Averaging conflicting statistics from credible sources discards the conflict signal and produces a value neither source reported. The correct approach is to annotate the conflict explicitly: report both values with their source attribution and publication dates, letting analysts determine which figure to use.
B) The synthesis agent should prefer the more recent source rather than averaging.
C) The synthesis agent should prefer the higher value as a conservative estimate for competitive analysis.
D) The synthesis agent should flag the conflict and refuse to report any market share figure until a human resolves it.

**Answer:** A

**Explanation:** Averaging conflicting statistics is an anti-pattern because it silently discards the conflict signal and produces a value that no source actually reported. The correct design preserves both values with their source attribution and publication dates — the conflict itself is analytically valuable information. Analysts may determine that one source is more recent, more authoritative, or measures a different market definition. Option B (prefer more recent) makes an authoritativeness decision the synthesis agent is not qualified to make without domain context. Option C (prefer higher value) is an arbitrary heuristic that could systematically inflate competitive threat estimates. Option D (refuse to report) is overly conservative — the synthesis agent can and should report both conflicting values with annotation.
---

## Question 54

Your extraction system synthesizes research findings from papers collected over a 5-year period. The synthesis report cites a statistic ("treatment reduces hospitalization by 34%") without indicating whether this comes from a 2019 study or a 2024 study. Medical reviewers note that treatment protocols changed significantly in 2022, making the temporal context critical for interpretation. What structural change prevents this problem?

A) Require all document analysis subagents to include publication date and data collection period as mandatory fields in their structured outputs, so the synthesis agent can include temporal context alongside each statistic in the final report.
B) Add an instruction to the synthesis agent to "include dates where possible."
C) Sort all source documents by publication date before processing so the synthesis agent encounters them in chronological order.
D) Add a post-processing step that queries each citation's source document for its publication date.

**Answer:** A

**Explanation:** Temporal context must be captured at the subagent level (during document analysis) and carried through the synthesis step as a required structured field. If the document analysis subagent does not extract and return publication dates, the synthesis agent has no data to include. Requiring publication date as a mandatory structured output field ensures temporal context is always available. Option B (synthesis agent instruction) cannot work if the subagent did not include date information in its output — the synthesis agent cannot invent dates it was never given. Option C (chronological sorting) does not cause the synthesis agent to include dates in its output. Option D (post-processing date queries) adds latency and infrastructure complexity for information that should have been captured during the initial document analysis.
---

## Question 55

Your synthesis agent produces reports that combine financial data tables, regulatory findings, and news summaries from three specialized subagents. Currently, all findings are converted to a uniform prose narrative. Financial analysts report difficulty extracting specific numbers, and legal reviewers struggle to scan regulatory findings quickly. What output design change should be made?

A) Render each content type in its appropriate format: financial data as structured tables, regulatory findings as bulleted structured lists with citation fields, and news summaries as prose — rather than converting everything to uniform narrative.
B) Return all content as JSON and let downstream applications render it appropriately.
C) Add a table of contents to the synthesis report so analysts can navigate to relevant sections.
D) Increase the detail level of the prose narrative to include all specific numbers and citations inline.

**Answer:** A

**Explanation:** Different content types have different optimal representations — forcing everything to prose removes the structural advantages of tabular financial data and the scanability of bulleted regulatory findings. The synthesis step should preserve and use the appropriate format for each content type. Option B (raw JSON) addresses the machine-readability need but is not suitable for human reviewers (financial analysts and legal reviewers, as described). Option C (table of contents) helps navigation but does not fix the prose representation of data that would be better shown as tables. Option D (more detailed prose) exacerbates the problem — more numbers embedded in prose is harder to scan than a structured table.
---

## Question 56

Your extraction system's synthesis reports cite statistics with source document names but no excerpts. During a compliance audit, auditors discover that three reported statistics cannot be verified because the cited source documents have changed since extraction. What is the minimum additional provenance information that would enable verification?

A) Require subagents to include the relevant source excerpt (the exact text from which the statistic was derived) alongside the document name and location, so auditors can verify the specific passage even if the document has been updated.
B) Add a document hash (MD5 or SHA-256) of each source document to the citation metadata.
C) Include the extraction timestamp in the synthesis report to indicate when the data was gathered.
D) Store all source documents in a content-addressed archive and reference them by hash rather than name.

**Answer:** A

**Explanation:** Including the relevant source excerpt (the exact text containing the statistic) directly in the citation metadata enables auditors to verify the extraction even when source documents have changed — they can compare the claimed excerpt against the current document or an archive version. Option B (document hash) helps verify document integrity but requires auditors to retrieve the full document and locate the relevant passage, adding steps. Option C (extraction timestamp) tells auditors when the data was gathered but does not help verify what the source said — auditors still cannot locate the specific passage. Option D (content-addressed archive) is a robust long-term infrastructure solution but requires building and maintaining an archive system; requiring excerpts in structured outputs is simpler and addresses the immediate need.
---

## Question 57

Your extraction system processes scientific literature to build a research database. The synthesis agent receives findings from a subagent that analyzed a contested meta-analysis — a paper with high citation counts but significant methodological criticism in the literature. The subagent returns: `{"finding": "caffeine consumption reduces cancer risk by 18%", "source": "Johnson et al. 2021"}`. The synthesis agent incorporates this as an established finding. What is the structural flaw, and how should it be corrected?

A) The subagent did not preserve methodological context and expert characterization of the finding. Require subagents to include a `source_characterization` field capturing whether the finding is well-established, contested, or preliminary, along with the specific methodological context (e.g., "meta-analysis with noted heterogeneity bias critiques").
B) The synthesis agent should independently evaluate all source papers before incorporating findings.
C) Add a confidence score to the subagent output so the synthesis agent can filter out low-confidence findings.
D) Use a separate fact-checking subagent to verify all reported statistics before synthesis.

**Answer:** A

**Explanation:** The structural flaw is that the subagent compressed the source's characterization — "contested meta-analysis with methodological criticism" — into a bare statistical claim with no methodological context. Requiring a `source_characterization` field preserves the information needed for the synthesis agent to correctly represent the finding as contested rather than established. Option B (synthesis agent independently evaluating papers) is impractical at scale and duplicates the document analysis subagent's function. Option C (confidence score) addresses uncertainty in extraction but not the methodological characterization of the source — a correctly extracted contested finding should still be marked as contested. Option D (fact-checking subagent) would need to access the full literature to evaluate methodological critiques — a different problem from preserving characterization that the analyzing subagent already has access to.
---

## Question 58

Your extraction coordinator manages three specialized subagents: one for public filings, one for internal documents, and one for news sources. The public filings subagent completes successfully with 45 relevant documents. The internal documents subagent fails with a timeout. The news sources subagent returns results successfully. The coordinator must produce a synthesis report. What is the correct approach to producing the report?

A) Produce the synthesis report using available data from public filings and news sources, with an explicit coverage annotation indicating that internal document findings are missing due to a subagent timeout, allowing readers to assess the completeness of the analysis.
B) Halt synthesis and retry the entire workflow until all three subagents complete successfully.
C) Proceed with synthesis using public filings and news sources, but do not disclose the internal documents gap since readers cannot access internal documents anyway.
D) Substitute the failed internal documents subagent results with historical extraction results from the most recent successful run of the same workflow.

**Answer:** A

**Explanation:** When one subagent fails in a multi-source synthesis workflow, the correct design is to produce the best available synthesis from remaining sources while explicitly annotating the coverage gap. This allows readers to calibrate their trust in the report's completeness. Option B (halt until all complete) may block indefinitely on persistent failures and prevents any value from being delivered from the 90% successful data. Option C (suppress the gap) is misleading — readers may make decisions based on a report they believe is complete when it is not. Option D (substituting historical data) introduces temporal inconsistency and may present stale information as current without disclosure.
---

## Question 59

You are designing a validation workflow for extraction outputs that will route ambiguous documents to human reviewers. The system extracts 15 fields per document; reviewers have capacity to fully review 200 documents per day out of 2,000 total extractions. You have model-generated field-level confidence scores for all 15 fields per document. How should you prioritize the 200 review slots?

A) Route documents where one or more fields have confidence scores below the calibrated threshold to review first, then fill remaining slots with stratified random samples of high-confidence documents for ongoing error rate monitoring.
B) Route the 200 documents with the lowest average document-level confidence scores.
C) Route documents randomly, since systematic selection could introduce sampling bias.
D) Route only documents where all 15 fields have confidence scores below 0.85.

**Answer:** A

**Explanation:** The optimal routing strategy serves two purposes: catching likely errors (routing low-confidence fields) and monitoring calibration quality (stratified random sampling of high-confidence extractions). Using only average document-level scores (Option B) misses documents with one very low-confidence field among many high-confidence ones — exactly the targeted review that field-level scores enable. Option C (random routing) fails to use the available confidence signal and leaves systematic error patterns undetected until the next audit cycle. Option D (all fields below threshold) is overly restrictive — a document with 14 high-confidence fields and one low-confidence field is worth reviewing for that one field.
---

## Question 60

Your extraction system processes regulatory submissions and achieves 96.8% accuracy on a monthly sample of 500 documents. After a regulatory format change, accuracy on newly formatted documents drops to 78% over a two-week period before your team detects the problem. What ongoing monitoring design would have detected this degradation faster?

A) Implement a continuous stratified sampling review: sample 5% of daily extractions stratified by document format version and review them within 24 hours, so format-specific accuracy degradation appears in monitoring dashboards within 1–2 days of the format change rather than accumulating undetected over weeks.
B) Increase the monthly sample size from 500 to 2,000 documents.
C) Add an extraction timestamp field so you can identify which documents were processed after the format change.
D) Run the full 500-document monthly sample immediately after any detected regulatory format change is announced.

**Answer:** A

**Explanation:** Continuous stratified daily sampling with rapid review turnaround is the correct detection pattern. Monthly sampling with a 500-document batch creates a two-week blind spot between samples. Stratifying by document format version ensures that new format variants are represented in each daily sample, and 24-hour review turnaround means degradation would appear in monitoring within 1–2 days. Option B (larger monthly sample) still has a multi-week detection gap. Option C (timestamp field) enables retroactive analysis after detection but does not accelerate detection. Option D (reactive sampling after announced format changes) depends on format changes being announced in advance — many formatting changes are not formally announced and are only discovered when extractions begin failing.
---
