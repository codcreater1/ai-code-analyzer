export const EXTENSION_LANGUAGE = {
  sol: 'solidity', js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'typescript', py: 'python', java: 'java', c: 'cpp', h: 'cpp',
  cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', cs: 'csharp', go: 'go', rs: 'rust', php: 'php', rb: 'ruby'
};

export const LANGUAGE_LABELS = {
  auto: 'Auto Detect', solidity: 'Solidity', javascript: 'JavaScript', typescript: 'TypeScript',
  python: 'Python', java: 'Java', cpp: 'C/C++', csharp: 'C#', go: 'Go', rust: 'Rust', php: 'PHP', ruby: 'Ruby'
};

export function detectLanguage(fileName = '', code = '') {
  const extension = String(fileName).split('.').pop().toLowerCase();
  if (EXTENSION_LANGUAGE[extension]) return EXTENSION_LANGUAGE[extension];
  const source = String(code);
  if (/#include\s*[<"]|using\s+namespace\s+std|std::|\bint\s+main\s*\(/.test(source)) return 'cpp';
  if (/pragma\s+solidity|contract\s+\w+\s*\{|\bmsg\.sender\b|\bmapping\s*\(/.test(source)) return 'solidity';
  if (/^\s*def\s+\w+\s*\(|^\s*import\s+[\w.]+|^\s*from\s+[\w.]+\s+import|print\s*\(/m.test(source)) return 'python';
  if (/package\s+main|func\s+main\s*\(|fmt\.Print|go\s+func/.test(source)) return 'go';
  if (/fn\s+main\s*\(|use\s+std::|println!\s*\(/.test(source)) return 'rust';
  if (/<\?php|\$\w+\s*=|echo\s+/.test(source)) return 'php';
  if (/public\s+class\s+\w+|System\.out\.println|import\s+java\./.test(source)) return 'java';
  if (/using\s+System|namespace\s+\w+|Console\.WriteLine/.test(source)) return 'csharp';
  if (/interface\s+\w+|type\s+\w+\s*=|:\s*string|as\s+\w+/.test(source)) return 'typescript';
  return 'javascript';
}
