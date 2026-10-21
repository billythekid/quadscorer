# Quadscorer

Quadscorer is a static, installable X01 darts scorer built with vanilla JavaScript, CSS and Vite. It supports two-player standard and Quadro games, double-out checkouts, total or dart-by-dart entry, undo, history, local persistence and offline use.

## Commands

```bash
npm install
npm run dev
npm test
npm run build
```

## Structure

- `resources/js/game.js` owns scoring rules and persistence.
- `resources/js/app.js` owns browser rendering and interaction.
- `resources/css/app.css` owns the mobile-first UI.
- `static/manifest.webmanifest` and `static/sw.js` provide installable offline behavior.
- Vite builds the deployable site into the ignored `public/` directory used by Forge.
- `tests/game.test.js` covers scoring, busts, checkouts, Quadro segments, undo and persistence.

Keep the app dependency-light and phone-first. Do not add a server framework or persistence backend unless the product requires shared games or accounts.
