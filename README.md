# Breathwork

A minimal PWA for breath work exercises. Add to your iPhone home screen via Safari for an app-like experience.

## Offline on the phone

The app works **offline** on your phone **after** it has been loaded over a **secure context** (HTTPS or localhost) at least once. That allows the service worker to register and cache the app.

**Options:**

- **Deploy to a host with HTTPS** (e.g. GitHub Pages, Netlify, Vercel). Open the app on your phone from that URL once and use “Add to Home Screen” if you like. After that, the app works offline.
- **Use a tunnel with HTTPS** to your local server (e.g. Cloudflare Tunnel, ngrok). Open the resulting `https://` URL on your phone once and add to home screen; the cached app then works offline when the tunnel is down or the phone is offline.

**Python http.server on LAN only:** If you only serve the app at `http://192.168.x.x:8000` with no HTTPS, the service worker will not register on the phone, so the app will not be cached and will not work offline until you use one of the options above.

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in the browser. For offline to work on a phone, use HTTPS (deploy or tunnel) as above.
