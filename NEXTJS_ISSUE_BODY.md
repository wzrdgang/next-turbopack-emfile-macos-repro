### Link to the code that reproduces this issue

https://github.com/wzrdgang/next-turbopack-emfile-macos-repro

### To Reproduce

1. On macOS, clone the repro repo above.
2. Run `npm install`
3. Run `npm run dev:debug`
4. Observe repeated `Watchpack Error (watcher): Error: EMFILE: too many open files, watch`
5. Observe the debug watcher targets printed by the `fs.watch` preload in `scripts/watch-debug.cjs`
6. Run `npm run build` in the same repo and note that the build succeeds

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

### Provide environment information

```bash
Operating System:
  Platform: darwin
  Arch: arm64
  Version: Darwin Kernel Version 24.6.0: Mon Jan 19 22:01:41 PST 2026; root:xnu-11417.140.69.708.3~1/RELEASE_ARM64_T8132
  Available memory (MB): 24576
  Available CPU cores: 10
Binaries:
  Node: 25.9.0
  npm: 11.12.1
  Yarn: N/A
  pnpm: N/A
Relevant Packages:
  next: 16.2.3
  eslint-config-next: N/A
  react: 18.3.1
  react-dom: 18.3.1
  typescript: N/A
Next.js Config:
  output: N/A
```

### Which area(s) are affected? (Select all that apply)

Turbopack

### Which stage(s) are affected? (Select all that apply)

next dev (local)

### Additional context

- The repro intentionally creates a moderately wide App Router tree under `app/` because the larger real-world app showed the same failure pattern.
- The failure reproduced with both Node `25.9.0` and Node `24.14.0` in local investigation.
- The repro still succeeds with `npm run build`, so the problem appears isolated to Turbopack dev watchers.
- A validated watcher-target excerpt is included in `VALIDATED_WATCH_LOG.txt` in the repro repo.
- In the larger Munimetric app, the same logger also showed native watch attempts on `/Users`, `/Users/samhowell`, `/Users/samhowell/Documents`, `/Users/samhowell/Documents/munimetric`, `/Users/samhowell/Documents/munimetric/frontend`, `/Users/samhowell/Documents/munimetric/frontend/app`, and many `frontend/app/...` route directories.
- In the larger app, webpack + polling works around the issue, but that bypasses Turbopack instead of fixing it.
- A first submission attempt was auto-closed as [#93174](https://github.com/vercel/next.js/issues/93174) because the reproduction link was not inside a bot-parseable issue-form field. This issue uses the same public repro with the required field structure.

Validated watcher-target excerpt:

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
