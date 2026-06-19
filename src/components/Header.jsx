import { Moon, ShieldCheck, Sun, Sparkles } from 'lucide-react';

export function Header({ theme, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl light:border-slate-200 light:bg-white/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-glow">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight sm:text-xl">AI Code Guard</h1>
            <p className="text-xs font-medium text-slate-400">Premium multi-language SAST analyzer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-xs font-bold text-indigo-200 sm:flex light:text-indigo-700">
            <Sparkles className="h-4 w-4" /> Pro SAST UI
          </span>
          <button className="secondary-button !rounded-full !p-3" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
