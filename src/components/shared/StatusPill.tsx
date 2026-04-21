import { STATUS_LABELS } from '../../domain/constants';
import { cn } from '../../utils/cn';

const toneByHealth: Record<string, string> = {
  healthy: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  degraded: 'border-sky-200 bg-sky-50 text-sky-700',
  down: 'border-rose-200 bg-rose-50 text-rose-700',
};

interface StatusPillProps {
  status: string;
  health?: string;
  active?: boolean;
}

export function StatusPill({ status, health = 'healthy', active = false }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
        toneByHealth[health] ?? toneByHealth.healthy,
        active && 'animate-highlight',
      )}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-80" />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

