import {
  CONFIDENCE_THRESHOLD,
  DEFAULT_ZONE,
  PRIMARY_DEVICE_ID,
  RESULT_LABELS,
  ROGUE_DEVICE_ID,
  SERVICE_CATALOG,
  STATUS_LABELS,
} from '../domain/constants';
import type {
  CreateEventInput,
  DemoEvent,
  DemoMetrics,
  EventSource,
  ServiceId,
  ServiceState,
  TimelineRecord,
  SystemStatus,
} from '../domain/types';

let sequence = 0;

const nextEventId = (): string => {
  sequence += 1;
  return `EVT-${String(sequence).padStart(3, '0')}`;
};

export const nowIso = (): string => new Date().toISOString();

export const buildInitialServices = (): Record<ServiceId, ServiceState> => {
  const timestamp = nowIso();

  return SERVICE_CATALOG.reduce(
    (accumulator, descriptor) => {
      accumulator[descriptor.id] = {
        id: descriptor.id,
        name: descriptor.name,
        description: descriptor.description,
        group: descriptor.group,
        status: descriptor.initialStatus,
        health: descriptor.initialHealth,
        detail: descriptor.initialDetail,
        active: false,
        lastChanged: timestamp,
      };

      return accumulator;
    },
    {} as Record<ServiceId, ServiceState>,
  );
};

export const updateServiceSnapshot = (
  current: ServiceState,
  patch: Partial<Omit<ServiceState, 'id' | 'name' | 'description' | 'group'>> & { lastChanged?: string },
): ServiceState => ({
  ...current,
  ...patch,
  lastChanged: patch.lastChanged ?? nowIso(),
});

export const createDemoEvent = ({
  confidence,
  zone = DEFAULT_ZONE,
  motion = true,
  deviceId,
  source = 'authorized-edge',
  scenarioId,
}: CreateEventInput): DemoEvent => {
  const timestamp = nowIso();
  const currentSource: EventSource = source;

  return {
    eventId: nextEventId(),
    deviceId:
      deviceId ?? (currentSource === 'authorized-edge' ? PRIMARY_DEVICE_ID : ROGUE_DEVICE_ID),
    zone,
    motion,
    confidence,
    timestamp,
    source: currentSource,
    scenarioId,
    evidenceStatus: 'capturing',
    evidenceLabel: buildEvidenceLabel(zone, confidence),
    processingStatus: 'capturing',
    persisted: 'pending',
    notificationStatus: 'pending',
    validationResult: 'pending',
    alertStatus: 'detected',
    finalState: 'in_progress',
    notes: ['Evento creado en modo simulación.'],
    startedAtMs: Date.now(),
  };
};

export const buildEvidenceLabel = (zone: string, confidence: number): string =>
  `Captura simulada ${zone} · Confianza ${Math.round(confidence * 100)}%`;

export const isAuthorizedDevice = (deviceId: string): boolean => deviceId === PRIMARY_DEVICE_ID;

export const isValidConfidence = (confidence: number): boolean => confidence >= CONFIDENCE_THRESHOLD;

export const deriveSystemStatus = (services: Record<ServiceId, ServiceState>): SystemStatus => {
  const values = Object.values(services);

  if (values.some((service) => service.health === 'down')) {
    return 'critical';
  }

  if (values.some((service) => service.health === 'warning' || service.health === 'degraded')) {
    return 'degraded';
  }

  return 'operational';
};

export const countHealthyServices = (services: Record<ServiceId, ServiceState>): number =>
  Object.values(services).filter((service) => service.health === 'healthy').length;

export const finalizeTimelineRecord = (event: DemoEvent): TimelineRecord => ({
  eventId: event.eventId,
  time: event.timestamp,
  zone: event.zone,
  event: event.motion ? 'Movimiento detectado' : 'Sin movimiento',
  result: RESULT_LABELS[event.validationResult] ?? event.validationResult,
  persistence:
    event.persisted === 'persisted'
      ? 'Persistido'
      : event.persisted === 'error'
        ? 'Error'
        : 'Pendiente',
  notification:
    event.notificationStatus === 'sent'
      ? 'Enviada'
      : event.notificationStatus === 'failed'
        ? 'Fallida'
        : event.notificationStatus === 'not_applicable'
          ? 'No aplica'
          : 'Pendiente',
  finalState:
    event.validationResult === 'rejected_unauthorized'
      ? STATUS_LABELS.rejected
      : STATUS_LABELS[event.alertStatus] ?? event.alertStatus,
  deviceId: event.deviceId,
  confidence: event.confidence,
  responseTimeMs: event.responseTimeMs ?? null,
});

export const updateMetrics = (current: DemoMetrics, event: DemoEvent): DemoMetrics => {
  const totalResponses =
    current.averageResponseMs * Math.max(current.eventsDetected - 1, 0) + (event.responseTimeMs ?? 0);

  return {
    eventsDetected: current.eventsDetected,
    validAlerts: current.validAlerts + (event.validationResult === 'accepted' ? 1 : 0),
    discardedEvents:
      current.discardedEvents +
      (event.validationResult === 'discarded_low_confidence' ||
      event.validationResult === 'rejected_unauthorized'
        ? 1
        : 0),
    notificationsSent: current.notificationsSent + (event.notificationStatus === 'sent' ? 1 : 0),
    averageResponseMs:
      current.eventsDetected > 0 ? totalResponses / current.eventsDetected : current.averageResponseMs,
  };
};

export const cloneEvent = (event: DemoEvent): DemoEvent => ({
  ...event,
  notes: [...event.notes],
});
