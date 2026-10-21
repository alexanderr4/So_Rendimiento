# Simulador interactivo de Sistemas Operativos

Herramienta educativa para una exposición universitaria sobre memoria, rendimiento y comunicación CPU-dispositivo.

## Qué cubre

- Comparación de RAM, SSD SATA, SSD NVMe y HDD.
- Latencia, throughput y tiempo teórico de transferencia.
- Polling, busy-wait, interrupciones, IRQ e ISR.
- DMA, cycle stealing, burst mode y bus mastering.
- MMIO frente a PMIO con registros ilustrativos.
- Experimento visual de Polling frente a interrupciones.
- Quiz autocorregible con explicación inmediata.

## Ejecutar localmente

```bash
npm install
npm run dev
```

Abre la URL que muestre Vite. Para comprobar la versión de producción:

```bash
npm run build
npm run preview
```

## Publicar en GitHub Pages

1. Ejecuta `npm run build`.
2. Publica la carpeta `dist` con GitHub Pages o con una acción de despliegue de Vite.
3. Si el repositorio se publica dentro de una subruta, configura `base` en `vite.config.js` con el nombre del repositorio.

El proyecto no utiliza backend, base de datos, autenticación ni servicios externos.

## Experimento real en Linux

El módulo de E/S muestra un ejemplo opcional para contrastar una espera activa con una espera mediante `select()`. Es independiente de la simulación web.

`select()` espera hasta que un descriptor está listo o hasta que vence un timeout. El ejemplo mide tiempo de pared con `time.perf_counter()` y tiempo de CPU con `time.process_time()`.

La web representa un modelo didáctico: no puede medir directamente la ocupación real del procesador, el bus o el dispositivo.

## Limitaciones

- Las latencias y velocidades son referencias orientativas, no garantías de hardware.
- Los valores de CPU, bus y tiempos se calculan con modelos simplificados.
- MMIO y PMIO usan direcciones y puertos ilustrativos, no direcciones reales.
- Las animaciones ayudan a explicar la secuencia, pero no sustituyen un benchmark.

## Referencias para profundizar

- Operating System Concepts, capítulos de entrada/salida.
- Modern Operating Systems, capítulos de dispositivos y controladores.
- Manuales de Linux `select(2)` y `poll(2)`.
- Documentación técnica de PCI/PCIe, DMA y controladores de dispositivos.
