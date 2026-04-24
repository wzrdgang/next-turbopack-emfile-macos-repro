Title: Turbopack dev on macOS hits Watchpack fs.watch EMFILE on ancestor directories and app subtrees

### Summary

On macOS, Next.js `16.2.3` Turbopack development mode is hitting repeated native `fs.watch` `EMFILE` errors even with a very high shell file-descriptor limit. The failure appears in Watchpack, triggers false `next.config.js` restarts, and can destabilize the dev server.

### Version

Next.js `16.2.3`

### Link to the code that reproduces this issue

`https://github.com/wzrdgang/next-turbopack-emfile-macos-repro`

### To Reproduce

1. On macOS, clone the repro repo.
2. Run `npm install`
3. Run `npm run dev:debug`
4. Observe repeated `Watchpack Error (watcher): Error: EMFILE: too many open files, watch`
5. Observe the debug watcher targets printed by the `fs.watch` preload in `scripts/watch-debug.cjs`

### Current vs. Expected behavior

Current behavior:

- Turbopack dev starts, then immediately emits repeated Watchpack `EMFILE` errors
- The debug logger shows `fs.watch` `EMFILE` events for ancestor directories like:
  - `/Users`
  - `/Users/<user>`
  - `/Users/<user>/Documents/...`
  - the project root
  - multiple `app/...` subdirectories
- The same run also triggers false `Found a change in next.config.js. Restarting the server to apply the changes...`

Expected behavior:

- `next dev` with Turbopack should watch only the needed project paths without entering an `EMFILE` loop
- A high `ulimit -n` should not still result in repeated native watcher failures
- Turbopack should not restart because of false-positive config change detection during watcher failure

### Environment

- OS: macOS `15.7.4`
- Kernel: `Darwin 24.6.0 arm64`
- Node versions tested:
  - `25.9.0`
  - `24.14.0`
- npm: `11.12.1`
- `ulimit -n`: `1048575`

### Additional context

- The repro intentionally creates a moderately wide App Router tree under `app/` because the larger real-world app showed the same failure pattern
- The failure reproduced with both Node `25.9.0` and Node `24.14.0`
- The repro still succeeds with `npm run build`, so the problem appears isolated to Turbopack dev watchers
- A validated watcher-target excerpt is included in `VALIDATED_WATCH_LOG.txt`
- In the larger Munimetric app, the same logger also showed native watch attempts on `/Users`, `/Users/samhowell`, `/Users/samhowell/Documents`, `/Users/samhowell/Documents/munimetric`, `/Users/samhowell/Documents/munimetric/frontend`, `/Users/samhowell/Documents/munimetric/frontend/app`, and many `frontend/app/...` route directories
- In the larger app, webpack + polling works around the issue, but that bypasses Turbopack instead of fixing it

### Validated watcher-target excerpt

```text
[fs.watch EMFILE event] /private
[fs.watch EMFILE event] /private/tmp
[fs.watch EMFILE event] /private/tmp/next-turbopack-emfile-macos-repro
[fs.watch EMFILE event] /private/tmp/next-turbopack-emfile-macos-repro/app
[fs.watch EMFILE event] /private/tmp/next-turbopack-emfile-macos-repro/app/about
[fs.watch EMFILE event] /private/tmp/next-turbopack-emfile-macos-repro/app/api
[fs.watch EMFILE event] /private/tmp/next-turbopack-emfile-macos-repro/app/internal
[fs.watch EMFILE event] /private/tmp/next-turbopack-emfile-macos-repro/app/states
Watchpack Error (watcher): Error: EMFILE: too many open files, watch
⚠ Found a change in next.config.js. Restarting the server to apply the changes...
```
