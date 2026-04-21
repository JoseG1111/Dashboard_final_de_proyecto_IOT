import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface PanelProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function Panel({ title, subtitle, action, className, children }: PanelProps) {
  return (
    <section
      className={cn(
        'rounded-3xl border border-slate-200/80 bg-white/88 p-5 shadow-panel backdrop-blur',
        className,
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

