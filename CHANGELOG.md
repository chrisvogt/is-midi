# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

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
