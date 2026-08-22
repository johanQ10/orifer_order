# Orifer — Gestor de Pedidos

Aplicación web (HTML, CSS y JavaScript puro, sin frameworks ni build step) para registrar los pedidos de producción de Orifer y generar, con un clic, una **orden de producción en PDF** bien organizada para entregar a los trabajadores, con las tareas y responsables de cada parte del pedido.

No requiere instalación ni servidor: se abre directamente el archivo `index.html` en el navegador.

## ¿Qué resuelve?

En vez de anotar los pedidos a mano o repetir la información en varios lugares, esta app centraliza:

- Los datos generales del pedido (cliente, fechas, número de orden).
- Las especificaciones de tela/tallas/cuello.
- Los **items** de producción (corte, confección, bordado, empaque, etc.), cada uno con su responsable, su lista de tareas e imágenes de referencia.
- Los anexos generales del pedido.

Y con eso arma automáticamente un PDF listo para imprimir o compartir con el equipo, para que cada trabajador sepa exactamente qué le corresponde hacer.

## Funcionalidades principales

- **Datos del pedido**: fecha del pedido, número de orden, cliente y fecha de entrega.
  - El campo *Nombre del cliente* tiene un switch para alternar entre texto libre y una lista de clientes habituales (Luisana Andrade, Bunny, Genesis, Made, Guillermo).
- **Especificaciones**: tabla editable de tipo de tela / tallas / tipo de cuello, con filas que se agregan o eliminan libremente.
- **Items del pedido**: cada item tiene título, responsable (seleccionable de una lista fija de trabajadores), una lista de tareas y la posibilidad de adjuntar imágenes de referencia.
- **Anexos**: imágenes generales del pedido no asociadas a un item específico.
- **Generar PDF**: crea una orden de producción con el logo de Orifer, tablas y tarjetas de colores con esquinas redondas, las tareas de cada item mostradas como una mini tabla, e imágenes bien distribuidas para no desperdiciar papel al imprimir.
- **Guardar pedido**: exporta el pedido como archivo `.json` en una carpeta local llamada `orders`, con el nombre `<numero_orden>_<dd>_<mm>_<yy>.json`.
- **Editar pedido**: permite volver a abrir cualquier pedido guardado (seleccionándolo de una lista o eligiendo el archivo manualmente) para modificarlo.
- Interfaz responsive: se adapta a pantallas de escritorio, tablet y celular.

## Cómo usarla

1. Abre `index.html` en Chrome o Edge (recomendado, por el guardado directo a carpetas).
2. Completa los datos del pedido, las especificaciones y agrega los items necesarios con sus tareas e imágenes.
3. Usa **Guardar pedido** para dejar un respaldo del pedido en la carpeta `orders/`.
4. Usa **Generar PDF** para producir la orden de producción; el PDF se guarda en la carpeta `pdf/`.
5. Para retomar un pedido más adelante, usa **Editar pedido** y selecciónalo de la lista.

> La primera vez que uses "Guardar pedido" o "Generar PDF", el navegador te pedirá seleccionar la carpeta `orders` o `pdf` correspondiente (deben existir previamente en el proyecto). Luego de esa selección inicial no se vuelve a preguntar, salvo que el navegador no soporte esta función — en ese caso, el archivo se descarga normalmente y debes moverlo tú mismo a la carpeta correspondiente.

## Estructura del proyecto

```
├── index.html          # Estructura de la página y plantillas de la UI
├── styles.css           # Estilos de la aplicación
├── app.js                # Toda la lógica: formulario, guardado y generación de PDF
├── assets/
│   ├── logo.png          # Logo de Orifer (para mostrarlo en la página)
│   └── logo.js           # El mismo logo embebido en base64 (para incluirlo en el PDF)
├── vendor/
│   └── jspdf.umd.min.js  # Librería jsPDF (generación de PDF), incluida localmente
├── orders/                # Pedidos guardados como JSON
└── pdf/                   # Órdenes de producción generadas en PDF
```

## Notas técnicas

- No depende de conexión a internet: jsPDF está incluido localmente en `vendor/`.
- El guardado directo en las carpetas `orders/` y `pdf/` usa la *File System Access API*, disponible en navegadores basados en Chromium (Chrome, Edge). En otros navegadores, la app cae automáticamente a la descarga tradicional del archivo.
- Los nombres de responsables y de clientes habituales están definidos como listas simples dentro de `app.js` (constantes `RESPONSABLES` y `CLIENTES_HABITUALES`), fáciles de editar si el equipo cambia.
