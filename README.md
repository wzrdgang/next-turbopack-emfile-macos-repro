# Next Turbopack EMFILE macOS Repro

This stripped-down app exists to reproduce a macOS-native `fs.watch` `EMFILE` failure seen with Next.js `16.2.3` Turbopack development mode.

## Install

```bash
npm install
```

## Reproduce

```bash
npm run dev:debug
```

The debug variant preloads a tiny `fs.watch` patch that prints the specific watch target whenever the watcher emits `EMFILE`.

Expected failure signature on the affected macOS environment:

```text
[fs.watch EMFILE event] /Users
[fs.watch EMFILE event] /Users/<user>
[fs.watch EMFILE event] /Users/<user>/Documents/...
[fs.watch EMFILE event] .../app/...
Watchpack Error (watcher): Error: EMFILE: too many open files, watch
```

Validated locally on April 23, 2026:

- the repro emitted `EMFILE` watcher targets for `/Users`, `/Users/samhowell`, `/Users/samhowell/Documents`, the repro root, and `app/...` subdirectories
- the repro also triggered false `Found a change in next.config.js` restarts
- `npm run build` still succeeded

## Notes

- `npm run dev:turbo` is the plain Turbopack path without the watcher-target logger.
- `npm run build` should still succeed even when the dev watcher fails.
- The generated routes intentionally create a moderately wide `app/` tree to stress native watcher setup on macOS.
