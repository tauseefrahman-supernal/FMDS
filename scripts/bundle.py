#!/usr/bin/env python3
"""
bundle.py — build the CSP-safe, self-contained hosted bundle for FMDS OS.

The hosted Artifact runs under a strict CSP: no module scripts, no fetch, no
Google Fonts, and localStorage may be blocked in the sandboxed iframe. This
script therefore:

  1. Inlines styles.css into a <style> block, PREPENDING the base64 @font-face
     blocks from scripts/fonts-embedded.css (Inter / Lora / JetBrains Mono) —
     local dev instead loads Google Fonts via <link> in index.html.
  2. Embeds every data/**/*.json into window.__FMDS_DATA__ and installs a
     fetch() shim that resolves those paths from the embedded map.
  3. Converts each ES module (lib/*, views/*, app.js) into a window.__M["path"]
     IIFE, emitted in import-dependency order:
       import { a, b } from './x.js'  →  const { a, b } = __M["lib/x.js"];
       export function/const/async …  →  stripped; names returned at the end
       export { NAME };               →  removed; NAME added to the return
       localStorage                   →  __ls (a guarded in-memory fallback)

Outputs (repo root):
  dist-artifact.html         — the raw <style>+<script> fragment
  dist-test.html             — full-page wrapper (open locally to verify)
  FMDS-OS-World-Emblem.html  — <title>+<meta> + fragment (the Artifact publish
                               file; the Artifact host wraps it in the page
                               skeleton, so no <html>/<head>/<body> tags)
  .bundle-check.js           — the script body alone, for `node --check`

Usage:  python3 scripts/bundle.py   (from anywhere; paths resolve to repo root)
Then:   node --check .bundle-check.js
        re-publish FMDS-OS-World-Emblem.html to the SAME artifact URL.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

TITLE = "FMDS OS — World Emblem"
META = ('<meta name="description" content="Agentic Data & Operations Platform '
        "— role-based operator console for World Emblem's FMDS management "
        'layer.">')

# ── 1. Collect sources ──────────────────────────────────────────────────────

def module_paths():
    libs = sorted(p.relative_to(ROOT).as_posix() for p in (ROOT / "lib").glob("*.js"))
    views = sorted(p.relative_to(ROOT).as_posix() for p in (ROOT / "views").glob("*.js"))
    return libs + views + ["app.js"]


IMPORT_RE = re.compile(r"import\s*\{([^}]*)\}\s*from\s*['\"]([^'\"]+)['\"]\s*;?", re.S)


def resolve(from_path, spec):
    """Resolve a relative import spec to a repo-root key like 'lib/rag.js' (lexically)."""
    parts = list(Path(from_path).parent.parts)
    for seg in Path(spec).parts:
        if seg == "..":
            parts.pop()
        elif seg != ".":
            parts.append(seg)
    return "/".join(parts)


def topo_sort(sources):
    """Order modules so every dependency precedes its importers."""
    deps = {}
    for path, src in sources.items():
        deps[path] = [resolve(path, m.group(2)) for m in IMPORT_RE.finditer(src)]
    ordered, seen, visiting = [], set(), set()

    def visit(p):
        if p in seen:
            return
        if p in visiting:
            sys.exit(f"bundle.py: import cycle at {p}")
        visiting.add(p)
        for d in deps.get(p, []):
            if d in sources:
                visit(d)
            else:
                sys.exit(f"bundle.py: {p} imports missing module {d}")
        visiting.discard(p)
        seen.add(p)
        ordered.append(p)

    for p in sources:
        visit(p)
    return ordered


# ── 2. Transform one ES module into an __M IIFE ─────────────────────────────

EXPORT_DECL_RE = re.compile(r"^export\s+(async\s+function|function|const|let|var)\s+([A-Za-z_$][\w$]*)", re.M)
EXPORT_LIST_RE = re.compile(r"^export\s*\{([^}]*)\}\s*;?\s*$", re.M)


def transform(path, src):
    names = []

    def bind(n):
        n = " ".join(n.split())
        return n.replace(" as ", ": ") if " as " in n else n

    def imp(m):
        binds = ", ".join(bind(n) for n in m.group(1).split(",") if n.strip())
        return f'const {{ {binds} }} = __M["{resolve(path, m.group(2))}"];'

    src = IMPORT_RE.sub(imp, src)

    for m in EXPORT_DECL_RE.finditer(src):
        names.append(m.group(2))
    src = EXPORT_DECL_RE.sub(lambda m: f"{m.group(1)} {m.group(2)}", src)

    for m in EXPORT_LIST_RE.finditer(src):
        names.extend(n.strip() for n in m.group(1).split(",") if n.strip())
    src = EXPORT_LIST_RE.sub("", src)

    if "export" in re.sub(r"//[^\n]*|/\*.*?\*/|'[^']*'|\"[^\"]*\"|`[^`]*`", "", src, flags=re.S):
        sys.exit(f"bundle.py: unhandled export syntax left in {path}")

    src = re.sub(r"\blocalStorage\b", "__ls", src)

    ret = "{ " + ", ".join(names) + " }" if names else "{}"
    return f'/* ==== {path} ==== */\n__M["{path}"] = (function(){{\n{src}\n;return {ret};\n}})();\n'


# ── 3. Assemble ─────────────────────────────────────────────────────────────

SHIMS = """
window.__M = {};
// localStorage guard (sandboxed iframe may block it)
var __ls = (function(){ try{ var t="__t"; window.localStorage.setItem(t,"1"); window.localStorage.removeItem(t); return window.localStorage; }
  catch(e){ var m={}; return {getItem:function(k){return (k in m)?m[k]:null;}, setItem:function(k,v){m[k]=String(v);}, removeItem:function(k){delete m[k];}, clear:function(){for(var k in m)delete m[k];}}; } })();
// fetch shim -> embedded data
(function(){ var real = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function(url){ var key = String(url).split("?")[0].replace(/^\\.?\\//,"");
    var D = window.__FMDS_DATA__ || {};
    if (key in D) return Promise.resolve({ ok:true, status:200, json:function(){return Promise.resolve(D[key]);}, text:function(){return Promise.resolve(JSON.stringify(D[key]));} });
    var hit = Object.keys(D).find(function(k){ return k.split("/").pop() === key.split("/").pop(); });
    if (hit) return Promise.resolve({ ok:true, status:200, json:function(){return Promise.resolve(D[hit]);} });
    return Promise.reject(new Error("no bundled resource: "+url));
  };
})();
"""


def main():
    css = (ROOT / "scripts/fonts-embedded.css").read_text() + "\n" + (ROOT / "styles.css").read_text()

    data = {}
    for p in sorted((ROOT / "data").rglob("*.json")):
        data[p.relative_to(ROOT).as_posix()] = json.loads(p.read_text())

    sources = {p: (ROOT / p).read_text() for p in module_paths()}
    order = topo_sort(sources)
    if order[-1] != "app.js":
        order.remove("app.js")
        order.append("app.js")

    js = SHIMS
    js += "window.__FMDS_DATA__ = " + json.dumps(data, ensure_ascii=False, separators=(",", ": ")) + ";\n\n"
    js += "\n".join(transform(p, sources[p]) for p in order)

    fragment = f'<style>\n{css}\n</style>\n<div id="app"></div>\n<script>\n{js}\n</script>'

    (ROOT / "dist-artifact.html").write_text(fragment)
    (ROOT / ".bundle-check.js").write_text(js)

    test_head = ("<!doctype html><html lang=en><head><meta charset=utf-8>"
                 "<meta name=viewport content='width=device-width,initial-scale=1'>"
                 f"<title>FMDS OS — test</title></head><body>\n")
    (ROOT / "dist-test.html").write_text(test_head + fragment + "\n\n</body></html>")

    (ROOT / "FMDS-OS-World-Emblem.html").write_text(f"<title>{TITLE}</title>\n{META}\n{fragment}")

    kb = (ROOT / "FMDS-OS-World-Emblem.html").stat().st_size // 1024
    print(f"bundled {len(order)} modules, {len(data)} data files → FMDS-OS-World-Emblem.html ({kb} KB)")
    print("next: node --check .bundle-check.js")


if __name__ == "__main__":
    main()
