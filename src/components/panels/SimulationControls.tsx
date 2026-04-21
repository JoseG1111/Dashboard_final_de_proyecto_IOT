import { useShallow } from 'zustand/react/shallow';
import { demoScenarios } from '../../simulation/demoScenarios';
import { useDashboardStore } from '../../store/dashboardStore';
import { formatConfidence } from '../../utils/format';
import { Panel } from '../shared/Panel';

const accentStyles = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300',
  amber: 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300',
  sky: 'border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300',
  rose: 'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300',
};

export function SimulationControls() {
  const {
    confidenceInput,
    setConfidenceInput,
    triggerMotion,
    failEdge,
    restartBroker,
    crashBroker,
    triggerUnauthorizedAttempt,
    recoverSystem,
    runScenario,
    simulationBusy,
  } = useDashboardStore(
    useShallow((state) => ({
      confidenceInput: state.confidenceInput,
      setConfidenceInput: state.setConfidenceInput,
      triggerMotion: state.triggerMotion,
      failEdge: state.failEdge,
      restartBroker: state.restartBroker,
      crashBroker: state.crashBroker,
      triggerUnauthorizedAttempt: state.triggerUnauthorizedAttempt,
      recoverSystem: state.recoverSystem,
      runScenario: state.runScenario,
      simulationBusy: state.simulationBusy,
    })),
  );

  return (
    <Panel
      title="Panel de simulación"
      subtitle="Controla manualmente el flujo o ejecuta escenarios de demo listos para sustentación."
    >
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Evento manual</p>
              <p className="text-sm text-slate-500">Simula la detección PIR con confianza configurable.</p>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">
              {formatConfidence(confidenceInput)}
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={0.99}
            step={0.01}
            value={confidenceInput}
            onChange={(event) => setConfidenceInput(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-700"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={simulationBusy}
              onClick={() => triggerMotion()}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Disparar movimiento
            </button>
            <button
              type="button"
              disabled={simulationBusy}
              onClick={triggerUnauthorizedAttempt}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Intento no autorizado
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-sm font-medium text-slate-900">Fallos y recuperación</p>
          <p className="mb-4 text-sm text-slate-500">Expone disponibilidad y degradación del sistema.</p>
          <div className="grid gap-3">
            <button
              type="button"
              onClick={failEdge}
              className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm font-medium text-amber-700 transition hover:border-amber-300"
            >
              Simular pérdida de conectividad del edge
            </button>
            <button
              type="button"
              onClick={restartBroker}
              className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-left text-sm font-medium text-sky-700 transition hover:border-sky-300"
            >
              Simular reinicio del broker MQTT
            </button>
            <button
              type="button"
              onClick={crashBroker}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-sm font-medium text-rose-700 transition hover:border-rose-300"
            >
              Simular caída del broker MQTT
            </button>
            <button
              type="button"
              onClick={recoverSystem}
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm font-medium text-emerald-700 transition hover:border-emerald-300"
            >
              Reanudar operación / recuperación
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2 2xl:grid-cols-4">
        {demoScenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            disabled={simulationBusy}
            onClick={() => runScenario(scenario.id)}
            className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${accentStyles[scenario.accent]}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{scenario.name}</p>
                <p className="mt-2 text-sm leading-6 opacity-90">{scenario.description}</p>
              </div>
              <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-semibold">
                {formatConfidence(scenario.confidence)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}
