#!/usr/bin/env python3
import http.server
import socketserver
import urllib.parse
import urllib.request
import urllib.error
import re
import sys

class VoidOSProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/proxy':
            self.handle_proxy(parsed.query)
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/proxy':
            self.handle_proxy(parsed.query, method='POST')
        else:
            super().do_POST()

    def handle_proxy(self, query, method='GET'):
        params = urllib.parse.parse_qs(query)
        target = params.get('url', [''])[0]
        adblock = params.get('adblock', ['1'])[0] != '0'
        region = params.get('region', ['Global'])[0]
        self.region = region
        self.adblock = '1' if adblock else '0'

        if not target:
            self.send_error(400, 'Missing url parameter')
            return

        try:
            target_url = urllib.parse.unquote(target)
            request = urllib.request.Request(target_url, method=method)
            request.add_header('User-Agent', self.headers.get('User-Agent', 'Mozilla/5.0'))
            request.add_header('Accept', self.headers.get('Accept', '*/*'))
            request.add_header('Accept-Language', self.headers.get('Accept-Language', 'en-US,en;q=0.9'))
            request.add_header('X-VoidOS-Region', region)

            if method == 'POST':
                length = int(self.headers.get('Content-Length', 0))
                request.data = self.rfile.read(length) if length else None

            with urllib.request.urlopen(request, timeout=20) as response:
                content = response.read()
                content_type = response.headers.get('Content-Type', 'application/octet-stream')
                status = response.getcode()

                if 'text/html' in content_type.lower():
                    content = self.rewrite_html(content, target_url, adblock)
                    content_type = 'text/html; charset=utf-8'

                self.send_response(status)
                self.send_header('Content-Type', content_type)
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                self.end_headers()
                self.wfile.write(content)
        except urllib.error.HTTPError as exc:
            self.send_error(exc.code, str(exc))
        except Exception as exc:
            self.send_error(502, f'Proxy error: {exc}')

    def rewrite_html(self, content, base_url, adblock):
        text = content.decode('utf-8', errors='ignore')
        text = self.proxify_urls(text, base_url)
        if adblock:
            text = self.filter_ads(text)
        return text.encode('utf-8')

    def proxify_urls(self, text, base_url):
        def rewrite_attr(match):
            attr, quote, value = match.group(1), match.group(2), match.group(3)
            if not value or value.startswith(('data:', 'mailto:', 'javascript:', '#')):
                return match.group(0)
            absolute = urllib.parse.urljoin(base_url, value)
            safe_url = urllib.parse.quote(absolute, safe=':/?&=#%')
            proxy_url = f'/proxy?url={safe_url}&adblock={self.adblock}&region={urllib.parse.quote(self.region)}'
            return f'{attr}={quote}{proxy_url}{quote}'

        text = re.sub(r'(?i)(src|href|action)=(\"|\')(.*?)(\2)', rewrite_attr, text)
        text = re.sub(r'(?i)url\((\"|\'|)([^\)\"\']+)(\"|\'|)\)', lambda m: self.rewrite_css_url(m, base_url), text)
        return text

    def rewrite_css_url(self, match, base_url):
        quote = match.group(1) or ''
        url = match.group(2)
        if not url or url.startswith(('data:', 'mailto:', 'javascript:', '#')):
            return match.group(0)
        absolute = urllib.parse.urljoin(base_url, url)
        safe_url = urllib.parse.quote(absolute, safe=':/?&=#%')
        proxy_url = f'/proxy?url={safe_url}&adblock={self.adblock}&region={urllib.parse.quote(self.region)}'
        return f'url({quote}{proxy_url}{quote})'

    def filter_ads(self, text):
        patterns = [
            r'<script[^>]+src=["\'][^"\']*(?:ads|doubleclick|googlesyndication|adservice|adsystem|adroll|googleadservices)[^"\']*["\'][^>]*>.*?</script>',
            r'<iframe[^>]+src=["\'][^"\']*(?:ads|doubleclick|googlesyndication|adservice|adsystem|adroll|googleadservices)[^"\']*["\'][^>]*>.*?</iframe>',
            r'<div[^>]+class=["\'][^"\']*(?:ads|advert|banner|sponsor|promo|pixel)[^"\']*["\'][^>]*>.*?</div>',
        ]
        for pattern in patterns:
            text = re.sub(pattern, '', text, flags=re.I | re.S)
        return text

class ThreadedHTTPServer(http.server.ThreadingHTTPServer):
    def __init__(self, server_address, RequestHandlerClass):
        super().__init__(server_address, RequestHandlerClass)
        self.current_region = 'Global'

    def set_region(self, region):
        self.current_region = region

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = ThreadedHTTPServer(('0.0.0.0', port), VoidOSProxyHandler)
    print(f'Serving VoidOS on http://127.0.0.1:{port}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopping VoidOS server')
        server.server_close()
