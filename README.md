# Dashboard Demo IoT - Seguridad Perimetral

Dashboard web para sustentacion universitaria de un proyecto de Arquitectura de Software + IoT. La aplicacion muestra, en modo simulacion, el flujo completo:

`PIR -> ESP32-CAM -> Edge -> MQTT -> Node-RED -> Dashboard/API -> DB -> Notificacion`

No requiere hardware real, broker MQTT real ni backend real para ejecutarse.

## Como correr

Requisitos recomendados:

- Node.js 22.12+ o 24.x
- npm 10+

Instalacion y arranque:

```bash
npm install
npm run dev
```

Build de verificacion:

```bash
npm run build
```

## Deploy en Render con Blueprint

El proyecto ya incluye un archivo [render.yaml](./render.yaml) listo para desplegarse como Static Site con Render Blueprint.

La configuracion ya deja resuelto:

- build reproducible con `npm ci && npm run build`
- publicacion del directorio `dist`
- rewrite `/* -> /index.html` para evitar errores al recargar rutas del frontend
- version de Node fijada para evitar cambios inesperados en Render

Pasos:

1. Sube este proyecto a un repositorio en GitHub.
2. En Render, entra a `New +` -> `Blueprint`.
3. Conecta tu cuenta de GitHub y selecciona el repositorio.
4. Render detectara automaticamente `render.yaml` en la raiz.
5. Revisa el servicio estatico y crea el Blueprint.

Notas:

- No hace falta crear manualmente un Static Site si usas el Blueprint.
- No fije el campo `branch` en `render.yaml`, asi que Render usara la rama por defecto de tu repo.
- Si cambias el nombre del servicio en Render, conviene reflejarlo tambien en `render.yaml` para mantener el Blueprint sincronizado.

## Modo simulacion

La app arranca en modo `simulation` por defecto y ya incluye:

- Disparo manual de movimiento
- Slider de `confidence`
- Simulacion de perdida de conectividad del edge
- Simulacion de reinicio/caida del broker MQTT
- Intento de publicacion no autorizada
- Recuperacion operativa
- 4 escenarios predefinidos de demo

Supuestos minimos usados:

- La "IA basica" se representa con una regla explicable por umbral de confianza
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
  domain/        Tipos, constantes y catalogos del sistema
  simulation/    Escenarios y helpers del motor de simulacion
  store/         Estado global y flujo temporal con Zustand
  utils/         Formateo y utilidades pequenas
```

## Extender a backend / MQTT real

La UI ya esta separada de la infraestructura mediante adaptadores:

- `src/adapters/ports.ts`
- `src/adapters/simulationAdapters.ts`

Ruta sugerida de evolucion:

1. Reemplazar `simulationEventTransport` por un adaptador MQTT real.
2. Reemplazar `simulationPersistence` por llamadas HTTP/REST o persistencia real.
3. Conectar `HealthAdapter` a endpoints reales de disponibilidad.
4. Mantener el store y la UI; solo cambiar las implementaciones de adaptadores.

## Escenarios incluidos

1. `Intrusion normal`
2. `Falso positivo`
3. `Caida y recuperacion`
4. `Intento no autorizado`

## Verificacion realizada

- `npm install`
- `npm run build`
