import http.server, socketserver, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
PORT = 8770

class Handler(http.server.SimpleHTTPRequestHandler):
    # No-store so every reload picks up the latest modules/data (dev + demo).
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as h:
    print(f"FMDS OS prototype on http://localhost:{PORT} (no-store)")
    h.serve_forever()
