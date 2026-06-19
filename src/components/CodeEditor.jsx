import { UploadCloud } from 'lucide-react';
import { LANGUAGE_LABELS } from '../utils/language.js';

export function CodeEditor({ code, setCode, languageChoice, setLanguageChoice, detectedLanguage, fileName, setFileName, onAnalyze, onRepoScan, repoUrl, setRepoUrl }) {
  async function handleFile(file) {
    if (!file) return;
    const text = await file.text();
    setFileName(file.name);
    setCode(text);
  }

  return (
    <section className="glass-panel rounded-[2rem] p-5 lg:p-6">
      <div className="grid gap-4 md:grid-cols-[180px_1fr_auto_auto]">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Language</span>
          <select className="input-shell w-full" value={languageChoice} onChange={event => setLanguageChoice(event.target.value)}>
            {Object.entries(LANGUAGE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">File / GitHub URL</span>
          <input className="input-shell w-full" value={repoUrl} onChange={event => setRepoUrl(event.target.value)} placeholder="Paste GitHub repository URL for repository scan" />
        </label>
        <button className="secondary-button self-end" onClick={onRepoScan}>Scan Repo</button>
        <button className="primary-button self-end" onClick={onAnalyze}>Analyze</button>
      </div>

      <label
        className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-400/35 bg-indigo-500/5 p-6 text-center transition duration-300 hover:border-indigo-300 hover:bg-indigo-500/10"
        onDragOver={event => event.preventDefault()}
        onDrop={event => { event.preventDefault(); handleFile(event.dataTransfer.files?.[0]); }}
      >
        <UploadCloud className="mb-3 h-7 w-7 text-indigo-300" />
        <span className="font-semibold text-slate-300 light:text-slate-700">Drop a code file here or click to upload</span>
        <input className="hidden" type="file" onChange={event => handleFile(event.target.files?.[0])} />
      </label>

      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 light:border-slate-200 light:bg-white">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm light:border-slate-200">
          <span className="font-bold text-slate-300 light:text-slate-700">{fileName}</span>
          <span className="chip">{LANGUAGE_LABELS[detectedLanguage] || detectedLanguage}</span>
        </div>
        <textarea
          className="code-scroll min-h-[490px] w-full resize-y bg-transparent p-5 font-mono text-sm leading-7 text-slate-100 outline-none light:text-slate-900"
          spellCheck="false"
          value={code}
          onChange={event => setCode(event.target.value)}
        />
      </div>
    </section>
  );
}
