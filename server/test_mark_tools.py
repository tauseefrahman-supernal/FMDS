"""Unit tests for server/mark_tools.py.

Run via the venv (needs `anthropic` for the @beta_tool decorator):
    server/.venv/bin/python -m unittest server.test_mark_tools

Each @beta_tool-decorated function is callable directly — BetaFunctionTool's
`__call__` is a property that returns the original undecorated function
(see anthropic.lib.tools._beta_functions.BaseFunctionTool), so `tool(...)`
below invokes real Python code, not the runner's JSON-validated `.call()`.
"""

import unittest

from server import mark_tools

FIXTURE_CONTEXT = {
    "deptId": "operations",
    "deptName": "Operations",
    "kpis": [
        {
            "id": "otp",
            "name": "OTP (On-Time %)",
            "rag": "red",
            "actual": 0.863,
            "target": 0.985,
            "unit": "ratio",
            "level": 1,
            "isMain": True,
            "parentId": None,
            "owner": "Jim Kozel",
            "explanation": {"why": "Mexico is dragging the WE main hard."},
        },
        {
            "id": "otp_mexico",
            "name": "OTP — Mexico",
            "rag": "red",
            "actual": 0.75,
            "target": 0.985,
            "unit": "ratio",
            "level": 2,
            "isMain": False,
            "parentId": "otp",
            "owner": "M. Valdez",
            "explanation": {"why": "Sample-volume surge inflated the denominator."},
        },
        {
            "id": "pplh",
            "name": "PPLH",
            "rag": "green",
            "actual": 12.4,
            "target": 12.0,
            "unit": "num",
            "level": 1,
            "isMain": True,
            "parentId": None,
            "owner": "Jim Kozel",
            "explanation": {"why": "On target across all locations."},
        },
    ],
    "reds": ["otp", "otp_mexico"],
    "reasons": [
        {
            "id": "r1", "deptId": "operations", "kpiId": "otp_mexico", "entityId": "",
            "author": "M. Valdez", "text": "Older note.", "status": "red", "ts": "2026-06-01T00:00:00.000Z",
        },
        {
            "id": "r2", "deptId": "operations", "kpiId": "otp_mexico", "entityId": "",
            "author": "M. Valdez", "text": "Newer note.", "status": "red", "ts": "2026-06-05T00:00:00.000Z",
        },
    ],
    "comments": [
        {
            "id": "c1", "deptId": "operations", "kpiId": "otp_mexico", "author": "Mark", "role": "ai",
            "kind": "driving", "text": "First thread note.", "status": "red", "ts": "2026-06-02T00:00:00.000Z",
        },
        {
            "id": "c2", "deptId": "operations", "kpiId": "otp_mexico", "author": "Jim", "role": "human",
            "kind": "note", "text": "Second thread note.", "status": "red", "ts": "2026-06-03T00:00:00.000Z",
        },
    ],
    "kzRecords": [
        {"kzNumber": "KZ-346", "item": "Pricing Credit Memos", "who": "M. Valdez", "linkedKpiId": "otp_mexico", "done": 5, "closed": False},
    ],
    "responses": [
        {
            "deptId": "operations", "kpiId": "otp_mexico", "owner": "Jim Kozel",
            "dueDate": "2026-06-03T00:00:00.000Z", "answered": True, "onTime": True,
            "cause": "Mexico backlog.", "action": "Overtime deployed.", "needs8Step": True,
            "kzNumber": "KZ-346", "reportBackWhen": "Next T3 review",
            "lifecycle": {"detected": {"done": True, "ts": "2026-06-01T00:00:00.000Z"},
                          "responded": {"done": True, "ts": "2026-06-01T00:00:00.000Z"},
                          "actionUnderway": {"done": True, "ts": "2026-06-02T00:00:00.000Z"},
                          "eightStepOpened": {"done": False, "ts": None},
                          "reported": {"done": False, "ts": None},
                          "recovered": {"done": False, "ts": None}},
            "ts": "2026-06-01T00:00:00.000Z",
        },
        {
            # Older entry for the same KPI — get_response_status must return
            # the newest by ts, not just the first array match.
            "deptId": "operations", "kpiId": "otp_mexico", "owner": "Jim Kozel",
            "dueDate": "2026-05-01T00:00:00.000Z", "answered": True, "onTime": False,
            "cause": "Stale cause.", "action": "Stale action.", "needs8Step": False,
            "kzNumber": None, "reportBackWhen": None,
            "lifecycle": {"detected": {"done": True, "ts": "2026-04-01T00:00:00.000Z"},
                          "responded": {"done": True, "ts": "2026-04-01T00:00:00.000Z"},
                          "actionUnderway": {"done": False, "ts": None},
                          "eightStepOpened": {"done": False, "ts": None},
                          "reported": {"done": False, "ts": None},
                          "recovered": {"done": False, "ts": None}},
            "ts": "2026-04-01T00:00:00.000Z",
        },
    ],
}


class BuildToolsShapeTest(unittest.TestCase):
    def setUp(self):
        tools = mark_tools.build_tools(FIXTURE_CONTEXT)
        self.tools = {t.name: t for t in tools}
        self.assertEqual(len(tools), 8)

    def test_get_department_snapshot(self):
        snap = self.tools["get_department_snapshot"]()
        self.assertEqual(snap["deptId"], "operations")
        self.assertEqual(snap["deptName"], "Operations")
        self.assertEqual(snap["kpiCount"], 3)
        self.assertEqual(snap["redCount"], 2)
        self.assertEqual([k["id"] for k in snap["kpis"]], ["otp", "otp_mexico", "pplh"])

    def test_get_kpi_found(self):
        kpi = self.tools["get_kpi"](kpi_id="otp_mexico")
        self.assertTrue(kpi["found"])
        self.assertEqual(kpi["owner"], "M. Valdez")
        self.assertEqual(kpi["rag"], "red")

    def test_get_kpi_not_found_is_explicit(self):
        kpi = self.tools["get_kpi"](kpi_id="does_not_exist")
        self.assertEqual(kpi, {
            "found": False,
            "kpiId": "does_not_exist",
            "note": "No KPI with this id in the posted department context.",
        })

    def test_get_red_kpis(self):
        reds = self.tools["get_red_kpis"]()
        self.assertEqual({k["id"] for k in reds}, {"otp", "otp_mexico"})

    def test_get_red_kpis_empty_when_no_reds(self):
        ctx = dict(FIXTURE_CONTEXT, reds=[])
        tools = {t.name: t for t in mark_tools.build_tools(ctx)}
        self.assertEqual(tools["get_red_kpis"](), [])

    def test_get_reasons_sorted_newest_first(self):
        reasons = self.tools["get_reasons"](kpi_id="otp_mexico")
        self.assertEqual([r["id"] for r in reasons], ["r2", "r1"])

    def test_get_reasons_empty_for_unknown_kpi(self):
        self.assertEqual(self.tools["get_reasons"](kpi_id="pplh"), [])

    def test_get_comments_sorted_oldest_first(self):
        comments = self.tools["get_comments"](kpi_id="otp_mexico")
        self.assertEqual([c["id"] for c in comments], ["c1", "c2"])

    def test_get_comments_empty_for_unknown_kpi(self):
        self.assertEqual(self.tools["get_comments"](kpi_id="pplh"), [])

    def test_get_kz_records_scoped_to_dept_from_disk(self):
        records = self.tools["get_kz_records"]()
        self.assertTrue(len(records) > 0)
        self.assertTrue(all(r["deptId"] == "operations" for r in records))
        # Sanity: comes from disk (richer shape than context.kzRecords), not
        # the fixture's context.kzRecords stub.
        self.assertTrue(any("steps" in r for r in records))

    def test_get_kz_records_dept_with_no_records_is_empty(self):
        ctx = dict(FIXTURE_CONTEXT, deptId="hr")
        tools = {t.name: t for t in mark_tools.build_tools(ctx)}
        self.assertEqual(tools["get_kz_records"](), [])

    def test_get_hoshin_own_activities(self):
        hoshin = self.tools["get_hoshin"]()
        self.assertTrue(len(hoshin["objectives"]) == 5)
        self.assertEqual(hoshin["department"]["block"], "OPERATIONS")
        self.assertEqual(hoshin["department"]["functionalLead"], "Jim Kozel")
        self.assertIsNone(hoshin["department"]["aliasOf"])
        self.assertTrue(len(hoshin["department"]["activities"]) > 0)

    def test_get_hoshin_resolves_alias(self):
        ctx = dict(FIXTURE_CONTEXT, deptId="service")
        tools = {t.name: t for t in mark_tools.build_tools(ctx)}
        hoshin = tools["get_hoshin"]()
        self.assertEqual(hoshin["department"]["aliasOf"], "sales")
        # Service's own block has zero activities; resolves through to Sales's.
        self.assertTrue(len(hoshin["department"]["activities"]) > 0)

    def test_get_hoshin_genuinely_blank_dept_stays_empty(self):
        ctx = dict(FIXTURE_CONTEXT, deptId="finance")
        tools = {t.name: t for t in mark_tools.build_tools(ctx)}
        hoshin = tools["get_hoshin"]()
        self.assertIsNone(hoshin["department"]["aliasOf"])
        self.assertEqual(hoshin["department"]["activities"], [])

    def test_get_response_status_returns_newest_entry(self):
        status = self.tools["get_response_status"](kpi_id="otp_mexico")
        self.assertTrue(status["found"])
        self.assertEqual(status["cause"], "Mexico backlog.")
        self.assertEqual(status["ts"], "2026-06-01T00:00:00.000Z")

    def test_get_response_status_not_found_is_explicit(self):
        status = self.tools["get_response_status"](kpi_id="pplh")
        self.assertEqual(status, {
            "found": False,
            "kpiId": "pplh",
            "note": "No accountability response on file for this KPI in the posted context.",
        })

    def test_get_response_status_absent_field_is_no_data_not_error(self):
        ctx = {k: v for k, v in FIXTURE_CONTEXT.items() if k != "responses"}
        tools = {t.name: t for t in mark_tools.build_tools(ctx)}
        status = tools["get_response_status"](kpi_id="otp_mexico")
        self.assertFalse(status["found"])


class BuildToolsNoneContextTest(unittest.TestCase):
    """context can be None (malformed/absent POST body) — nothing should crash
    and every tool should degrade to an explicit empty/no-data shape."""

    def setUp(self):
        self.tools = {t.name: t for t in mark_tools.build_tools(None)}

    def test_snapshot_is_empty_not_fabricated(self):
        snap = self.tools["get_department_snapshot"]()
        self.assertIsNone(snap["deptId"])
        self.assertEqual(snap["kpiCount"], 0)
        self.assertEqual(snap["kpis"], [])

    def test_get_kpi_not_found(self):
        self.assertFalse(self.tools["get_kpi"](kpi_id="otp")["found"])

    def test_get_red_kpis_empty(self):
        self.assertEqual(self.tools["get_red_kpis"](), [])

    def test_get_reasons_and_comments_empty(self):
        self.assertEqual(self.tools["get_reasons"](kpi_id="otp"), [])
        self.assertEqual(self.tools["get_comments"](kpi_id="otp"), [])

    def test_get_kz_records_returns_all_when_no_dept(self):
        # No deptId to scope by — falls back to the full on-disk set rather
        # than silently returning [] as if nothing exists.
        records = self.tools["get_kz_records"]()
        self.assertTrue(len(records) > 0)

    def test_get_hoshin_department_is_empty_shape(self):
        hoshin = self.tools["get_hoshin"]()
        self.assertTrue(len(hoshin["objectives"]) == 5)
        self.assertEqual(hoshin["department"]["activities"], [])

    def test_get_response_status_not_found(self):
        self.assertFalse(self.tools["get_response_status"](kpi_id="otp")["found"])


if __name__ == "__main__":
    unittest.main()
