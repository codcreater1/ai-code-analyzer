# AI Code Analyzer

> A lightweight static code analyzer that detects common code quality, security, and maintainability issues across multiple programming languages.

![License](https://img.shields.io/github/license/codcreater1/ai-code-analyzer)
![CI](https://github.com/codcreater1/ai-code-analyzer/actions/workflows/ci.yml/badge.svg)
![Last Commit](https://img.shields.io/github/last-commit/codcreater1/ai-code-analyzer)

---

## Features

- Static code analysis
- Multi-language support
- Detects common security issues
- Code quality recommendations
- Maintainability analysis
- Extensible rule system
- Unit tested
- Automated GitHub Actions CI

---

## Supported Languages

- JavaScript
- Python
- Java
- C++
- C#
- TypeScript

---

## Project Structure

```
src/
 ├── utils/
 │   ├── analyzer.js
 │   ├── analyzer.test.js
 │   ├── language.js
 │   └── language.test.js
 ├── components/
 └── ...
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/codcreater1/ai-code-analyzer.git
cd ai-code-analyzer
```

Install dependencies:

```bash
npm install
```

Run the project:

```bash
npm run dev
```

---

## Running Tests

```bash
npm test
```

Run ESLint:

```bash
npm run lint
```

---

## Continuous Integration

This project uses **GitHub Actions** to automatically:

- Install dependencies
- Run ESLint
- Execute unit tests
- Validate every push to the `main` branch

Every successful workflow confirms that the project passes automated quality checks.

---

## Technologies

- JavaScript (ES6+)
- Node.js
- Vite
- ESLint
- Jest / Vitest
- GitHub Actions

---

## Future Improvements

- AI-powered code suggestions
- Severity scoring
- More language support
- Export analysis reports
- IDE integration
- Docker support

---

## License

This project is licensed under the MIT License.

---

## Author

**Murat Can Nergiz**

GitHub:
https://github.com/codcreater1
