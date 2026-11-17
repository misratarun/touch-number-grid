# Touch Number Grid

A calm number board for iPad. Touch a number and it darkens briefly, like a pressed button on an AAC device. Then it is spoken, written large, and drawn as dots.

It is a companion to [Touch Country Identifier](https://github.com/misratarun/touch-country-identifier) and follows the same rules: predictable, the same every time, and quiet.

## Try it

```bash
npm install
```

```bash
npm run dev
```

Open the "Network" address it prints in Safari on an iPad that is on the same wifi.

## Put it on an iPad

1. Open the published address in Safari.
2. Tap Share → Add to Home Screen → Add.
3. Open it once from the new icon while still online. After that it works with no connection.

To keep a child inside the app, turn on Guided Access (Settings → Accessibility → Guided Access), open the app, and triple-click the top button.

`.github/workflows/publish.yml` builds the app and publishes it to GitHub Pages whenever the `main` branch changes.

## What it does

**Touch a number → hear it and see it.** A parent or teacher does the teaching. The app has no quiz, scoring, prompts, praise sounds or levels to win.

The first page has three buttons. Each says its name, then opens its board.

| Board | What a touch does |
| --- | --- |
| Count (`1 2 3`) | A square of 1 to 100. A number says its name, is written large, and is drawn as that many dots in rows of ten. |
| Add (`+`) | Numbers 1 to 10 down the left choose which number to add to. Its ten sums are written beside it in order, `3 + 1 = 4` to `3 + 10 = 13`. A sum says itself ("3 plus 8 is 11") and draws the two numbers as dots in two colours. |
| Times (`×`) | Numbers 1 to 10 down the left choose a table. Its ten lines are written beside it in order, `3 × 1 = 3` to `3 × 10 = 30`. A line says itself the way tables are chanted ("3 eights are 24") and draws 3 rows of 8 dots. |

Each line is one button with the whole sum on it, so the touch lands on the question and the answer comes with it. Only one table is on screen at a time.

## Design choices

| Topic | Choice |
| --- | --- |
| Model | Behave like an AAC button grid: predictable, the same every time. |
| Touch | Single touches only. No pinching, dragging or scrolling. |
| Press feedback | The touched button darkens briefly, then goes back to normal. |
| Fast taps | Sentences queue, and each waits for the previous one to finish. None get cut off. |
| Picture | Shown in one fixed place. It changes when its own sentence starts and stays until the next one. |
| Where am I | The chosen table stays filled in, and the line being spoken keeps a plain outline. |
| Dots | Rows of ten with a small gap after five, so a row can be read at a glance. Times shows a block: rows by columns. |
| Opening a board | A board opens only after its name has been spoken, and it changes without animation. |
| Back button | Top-left on every board. |
| Stimulation | Muted colours on a plain pale background. Nothing moves by itself, and there are no sounds except the spoken numbers. |
| Voice | The device's built-in voice. |

## Tech

- **Build:** Vite and plain JavaScript. The app is `src/main.js`, with the spoken wording and tunable numbers at the top.
- **Voice:** the browser's `speechSynthesis`, queued in `src/voice.js`.
- **Offline app:** `vite-plugin-pwa` saves every file on the device and supplies the home-screen name and icon. `npm run icons` redraws the icon.
