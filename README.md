# Photobooth

Four-panel vintage photo strips from your webcam. Plain HTML/CSS/JS, no build step. Everything runs in your browser; photos are never uploaded.

## Run locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000 in Chrome or Safari. (Camera access needs a secure context; `localhost` counts.)

If the camera is blocked: System Settings > Privacy & Security > Camera, enable your browser, then reload.

## Notes

- Preview is mirrored like a mirror; saved photos are **not** mirrored (what a stranger would see).
- Space starts the countdown.
- Tweak the look (warmth, grain, fade, vignette...) in the `CONFIG` object at the top of `app.js`.
