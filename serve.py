# Static file server + Mark agent endpoint for the FMDS OS prototype.
#
# Backend deps (only needed to exercise POST /api/mark): create a venv and
# install from requirements.txt — e.g. `python3 -m venv server/.venv &&
# server/.venv/bin/pip install -r requirements.txt`, then run this script
# with that venv's python. Static serving works with plain system python3
# and no dependencies at all; `anthropic` is imported lazily inside the
# POST handler so a missing package never breaks the static app.
import http.server, os, json

os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = int(os.environ.get('PORT', 8770))
HOST = '0.0.0.0' if os.environ.get('PORT') else '127.0.0.1'


class Handler(http.server.SimpleHTTPRequestHandler):
    # No-store so every reload picks up the latest modules/data (dev + demo).
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

    def _send_json(self, status, payload):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != '/api/mark':
            self.send_error(404, 'Not Found')
            return

        if not os.environ.get('ANTHROPIC_API_KEY'):
            self._send_json(503, {
                'error': 'ANTHROPIC_API_KEY is not set on the server — Mark is unavailable; falling back to scripted replies.'
            })
            return

        try:
            length = int(self.headers.get('Content-Length', 0) or 0)
            raw = self.rfile.read(length) if length else b'{}'
            body = json.loads(raw or b'{}')
        except (ValueError, json.JSONDecodeError):
            self._send_json(400, {'error': 'Invalid JSON body.'})
            return

        dept_id = body.get('deptId')
        context = body.get('context')
        messages = body.get('messages') or []

        try:
            from server import mark_agent  # lazy import: keeps static serving anthropic-free
            reply = mark_agent.run(dept_id, context, messages)
        except Exception as exc:
            self._send_json(500, {'error': f'Mark agent failed: {exc}'})
            return

        self._send_json(200, {'reply': reply})


http.server.ThreadingHTTPServer.allow_reuse_address = True
with http.server.ThreadingHTTPServer((HOST, PORT), Handler) as httpd:
    print(f"FMDS OS prototype on http://{HOST}:{PORT} (no-store)")
    httpd.serve_forever()
