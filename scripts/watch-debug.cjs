const fs = require("fs");

const originalWatch = fs.watch;

fs.watch = function patchedWatch(target, options, listener) {
  try {
    const watcher = originalWatch.call(this, target, options, listener);
    if (watcher && typeof watcher.on === "function") {
      watcher.on("error", (error) => {
        if (error && error.code === "EMFILE") {
          process.stderr.write(`[fs.watch EMFILE event] ${String(target)}\n`);
        }
      });
    }
    return watcher;
  } catch (error) {
    if (error && error.code === "EMFILE") {
      process.stderr.write(`[fs.watch EMFILE throw] ${String(target)}\n`);
    }
    throw error;
  }
};

