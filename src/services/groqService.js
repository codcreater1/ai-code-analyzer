const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// Llama occasionally emits a raw newline/tab inside a JSON string value instead
// of the escaped \n / \t, which JSON.parse rejects as a "Bad control character"
// error. This walks the text tracking string boundaries (respecting \" and \\
// escapes) and escapes control chars only when they fall inside a string.
function sanitizeControlChars(str) {
  let result = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      result += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }
    if (inString && (ch === '\n' || ch === '\r' || ch === '\t')) {
      result += ch === '\n' ? '\\n' : ch === '\r' ? '\\r' : '\\t';
      continue;
    }
    result += ch;
  }
  return result;
}

function tryParseVariants(candidate) {
  for (const variant of [candidate, sanitizeControlChars(candidate)]) {
    try {
      return JSON.parse(variant);
    } catch {
      // try next variant
    }
  }
  return undefined;
}

export function extractJson(text) {
  const clean = String(text).replace(/```json|```/g, '').trim();
  const direct = tryParseVariants(clean);
  if (direct !== undefined) return direct;

  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const sliced = tryParseVariants(clean.slice(start, end + 1));
    if (sliced !== undefined) return sliced;
  }
  throw new Error('AI response was not valid JSON.');
}

export async function analyzeWithGroq({ apiKey, code, language, fileName }) {
  if (!apiKey) throw new Error('Groq API key is missing.');
  const prompt = `Analyze this ${language} file for security vulnerabilities, bugs, bad practices, maintainability issues, and performance risks. Return ONLY valid JSON with schema {"summary":"...","findings":[{"id":"...","severity":"CRITICAL|HIGH|MEDIUM|LOW","type":"...","lineStart":1,"lineEnd":1,"snippet":"...","description":"...","impact":"...","recommendation":"...","cwe":"...","owasp":"...","cvss":0}],"fixedCode":"optional full safer version"}. File: ${fileName}\n\n${code}`;
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.1,
      messages: [
        { role: 'system', content: 'You are a senior application security engineer and SAST expert. Return strict JSON only.' },
        { role: 'user', content: prompt }
      ]
    })
  });
  if (!response.ok) throw new Error(`Groq API error ${response.status}`);
  return extractJson(await response.json().then(data => data.choices?.[0]?.message?.content || ''));
}
