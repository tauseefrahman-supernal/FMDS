# Static file server + Mark agent endpoint for the FMDS OS prototype.
#
# Backend deps (only needed to exercise POST /api/mark): create a venv and
# install from requirements.txt — e.g. `python3 -m venv server/.venv &&
# server/.venv/bin/pip install -r requirements.txt`, then run this script
# with that venv's python. Static serving works with plain system python3
# and no dependencies at all; `anthropic` is imported lazily inside the
# POST handler so a missing package never breaks the static app.
import http.server, os, json, sys, traceback

os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = int(os.environ.get('PORT', 8770))
HOST = '0.0.0.0' if os.environ.get('PORT') else '127.0.0.1'

# Reject oversized request bodies before reading them into memory (public
# deploy on Railway — this closes a trivial memory-exhaustion vector).
MAX_BODY_BYTES = 2 * 1024 * 1024  # 2 MB


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

        # Size cap runs before anything else (including the API-key check) so
        # an oversized body is always rejected without being read into memory.
        # Missing Content-Length is treated as an empty body (matches prior
        # behavior); a present-but-malformed header is rejected outright.
        header = self.headers.get('Content-Length')
        if header is None:
            length = 0
        else:
            try:
                length = int(header)
            except ValueError:
                length = -1
            if length < 0:
                self._send_json(400, {'error': 'Invalid Content-Length header.'})
                return

        if length > MAX_BODY_BYTES:
            self._send_json(413, {'error': 'Request body too large (max 2 MB).'})
            return

        if not os.environ.get('ANTHROPIC_API_KEY'):
            self._send_json(503, {
                'error': 'ANTHROPIC_API_KEY is not set on the server — Mark is unavailable; falling back to scripted replies.'
            })
            return

        try:
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
        except Exception:
            # Never leak internals (stack traces, key fragments) to the public
            # client; the real error goes to the server's own log.
            traceback.print_exc(file=sys.stderr)
            self._send_json(500, {'error': 'Mark agent failed — see server log.'})
            return

        self._send_json(200, {'reply': reply})


http.server.ThreadingHTTPServer.allow_reuse_address = True
with http.server.ThreadingHTTPServer((HOST, PORT), Handler) as httpd:
    print(f"FMDS OS prototype on http://{HOST}:{PORT} (no-store)")
    httpd.serve_forever()
