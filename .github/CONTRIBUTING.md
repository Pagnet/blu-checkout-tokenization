# How to Contribute

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

The following is a set of guidelines for contributing to
`@useblu/checkout-tokenization`. Please take a moment to review this document in
order to make the contribution process straightforward and effective for
everyone involved.

### Table Of Contents

- [Code of Conduct](#code-of-conduct)
- [Issues](#issues)
- [Making Changes](#making-changes)
- [Pull Requests](#pull-requests)
- [Setup](#setup)
- [Syncing with upstream](#syncing-with-upstream)
- [Styleguides](#styleguides)

## Code of Conduct

We adopted a Code of Conduct that we expect project participants to adhere to.
Please read [the full text](CODE_OF_CONDUCT.md) so that you can understand what
actions will and will not be tolerated.

## Issues

A great way to contribute to the project is to send a detailed report when you
encounter an issue. We always appreciate a well-written, thorough bug report,
and will thank you for it!

Check that our issue database doesn't already include that problem or suggestion
before submitting an issue.

### Security Issues

Blu's staff takes security and privacy issues seriously — even more so for a
payments SDK. If you discover a potential point of failure, please bring it to
our attention immediately!

Please **DO NOT** file a public issue, but rather send your report privately to
seguranca@useblu.com.br.

Read more: [SECURITY.md](SECURITY.md)

## Making Changes

- We adopted [GitHub Flow](https://guides.github.com/introduction/flow/).
- Assign the issue to yourself so everyone knows you took it.
- Create your branch from `main` following the pattern
  `feat/<TICKET>/<short-description>` (e.g. `feat/AC-161/prod-environment-docs`).
- Make commits of logical and atomic units, following
  [Conventional Commits](https://www.conventionalcommits.org/).
- Submit a pull request.

## Pull Requests

Please follow these steps to have your contribution considered by the
maintainers:

1. Follow all instructions in [the template](PULL_REQUEST_TEMPLATE.md).
2. Follow the [styleguides](#styleguides).
3. After you submit your pull request, verify that all CI status checks
   (lint, tests and build) are passing.

While the prerequisites above must be satisfied prior to having your pull
request reviewed, the reviewer(s) may ask you to complete additional work,
tests, or other changes before your pull request can be accepted.

## Setup

This project uses [pnpm](https://pnpm.io/) and Node.js 18 (see `.nvmrc`).

```sh
# install dependencies
pnpm install

# run the test suite
pnpm test:ci

# lint
pnpm lint

# build (ESM + CJS + type declarations)
pnpm build
```

## Syncing with upstream

This package is a **fork** of
[`@malga/tokenization`](https://github.com/plughacker/malga-tokenization). The
tokenization logic is inherited from upstream — we do not rewrite it. When
bringing in upstream changes:

- **Never auto-merge:** every upstream update goes through manual review.
- **Cherry-pick, don't merge:** to avoid dragging in unwanted changes.
- **Test locally** before opening a sync PR.
- **Changelog:** document what changed from upstream in `CHANGELOG.md`.
- Avoid changing inherited public signatures — each divergence increases the
  cost of future syncs.

## Styleguides

- **Code:** ESLint + Prettier (`pnpm lint`).
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/).
- **Tests:** keep the inherited suite green and add tests for fork-specific
  behavior.
