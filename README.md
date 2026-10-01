# Outerbase Studio Desktop

Outerbase Studio Desktop is a lightweight Electron wrapper for the [Outerbase Studio](https://github.com/outerbase/studio) web version. It enables support for drivers that aren't feasible in a browser environment, such as MySQL and PostgreSQL.

## Development checks

Use Node.js 22.13 or newer within Node 22, or Node 24 or newer. The ESLint 10
toolchain requires this range; the release workflow uses Node 22. Install the
locked dependencies with `npm ci`, then run `npm run lint`. For lint-only checks,
`npm ci --ignore-scripts` skips Electron and other dependency lifecycle scripts.
It does not prepare a runnable or packaged Electron application.

`npm run lint` runs the configuration regression tests and checks every `.ts`
and `.tsx` file with zero warnings allowed. The flat configuration preserves the
previous dot-path, `node_modules`, and `dist` exclusions. JavaScript files were
outside the previous `--ext ts,tsx` command and remain outside this command.
`dist-electron` is not an additional lint exclusion.

The migration uses native ESLint 10 peers in TypeScript ESLint 8, React Hooks 7,
and React Refresh 0.5. It retains both original Hooks rules and their severities.
It also retains checks dropped or relaxed by newer recommended presets. The
removed TypeScript `ban-types`, `no-loss-of-precision`, and `no-var-requires`
checks use current replacements; the restricted type list preserves the old
ban on empty intersections and shadowed wrapper names. Current recommended
rules remain enabled, including caught-error causes and unused expressions.
The lock also updates the shared `debug` dependency from 4.3.7 to 4.4.3 because
the newer lint dependency graph requires it; direct application dependencies
are unchanged.

For local compilation without packaging, signing, or publishing, run
`npx --no-install tsc --noEmit` and `npx --no-install vite build`. The narrow
`ES2022.Error` type library enables `Error.cause` while the compilation target
remains ES2020. Desktop packaging and live database connections require their
own validation; lint and compilation do not establish those results.

Migration references: [ESLint 10](https://eslint.org/docs/latest/use/migrate-to-10.0.0),
[ESLint 9 changes](https://eslint.org/docs/latest/use/migrate-to-9.0.0), and
[TypeScript ESLint 8](https://typescript-eslint.io/blog/announcing-typescript-eslint-v8/).
