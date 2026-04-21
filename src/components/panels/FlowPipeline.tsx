import { PIPELINE_ORDER } from '../../domain/constants';
import { useDashboardStore } from '../../store/dashboardStore';
import { formatShortTime } from '../../utils/format';
import { Panel } from '../shared/Panel';
import { StatusPill } from '../shared/StatusPill';

const stageLabels = {
  pir: 'PIR',
  camera: 'ESP32-CAM',
  edge: 'Edge',
  mqtt: 'MQTT',
  nodeRed: 'Node-RED',
  dashboard: 'Dashboard/API',
  database: 'DB',
  notification: 'Notif.',
};

export function FlowPipeline() {
  const services = useDashboardStore((state) => state.services);

  return (
    <Panel
      title="Flujo operativo"
      subtitle="Pipeline visual del sistema: sensores simulados, broker, reglas, persistencia y notificación."
      className="overflow-hidden"
    >
      <div className="grid gap-4 xl:grid-cols-[repeat(8,minmax(0,1fr))]">
        {PIPELINE_ORDER.map((serviceId, index) => {
          const service = services[serviceId];

          return (
            <div key={serviceId} className="relative">
              {index < PIPELINE_ORDER.length - 1 ? (
                <div className="pointer-events-none absolute left-[calc(100%-10px)] top-[58px] hidden h-[2px] w-[calc(100%+20px)] bg-slate-200 xl:block">
                  <div
                    className={`h-full rounded-full ${
                      service.active ? 'animate-pulseLine bg-gradient-to-r from-teal-500 to-sky-400' : 'bg-slate-200'
                    }`}
                  />
                </div>
              ) : null}

              <article
                className={`h-full rounded-3xl border p-4 transition ${
                  service.active
                    ? 'border-teal-300 bg-teal-50/70 shadow-lg'
                    : 'border-slate-200 bg-slate-50/80'
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      {stageLabels[serviceId]}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-slate-900">{service.name}</h3>
                  </div>
                  <StatusPill status={service.status} health={service.health} active={service.active} />
                </div>
                <p className="min-h-[72px] text-sm leading-6 text-slate-600">{service.detail}</p>
                <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
                  Último cambio: {formatShortTime(service.lastChanged)}
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

