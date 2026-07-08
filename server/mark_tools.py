"""Read-only tools Mark uses to reason over department data.

build_tools(context) returns the list of @beta_tool functions handed to the
Anthropic tool runner (see server/mark_agent.py). Each tool is defined as an
inner function closing over the per-request `context` — the JSON object the
browser posts, produced by lib/context.js's buildDeptContext() — so every
request gets tools scoped to that department's own live data.

Two data sources, per the plan (docs/superpowers/plans/2026-07-08-mark-agent-sdk.md,
Task 2):
  - DYNAMIC stores (KPIs, reds, reasons, comments, accountability responses)
    come from the posted `context` — whatever the browser had in its stores
    at send time.
  - STATIC stores (8-step KZ records, the annual Hoshin plan) are read fresh
    from data/kz-records.json / data/hoshin.json on every call, scoped to
    this department, since those files are richer than what buildDeptContext
    threads through and don't change per-request.

Zero-invented-data: every tool returns only what is actually present in the
posted context or on disk. A KPI/id/thread that doesn't exist comes back as
an explicit "not found" / empty shape — never a guessed or fabricated value.

All tools are read-only: none of them write to `context` or to disk.
"""

import json
from pathlib import Path

import anthropic

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def _load_json(name):
    """Parse data/<name> fresh off disk. Raises if the file is missing/invalid
    — callers are static data.json files that are expected to exist; a
    missing file is a deployment bug, not a "no data" case to swallow."""
    with open(DATA_DIR / name, "r", encoding="utf-8") as fh:
        return json.load(fh)


def _hoshin_activities_for(hoshin, dept_id, seen=None):
    """Mirror lib/hoshin.js's activitiesFor(): a dept's own activities, or —
    when its own block is empty and it carries an `aliasOf` pointer (e.g.
    Service -> Sales) — the aliased department's activities. `seen` guards
    against a malformed alias cycle."""
    seen = seen or set()
    if dept_id in seen:
        return []
    seen.add(dept_id)
    dept = (hoshin.get("departments") or {}).get(dept_id) or {}
    activities = dept.get("activities") or []
    if activities:
        return activities
    alias_of = dept.get("aliasOf")
    if alias_of:
        return _hoshin_activities_for(hoshin, alias_of, seen)
    return []


def build_tools(context):
    """Build Mark's read-only tool set for one request's department context.

    context: the JSON object posted by the browser (lib/context.js's
        buildDeptContext() shape) — { deptId, deptName, kpis, reds, reasons,
        comments, kzRecords, responses? }. May be None (malformed/absent
        request body); treated as empty everywhere below.
    """
    ctx = context or {}
    kpis = ctx.get("kpis") or []
    reds = ctx.get("reds") or []
    reasons = ctx.get("reasons") or []
    comments = ctx.get("comments") or []
    # Accountability responses (lib/accountability.js entry shape) are not
    # yet threaded through buildDeptContext() as of this task — Task 4 wires
    # liveReply's POST body and may add a `responses` array to the posted
    # context. get_response_status() reads it defensively: until that
    # wiring lands, every KPI legitimately has "no response data available"
    # rather than a fabricated answer.
    responses = ctx.get("responses") or []
    dept_id = ctx.get("deptId")
    dept_name = ctx.get("deptName")

    def _find_kpi(kpi_id):
        return next((k for k in kpis if k.get("id") == kpi_id), None)

    @anthropic.beta_tool
    def get_department_snapshot() -> dict:
        """Get a whole-department overview: name, KPI count, red count, and
        every KPI's live id/name/rag/actual/target/owner.

        Call this FIRST for department-wide questions ("how's the department
        doing", "give me the board", "what's the state of things") or when
        you need to see every KPI at a glance before drilling into one with
        get_kpi. Returns an explicit empty kpis list if the posted context
        has no KPIs — never a fabricated department state.
        """
        return {
            "deptId": dept_id,
            "deptName": dept_name,
            "kpiCount": len(kpis),
            "redCount": len(reds),
            "kpis": kpis,
        }

    @anthropic.beta_tool
    def get_kpi(kpi_id: str) -> dict:
        """Get one KPI's full live record (rag, actual, target, unit, level,
        owner, and its computed explanation) by id.

        Call when the user asks about a specific KPI by id or by name and you
        need its current numbers, status, or owner. If you don't know the
        exact id, call get_department_snapshot or get_red_kpis first to find
        it. Returns {"found": false, ...} rather than guessing if no KPI
        with that id is in the posted context.
        """
        kpi = _find_kpi(kpi_id)
        if kpi is None:
            return {
                "found": False,
                "kpiId": kpi_id,
                "note": "No KPI with this id in the posted department context.",
            }
        return {"found": True, **kpi}

    @anthropic.beta_tool
    def get_red_kpis() -> list:
        """Get the full live records for every KPI currently red in this
        department.

        Call when asked which KPIs need attention, before reasoning about
        accountability for a red, or to scope get_reasons/get_comments/
        get_response_status calls to the KPIs that actually matter right
        now. Returns [] (not a fabricated red) when nothing is red.
        """
        return [k for k in kpis if k.get("id") in reds]

    @anthropic.beta_tool
    def get_reasons(kpi_id: str) -> list:
        """Get the floor-level reason-log entries logged against one KPI
        (a rep/location's free-text explanation for a status), newest first.

        Call when asked why a specific KPI moved, or what a rep/location
        said about it on the floor — this is the reason log, distinct from
        the KPI's comment thread (use get_comments for that). Returns []
        when no reasons are logged for this KPI in the posted context.
        """
        matches = [r for r in reasons if r.get("kpiId") == kpi_id]
        return sorted(matches, key=lambda r: r.get("ts") or "", reverse=True)

    @anthropic.beta_tool
    def get_comments(kpi_id: str) -> list:
        """Get the comment thread posted against one KPI (Mark's and/or a
        human's notes — "what's driving this", actions, tracking notes),
        oldest first so it reads as a conversation.

        Call when asked about the discussion/notes on a KPI, or to see what
        has already been said before adding more context — distinct from the
        floor reason log (use get_reasons for that). Returns [] when no
        comments are on file for this KPI in the posted context.
        """
        matches = [c for c in comments if c.get("kpiId") == kpi_id]
        return sorted(matches, key=lambda c: c.get("ts") or "")

    @anthropic.beta_tool
    def get_kz_records() -> list:
        """Get every 8-step (KZ) problem-solving record on file for this
        department, straight off data/kz-records.json — kzNumber, title,
        who's driving it, per-step (1-8) progress, and whether it's
        active/closed. Richer than the posted context's kzRecords summary
        (which only carries done/closed).

        Call when asked about open or closed 8-steps for this department,
        which KPI a KZ is linked to, or how far a KZ has progressed through
        its 8 steps. Returns [] if this department has no KZ records on
        file — never a fabricated record.
        """
        all_records = _load_json("kz-records.json")
        if not dept_id:
            return all_records
        return [r for r in all_records if r.get("deptId") == dept_id]

    @anthropic.beta_tool
    def get_hoshin() -> dict:
        """Get this department's 2026 Hoshin (annual policy-deployment) plan
        straight off data/hoshin.json: the 5 WE 2026 objectives, and this
        department's functional lead + annual activities (each with its
        Hoshin priority, activity plan, target, support function, lead, and
        timeline). When a department's own block is empty but it's aliased
        to another (e.g. Service is aliased to Sales), resolves through to
        the aliased department's activities, same as the UI does.

        Call when asked about annual Hoshin priorities/objectives, this
        department's yearly activities or targets, or its functional lead —
        the annual plan, separate from live weekly/monthly KPI data (use
        get_kpi / get_department_snapshot for that).
        """
        hoshin = _load_json("hoshin.json")
        objectives = [
            {"id": o.get("id"), "name": o.get("name"), "description": o.get("description")}
            for o in (hoshin.get("objectives") or [])
        ]
        dept_block = (hoshin.get("departments") or {}).get(dept_id) or {}
        activities = _hoshin_activities_for(hoshin, dept_id) if dept_id else []
        return {
            "objectives": objectives,
            "department": {
                "deptId": dept_id,
                "block": dept_block.get("block"),
                "functionalLead": dept_block.get("functionalLead"),
                "aliasOf": dept_block.get("aliasOf"),
                "activities": activities,
            },
        }

    @anthropic.beta_tool
    def get_response_status(kpi_id: str) -> dict:
        """Get the red-KPI accountability response for one KPI: the owner's
        4-field answer (cause, action, needs8Step, reportBackWhen) and its
        lifecycle stage (detected -> responded -> actionUnderway ->
        eightStepOpened -> reported -> recovered), if one has been recorded.

        Call when asked whether a red KPI's owner has responded yet, what
        they said, or how far along the response is. Returns
        {"found": false, ...} — not a fabricated response — when the posted
        context carries no accountability entry for this KPI (either none
        has been logged yet, or the frontend didn't include response data
        with this request).
        """
        matches = [r for r in responses if r.get("kpiId") == kpi_id]
        if not matches:
            return {
                "found": False,
                "kpiId": kpi_id,
                "note": "No accountability response on file for this KPI in the posted context.",
            }
        latest = sorted(matches, key=lambda r: r.get("ts") or "", reverse=True)[0]
        return {"found": True, **latest}

    return [
        get_department_snapshot,
        get_kpi,
        get_red_kpis,
        get_reasons,
        get_comments,
        get_kz_records,
        get_hoshin,
        get_response_status,
    ]
