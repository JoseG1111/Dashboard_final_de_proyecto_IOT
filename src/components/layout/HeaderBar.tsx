import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useDashboardStore } from '../../store/dashboardStore';
import { cn } from '../../utils/cn';
import { formatClock } from '../../utils/format';

const statusCopy = {
  operational: 'Operación nominal',
  degraded: 'Operación degradada',
  critical: 'Riesgo crítico',
};

export function HeaderBar() {
  const [now, setNow] = useState(() => new Date());
  const { projectTitle, projectSubtitle, systemStatus, resetDemo } = useDashboardStore(
    useShallow((state) => ({
      projectTitle: state.projectTitle,
      projectSubtitle: state.projectSubtitle,
      systemStatus: state.systemStatus,
      resetDemo: state.resetDemo,
    })),
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-slate-950 text-white shadow-panel">
      <div className="relative p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.24),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.02),_rgba(255,255,255,0))]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Modo simulación
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{projectTitle}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">{projectSubtitle}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Hora actual</span>
              <p className="mt-2 font-mono text-2xl">{formatClock(now)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Estado general</span>
              <p
                className={cn(
                  'mt-2 text-lg font-semibold',
                  systemStatus === 'operational' && 'text-emerald-300',
                  systemStatus === 'degraded' && 'text-amber-300',
                  systemStatus === 'critical' && 'text-rose-300',
                )}
              >
                {statusCopy[systemStatus]}
              </p>
            </div>
            <button
              type="button"
              onClick={resetDemo}
              className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 text-left transition hover:border-sky-300 hover:bg-sky-500/20"
            >
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Control</span>
              <p className="mt-2 text-lg font-semibold text-sky-200">Reset demo</p>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
