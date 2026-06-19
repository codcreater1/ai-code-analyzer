import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Download, FileText, Filter } from 'lucide-react';

const severityStyles = {
  CRITICAL: 'border-rose-400/50 bg-rose-500/10 text-rose-200',
  HIGH: 'border-orange-400/50 bg-orange-500/10 text-orange-200',
  MEDIUM: 'border-amber-400/50 bg-amber-500/10 text-amber-100',
  LOW: 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100'
};

export function ResultsPanel({ report, activeTab, setActiveTab, filter, setFilter, severity, setSeverity, repoReport, onExportJson, onExportMarkdown, onApplyFix }) {
  const findings = (report?.findings || []).filter(item => {
    const matchesSeverity = severity === 'ALL' || item.severity === severity;
    const matchesSearch = !filter || JSON.stringify(item).toLowerCase().includes(filter.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <section className="glass-panel rounded-[2rem] p-5 lg:p-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {['issues', 'explain', 'fix', 'repo'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-2xl px-4 py-3 text-sm font-black capitalize transition duration-300 ${activeTab === tab ? 'bg-indigo-500 text-white shadow-glow' : 'bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] light:bg-slate-100 light:text-slate-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input-shell w-full pl-11" value={filter} onChange={event => setFilter(event.target.value)} placeholder="Search issues, CWE, OWASP, snippets..." />
        </div>
        <select className="input-shell" value={severity} onChange={event => setSeverity(event.target.value)}>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(item => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="mt-5 min-h-[570px] thin-scroll overflow-auto pr-2">
        {activeTab === 'issues' && (
          <AnimatePresence mode="popLayout">
            {findings.length ? findings.map((item, index) => (
              <motion.article
                key={`${item.id}-${item.lineStart}-${index}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.28, delay: index * 0.025 }}
                className={`mb-4 rounded-3xl border p-5 ${severityStyles[item.severity] || severityStyles.LOW}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-white light:text-slate-950">{item.type}</h3>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">Line {item.lineStart}{item.lineEnd !== item.lineStart ? `-${item.lineEnd}` : ''} · {item.id}</p>
                  </div>
                  <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-black">{item.severity}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="chip">{item.cwe}</span>
                  <span className="chip">OWASP {item.owasp}</span>
                  <span className="chip">CVSS {item.cvss}</span>
                </div>
                {item.snippet && <pre className="code-scroll mt-4 overflow-auto rounded-2xl bg-slate-950/75 p-4 text-xs text-slate-100">{item.snippet}</pre>}
                <p className="mt-4 text-sm leading-6 text-slate-200 light:text-slate-700">{item.description}</p>
                <p className="mt-3 text-sm leading-6"><b>Impact:</b> {item.impact}</p>
                <p className="mt-2 text-sm leading-6"><b>Fix:</b> {item.recommendation}</p>
              </motion.article>
            )) : (
              <div className="grid min-h-[420px] place-items-center rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-8 text-center">
                <div>
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300" />
                  <h3 className="mt-4 text-xl font-black">No matching issues</h3>
                  <p className="mt-2 text-sm text-slate-400">Try another filter or analyze a different source file.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        )}

        {activeTab === 'explain' && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 light:border-slate-200 light:bg-white">
            <h3 className="text-2xl font-black">Analysis Summary</h3>
            <p className="mt-4 leading-7 text-slate-300 light:text-slate-700">{report?.summary || 'Run an analysis to generate a summary.'}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <InfoCard title="How it works" text="The analyzer combines deterministic local SAST rules with optional Groq AI review for deeper explanations and remediation suggestions." />
              <InfoCard title="Fix priority" text="Critical and High findings should be fixed first. Medium and Low findings usually improve hardening, reliability, or maintainability." />
              <InfoCard title="Coverage" text="Rules cover injection, unsafe memory APIs, hardcoded secrets, weak crypto, XSS sinks, TLS mistakes, deserialization and language-specific bad practices." />
              <InfoCard title="Portfolio value" text="The UI is responsive, component-driven, and built with React, Tailwind CSS, and Framer Motion for a premium product feel." />
            </div>
          </div>
        )}

        {activeTab === 'fix' && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 light:border-slate-200 light:bg-white">
            {report?.fixedCode ? (
              <>
                <button className="primary-button" onClick={onApplyFix}>Apply full AI fix</button>
                <pre className="code-scroll mt-5 max-h-[470px] overflow-auto rounded-3xl bg-slate-950 p-5 text-sm text-slate-100">{report.fixedCode}</pre>
              </>
            ) : (
              <div className="grid min-h-[430px] place-items-center text-center">
                <div>
                  <AlertTriangle className="mx-auto h-12 w-12 text-amber-300" />
                  <h3 className="mt-4 text-xl font-black">No full-code fix yet</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">Add a Groq API key and rerun analysis to request full-code remediation. Local findings still include safe fix recommendations.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'repo' && (
          <div className="space-y-4">
            {repoReport.length ? repoReport.map(item => (
              <article key={item.file} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 light:border-slate-200 light:bg-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-black">{item.file}</h3>
                    <p className="mt-1 text-sm text-slate-400">{item.language} · {item.findings.length} issues</p>
                  </div>
                  <span className="chip">Score {item.score}</span>
                </div>
                <div className="mt-4 space-y-2">
                  {item.findings.slice(0, 5).map(finding => <p key={`${finding.id}-${finding.lineStart}`} className="text-sm text-slate-300 light:text-slate-700">{finding.severity} · {finding.type} · line {finding.lineStart}</p>)}
                </div>
              </article>
            )) : (
              <div className="grid min-h-[430px] place-items-center rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center light:border-slate-200 light:bg-white">
                <div>
                  <FileText className="mx-auto h-12 w-12 text-indigo-300" />
                  <h3 className="mt-4 text-xl font-black">Repository results appear here</h3>
                  <p className="mt-2 text-sm text-slate-400">Paste a public GitHub repository URL and click Scan Repo.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button className="secondary-button flex-1" onClick={onExportJson}><Download className="h-4 w-4" /> Export JSON</button>
        <button className="secondary-button flex-1" onClick={onExportMarkdown}><Download className="h-4 w-4" /> Export Markdown</button>
      </div>
    </section>
  );
}

function InfoCard({ title, text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 light:border-slate-200 light:bg-slate-50">
      <h4 className="font-black">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-400 light:text-slate-600">{text}</p>
    </div>
  );
}
