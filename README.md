# Outerbase Studio Desktop

Outerbase Studio Desktop is a lightweight Electron wrapper for the [Outerbase Studio](https://github.com/outerbase/studio) web version. It enables support for drivers that aren't feasible in a browser environment, such as MySQL and PostgreSQL.

## Pull request checks

The `CI` check runs for every pull request, merge queue entry, and push to `master`.
Using Node.js 22 (at least 22.12), run the same checks locally:

```sh
npm ci
npm run lint
npm exec -- tsc --noEmit
npm exec -- vite build
```

These checks validate the renderer and Electron bundles without packaging, signing,
or publishing a release. Configure the repository's `master` branch protection or
ruleset to require the `CI` status check before merging.
