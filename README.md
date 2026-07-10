# AI Code Guard — React Pro SAST

[![CI](https://github.com/codcreater1/ai-code-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/codcreater1/ai-code-analyzer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)

A premium multi-language static application security testing interface built with React, Tailwind CSS, and Framer Motion.

## Table of contents

- [Features](#features)
- [Run locally](#run-locally)
- [Testing & linting](#testing--linting)
- [Recommended workflow](#recommended-workflow)
- [Design system rules](#design-system-rules)
- [Contributing](#contributing)
- [License](#license)

## Features

- Modern dark and light mode UI
- Glassmorphism cards, gradients, responsive layout, smooth micro-interactions
- Multi-language local SAST rules
- C/C++, Python, JavaScript, TypeScript, Java, C#, Go, Rust, PHP, Solidity support
- CWE, OWASP and CVSS metadata
- Groq AI assisted analysis and full-code fix suggestions
- Drag and drop file upload
- Public GitHub repository scan
- Search and severity filters
- JSON and Markdown export

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Testing & linting

```bash
npm test        # run the Vitest suite
npm run lint     # run ESLint
npm run build    # production build
```

All three run automatically in CI on every push and pull request to `main`.

## Recommended workflow

1. Paste or upload a source file.
2. Keep language on Auto Detect unless you want to force a language.
3. Click Analyze.
4. Fix Critical and High issues first.
5. Add a Groq API key for deeper AI explanations and full-code remediation.
6. Export JSON or Markdown reports for documentation.

## Design system rules

- Keep all new components in `src/components`.
- Keep analysis logic in `src/utils` and API logic in `src/services`.
- Use `glass-panel`, `primary-button`, `secondary-button`, `input-shell`, `metric-card`, and `chip` classes for visual consistency.
- Keep spacing generous: prefer `p-5`, `p-6`, `gap-4`, `gap-6`, rounded `2xl/3xl` components.
- Use English names for variables, functions, components and comments.

## Contributing

Issues and pull requests are welcome. Before opening a PR:

1. Run `npm run lint` and `npm test` locally and make sure both pass.
2. Keep new SAST rules and utilities covered by tests in `src/utils/*.test.js`.
3. Follow the design system rules above for any UI changes.

## License

Released under the [MIT License](LICENSE).
