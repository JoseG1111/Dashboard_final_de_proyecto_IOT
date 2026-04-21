import type { ServiceId, ServiceNodeDescriptor } from './types';

export const PROJECT_TITLE = 'Seguridad Perimetral IoT';
export const PROJECT_SUBTITLE = 'Arquitectura de Software + IA básica + Demo operacional';

export const DEFAULT_ZONE = 'Zona Perimetral Norte';
export const PRIMARY_DEVICE_ID = 'edge-gateway-01';
export const ROGUE_DEVICE_ID = 'rogue-sender-77';
export const CONFIDENCE_THRESHOLD = 0.72;

export const PIPELINE_ORDER: ServiceId[] = [
  'pir',
  'camera',
  'edge',
  'mqtt',
  'nodeRed',
  'dashboard',
  'database',
  'notification',
];

export const SERVICE_CATALOG: ServiceNodeDescriptor[] = [
  {
    id: 'pir',
    name: 'Sensor PIR',
    description: 'Detección de movimiento en perímetro',
    group: 'physical',
    initialStatus: 'idle',
    initialHealth: 'healthy',
    initialDetail: 'Escaneando la zona y esperando eventos.',
  },
  {
    id: 'camera',
    name: 'ESP32-CAM',
    description: 'Captura de evidencia visual',
    group: 'physical',
    initialStatus: 'idle',
    initialHealth: 'healthy',
    initialDetail: 'Standby para capturar evidencia asociada.',
  },
  {
    id: 'edge',
    name: 'Nodo Edge',
    description: 'Ensamble y publicación del evento',
    group: 'physical',
    initialStatus: 'idle',
    initialHealth: 'healthy',
    initialDetail: 'Conectado al broker y listo para publicar.',
  },
  {
    id: 'mqtt',
    name: 'Broker MQTT',
    description: 'Canal Publish-Subscribe del sistema',
    group: 'logical',
    initialStatus: 'healthy',
    initialHealth: 'healthy',
    initialDetail: 'Broker operativo y esperando publicaciones.',
  },
  {
    id: 'nodeRed',
    name: 'Node-RED',
    description: 'Orquestación y validación por reglas',
    group: 'logical',
    initialStatus: 'waiting',
    initialHealth: 'healthy',
    initialDetail: 'Motor de reglas esperando nuevos mensajes.',
  },
  {
    id: 'dashboard',
    name: 'Dashboard / API',
    description: 'Visualización y trazabilidad del evento',
    group: 'logical',
    initialStatus: 'online',
    initialHealth: 'healthy',
    initialDetail: 'Panel sincronizado en modo simulación.',
  },
  {
    id: 'database',
    name: 'Base de Datos / Bitácora',
    description: 'Persistencia del evento y evidencia',
    group: 'logical',
    initialStatus: 'persisted',
    initialHealth: 'healthy',
    initialDetail: 'Bitácora consistente; sin operaciones pendientes.',
  },
  {
    id: 'notification',
    name: 'Canal de Notificación',
    description: 'Reflejo de salida operacional al operador',
    group: 'logical',
    initialStatus: 'pending',
    initialHealth: 'healthy',
    initialDetail: 'Canal disponible para nuevos envíos.',
  },
];

export const STATUS_LABELS: Record<string, string> = {
  idle: 'Idle',
  motion_detected: 'Movimiento detectado',
  capturing: 'Capturando',
  evidence_ready: 'Evidencia lista',
  publishing: 'Publicando',
  offline: 'Sin conexión',
  retrying: 'Reintentando',
  recovered: 'Recuperado',
  healthy: 'Saludable',
  receiving: 'Recibiendo mensaje',
  restarting: 'Reiniciando',
  down: 'Caído',
  waiting: 'Esperando',
  processing: 'Procesando',
  validated: 'Validado',
  discarded: 'Descartado',
  online: 'En línea',
  updating: 'Actualizando',
  stale: 'Desactualizado',
  error: 'Error',
  pending: 'Pendiente',
  persisted: 'Persistido',
  sent: 'Enviada',
  failed: 'Fallida',
  detected: 'Detectada',
  registered: 'Registrada',
  closed: 'Cerrada',
  rejected: 'Rechazada',
};

export const RESULT_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  accepted: 'Alerta válida',
  discarded_low_confidence: 'Descartado por confianza baja',
  rejected_unauthorized: 'Rechazado por publicación no autorizada',
  retry_pending: 'Pendiente por reconexión',
  error: 'Error operacional',
};
