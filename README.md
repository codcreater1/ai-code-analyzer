# AI Code Guard — React Pro SAST

A premium multi-language static application security testing interface built with React, Tailwind CSS, and Framer Motion.

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
