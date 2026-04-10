# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [2.2.0] - 2026-04-11

### Added

- `sniffMidi()` returns `{ format: 'smf' | 'rmi' }` when the prefix matches, otherwise `undefined`.
- `isMidiHeaderPlausible()` performs a stricter check (SMF header chunk and track layout; sane RIFF payload size) without reading the whole file.
- Exported size hints: `MIN_BYTES_SMF`, `MIN_BYTES_RMI`, and `MIN_BYTES_TO_SNIFF`.
- CLI binary `is-midi` (`--plausible`, `--print`, `--help`), exposed via the `is-midi` package `bin` field.

### Changed

- README documents partial reads, MIME/extensions, integration with `file-type`, and when full parsing is needed.

## [2.1.2] - 2026-04-10

### Fixed

- GitHub Actions: GitHub Packages publish job now uses a dedicated npm `--userconfig` for auth and leaves `setup-node` on the default registry for `npm ci`, avoiding `ENEEDAUTH` to `npm.pkg.github.com`.
- GitHub Actions: npm registry publish continues to use OIDC trusted publishing with `npm@latest` so the CLI meets the npm 11.5.1+ OIDC requirement.

### Changed

- `repository.url` in `package.json` uses `https://github.com/chrisvogt/is-midi.git` for npm trusted publishing validation.

## [2.1.1] - 2026-04-09

### Fixed

- GitHub Actions publish workflow: set `registry-url` to `https://npm.pkg.github.com` in the GitHub Packages job so `npm publish` receives credentials (`ENEEDAUTH` without it).

## [2.0.0] - 2026-02-10

### Breaking Changes

- Now requires Node.js 18 or later (previously Node.js 6+)
- Converted to ES Modules (`import`/`export`). CommonJS `require()` is no longer supported.

### Added

- TypeScript type definitions (`index.d.ts`)
- GitHub Actions CI workflow (replacing Travis CI)
- Additional test cases for edge cases

### Changed

- Modernized codebase with ES Module syntax
- Updated all dev dependencies to latest versions
- Improved code documentation with JSDoc comments
- Updated README with modern usage examples

### Removed

- Dropped support for Node.js versions below 18
- Removed `read-chunk` dev dependency (using native `fs` instead)

## [1.0.0] - 2018

- Initial release
