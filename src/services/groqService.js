const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

function extractJson(text) {
  const clean = String(text).replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    // Fall through to brace-extraction below if the response wasn't pure JSON.
  }
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start >= 0 && end > start) return JSON.parse(clean.slice(start, end + 1));
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
