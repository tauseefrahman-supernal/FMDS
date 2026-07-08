"""Unit tests for server/mark_prompt.py.

Pure stdlib — mark_prompt has no third-party dependency, so this runs under
either interpreter:
    server/.venv/bin/python -m unittest server.test_mark_prompt
    python3 -m unittest server.test_mark_prompt
"""

import unittest

from server import mark_prompt


class BuildSystemTest(unittest.TestCase):
    def test_stable_prefix_identical_across_depts(self):
        # The cache-hit property: the frozen prefix must be byte-identical no
        # matter the department or context, so the API serves it from cache.
        ops = mark_prompt.build_system("operations", {"deptName": "Operations"})
        fin = mark_prompt.build_system("finance", {"deptName": "Finance"})
        prefix = mark_prompt.STABLE_PREFIX
        self.assertTrue(ops.startswith(prefix))
        self.assertTrue(fin.startswith(prefix))
        # And the shared leading slice really is identical between the two.
        self.assertEqual(ops[: len(prefix)], fin[: len(prefix)])

    def test_dept_identity_appears_in_suffix_only(self):
        prompt = mark_prompt.build_system("operations", {"deptName": "Operations"})
        prefix = mark_prompt.STABLE_PREFIX
        # The department name is a per-request detail: it must NOT be baked
        # into the frozen prefix, only into the tail after it.
        self.assertNotIn("Operations", prefix)
        suffix = prompt[len(prefix):]
        self.assertIn("Operations", suffix)
        self.assertIn("operations", suffix)  # the id

    def test_no_kpi_value_leaks_into_prompt(self):
        # A context carrying live KPI values must not put any of them into the
        # prompt — Mark reads those through tools, and inlining them would both
        # break caching and risk stale data. Mirror mark_tools' context shape.
        context = {
            "deptId": "operations",
            "deptName": "Operations",
            "kpis": [
                {"id": "otp", "name": "OTP (On-Time %)", "rag": "red",
                 "actual": 0.863, "target": 0.985, "owner": "Jim Kozel"},
            ],
            "reds": ["otp"],
            "reasons": [{"kpiId": "otp", "text": "Mexico backlog surge."}],
            "comments": [{"kpiId": "otp", "text": "Watching the remake run."}],
        }
        prompt = mark_prompt.build_system("operations", context)
        # No figures, no owner, no free-text reason/comment content.
        for leaked in ("0.863", "0.985", "Jim Kozel", "Mexico backlog surge.",
                       "Watching the remake run."):
            self.assertNotIn(leaked, prompt)

    def test_handles_missing_context_and_name(self):
        # None context / absent deptName must not crash and must still name the
        # department by its slug.
        self.assertTrue(mark_prompt.build_system("hr", None).startswith(mark_prompt.STABLE_PREFIX))
        prompt = mark_prompt.build_system("hr", {})
        self.assertIn("hr", prompt[len(mark_prompt.STABLE_PREFIX):])

    def test_encodes_operating_model_and_grounding(self):
        # Spot-check that the charter actually carries the FMDS model and the
        # no-fabrication rule — the substance of the task, not just structure.
        prefix = mark_prompt.STABLE_PREFIX
        for concept in ("Hoshin", "8-step", "KZ-###", "accountability",
                        "Leadership OS", "standard work", "Never fabricate"):
            self.assertIn(concept, prefix)


if __name__ == "__main__":
    unittest.main()
