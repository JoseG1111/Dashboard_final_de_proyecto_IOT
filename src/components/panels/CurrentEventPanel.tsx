import { useShallow } from 'zustand/react/shallow';
import { RESULT_LABELS } from '../../domain/constants';
import { useDashboardStore } from '../../store/dashboardStore';
import { formatConfidence, formatTimestamp } from '../../utils/format';
import { Panel } from '../shared/Panel';
import { StatusPill } from '../shared/StatusPill';

export function CurrentEventPanel() {
  const { currentEvent, closeCurrentAlert } = useDashboardStore(
    useShallow((state) => ({
      currentEvent: state.currentEvent,
      closeCurrentAlert: state.closeCurrentAlert,
    })),
  );

  return (
    <Panel
      title="Evento actual"
      subtitle="Payload base del proyecto y campos operativos internos de la demo."
      action={
        currentEvent && ['registered', 'validated'].includes(currentEvent.alertStatus) ? (
          <button
            type="button"
            onClick={closeCurrentAlert}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-400"
          >
            Atender / cerrar alerta
          </button>
        ) : null
      }
      className="h-full"
    >
      {!currentEvent ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500">
          No hay un evento en curso. Usa el panel de simulación para disparar movimiento o ejecutar un escenario.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <DataRow label="deviceId" value={currentEvent.deviceId} />
              <DataRow label="zone" value={currentEvent.zone} />
              <DataRow label="motion" value={currentEvent.motion ? 'true' : 'false'} />
              <DataRow label="confidence" value={formatConfidence(currentEvent.confidence)} />
              <DataRow label="timestamp" value={formatTimestamp(currentEvent.timestamp)} className="sm:col-span-2" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MetaRow label="Resultado de validación" value={RESULT_LABELS[currentEvent.validationResult] ?? currentEvent.validationResult} />
              <MetaRow label="Estado de alerta" value={currentEvent.alertStatus} />
              <MetaRow label="Persistencia" value={currentEvent.persisted} />
              <MetaRow label="Notificación" value={currentEvent.notificationStatus} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill status={currentEvent.processingStatus} health="healthy" active />
                <StatusPill status={currentEvent.alertStatus} health={currentEvent.finalState === 'rejected' ? 'warning' : 'healthy'} />
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {currentEvent.notes.map((note) => (
                  <li key={note} className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              Campos internos de la demo: <code className="rounded bg-slate-100 px-1 py-0.5">eventId</code>,{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5">processingStatus</code>,{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5">persisted</code>,{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5">notificationStatus</code>,{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5">alertStatus</code>. El payload obligatorio sigue siendo{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5">deviceId</code>,{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5">zone</code>,{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5">motion</code>,{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5">confidence</code> y{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5">timestamp</code>.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-4 text-white">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Evidencia simulada</p>
                <h3 className="mt-1 text-lg font-semibold">ESP32-CAM snapshot</h3>
              </div>
              <span className="rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-200">
                {currentEvent.eventId}
              </span>
            </div>
            <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.22),_transparent_35%),linear-gradient(160deg,_rgba(15,23,42,0.96),_rgba(2,6,23,1))] p-5">
              <div className="absolute inset-0 bg-[linear-gradient(transparent_24%,rgba(56,189,248,0.09)_25%,transparent_26%),linear-gradient(90deg,transparent_24%,rgba(56,189,248,0.08)_25%,transparent_26%)] bg-[length:28px_28px]" />
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-teal-400/15 to-transparent animate-sweep" />
              </div>
              <div className="relative space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
                  <span>{currentEvent.zone}</span>
                  <span>{formatConfidence(currentEvent.confidence)}</span>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Estado</p>
                      <p className="mt-2 text-lg font-semibold text-teal-200">{currentEvent.evidenceStatus}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Etiqueta</p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">{currentEvent.evidenceLabel}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Descripción</p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      Placeholder visual conservador para la sustentación. Representa la evidencia capturada sin requerir hardware real ni backend de imágenes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

interface DataRowProps {
  label: string;
  value: string;
  className?: string;
}

function DataRow({ label, value, className }: DataRowProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50/80 p-4 ${className ?? ''}`}>
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 break-words font-mono text-sm text-slate-900">{value}</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
