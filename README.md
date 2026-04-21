# Dashboard Demo IoT - Seguridad Perimetral

Dashboard web para sustentación universitaria de un proyecto de Arquitectura de Software + IoT. La aplicación muestra, en modo simulación, el flujo completo:

`PIR -> ESP32-CAM -> Edge -> MQTT -> Node-RED -> Dashboard/API -> DB -> Notificación`

No requiere hardware real, broker MQTT real ni backend real para ejecutarse.

## Cómo correr

Requisitos recomendados:

- Node.js 20+ o 22+
- npm 10+

Instalación y arranque:

```bash
npm install
npm run dev
```

Build de verificación:

```bash
npm run build
```

## Modo simulación

La app arranca en modo `simulation` por defecto y ya incluye:

- Disparo manual de movimiento
- Slider de `confidence`
- Simulación de pérdida de conectividad del edge
- Simulación de reinicio/caída del broker MQTT
- Intento de publicación no autorizada
- Recuperación operativa
- 4 escenarios predefinidos de demo

Supuestos mínimos usados:

- La "IA básica" se representa con una regla explicable por umbral de confianza
- La evidencia se representa con un placeholder visual controlado por la UI
- Los campos internos de demo como `eventId`, `processingStatus`, `persisted`, `notificationStatus` y `alertStatus` no reemplazan el payload base del proyecto

Payload base preservado:

- `deviceId`
- `zone`
- `motion`
- `confidence`
- `timestamp`

## Estructura

```text
src/
  adapters/      Interfaces para futuros adaptadores reales
  components/    UI modular del dashboard
  domain/        Tipos, constantes y catálogos del sistema
  simulation/    Escenarios y helpers del motor de simulación
  store/         Estado global y flujo temporal con Zustand
  utils/         Formateo y utilidades pequeñas
```

## Extender a backend / MQTT real

La UI ya está separada de la infraestructura mediante adaptadores:

- `src/adapters/ports.ts`
  - `EventTransportAdapter`
  - `PersistenceAdapter`
  - `HealthAdapter`
- `src/adapters/simulationAdapters.ts`
  - Implementaciones base para modo simulación

Ruta sugerida de evolución:

1. Reemplazar `simulationEventTransport` por un adaptador MQTT real.
2. Reemplazar `simulationPersistence` por llamadas HTTP/REST o persistencia real.
3. Conectar `HealthAdapter` a endpoints reales de disponibilidad.
4. Mantener el store y la UI; solo cambiar las implementaciones de adaptadores.

## Escenarios incluidos

1. `Intrusión normal`
2. `Falso positivo`
3. `Caída y recuperación`
4. `Intento no autorizado`

## Verificación realizada

- `npm install`
- `npm run build`
