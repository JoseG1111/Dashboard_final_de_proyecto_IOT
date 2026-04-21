import type { DemoEvent, FailureModeState, ServiceState } from '../domain/types';

export interface EventTransportAdapter {
  publish(event: DemoEvent): Promise<{ accepted: boolean; reason?: string }>;
}

export interface PersistenceAdapter {
  persist(event: DemoEvent): Promise<{ success: boolean }>;
}

export interface HealthAdapter {
  getHealth(): Promise<FailureModeState>;
  getServices(): Promise<ServiceState[]>;
}

