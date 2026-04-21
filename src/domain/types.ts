export type SimulationMode = 'simulation';
export type SystemStatus = 'operational' | 'degraded' | 'critical';

export type ServiceId =
  | 'pir'
  | 'camera'
  | 'edge'
  | 'mqtt'
  | 'nodeRed'
  | 'dashboard'
  | 'database'
  | 'notification';

export type ServiceGroup = 'physical' | 'logical';
export type ServiceHealth = 'healthy' | 'warning' | 'degraded' | 'down';

export type EventSource = 'authorized-edge' | 'unauthorized-device';
export type ScenarioId =
  | 'normal_intrusion'
  | 'low_confidence'
  | 'connectivity_recovery'
  | 'unauthorized_attempt';

export type EvidenceStatus = 'idle' | 'capturing' | 'attached' | 'unavailable';
export type ProcessingStatus =
  | 'idle'
  | 'capturing'
  | 'publishing'
  | 'processing'
  | 'validated'
  | 'discarded'
  | 'rejected'
  | 'retrying'
  | 'persisting'
  | 'notifying'
  | 'registered'
  | 'completed'
  | 'error';

export type ValidationResult =
  | 'pending'
  | 'accepted'
  | 'discarded_low_confidence'
  | 'rejected_unauthorized'
  | 'retry_pending'
  | 'error';

export type AlertStatus = 'detected' | 'validated' | 'discarded' | 'registered' | 'closed';
export type EventFinalState = 'in_progress' | 'validated' | 'discarded' | 'rejected' | 'closed';

export interface ProjectEventPayload {
  deviceId: string;
  zone: string;
  motion: boolean;
  confidence: number;
  timestamp: string;
}

export interface DemoEvent extends ProjectEventPayload {
  eventId: string;
  source: EventSource;
  scenarioId?: ScenarioId;
  evidenceStatus: EvidenceStatus;
  evidenceLabel: string;
  processingStatus: ProcessingStatus;
  persisted: 'pending' | 'persisted' | 'error' | 'not_applicable';
  notificationStatus: 'pending' | 'sent' | 'failed' | 'not_applicable';
  validationResult: ValidationResult;
  alertStatus: AlertStatus;
  finalState: EventFinalState;
  notes: string[];
  startedAtMs: number;
  responseTimeMs?: number;
}

export interface TimelineRecord {
  eventId: string;
  time: string;
  zone: string;
  event: string;
  result: string;
  persistence: string;
  notification: string;
  finalState: string;
  deviceId: string;
  confidence: number;
  responseTimeMs: number | null;
}

export interface ServiceNodeDescriptor {
  id: ServiceId;
  name: string;
  description: string;
  group: ServiceGroup;
  initialStatus: string;
  initialHealth: ServiceHealth;
  initialDetail: string;
}

export interface ServiceState {
  id: ServiceId;
  name: string;
  description: string;
  group: ServiceGroup;
  status: string;
  health: ServiceHealth;
  lastChanged: string;
  detail: string;
  active: boolean;
}

export interface CreateEventInput {
  confidence: number;
  zone?: string;
  motion?: boolean;
  deviceId?: string;
  source?: EventSource;
  scenarioId?: ScenarioId;
}

export interface FailureModeState {
  edgeOffline: boolean;
  mqttRestarting: boolean;
  mqttDown: boolean;
}

export interface DemoScenarioDefinition {
  id: ScenarioId;
  name: string;
  description: string;
  accent: 'emerald' | 'amber' | 'rose' | 'sky';
  confidence: number;
  zone: string;
  source?: EventSource;
}

export interface DemoMetrics {
  eventsDetected: number;
  validAlerts: number;
  discardedEvents: number;
  notificationsSent: number;
  averageResponseMs: number;
}

