import { useDashboardStore } from '../../store/dashboardStore';
import { formatConfidence, formatLatency, formatShortTime } from '../../utils/format';
import { Panel } from '../shared/Panel';

export function EventTimeline() {
  const timeline = useDashboardStore((state) => state.timeline);

  return (
    <Panel
      title="Bitácora / Timeline"
      subtitle="Trazabilidad resumida de cada evento simulado y su resultado final."
      className="h-full"
    >
      {timeline.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500">
          La bitácora se irá poblando a medida que ejecutes eventos y escenarios.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Zona</th>
                  <th className="px-4 py-3">Evento</th>
                  <th className="px-4 py-3">Resultado</th>
                  <th className="px-4 py-3">Persistencia</th>
                  <th className="px-4 py-3">Notificación</th>
                  <th className="px-4 py-3">Estado final</th>
                  <th className="px-4 py-3">RT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {timeline.map((record) => (
                  <tr key={record.eventId} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {formatShortTime(record.time)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{record.zone}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{record.event}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {record.deviceId} · {formatConfidence(record.confidence)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{record.result}</td>
                    <td className="px-4 py-3 text-slate-700">{record.persistence}</td>
                    <td className="px-4 py-3 text-slate-700">{record.notification}</td>
                    <td className="px-4 py-3 text-slate-700">{record.finalState}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {record.responseTimeMs ? formatLatency(record.responseTimeMs) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Panel>
  );
}

