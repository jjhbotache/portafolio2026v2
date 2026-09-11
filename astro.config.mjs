// @ts-nocheck
// This config file deliberately opts out of `@ts-check`. Vite's plugin
// types (`Plugin`, `ViteDevServer`, `FSWatcher`) and the Node globals
// we touch (`process`, `globalThis`) don't always align cleanly with
// the `.mjs` JSDoc flavour Astro uses, and adding dozens of inline
// casts here would obscure the actual logic. The runtime behaviour is
// covered by the dev-server smoke test below; type-check the rest of
// the project with `astro check`.
import { defineConfig } from 'astro/config';
import icon from "astro-icon";

/**
 * Process-wide symbol used by the windows-dumpstack-shield plugin to avoid
 * double-registering process listeners when Astro hot-reloads this config.
 * Stored on globalThis so it survives across HMR reloads of this file.
 */
const SHIELD_INSTALLED = Symbol.for('jjh.dumpstackShieldInstalled');

// https://astro.build/config
export default defineConfig({
  site: 'https://juanjosehuertas.dev',
  output: 'static',
  server: {
    host: '0.0.0.0',
    port: 4321
  },
  vite: {
    server: {
      hmr: {
        // helps with the windows hot-reload quirks
        clientPort: 4321
      },
      // Windows Defender creates C:\DumpStack.log.tmp while scanning
      // and locks it. readdirp (used internally by Vite/chokidar) lstat()s
      // it during the initial scan and the EBUSY error bubbles up as an
      // `error` event on the FSWatcher. Node's default behaviour is to
      // re-throw that as an unhandled error and kill the dev server.
      //
      // `watch.ignored` (globs) doesn't catch it because the readdirp
      // walker hits the file via a parent-dir lstat, not via the chokidar
      // path matcher. The fix is to install a process-level handler that
      // swallows only this specific EBUSY on this specific path. Anything
      // else still crashes loudly so real bugs aren't masked.
      watch: {
        // Best-effort: still tell chokidar to skip these so we don't
        // even enumerate them on changes.
        ignored: [
          '**/DumpStack.log.tmp',
          '**/DumpStack.log',
          '**/pagefile.sys',
          '**/hiberfil.sys',
          '**/swapfile.sys',
          '**/System Volume Information/**',
          '**/$RECYCLE.BIN/**',
        ],
      },
    },
    plugins: [
      {
        name: 'windows-dumpstack-shield',
        configureServer(server) {
          // Guard against double-registration when astro reloads the config.
          if (globalThis[SHIELD_INSTALLED]) return;
          globalThis[SHIELD_INSTALLED] = true;

          const isDumpstackErr = (err) => {
            if (!err || typeof err !== 'object') return false;
            const e = err;
            const code = e.code ?? e.cause?.code;
            if (code !== 'EBUSY') return false;
            const p = String(e.path ?? e.cause?.path ?? '');
            return /[\\/]DumpStack\.log(\.tmp)?$/i.test(p);
          };
          // 1) Catch synchronous rethrows from FSWatcher 'error' events.
          // NOTE: `throw err` inside uncaughtException is a no-op in Node —
          // the only way to keep the dev server alive is to *return* and
          // let the listener finish, which keeps the process running.
          process.on('uncaughtException', (err) => {
            if (isDumpstackErr(err)) {
              console.warn(
                '[vite] swallowed transient EBUSY on',
                err.path,
                '(Windows Defender holding C:\\DumpStack.log.tmp)',
              );
              return;
            }
            // Any other uncaught error: log loudly. We can't reliably
            // re-throw from here, so we print a stack and let the user
            // decide whether to restart. HMR keeps working for unrelated
            // modules.
            console.error('[vite] uncaught exception:', err);
          });
          // 2) Catch the unhandled 'error' event specifically — Node
          // routes uncaught EventEmitter errors through here.
          process.on('unhandledRejection', (reason) => {
            if (isDumpstackErr(reason)) return;
          });
          // 3) Once the watcher is alive, attach a per-watcher listener.
          server.httpServer?.once?.('listening', () => {
            const watcher = server.watcher;
            if (watcher && typeof watcher.on === 'function') {
              watcher.on('error', (err) => {
                if (isDumpstackErr(err)) return; // swallow
                // Re-emit as uncaught so we don't silently eat other errors.
                process.emit('uncaughtException', err);
              });
            }
          });
        },
      },
    ],
  },
  integrations: [icon()]
});
