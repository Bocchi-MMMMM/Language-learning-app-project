import os
import socket
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parent
LOCAL_PORTS = range(5173, 5184)


class WordwiseHandler(SimpleHTTPRequestHandler):
	def __init__(self, *args, **kwargs):
		super().__init__(*args, directory=str(ROOT), **kwargs)

	def do_GET(self):
		if urlsplit(self.path).path in ("/", "/index.html"):
			self.send_response(302)
			self.send_header("Location", "/user.html")
			self.send_header("Content-Length", "0")
			self.end_headers()
			return
		super().do_GET()


def get_lan_ip():
	try:
		with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as probe:
			probe.connect(("192.0.2.1", 80))
			return probe.getsockname()[0]
	except OSError:
		return None


def main():
	host = os.environ.get("HOST", "0.0.0.0")
	platform_port = os.environ.get("PORT")
	if platform_port:
		ports = (int(platform_port),)
	else:
		ports = LOCAL_PORTS

	for port in ports:
		try:
			server = ThreadingHTTPServer((host, port), WordwiseHandler)
			break
		except OSError:
			continue
	else:
		print("No available server port", file=sys.stderr)
		sys.exit(1)

	print(f"Wordwise login: http://127.0.0.1:{port}", flush=True)
	lan_ip = get_lan_ip()
	if lan_ip:
		print(f"Same-network link: http://{lan_ip}:{port}", flush=True)
	try:
		server.serve_forever()
	except KeyboardInterrupt:
		pass
	finally:
		server.server_close()


if __name__ == "__main__":
	main()
