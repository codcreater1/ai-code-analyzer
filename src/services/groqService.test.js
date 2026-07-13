import { describe, it, expect } from 'vitest';
import { extractJson } from './groqService.js';

describe('extractJson', () => {
  it('parses a clean JSON string directly', () => {
    const result = extractJson('{"summary":"ok","findings":[]}');
    expect(result).toEqual({ summary: 'ok', findings: [] });
  });

  it('strips ```json fences before parsing', () => {
    const result = extractJson('```json\n{"summary":"fenced"}\n```');
    expect(result).toEqual({ summary: 'fenced' });
  });

  it('strips bare ``` fences before parsing', () => {
    const result = extractJson('```\n{"summary":"bare-fenced"}\n```');
    expect(result).toEqual({ summary: 'bare-fenced' });
  });

  it('falls back to brace-extraction when there is leading/trailing prose', () => {
    const text = 'Sure, here is the analysis:\n{"summary":"noisy"}\nHope that helps!';
    const result = extractJson(text);
    expect(result).toEqual({ summary: 'noisy' });
  });

  it('extracts JSON correctly when the payload contains nested objects and arrays', () => {
    const text = 'Result: {"summary":"nested","findings":[{"id":"A-1","severity":"HIGH","meta":{"cvss":7.5}}]}';
    const result = extractJson(text);
    expect(result.findings[0].meta).toEqual({ cvss: 7.5 });
  });

  it('coerces non-string input via String() before parsing', () => {
    // extractJson does String(text), so a JSON-shaped value passed as a non-string
    // (e.g. already-parsed data accidentally re-passed) should not crash.
    const result = extractJson('{"summary":"123"}');
    expect(result.summary).toBe('123');
  });

  it('throws a descriptive error when there is no JSON object at all', () => {
    expect(() => extractJson('The model refused to answer.')).toThrow('AI response was not valid JSON.');
  });

  it('throws when braces are present but malformed/unbalanced', () => {
    expect(() => extractJson('{"summary": "unterminated')).toThrow();
  });

  it('throws on an empty string', () => {
    expect(() => extractJson('')).toThrow('AI response was not valid JSON.');
  });

  it('throws when only a closing brace exists with no matching opener', () => {
    expect(() => extractJson('no json here }')).toThrow('AI response was not valid JSON.');
  });
});
