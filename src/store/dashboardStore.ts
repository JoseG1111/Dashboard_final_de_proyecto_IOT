import { create } from 'zustand';
import { CONFIDENCE_THRESHOLD, DEFAULT_ZONE, PROJECT_SUBTITLE, PROJECT_TITLE, RESULT_LABELS, STATUS_LABELS } from '../domain/constants';
import type { CreateEventInput, DemoEvent, DemoMetrics, FailureModeState, ScenarioId, ServiceId, ServiceState, SystemStatus, TimelineRecord } from '../domain/types';
import { demoScenarios } from '../simulation/demoScenarios';
import { buildInitialServices, cloneEvent, countHealthyServices, createDemoEvent, deriveSystemStatus, finalizeTimelineRecord, isAuthorizedDevice, isValidConfidence, updateMetrics, updateServiceSnapshot } from '../simulation/simulationEngine';

interface DashboardStoreState {
  mode: 'simulation';
  projectTitle: string;
  projectSubtitle: string;
  currentZone: string;
  confidenceInput: number;
  threshold: number;
  services: Record<ServiceId, ServiceState>;
  systemStatus: SystemStatus;
  failureModes: FailureModeState;
  currentEvent: DemoEvent | null;
  timeline: TimelineRecord[];
  metrics: DemoMetrics;
  simulationBusy: boolean;
  scenarioRunning: ScenarioId | null;
  scheduledTaskIds: number[];
  setConfidenceInput: (value: number) => void;
  triggerMotion: (input?: Partial<CreateEventInput>) => void;
  triggerUnauthorizedAttempt: () => void;
  failEdge: () => void;
  restartBroker: () => void;
  crashBroker: () => void;
  recoverSystem: () => void;
  runScenario: (id: ScenarioId) => void;
  closeCurrentAlert: () => void;
  resetDemo: () => void;
}

const initialMetrics = (): DemoMetrics => ({
  eventsDetected: 0,
  validAlerts: 0,
  discardedEvents: 0,
  notificationsSent: 0,
  averageResponseMs: 0,
});

const initialFailures = (): FailureModeState => ({
  edgeOffline: false,
  mqttRestarting: false,
  mqttDown: false,
});

export const useDashboardStore = create<DashboardStoreState>((set, get) => {
  const clearScheduledTasks = () => {
    const pending = get().scheduledTaskIds;
    pending.forEach((taskId) => window.clearTimeout(taskId));
    set({ scheduledTaskIds: [] });
  };

  const schedule = (delay: number, callback: () => void): number => {
    const taskId = window.setTimeout(() => {
      callback();
      set((state) => ({
        scheduledTaskIds: state.scheduledTaskIds.filter((currentId) => currentId !== taskId),
      }));
    }, delay);

    set((state) => ({ scheduledTaskIds: [...state.scheduledTaskIds, taskId] }));
    return taskId;
  };

  const applyServiceUpdates = (
    updates: Array<[
      ServiceId,
      Partial<Omit<ServiceState, 'id' | 'name' | 'description' | 'group'>> & { lastChanged?: string },
    ]>,
    options: { deactivateOthers?: boolean } = {},
  ) => {
    set((state) => {
      const services = { ...state.services };

      if (options.deactivateOthers) {
        Object.keys(services).forEach((serviceId) => {
          const key = serviceId as ServiceId;
          services[key] = { ...services[key], active: false };
        });
      }

      updates.forEach(([serviceId, patch]) => {
        services[serviceId] = updateServiceSnapshot(services[serviceId], patch);
      });

      return {
        services,
        systemStatus: deriveSystemStatus(services),
      };
    });
  };

  const patchCurrentEvent = (patch: Partial<DemoEvent>) => {
    set((state) => {
      if (!state.currentEvent) {
        return state;
      }

      return {
        currentEvent: {
          ...state.currentEvent,
          ...patch,
        },
      };
    });
  };

  const appendNote = (note: string) => {
    set((state) => {
      if (!state.currentEvent) {
        return state;
      }

      return {
        currentEvent: {
          ...state.currentEvent,
          notes: [...state.currentEvent.notes, note],
        },
      };
    });
  };

  const setSteadyServiceView = (
    notificationDetail = 'Canal disponible para nuevos envíos.',
    notificationStatus: 'pending' | 'sent' = 'pending',
  ) => {
    const { failureModes } = get();

    applyServiceUpdates(
      [
        ['pir', { status: 'idle', health: 'healthy', detail: 'Escaneando la zona y esperando eventos.', active: false }],
        ['camera', { status: 'idle', health: 'healthy', detail: 'Standby para capturar evidencia asociada.', active: false }],
        [
          'edge',
          failureModes.edgeOffline
            ? { status: 'offline', health: 'down', detail: 'Nodo edge sin conectividad con el broker.', active: false }
            : { status: 'idle', health: 'healthy', detail: 'Conectado al broker y listo para publicar.', active: false },
        ],
        [
          'mqtt',
          failureModes.mqttDown
            ? { status: 'down', health: 'down', detail: 'Broker detenido; no hay recepción de mensajes.', active: false }
            : failureModes.mqttRestarting
              ? { status: 'restarting', health: 'degraded', detail: 'Broker reiniciándose y reteniendo publicaciones.', active: false }
              : { status: 'healthy', health: 'healthy', detail: 'Broker operativo y esperando publicaciones.', active: false },
        ],
        ['nodeRed', { status: 'waiting', health: 'healthy', detail: 'Motor de reglas esperando nuevos mensajes.', active: false }],
        ['dashboard', { status: 'online', health: 'healthy', detail: 'Panel sincronizado en modo simulación.', active: false }],
        ['database', { status: 'persisted', health: 'healthy', detail: 'Bitácora consistente; sin operaciones pendientes.', active: false }],
        ['notification', { status: notificationStatus, health: 'healthy', detail: notificationDetail, active: false }],
      ],
      { deactivateOthers: true },
    );
  };

  const finalizeEvent = (patch: Partial<DemoEvent>) => {
    const state = get();
    if (!state.currentEvent) {
      return;
    }

    const finalized: DemoEvent = cloneEvent({
      ...state.currentEvent,
      ...patch,
      responseTimeMs: Date.now() - state.currentEvent.startedAtMs,
    });

    set((current) => ({
      currentEvent: finalized,
      timeline: [finalizeTimelineRecord(finalized), ...current.timeline].slice(0, 14),
      metrics: updateMetrics(current.metrics, finalized),
      simulationBusy: false,
      scenarioRunning: null,
    }));
  };

  const finalizeRejectedAttempt = () => {
    patchCurrentEvent({
      processingStatus: 'completed',
      validationResult: 'rejected_unauthorized',
      persisted: 'persisted',
      notificationStatus: 'not_applicable',
      alertStatus: 'discarded',
      finalState: 'rejected',
    });
    appendNote('Intento no autorizado persistido en bitácora para auditoría.');
    finalizeEvent({
      processingStatus: 'completed',
      validationResult: 'rejected_unauthorized',
      persisted: 'persisted',
      notificationStatus: 'not_applicable',
      alertStatus: 'discarded',
      finalState: 'rejected',
    });
    setSteadyServiceView('Canal disponible; no se emitió notificación por rechazo.', 'pending');
  };

  const finalizeDiscardedEvent = () => {
    patchCurrentEvent({
      processingStatus: 'completed',
      validationResult: 'discarded_low_confidence',
      persisted: 'persisted',
      notificationStatus: 'not_applicable',
      alertStatus: 'discarded',
      finalState: 'discarded',
    });
    appendNote('Evento archivado sin escalamiento por confianza inferior al umbral.');
    finalizeEvent({
      processingStatus: 'completed',
      validationResult: 'discarded_low_confidence',
      persisted: 'persisted',
      notificationStatus: 'not_applicable',
      alertStatus: 'discarded',
      finalState: 'discarded',
    });
    setSteadyServiceView('Canal disponible; no hubo envío por descarte.', 'pending');
  };

  const finalizeValidatedEvent = () => {
    patchCurrentEvent({
      processingStatus: 'completed',
      validationResult: 'accepted',
      persisted: 'persisted',
      notificationStatus: 'sent',
      alertStatus: 'registered',
      finalState: 'validated',
    });
    appendNote('Alerta registrada y notificación emitida al operador.');
    finalizeEvent({
      processingStatus: 'completed',
      validationResult: 'accepted',
      persisted: 'persisted',
      notificationStatus: 'sent',
      alertStatus: 'registered',
      finalState: 'validated',
    });
    setSteadyServiceView('Canal operativo; última alerta enviada correctamente.', 'sent');
  };

  const continueRuleEngineFlow = () => {
    applyServiceUpdates(
      [
        ['mqtt', { status: 'receiving', health: 'healthy', detail: 'Evento entrante distribuido a Node-RED.', active: true }],
        ['edge', { status: 'publishing', health: 'healthy', detail: 'Publicando payload del evento al broker.', active: true }],
      ],
      { deactivateOthers: true },
    );

    schedule(380, () => {
      patchCurrentEvent({ processingStatus: 'processing' });
      appendNote('Broker MQTT aceptó el evento y lo entregó a Node-RED.');
      applyServiceUpdates(
        [
          ['mqtt', { status: 'healthy', health: 'healthy', detail: 'Broker entregó el mensaje al motor de reglas.', active: false }],
          ['nodeRed', { status: 'processing', health: 'healthy', detail: 'Validando movimiento y confianza del evento.', active: true }],
          ['dashboard', { status: 'updating', health: 'healthy', detail: 'Recibiendo estados del flujo en tiempo real.', active: true }],
        ],
        { deactivateOthers: true },
      );
    });

    schedule(880, () => {
      const current = get().currentEvent;
      if (!current || !isAuthorizedDevice(current.deviceId)) {
        return;
      }

      if (!isValidConfidence(current.confidence)) {
        patchCurrentEvent({
          validationResult: 'discarded_low_confidence',
          processingStatus: 'discarded',
          alertStatus: 'discarded',
          notificationStatus: 'not_applicable',
        });
        appendNote('Node-RED descartó el evento por confianza por debajo del umbral.');
        applyServiceUpdates(
          [
            ['nodeRed', { status: 'discarded', health: 'warning', detail: 'Regla de confianza descartó el evento como no concluyente.', active: true }],
            ['dashboard', { status: 'updating', health: 'healthy', detail: 'Actualizando el resultado descartado.', active: true }],
          ],
          { deactivateOthers: true },
        );

        schedule(360, () => {
          patchCurrentEvent({ processingStatus: 'persisting', persisted: 'pending' });
          applyServiceUpdates([['database', { status: 'pending', health: 'warning', detail: 'Registrando descarte y evidencia simulada.', active: true }]], { deactivateOthers: false });
        });

        schedule(760, () => {
          applyServiceUpdates(
            [
              ['database', { status: 'persisted', health: 'healthy', detail: 'Evento descartado archivado en la bitácora.', active: false }],
              ['notification', { status: 'pending', health: 'healthy', detail: 'No se escala notificación por descarte.', active: false }],
            ],
            { deactivateOthers: false },
          );
        });

        schedule(1220, finalizeDiscardedEvent);
        return;
      }

      patchCurrentEvent({
        validationResult: 'accepted',
        processingStatus: 'validated',
        alertStatus: 'validated',
      });
      appendNote('Node-RED validó el evento como alerta explicable por umbral.');
      applyServiceUpdates(
        [
          ['nodeRed', { status: 'validated', health: 'healthy', detail: 'Regla explicable validó la intrusión por confianza alta.', active: true }],
          ['dashboard', { status: 'updating', health: 'healthy', detail: 'Mostrando alerta validada al operador.', active: true }],
        ],
        { deactivateOthers: true },
      );

      schedule(360, () => {
        patchCurrentEvent({ processingStatus: 'persisting', persisted: 'pending' });
        applyServiceUpdates([['database', { status: 'pending', health: 'warning', detail: 'Persistiendo alerta, payload y evidencia simulada.', active: true }]], { deactivateOthers: false });
      });

      schedule(760, () => {
        patchCurrentEvent({ processingStatus: 'notifying', notificationStatus: 'pending' });
        applyServiceUpdates(
          [
            ['database', { status: 'persisted', health: 'healthy', detail: 'Bitácora actualizada con evento validado.', active: false }],
            ['notification', { status: 'pending', health: 'warning', detail: 'Preparando notificación al operador.', active: true }],
          ],
          { deactivateOthers: false },
        );
      });

      schedule(1100, () => {
        patchCurrentEvent({ processingStatus: 'registered', notificationStatus: 'sent', alertStatus: 'registered' });
        applyServiceUpdates([['notification', { status: 'sent', health: 'healthy', detail: 'Notificación enviada y visible en la demo.', active: true }]], { deactivateOthers: false });
      });

      schedule(1500, finalizeValidatedEvent);
    });
  };

  const queueEventForRecovery = () => {
    const failures = get().failureModes;
    patchCurrentEvent({
      processingStatus: 'retrying',
      validationResult: 'retry_pending',
      notificationStatus: 'not_applicable',
    });
    appendNote('Publicación retenida hasta recuperar conectividad del edge y/o broker.');
    applyServiceUpdates(
      [
        [
          'edge',
          failures.edgeOffline
            ? { status: 'retrying', health: 'warning', detail: 'Sin enlace estable; el evento queda en espera de reconexión.', active: true }
            : { status: 'publishing', health: 'healthy', detail: 'Evento listo para reenviar al broker en recuperación.', active: true },
        ],
        [
          'mqtt',
          failures.mqttDown
            ? { status: 'down', health: 'down', detail: 'Broker caído; no puede recibir la publicación.', active: true }
            : { status: 'restarting', health: 'degraded', detail: 'Broker reiniciándose; mensaje a la espera.', active: true },
        ],
        ['dashboard', { status: 'stale', health: 'warning', detail: 'El flujo quedó degradado esperando recuperación.', active: false }],
      ],
      { deactivateOthers: true },
    );
  };

  const beginPipeline = (input?: Partial<CreateEventInput>) => {
    if (get().simulationBusy) {
      return;
    }

    const event = createDemoEvent({
      confidence: input?.confidence ?? get().confidenceInput,
      zone: input?.zone ?? get().currentZone,
      motion: input?.motion ?? true,
      deviceId: input?.deviceId,
      source: input?.source,
      scenarioId: input?.scenarioId,
    });

    set((state) => ({
      currentEvent: event,
      metrics: {
        ...state.metrics,
        eventsDetected: state.metrics.eventsDetected + 1,
      },
      simulationBusy: true,
      scenarioRunning: input?.scenarioId ?? state.scenarioRunning,
    }));

    applyServiceUpdates(
      [
        ['pir', { status: 'motion_detected', health: 'healthy', detail: 'Movimiento detectado en la zona monitorizada.', active: true }],
        ['camera', { status: 'capturing', health: 'healthy', detail: 'Capturando evidencia asociada al movimiento.', active: true }],
        [
          'edge',
          {
            status: 'motion_detected',
            health: get().failureModes.edgeOffline ? 'down' : 'healthy',
            detail: get().failureModes.edgeOffline ? 'Detectó movimiento pero no tiene salida de conectividad.' : 'Construyendo el payload del evento para publicar.',
            active: true,
          },
        ],
      ],
      { deactivateOthers: true },
    );

    schedule(360, () => {
      patchCurrentEvent({ evidenceStatus: 'attached', processingStatus: 'publishing' });
      appendNote('ESP32-CAM asoció la evidencia al evento.');
      applyServiceUpdates(
        [
          ['camera', { status: 'evidence_ready', health: 'healthy', detail: 'Evidencia lista para ser trazada en el dashboard.', active: true }],
          [
            'edge',
            {
              status: get().failureModes.edgeOffline ? 'offline' : 'publishing',
              health: get().failureModes.edgeOffline ? 'down' : 'healthy',
              detail: get().failureModes.edgeOffline ? 'No puede alcanzar el broker para publicar.' : 'Payload listo y publicándose hacia MQTT.',
              active: true,
            },
          ],
        ],
        { deactivateOthers: true },
      );
    });

    schedule(860, () => {
      const current = get().currentEvent;
      if (!current) {
        return;
      }

      if (!isAuthorizedDevice(current.deviceId)) {
        patchCurrentEvent({
          validationResult: 'rejected_unauthorized',
          processingStatus: 'rejected',
          notificationStatus: 'not_applicable',
          alertStatus: 'discarded',
        });
        appendNote('Broker MQTT identificó un publicador no autorizado.');
        applyServiceUpdates(
          [
            ['mqtt', { status: 'receiving', health: 'warning', detail: 'Recibiendo un intento de publicación no autorizado.', active: true }],
            ['dashboard', { status: 'updating', health: 'healthy', detail: 'Mostrando evento rechazado por política de seguridad.', active: true }],
          ],
          { deactivateOthers: true },
        );

        schedule(420, () => {
          applyServiceUpdates(
            [
              ['mqtt', { status: 'healthy', health: 'healthy', detail: 'ACL aplicada: publicación rechazada y auditada.', active: false }],
              ['nodeRed', { status: 'waiting', health: 'healthy', detail: 'Sin procesamiento; el evento fue bloqueado antes de llegar.', active: false }],
              ['database', { status: 'pending', health: 'warning', detail: 'Registrando intento no autorizado en bitácora.', active: true }],
            ],
            { deactivateOthers: false },
          );
        });

        schedule(940, finalizeRejectedAttempt);
        return;
      }

      const { failureModes } = get();
      if (failureModes.edgeOffline || failureModes.mqttDown || failureModes.mqttRestarting) {
        queueEventForRecovery();
        return;
      }

      continueRuleEngineFlow();
    });
  };

  const resumeQueuedEvent = () => {
    const current = get().currentEvent;
    if (!current || current.validationResult !== 'retry_pending') {
      return;
    }

    patchCurrentEvent({
      processingStatus: 'publishing',
      validationResult: 'pending',
      notificationStatus: 'pending',
    });
    appendNote('Se reanudó la publicación del evento tras la recuperación.');
    applyServiceUpdates(
      [
        ['edge', { status: 'publishing', health: 'healthy', detail: 'Reintentando publicación después de la recuperación.', active: true }],
        ['mqtt', { status: 'receiving', health: 'healthy', detail: 'Broker restaurado y recibiendo el mensaje reenviado.', active: true }],
      ],
      { deactivateOthers: true },
    );

    schedule(340, continueRuleEngineFlow);
  };

  return {
    mode: 'simulation',
    projectTitle: PROJECT_TITLE,
    projectSubtitle: PROJECT_SUBTITLE,
    currentZone: DEFAULT_ZONE,
    confidenceInput: 0.86,
    threshold: CONFIDENCE_THRESHOLD,
    services: buildInitialServices(),
    systemStatus: 'operational',
    failureModes: initialFailures(),
    currentEvent: null,
    timeline: [],
    metrics: initialMetrics(),
    simulationBusy: false,
    scenarioRunning: null,
    scheduledTaskIds: [],
    setConfidenceInput: (value) => set({ confidenceInput: value }),
    triggerMotion: (input) => beginPipeline(input),
    triggerUnauthorizedAttempt: () => beginPipeline({ confidence: 0.92, source: 'unauthorized-device', scenarioId: 'unauthorized_attempt' }),
    failEdge: () => {
      set((state) => ({
        failureModes: {
          ...state.failureModes,
          edgeOffline: true,
        },
      }));
      applyServiceUpdates([
        ['edge', { status: 'offline', health: 'down', detail: 'Conectividad del edge degradada manualmente.', active: false }],
        ['dashboard', { status: 'stale', health: 'warning', detail: 'El dashboard detecta degradación de conectividad.', active: false }],
      ]);
    },
    restartBroker: () => {
      set((state) => ({
        failureModes: {
          ...state.failureModes,
          mqttRestarting: true,
          mqttDown: false,
        },
      }));
      applyServiceUpdates([
        ['mqtt', { status: 'restarting', health: 'degraded', detail: 'Broker en reinicio manual; las publicaciones se retienen.', active: false }],
        ['dashboard', { status: 'stale', health: 'warning', detail: 'Sincronización parcial por reinicio del broker.', active: false }],
      ]);
    },
    crashBroker: () => {
      set((state) => ({
        failureModes: {
          ...state.failureModes,
          mqttRestarting: false,
          mqttDown: true,
        },
      }));
      applyServiceUpdates([
        ['mqtt', { status: 'down', health: 'down', detail: 'Broker detenido manualmente.', active: false }],
        ['dashboard', { status: 'stale', health: 'warning', detail: 'Dashboard sin eventos nuevos por caída del broker.', active: false }],
      ]);
    },
    recoverSystem: () => {
      set({ failureModes: initialFailures() });
      applyServiceUpdates([
        ['edge', { status: 'recovered', health: 'healthy', detail: 'Nodo edge restablecido y sincronizado.', active: true }],
        ['mqtt', { status: 'healthy', health: 'healthy', detail: 'Broker operativo tras recuperación.', active: true }],
        ['dashboard', { status: 'online', health: 'healthy', detail: 'Estado general del sistema sincronizado.', active: false }],
      ]);
      schedule(520, () => {
        if (get().currentEvent?.validationResult === 'retry_pending') {
          resumeQueuedEvent();
          return;
        }

        setSteadyServiceView();
      });
    },
    runScenario: (id) => {
      if (get().simulationBusy) {
        return;
      }

      const scenario = demoScenarios.find((item) => item.id === id);
      if (!scenario) {
        return;
      }

      set({
        scenarioRunning: id,
        confidenceInput: scenario.confidence,
      });

      if (id === 'connectivity_recovery') {
        get().failEdge();
        get().restartBroker();
        schedule(220, () => beginPipeline({ confidence: scenario.confidence, zone: scenario.zone, scenarioId: id }));
        schedule(2300, () => {
          get().recoverSystem();
        });
        return;
      }

      if (id === 'unauthorized_attempt') {
        beginPipeline({ confidence: scenario.confidence, zone: scenario.zone, source: 'unauthorized-device', scenarioId: id });
        return;
      }

      beginPipeline({ confidence: scenario.confidence, zone: scenario.zone, scenarioId: id });
    },
    closeCurrentAlert: () => {
      set((state) => {
        if (!state.currentEvent || !['registered', 'validated'].includes(state.currentEvent.alertStatus)) {
          return state;
        }

        const updatedEvent = {
          ...state.currentEvent,
          alertStatus: 'closed' as const,
          finalState: 'closed' as const,
          notes: [...state.currentEvent.notes, 'Operador marcó la alerta como atendida/cerrada.'],
        };

        return {
          currentEvent: updatedEvent,
          timeline: state.timeline.map((record) =>
            record.eventId === updatedEvent.eventId
              ? {
                  ...record,
                  finalState: STATUS_LABELS.closed,
                  result: RESULT_LABELS.accepted,
                }
              : record,
          ),
        };
      });

      applyServiceUpdates([['dashboard', { status: 'online', health: 'healthy', detail: 'Operador cerró la alerta y dejó trazabilidad.', active: false }]]);
    },
    resetDemo: () => {
      clearScheduledTasks();
      const services = buildInitialServices();
      set({
        currentZone: DEFAULT_ZONE,
        confidenceInput: 0.86,
        services,
        systemStatus: deriveSystemStatus(services),
        failureModes: initialFailures(),
        currentEvent: null,
        timeline: [],
        metrics: initialMetrics(),
        simulationBusy: false,
        scenarioRunning: null,
        scheduledTaskIds: [],
      });
    },
  };
});

export const selectHealthyServices = (): number => countHealthyServices(useDashboardStore.getState().services);
