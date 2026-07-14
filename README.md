# Mockup Reembolso GMM

SPA en React + Vite + TailwindCSS que simula el flujo de **Reembolso** del Portal Público de Siniestros GMM de Allianz México como un wizard paso a paso.

## Stack

- React 18
- Vite 6
- TailwindCSS 3
- Sin backend, sin SSR, sin rutas server-side

## Flujo implementado

1. Modal inicial de selección de trámite
2. Primer popup informativo de reembolso con recomendaciones y teléfono de contacto
3. Segundo popup documental con encabezado institucional y materiales de referencia
4. Paso de documentos con tarjetas, drag and drop y carga simulada
5. Validación inteligente con pantalla de procesamiento y resultados
6. Información editable de póliza, persona y contacto
7. Reclamación editable con validaciones
8. Revisión final con resumen, alertas aceptadas y confirmación

## Instalación local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Vista previa local

```bash
npm run preview
```

## AWS Amplify Hosting

El repositorio incluye [`amplify.yml`](./amplify.yml) con una configuración estándar para Vite.

El build genera `dist/` como sitio estático, por lo que es compatible con Amplify Hosting sin SSR.

Si más adelante se agrega React Router, usa una regla de rewrite hacia `index.html` con código `200`. Regla sugerida:

`</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>` -> `/index.html` -> `200`

## Notas

- Todo el comportamiento de OCR, validación y alertas es simulado.
- No hay integración con servicios externos ni uso obligatorio de variables de entorno.
- El flujo cubre únicamente el punto **4.2.1 Reembolso**.
