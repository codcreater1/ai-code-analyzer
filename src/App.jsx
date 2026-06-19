import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Radar, Shield, Zap } from 'lucide-react';
import { Header } from './components/Header.jsx';
import { CodeEditor } from './components/CodeEditor.jsx';
import { MetricCard } from './components/MetricCard.jsx';
import { ResultsPanel } from './components/ResultsPanel.jsx';
import { SAMPLE_CODE } from './data/sampleCode.js';
import { analyzeLocally, calculateScore, countSeverities, riskFromScore } from './utils/analyzer.js';
import { detectLanguage, EXTENSION_LANGUAGE } from './utils/language.js';
import { analyzeWithGroq } from './services/groqService.js';

const MAX_REPO_FILES = 80;
const MAX_FILE_BYTES = 450000;
const DEFAULT_BRANCHES = ['main', 'master'];

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [code, setCode] = useState(SAMPLE_CODE);
  const [fileName, setFileName] = useState('sample.cpp');
  const [languageChoice, setLanguageChoice] = useState('auto');
  const [repoUrl, setRepoUrl] = useState('');
  const [status, setStatus] = useState('Ready');
  const [apiKey, setApiKey] = useState(localStorage.getItem('GROQ_API_KEY') || '');
  const [activeTab, setActiveTab] = useState('issues');
  const [filter, setFilter] = useState('');
  const [severity, setSeverity] = useState('ALL');
  const [repoReport, setRepoReport] = useState([]);
  const [report, setReport] = useState(() => analyzeLocally(SAMPLE_CODE, 'cpp', 'sample.cpp'));

  const detectedLanguage = useMemo(() => languageChoice === 'auto' ? detectLanguage(fileName, code) : languageChoice, [languageChoice, fileName, code]);
  const counts = countSeverities(report?.findings || []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('light', nextTheme === 'light');
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  }

  async function analyzeCode() {
    if (code.trim().length < 5) {
      setStatus('Paste code first');
      return;
    }
    setStatus('Analyzing source...');
    const localReport = analyzeLocally(code, detectedLanguage, fileName);
    setReport(localReport);

    if (!apiKey.trim()) {
      setStatus('Local analysis complete');
      return;
    }

    try {
      const aiReport = await analyzeWithGroq({ apiKey: apiKey.trim(), code, language: detectedLanguage, fileName });
      const normalizedAiFindings = (aiReport.findings || []).map((item, index) => ({
        id: item.id || `AI-${index + 1}`,
        severity: item.severity || 'MEDIUM',
        type: item.type || 'AI finding',
        lineStart: item.lineStart || item.line_start || 1,
        lineEnd: item.lineEnd || item.line_end || item.lineStart || item.line_start || 1,
        snippet: item.snippet || '',
        description: item.description || 'AI detected issue.',
        impact: item.impact || 'May affect security, reliability, or maintainability.',
        recommendation: item.recommendation || 'Review and remediate this issue.',
        cwe: item.cwe || 'N/A',
        owasp: item.owasp || 'N/A',
        cvss: item.cvss || 5.0,
        source: 'ai'
      }));
      const mergedFindings = [...localReport.findings, ...normalizedAiFindings];
      const score = calculateScore(mergedFindings);
      setReport({
        fileName,
        language: detectedLanguage,
        summary: aiReport.summary || localReport.summary,
        findings: mergedFindings,
        score,
        risk: riskFromScore(score),
        fixedCode: aiReport.fixedCode || aiReport.fixed_code || ''
      });
      setStatus('AI + local analysis complete');
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function scanRepository() {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
    if (!match) {
      setStatus('Paste a valid GitHub repository URL');
      return;
    }

    const [, owner, rawRepo] = match;
    const repo = rawRepo.replace(/\.git$/, '');
    setActiveTab('repo');
    setStatus('Loading repository tree...');

    try {
      let tree = null;
      let branchUsed = 'main';
      for (const branch of DEFAULT_BRANCHES) {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
        if (response.ok) {
          tree = await response.json();
          branchUsed = branch;
          break;
        }
      }
      if (!tree) throw new Error('Could not fetch repo tree. Make sure the repo is public and branch is main/master.');

      const files = tree.tree
        .filter(item => item.type === 'blob')
        .filter(item => EXTENSION_LANGUAGE[(item.path.split('.').pop() || '').toLowerCase()])
        .filter(item => item.size < MAX_FILE_BYTES)
        .slice(0, MAX_REPO_FILES);

      const reports = [];
      for (const file of files) {
        setStatus(`Scanning ${file.path}`);
        const response = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branchUsed}/${file.path}`);
        if (!response.ok) continue;
        const source = await response.text();
        const language = detectLanguage(file.path, source);
        reports.push(analyzeLocally(source, language, file.path));
      }
      setRepoReport(reports.sort((a, b) => a.score - b.score));
      setStatus(`Repository scan complete: ${reports.length} files`);
    } catch (error) {
      setStatus(error.message);
    }
  }

  function saveApiKey() {
    localStorage.setItem('GROQ_API_KEY', apiKey.trim());
    setStatus('Groq API key saved locally');
  }

  function exportJson() {
    downloadFile(JSON.stringify({ report, repoReport, exportedAt: new Date().toISOString() }, null, 2), 'ai-code-guard-report.json', 'application/json');
  }

  function exportMarkdown() {
    const lines = ['# AI Code Guard Report', '', `Exported: ${new Date().toISOString()}`, '', `## ${report.fileName}`, `Language: ${report.language}`, `Score: ${report.score} (${report.risk})`, '', report.summary, ''];
    report.findings.forEach(item => {
      lines.push(`### ${item.severity}: ${item.type}`, `- Line: ${item.lineStart}`, `- CWE: ${item.cwe}`, `- OWASP: ${item.owasp}`, `- CVSS: ${item.cvss}`, `- Fix: ${item.recommendation}`, '', item.snippet ? `\`${item.snippet}\`` : '', '');
    });
    if (repoReport.length) {
      lines.push('## Repository Scan', '');
      repoReport.forEach(item => lines.push(`- ${item.fileName}: ${item.score} / ${item.risk} / ${item.findings.length} issues`));
    }
    downloadFile(lines.join('\n'), 'ai-code-guard-report.md', 'text/markdown');
  }

  function downloadFile(content, name, type) {
    const blob = new Blob([content], { type });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }

  function applyFix() {
    if (!report?.fixedCode) return;
    setCode(report.fixedCode);
    setStatus('AI fix applied');
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,.25),transparent_34%),radial-gradient(circle_at_top_right,rgba(217,70,239,.2),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] light:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,.16),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)]">
      <div className="pointer-events-none fixed left-[-80px] top-28 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-120px] right-[-80px] h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <span className="chip inline-flex items-center gap-2"><Zap className="h-4 w-4 text-indigo-300" /> React + Tailwind + Framer Motion</span>
            <h2 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
              Beautiful SAST analysis for modern engineering teams.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 light:text-slate-700">
              Scan multi-language code, detect risky patterns, review CWE / OWASP / CVSS metadata, export reports, and optionally enhance analysis with Groq AI.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }} className="glass-panel rounded-[2rem] p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500/20 text-indigo-200"><KeyRound className="h-5 w-5" /></div>
              <div>
                <h3 className="font-black">Groq API Key</h3>
                <p className="text-sm text-slate-400">Stored only in localStorage.</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <input className="input-shell flex-1" type="password" value={apiKey} onChange={event => setApiKey(event.target.value)} placeholder="gsk_..." />
              <button className="secondary-button" onClick={saveApiKey}>Save</button>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-400"><Radar className="h-4 w-4" /> {status}</p>
          </motion.div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Security Score" value={report.score} tone="default" />
          <MetricCard label="Critical" value={counts.CRITICAL} tone="critical" delay={0.05} />
          <MetricCard label="High" value={counts.HIGH} tone="high" delay={0.1} />
          <MetricCard label="Medium" value={counts.MEDIUM} tone="medium" delay={0.15} />
          <MetricCard label="Low" value={counts.LOW} tone="low" delay={0.2} />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
          <CodeEditor
            code={code}
            setCode={setCode}
            languageChoice={languageChoice}
            setLanguageChoice={setLanguageChoice}
            detectedLanguage={detectedLanguage}
            fileName={fileName}
            setFileName={setFileName}
            onAnalyze={analyzeCode}
            onRepoScan={scanRepository}
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
          />
          <ResultsPanel
            report={report}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filter={filter}
            setFilter={setFilter}
            severity={severity}
            setSeverity={setSeverity}
            repoReport={repoReport}
            onExportJson={exportJson}
            onExportMarkdown={exportMarkdown}
            onApplyFix={applyFix}
          />
        </section>

        <footer className="mt-10 pb-8 text-center text-sm text-slate-500">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 light:border-slate-200 light:bg-white">
            <Shield className="h-4 w-4" /> Built as a professional portfolio-grade SAST interface.
          </div>
        </footer>
      </main>
    </div>
  );
}
