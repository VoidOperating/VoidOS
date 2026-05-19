# VoidOS

VoidOS is a local browser shell and proxy front-end built to provide a sleek black-purple desktop experience with a home screen, taskbar, game mode, adblocker, and proxy-based browsing.

## Files

- `index.html` — main VoidOS interface
- `styles.css` — theme, layout, and homepage styling
- `script.js` — search, hotbar, settings, game mode, and browser logic
- `server.py` — local proxy server for external page loading

## Run locally

Start the server:

```bash
cd /workspaces/VoidOS
python3 server.py 8000
```

Open `http://127.0.0.1:8000` in your browser.

## Notes

- VoidOS is a local proxy shell, not a full VPN. It loads external pages through a local proxy route.
- The built-in adblocker removes common ad scripts and frames from proxied sites.
- Location selection is available in the settings, but actual IP routing requires external proxy servers or VPN infrastructure.
- Some websites may still block embedded proxy pages depending on their security policy.
