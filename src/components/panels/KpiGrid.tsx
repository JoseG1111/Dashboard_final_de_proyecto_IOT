import { useShallow } from 'zustand/react/shallow';
import { useDashboardStore } from '../../store/dashboardStore';
import { formatLatency } from '../../utils/format';
import { Panel } from '../shared/Panel';

export function KpiGrid() {
  const { metrics, healthyServices } = useDashboardStore(
    useShallow((state) => ({
      metrics: state.metrics,
      healthyServices: Object.values(state.services).filter((service) => service.health === 'healthy').length,
    })),
  );

  const cards = [
    { label: 'Eventos detectados', value: metrics.eventsDetected.toString() },
    { label: 'Alertas válidas', value: metrics.validAlerts.toString() },
    { label: 'Eventos descartados', value: metrics.discardedEvents.toString() },
    { label: 'Notificaciones emitidas', value: metrics.notificationsSent.toString() },
    { label: 'Servicios saludables', value: `${healthyServices}/8` },
    {
      label: 'Tiempo de respuesta aprox.',
      value: metrics.averageResponseMs > 0 ? formatLatency(metrics.averageResponseMs) : 'Sin datos',
    },
  ];

  return (
    <Panel
      title="KPIs de la demo"
      subtitle="Indicadores mínimos para narrar la efectividad, disponibilidad y respuesta del sistema."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{card.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{card.value}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}
