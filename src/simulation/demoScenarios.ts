import type { DemoScenarioDefinition } from '../domain/types';

export const demoScenarios: DemoScenarioDefinition[] = [
  {
    id: 'normal_intrusion',
    name: 'Intrusión normal',
    description: 'Movimiento válido, confianza alta y flujo exitoso de punta a punta.',
    accent: 'emerald',
    confidence: 0.91,
    zone: 'Zona Perimetral Norte',
  },
  {
    id: 'low_confidence',
    name: 'Falso positivo',
    description: 'Movimiento detectado pero descartado por confianza baja en Node-RED.',
    accent: 'amber',
    confidence: 0.34,
    zone: 'Zona Perimetral Norte',
  },
  {
    id: 'connectivity_recovery',
    name: 'Caída y recuperación',
    description: 'El edge y el broker muestran degradación, luego reintentan y recuperan el flujo.',
    accent: 'sky',
    confidence: 0.88,
    zone: 'Zona Perimetral Norte',
  },
  {
    id: 'unauthorized_attempt',
    name: 'Intento no autorizado',
    description: 'Un dispositivo no permitido intenta publicar y el sistema deja trazabilidad del rechazo.',
    accent: 'rose',
    confidence: 0.93,
    zone: 'Zona Perimetral Norte',
    source: 'unauthorized-device',
  },
];

