function createRule(id, severity, type, pattern, recommendation, meta = {}) {
  return { id, severity, type, pattern, recommendation, ...meta };
}

export function rulesFor(language) {
  const common = [
    createRule('SECRET-001', 'HIGH', 'Hardcoded secret', /(api[_-]?key|secret|password|passwd|pwd|token|private[_-]?key)\s*[:=\[\]]*\s*["'][^"']{6,}["']/i, 'Move secrets to environment variables or a secret manager.', { cwe: 'CWE-798', owasp: 'A07', cvss: 7.5 }),
    createRule('INJECT-001', 'CRITICAL', 'Code or command injection risk', /(\beval\s*\(|\bexec\s*\(|\bsystem\s*\(|child_process|Runtime\.getRuntime\(\)\.exec|ProcessBuilder\s*\()/i, 'Avoid dynamic execution. Use safe APIs and strict allowlists.', { cwe: 'CWE-78 / CWE-94', owasp: 'A03', cvss: 9.8 }),
    createRule('SQL-001', 'HIGH', 'Possible SQL injection', /(SELECT|INSERT|UPDATE|DELETE|DROP)\s+[^\n]*(\+|\$\{|format\(|%s|\.concat\()/i, 'Use prepared statements and parameterized queries.', { cwe: 'CWE-89', owasp: 'A03', cvss: 8.8 }),
    createRule('XSS-001', 'MEDIUM', 'Possible XSS sink', /(innerHTML\s*=|outerHTML\s*=|document\.write\s*\(|dangerouslySetInnerHTML)/i, 'Use textContent or sanitize HTML with a trusted sanitizer.', { cwe: 'CWE-79', owasp: 'A03', cvss: 6.1 }),
    createRule('CRYPTO-001', 'MEDIUM', 'Weak cryptography', /(md5\s*\(|sha1\s*\(|\bDES\b|\bECB\b|RC4)/i, 'Use modern cryptography. For passwords use Argon2, bcrypt, or scrypt.', { cwe: 'CWE-327', owasp: 'A02', cvss: 6.5 }),
    createRule('TLS-001', 'MEDIUM', 'Disabled TLS verification', /(rejectUnauthorized\s*:\s*false|verify\s*=\s*False|InsecureSkipVerify\s*:\s*true|TrustAllCerts)/i, 'Do not disable TLS certificate verification.', { cwe: 'CWE-295', owasp: 'A02', cvss: 7.4 })
  ];

  const languageRules = {
    cpp: [
      createRule('CPP-GETS', 'CRITICAL', 'Buffer overflow unsafe input', /\bgets\s*\(/i, 'Use fgets(), std::getline(), or bounded input handling.', { cwe: 'CWE-242 / CWE-120', owasp: 'Memory Safety', cvss: 9.8 }),
      createRule('CPP-STRCPY', 'HIGH', 'Unsafe C string copy', /\b(strcpy|strcat|sprintf|vsprintf|scanf)\s*\(/i, 'Use bounded alternatives, std::string, snprintf, or safer parsing.', { cwe: 'CWE-120', cvss: 8.6 }),
      createRule('CPP-MEMORY', 'LOW', 'Manual memory management', /\bnew\s+\w+|\bdelete\s+/i, 'Prefer RAII and smart pointers such as std::unique_ptr.', { cwe: 'CWE-401', cvss: 3.7 }),
      createRule('CPP-RAND', 'LOW', 'Predictable random generator', /\brand\s*\(/i, 'Use cryptographically secure randomness where security matters.', { cwe: 'CWE-338', cvss: 4.3 })
    ],
    python: [
      createRule('PY-YAML', 'HIGH', 'Unsafe YAML deserialization', /yaml\.load\s*\((?![^\n]*Loader\s*=\s*yaml\.SafeLoader)/i, 'Use yaml.safe_load().', { cwe: 'CWE-502', owasp: 'A08', cvss: 8.1 }),
      createRule('PY-PICKLE', 'HIGH', 'Insecure deserialization', /\bpickle\.loads?\s*\(|\bmarshal\.loads?\s*\(/i, 'Do not deserialize untrusted data with pickle or marshal.', { cwe: 'CWE-502', cvss: 8.1 }),
      createRule('PY-SHELL', 'CRITICAL', 'Shell command injection', /subprocess\.(run|Popen|call)\s*\([^\n]*shell\s*=\s*True/i, 'Avoid shell=True and pass command arguments as a list.', { cwe: 'CWE-78', owasp: 'A03', cvss: 9.8 }),
      createRule('PY-DEBUG', 'LOW', 'Debug mode enabled', /debug\s*=\s*True/i, 'Disable debug mode in production.', { cwe: 'CWE-489', cvss: 3.1 })
    ],
    javascript: [
      createRule('JS-LOCALSTORAGE', 'MEDIUM', 'Sensitive data in localStorage', /localStorage\.setItem\s*\([^\n]*(token|secret|password|jwt)/i, 'Avoid storing sensitive tokens in localStorage.', { cwe: 'CWE-922', cvss: 6.5 }),
      createRule('JS-NOSQL', 'HIGH', 'NoSQL injection pattern', /\$where|\$ne|\$gt|\$regex|findOne\s*\(\s*req\./i, 'Validate input and avoid passing request bodies directly into queries.', { cwe: 'CWE-943', owasp: 'A03', cvss: 8.1 })
    ],
    typescript: [],
    java: [
      createRule('JAVA-DESER', 'HIGH', 'Java insecure deserialization', /ObjectInputStream|readObject\s*\(/i, 'Avoid Java native deserialization for untrusted data.', { cwe: 'CWE-502', cvss: 8.1 }),
      createRule('JAVA-SQL', 'HIGH', 'Statement SQL injection risk', /createStatement\s*\(|executeQuery\s*\([^\n]*\+/i, 'Use PreparedStatement with placeholders.', { cwe: 'CWE-89', cvss: 8.8 })
    ],
    csharp: [
      createRule('CS-SQL', 'HIGH', 'SQL injection risk', /SqlCommand\s*\([^\n]*\+|ExecuteQuery\s*\([^\n]*\+/i, 'Use parameterized SqlCommand parameters.', { cwe: 'CWE-89', cvss: 8.8 }),
      createRule('CS-DESER', 'HIGH', 'Unsafe .NET deserialization', /BinaryFormatter|NetDataContractSerializer/i, 'Avoid unsafe serializers for untrusted data.', { cwe: 'CWE-502', cvss: 8.1 })
    ],
    go: [
      createRule('GO-SQL', 'HIGH', 'SQL injection risk', /db\.Query\s*\([^\n]*\+|fmt\.Sprintf\s*\([^\n]*(SELECT|UPDATE|DELETE|INSERT)/i, 'Use parameterized database calls.', { cwe: 'CWE-89', cvss: 8.8 }),
      createRule('GO-TLS', 'HIGH', 'Insecure TLS config', /InsecureSkipVerify\s*:\s*true/i, 'Keep TLS verification enabled.', { cwe: 'CWE-295', cvss: 7.4 })
    ],
    rust: [
      createRule('RS-UNSAFE', 'MEDIUM', 'Unsafe Rust block', /\bunsafe\s*\{/i, 'Minimize unsafe blocks and document invariants.', { cwe: 'Memory Safety', cvss: 5.3 }),
      createRule('RS-COMMAND', 'HIGH', 'Command execution with user input', /Command::new\s*\([^\n]*(input|args|request|param)/i, 'Use strict allowlists and avoid user-controlled commands.', { cwe: 'CWE-78', cvss: 8.8 })
    ],
    php: [
      createRule('PHP-SQL', 'HIGH', 'SQL injection risk', /mysql_query\s*\(|mysqli_query\s*\([^\n]*\$|PDO::query\s*\([^\n]*\$/i, 'Use prepared statements with bound parameters.', { cwe: 'CWE-89', cvss: 8.8 }),
      createRule('PHP-INCLUDE', 'HIGH', 'File inclusion risk', /(include|require)(_once)?\s*\([^\n]*\$/i, 'Never include files from user-controlled paths.', { cwe: 'CWE-98', cvss: 8.1 })
    ],
    solidity: [
      createRule('SOL-REENTRANCY', 'CRITICAL', 'Reentrancy risk', /\.call\s*\{?\s*value\s*:/i, 'Use checks-effects-interactions and ReentrancyGuard.', { cwe: 'CWE-841', owasp: 'Smart Contract', cvss: 9.3 }),
      createRule('SOL-TXORIGIN', 'HIGH', 'tx.origin authorization', /tx\.origin/i, 'Use msg.sender and explicit role checks.', { cwe: 'CWE-346', cvss: 8.0 }),
      createRule('SOL-SELFDESTRUCT', 'HIGH', 'Dangerous selfdestruct', /selfdestruct\s*\(/i, 'Avoid selfdestruct in modern contracts.', { cwe: 'CWE-284', cvss: 8.0 }),
      createRule('SOL-UNCHECKED', 'MEDIUM', 'Unchecked low-level call', /\.call\s*\([^\n;]*\)\s*;/i, 'Check low-level call return values.', { cwe: 'CWE-252', cvss: 6.5 })
    ]
  };

  return [...common, ...(languageRules[language] || [])];
}

export function analyzeLocally(code, language, fileName = 'source') {
  const findings = [];
  const lines = String(code).split('\n');
  for (const currentRule of rulesFor(language)) {
    lines.forEach((line, index) => {
      if (currentRule.pattern.test(line)) {
        findings.push({
          id: currentRule.id,
          severity: currentRule.severity,
          type: currentRule.type,
          lineStart: index + 1,
          lineEnd: index + 1,
          snippet: line.trim(),
          description: `${currentRule.type} detected by local static analysis rule.`,
          impact: 'May reduce security, reliability, or maintainability.',
          recommendation: currentRule.recommendation,
          cwe: currentRule.cwe || 'N/A',
          owasp: currentRule.owasp || 'N/A',
          cvss: currentRule.cvss || 5.0,
          source: 'local'
        });
      }
    });
  }
  const score = calculateScore(findings);
  return {
    fileName,
    language,
    summary: findings.length ? `${findings.length} issues found by local SAST rules.` : 'No local rule findings detected.',
    findings,
    score,
    risk: riskFromScore(score),
    fixedCode: ''
  };
}

export function calculateScore(findings) {
  const weights = { CRITICAL: 28, HIGH: 16, MEDIUM: 8, LOW: 3 };
  const penalty = findings.reduce((sum, item) => sum + (weights[item.severity] || 5), 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}

export function riskFromScore(score) {
  if (score >= 85) return 'LOW RISK';
  if (score >= 65) return 'MEDIUM RISK';
  if (score >= 35) return 'HIGH RISK';
  return 'CRITICAL RISK';
}

export function countSeverities(findings) {
  return findings.reduce((acc, item) => ({ ...acc, [item.severity]: (acc[item.severity] || 0) + 1 }), {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  });
}
