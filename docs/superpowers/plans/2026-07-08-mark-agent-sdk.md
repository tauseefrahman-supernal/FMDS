# Mark — live Claude Agent (SDK) integration — Phase D

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [x]`.
> **Build ONLY after** the design-system migration + Hoshin work is merged AND the owner has provided an `ANTHROPIC_API_KEY`. Test it, then hand off for the owner to run.
> **Plan style (owner pref):** files + interfaces + verify intent + commits; no inline code bodies.

**Goal:** Turn Mark from scripted replies into a live Claude **agent** that reasons over the department's actual FMDS OS data (KPIs, reds, reasons/comments, 8-step KZs, Hoshin) via tools, and answers as a World Emblem AI employee with company context — behind the existing `liveReply` seam, with the scripted path kept as the bundle-safe fallback.

**Architecture:** A small **Python backend** (the existing `serve.py`, upgraded) exposes `POST /api/mark`. It uses the **Anthropic Python SDK's tool runner** (`client.beta.messages.tool_runner`) with `@beta_tool` read-only tools over the posted department context + `data/*.json`, a company-employee **system prompt**, model **`claude-opus-4-8`** + adaptive thinking. The browser's `lib/agent.js` `liveReply()` POSTs to `/api/mark` when reachable and renders the reply; if the endpoint is absent/errors (e.g. the CSP-locked hosted Artifact, or no key), it falls back to today's scripted reply. **This is the "custom agent, we host the compute" tier — NOT Managed Agents** (no Anthropic-hosted containers/sessions).

**Tech Stack:** Python `anthropic` SDK (backend only, in a venv — the browser stays zero-dep); `serve.py` upgraded to `ThreadingHTTPServer` with a JSON POST route; vanilla `fetch` from the front-end. Node test runner for the pure JS seam.

## Global Constraints
- **Model `claude-opus-4-8`; adaptive thinking** (`thinking={"type":"adaptive"}`, `output_config={"effort":"medium"}` — tune). Never downgrade the model. Stream or use the tool runner's final message (avoid HTTP timeouts).
- **Key from env only** — read `ANTHROPIC_API_KEY` via a bare `Anthropic()`; never hardcode, never log it, never send it to the browser. The key lives only in the backend process env.
- **Backend runs local AND on Railway (owner, 2026-07-09)** — the app will be hosted on **Railway** in the company account; the Railway environment injects `ANTHROPIC_API_KEY` automatically, so credentials must be **env-var-only** and the server must bind `0.0.0.0:$PORT` when `PORT` is set (default `127.0.0.1:8770` locally). The CSP-locked hosted Artifact still cannot call any backend; `liveReply` MUST fall back to the scripted reply when `/api/mark` is unreachable so the hosted demo still works. Frontend stays dependency-free and bundle-safe.
- **Read-only tools in Phase D** — Mark reads/reasons; it does not write into the stores (writes stay a front-end action). Zero-invented-data: tools return real posted context / `data/*.json` only.
- **One seam** — only `liveReply()`'s body changes on the client; the Ask Mark page, response card, docked panel, and all UI are untouched.

---

### Task 1: Backend `/api/mark` endpoint + Anthropic SDK
**Files:** upgrade `serve.py` (→ `ThreadingHTTPServer` + a `do_POST` route for `/api/mark`); create `server/mark_agent.py` (the agent logic); create `server/requirements.txt` (`anthropic`); document the backend venv in the run steps.
**Interfaces:** `POST /api/mark` body `{deptId, context, messages:[{role,content}]}` → `{reply, usage?}` (or 503 when no key). `mark_agent.run(dept_id, context, messages) -> str`.
- [x] Add the POST route (reads JSON, calls `mark_agent.run`, returns JSON; 503 + a clear message if `ANTHROPIC_API_KEY` unset so the client falls back cleanly). Keep the existing static-file serving + `no-store`. **Railway-ready:** bind host/port from `PORT` env (`0.0.0.0:$PORT` when set, else `127.0.0.1:8770`); add root `requirements.txt` (→ `anthropic`) + `railway.json` (start `python3 serve.py`) so Railway's Python builder picks it up.
- [x] `mark_agent.run` builds an `Anthropic()` client, assembles the system prompt (Task 3) + tools (Task 2), runs `client.beta.messages.tool_runner(model="claude-opus-4-8", thinking={"type":"adaptive"}, output_config={"effort":"medium"}, tools=[...], messages=[...])` to completion, returns the final assistant text.
- [x] Manual verify: with a key set, `curl -XPOST localhost:8770/api/mark -d '{...operations context...}'` returns a grounded reply; with no key, returns 503. Commit.

### Task 2: Mark's tools over the department data
**Files:** `server/mark_tools.py`.
**Interfaces:** `@beta_tool` read-only functions closing over the request's `context` + `data/*.json`: `get_department_snapshot()`, `get_kpi(kpi_id)`, `get_red_kpis()`, `get_reasons(kpi_id)`, `get_comments(kpi_id)`, `get_kz_records()`, `get_hoshin()`, `get_response_status(kpi_id)`.
- [x] Implement each to return the real slice (from the posted `context` for the dynamic stores; from `data/<deptId>.json` / `data/hoshin.json` / `data/kz-records.json` for the static parts). Clear docstrings (the tool descriptions Claude reads) stating WHEN to call each. No writes.
- [x] A small Python unit test (venv) asserting each tool returns the expected shape for a fixture context. Commit.

### Task 3: System prompt — Mark as the AI employee
**Files:** `server/mark_prompt.py` (a `build_system(dept, context)` returning the prompt string; cache-friendly — stable prefix).
- [x] Encode: Mark is World Emblem's AI employee for `<dept>`; the FMDS OS operating model (Hoshin/ocean cascade, main→sub KPIs, the 8-step problem-solving loop, standard work, the red-KPI accountability loop, the Leadership-OS roll-up); voice = a helpful, direct company colleague; grounding rule = answer only from the tools/data, say when unknown, never fabricate figures; when a KPI is red, help reason toward a cause/countermeasure and reference the real reasons/comments/KZs. Keep the dynamic context out of the frozen prefix (pass via tools) for prompt-cache hits.
- [x] Commit.

### Task 4: Wire `liveReply` to the backend (fetch-or-fallback)
**Files:** `lib/agent.js` (`liveReply` body); `views/askmark.js` (already calls `liveReply` — pass `messages` history + `context`).
**Interfaces:** `liveReply(deptId, intent, ctx)` unchanged signature; body: `try { fetch('/api/mark', {POST, body:{deptId, context: buildDeptContext(ctx.dept,...), messages}}) → reply } catch/!ok { return <existing scripted reply> }`.
- [x] Implement fetch-or-fallback; keep the scripted path exactly as-is for the failure/absent case. Timeout the fetch (e.g. 30s) → fallback.
- [x] `tests/agent-live.test.mjs`: assert that when `fetch` is unavailable (Node) `liveReply` still returns the scripted reply (fallback path) — the suite stays green with NO backend. Commit.

### Task 5: End-to-end test with the real key + verifier
**Files:** none (verification) + update `docs/BUILD-JOURNAL.md` run steps.
- [x] With the owner's `ANTHROPIC_API_KEY` exported: start the backend, open Ask Mark (Operations L2), ask "why is OTP red and what should I do?" → confirm Mark calls tools (get_red_kpis/get_kpi/get_kz_records/get_hoshin), reasons over the REAL Mexico/OTP data, and answers as a company employee; ask a Hoshin question → confirm it uses `get_hoshin`. Confirm the scripted fallback still works with the key unset.
- [x] Run the `agent-sdk-dev` verifier (Python) against `server/`; fix anything it flags. Confirm `node --test tests/*.test.mjs` stays green. Commit + document the exact run command for the owner (`ANTHROPIC_API_KEY=… python3 serve.py`).

## Open decisions (confirm at build time)
- **Streaming vs. complete reply:** Phase D returns the tool-runner's final message (simplest). Token-streaming to the chat (manual agentic loop + SSE) is a fast-follow if the latency feels long.
- **Write tools:** if the owner wants Mark to *log* a red-KPI response or advance a lifecycle stage from chat, add a write path where Mark returns a structured action the front-end applies to its stores (keeps the browser the source of truth). Out of scope for Phase D read-only.
- **Effort/latency tuning:** start at `effort:"medium"`; raise to `high` if reasoning quality needs it, lower if the chat feels slow.
