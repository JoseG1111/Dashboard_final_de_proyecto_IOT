import type { DemoEvent, FailureModeState, ServiceState } from '../domain/types';
import type { EventTransportAdapter, HealthAdapter, PersistenceAdapter } from './ports';

export const simulationEventTransport: EventTransportAdapter = {
  async publish() {
    return { accepted: true };
  },
};

export const simulationPersistence: PersistenceAdapter = {
  async persist() {
    return { success: true };
  },
};

export const createSimulationHealthAdapter = (
  readFailures: () => FailureModeState,
  readServices: () => ServiceState[],
): HealthAdapter => ({
  async getHealth() {
    return readFailures();
  },
  async getServices() {
    return readServices();
  },
});

export const publishSimulationEvent = async (
  adapter: EventTransportAdapter,
  event: DemoEvent,
): Promise<{ accepted: boolean; reason?: string }> => adapter.publish(event);

