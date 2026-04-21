import { useDashboardStore } from '../../store/dashboardStore';
import { formatShortTime } from '../../utils/format';
import { Panel } from '../shared/Panel';
import { StatusPill } from '../shared/StatusPill';

const monitoredServices = ['edge', 'mqtt', 'nodeRed', 'dashboard', 'database', 'notification'] as const;

export function MonitoringGrid() {
  const services = useDashboardStore((state) => state.services);

  return (
    <Panel
      title="Monitoreo básico"
      subtitle="Estado de disponibilidad y salud de los servicios físicos y lógicos relevantes."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {monitoredServices.map((serviceId) => {
          const service = services[serviceId];

          return (
            <article key={serviceId} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{service.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{service.description}</p>
                </div>
                <StatusPill status={service.status} health={service.health} active={service.active} />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{service.detail}</p>
              <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
                Último cambio: {formatShortTime(service.lastChanged)}
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

