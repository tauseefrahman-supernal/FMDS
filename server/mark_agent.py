"""Agent runner for Mark, the FMDS OS AI employee.

Builds an Anthropic client from the environment, assembles Mark's system
prompt and read-only tools for the posted department context, and drives
the Claude tool-use loop to a final reply. Imported lazily by serve.py's
POST handler so static file serving never depends on the `anthropic`
package being installed.
"""

import anthropic

from server import mark_prompt, mark_tools

MODEL = "claude-opus-4-8"
MAX_TOKENS = 16000


def run(dept_id, context, messages):
    """Run Mark's agent loop and return the final assistant reply text.

    dept_id: the department slug (e.g. "operations").
    context: the posted department context (KPIs, reasons, comments, ...).
    messages: prior conversation as [{role, content}, ...]; the caller
        supplies the latest user turn as the last element.
    """
    client = anthropic.Anthropic()

    system = mark_prompt.build_system(dept_id, context)
    tools = mark_tools.build_tools(context)

    runner = client.beta.messages.tool_runner(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=system,
        thinking={"type": "adaptive"},
        output_config={"effort": "medium"},
        tools=tools,
        messages=messages,
    )

    final = None
    for message in runner:
        final = message

    if final is None:
        return ""

    return next((block.text for block in final.content if block.type == "text"), "")
