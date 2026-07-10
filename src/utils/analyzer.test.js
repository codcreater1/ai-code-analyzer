import { describe, it, expect } from 'vitest';
import { rulesFor, analyzeLocally, calculateScore, riskFromScore, countSeverities } from './analyzer.js';

describe('rulesFor', () => {
  it('returns common rules for an unknown language', () => {
    const rules = rulesFor('unknown-language');
    const ids = rules.map((r) => r.id);
    expect(ids).toContain('SECRET-001');
    expect(ids).toContain('INJECT-001');
  });

  it('adds language-specific rules on top of common rules', () => {
    const cppRules = rulesFor('cpp');
    const commonRules = rulesFor('unknown-language');
    expect(cppRules.length).toBeGreaterThan(commonRules.length);
    expect(cppRules.map((r) => r.id)).toContain('CPP-GETS');
  });

  it('returns no extra rules for typescript beyond common (empty language rules)', () => {
    const tsRules = rulesFor('typescript');
    const commonRules = rulesFor('unknown-language');
    expect(tsRules.length).toBe(commonRules.length);
  });
});

describe('analyzeLocally', () => {
  it('finds no issues in clean code', () => {
    const result = analyzeLocally('const x = 1;\nconsole.log(x);', 'javascript', 'clean.js');
    expect(result.findings).toHaveLength(0);
    expect(result.score).toBe(100);
    expect(result.risk).toBe('LOW RISK');
  });

  it('detects a hardcoded secret', () => {
    const code = 'const apiKey = "sk-abcdef123456";';
    const result = analyzeLocally(code, 'javascript', 'secrets.js');
    const finding = result.findings.find((f) => f.id === 'SECRET-001');
    expect(finding).toBeDefined();
    expect(finding.severity).toBe('HIGH');
    expect(finding.lineStart).toBe(1);
  });

  it('detects a critical code injection risk', () => {
    const code = 'eval(userInput);';
    const result = analyzeLocally(code, 'javascript', 'inject.js');
    const finding = result.findings.find((f) => f.id === 'INJECT-001');
    expect(finding).toBeDefined();
    expect(finding.severity).toBe('CRITICAL');
  });

  it('detects language-specific rules, e.g. C++ gets()', () => {
    const code = '#include <stdio.h>\nchar buf[10];\ngets(buf);';
    const result = analyzeLocally(code, 'cpp', 'unsafe.c');
    const finding = result.findings.find((f) => f.id === 'CPP-GETS');
    expect(finding).toBeDefined();
    expect(finding.severity).toBe('CRITICAL');
    expect(finding.lineStart).toBe(3);
  });

  it('detects Solidity reentrancy risk', () => {
    const code = 'contract Bank {\n  function withdraw() public {\n    msg.sender.call{value: amount}("");\n  }\n}';
    const result = analyzeLocally(code, 'solidity', 'Bank.sol');
    const finding = result.findings.find((f) => f.id === 'SOL-REENTRANCY');
    expect(finding).toBeDefined();
  });

  it('reports multiple findings across multiple lines', () => {
    const code = 'eval(x);\nconst password = "hunter2!";\ninnerHTML = data;';
    const result = analyzeLocally(code, 'javascript', 'multi.js');
    expect(result.findings.length).toBeGreaterThanOrEqual(3);
  });

  it('includes the correct fileName and language in the report', () => {
    const result = analyzeLocally('const a = 1;', 'python', 'script.py');
    expect(result.fileName).toBe('script.py');
    expect(result.language).toBe('python');
  });
});

describe('calculateScore', () => {
  it('returns 100 for no findings', () => {
    expect(calculateScore([])).toBe(100);
  });

  it('subtracts weighted penalties per severity', () => {
    const findings = [{ severity: 'CRITICAL' }, { severity: 'LOW' }];
    // 100 - 28 - 3 = 69
    expect(calculateScore(findings)).toBe(69);
  });

  it('never goes below 0', () => {
    const findings = Array(10).fill({ severity: 'CRITICAL' });
    expect(calculateScore(findings)).toBe(0);
  });

  it('falls back to a default weight for unknown severities', () => {
    const findings = [{ severity: 'UNKNOWN' }];
    expect(calculateScore(findings)).toBe(95);
  });
});

describe('riskFromScore', () => {
  it('classifies scores into the correct risk bands', () => {
    expect(riskFromScore(100)).toBe('LOW RISK');
    expect(riskFromScore(85)).toBe('LOW RISK');
    expect(riskFromScore(84)).toBe('MEDIUM RISK');
    expect(riskFromScore(65)).toBe('MEDIUM RISK');
    expect(riskFromScore(64)).toBe('HIGH RISK');
    expect(riskFromScore(35)).toBe('HIGH RISK');
    expect(riskFromScore(34)).toBe('CRITICAL RISK');
    expect(riskFromScore(0)).toBe('CRITICAL RISK');
  });
});

describe('countSeverities', () => {
  it('counts zero findings for each severity when list is empty', () => {
    expect(countSeverities([])).toEqual({ CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 });
  });

  it('tallies findings by severity', () => {
    const findings = [
      { severity: 'CRITICAL' },
      { severity: 'CRITICAL' },
      { severity: 'HIGH' },
      { severity: 'LOW' }
    ];
    expect(countSeverities(findings)).toEqual({ CRITICAL: 2, HIGH: 1, MEDIUM: 0, LOW: 1 });
  });
});
