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
    """Run Mark's agent loop; return (reply_text, usage_dict_or_None).

    dept_id: the department slug (e.g. "operations").
    context: the posted department context (KPIs, reasons, comments, ...).
    messages: prior conversation as [{role, content}, ...]; the caller
        supplies the latest user turn as the last element.
    usage carries the final turn's token counters (incl.
        cache_read_input_tokens, to observe whether the system-prompt
        cache breakpoint below is actually hitting).
    """
    client = anthropic.Anthropic()

    # cache_control on the system block: tools + system form the cacheable
    # prefix, so follow-up turns in a chat re-read them from cache instead
    # of re-paying the full prompt. (Opus min cacheable prefix is 4096
    # tokens — verify usage.cache_read_input_tokens > 0 rather than assume.)
    system = [{
        "type": "text",
        "text": mark_prompt.build_system(dept_id, context),
        "cache_control": {"type": "ephemeral"},
    }]
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
        return "", None

    reply = next((block.text for block in final.content if block.type == "text"), "")
    usage = None
    if getattr(final, "usage", None) is not None:
        u = final.usage
        usage = {
            "input_tokens": getattr(u, "input_tokens", None),
            "output_tokens": getattr(u, "output_tokens", None),
            "cache_creation_input_tokens": getattr(u, "cache_creation_input_tokens", None),
            "cache_read_input_tokens": getattr(u, "cache_read_input_tokens", None),
        }
    return reply, usage
