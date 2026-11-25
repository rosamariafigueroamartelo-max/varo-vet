# VaRo Vet · Bienestar animal

Sitio web de una clínica veterinaria en Sahagún, Córdoba. Proyecto de **Desarrollo Web I** (Ingeniería de Sistemas, Universidad de Córdoba). Esta es la **entrega final**: la misma página de los avances 1 y 2, migrada a una SPA con Vue 3, Vite y Vue Router.

**Autoras:** Rosa María Figueroa Martelo y Valentina González Hoyos
**Docente:** Ing. Juan Manuel Muskus Muskus

**Aplicación publicada:** _pendiente: pegar aquí la URL de producción después de desplegar (ver "Despliegue")_

## Qué hace

- Muestra la información de la clínica: inicio, nosotros, servicios, horario y contacto.
- Carga los servicios con `fetch` desde `public/data/servicios.json` y tiene un detalle por servicio.
- Permite agendar una cita con validación en tiempo real. La hora se elige con botones cada 30 minutos; las horas ocupadas o que ya pasaron salen desactivadas. Crear una cita hace un `POST` y modificarla un `PUT` a JSONPlaceholder (API de prueba que responde pero no guarda nada).
- Guarda las citas en `localStorage` y las lista debajo del formulario y en **Mis citas**, donde se pueden buscar, filtrar, modificar, cancelar, reactivar y eliminar.
- Si una búsqueda no encuentra nada, sale un mensaje en rojo con un botón para limpiarla.
- Tiene formulario de contacto con las mismas validaciones y un borrador que se recupera al recargar.

## Rutas (Vue Router)

| Ruta | Vista | Para qué sirve |
| --- | --- | --- |
| `/` | `InicioView` | Presentación, servicios destacados y horario |
| `/nosotros` | `NosotrosView` | Quiénes somos y misión |
| `/servicios` | `ServiciosView` | Catálogo con buscador |
| `/servicios/:id` | `ServicioDetalleView` | Detalle de un servicio (el `id` llega como prop) |
| `/agendar-cita` | `AgendarCitaView` | Formulario de operación: registrar una cita o modificarla (`?editar=id`) |
| `/mis-citas` | `MisCitasView` | Gestión de las citas guardadas |
| `/contacto` | `ContactoView` | Datos de contacto y formulario de mensaje |
| cualquier otra | `NoEncontradaView` | Página 404 |

El router usa **modo hash** (`/#/servicios`). Así, al recargar una página interna en GitHub Pages, Netlify o Vercel no sale un 404 y no hace falta configurar redirecciones.

## Estructura de carpetas

```
varo-vet/
├── index.html                 # punto de entrada (fuentes e íconos por CDN)
├── vite.config.js             # plugin de Vue, alias @ y base './'
├── package.json
├── public/
│   ├── favicon.svg
│   └── data/servicios.json    # datos que se leen con fetch
├── src/
│   ├── main.js                # crea la app y registra el router
│   ├── App.vue                # cabecera + <RouterView> + pie
│   ├── router/index.js        # rutas
│   ├── views/                 # una vista por ruta
│   ├── components/            # piezas reutilizables
│   │   ├── AppHeader.vue, AppFooter.vue, HorarioBox.vue
│   │   ├── ServiceCard.vue, CitaCard.vue
│   │   ├── CitasPanel.vue     # lista de citas con buscador, filtro y acciones
│   │   ├── HoraSelector.vue   # botones de hora cada 30 minutos (v-model)
│   │   ├── FormField.vue      # campo con v-model y mensaje de error
│   │   ├── StatusAlert.vue    # cargando / éxito / error
│   │   └── ModalConfirm.vue   # confirmación con <dialog>
│   ├── store/citas.js         # estado compartido de las citas (+ localStorage)
│   ├── composables/
│   │   ├── useForm.js         # formulario reactivo, validación y borrador
│   │   └── useServicios.js    # carga de servicios compartida entre vistas
│   ├── services/              # api.js (fetch) y storage.js (localStorage)
│   ├── utils/                 # validadores y fechas
│   └── assets/                # styles.css e imágenes
└── .github/workflows/deploy.yml
```

## Cómo está armada la reactividad

- **Props y eventos:** `ServiceCard` y `CitaCard` reciben el objeto por `props`. `CitaCard` no cambia nada por sí sola: avisa con los eventos `modificar`, `alternar` y `eliminar`, y `CitasPanel` reenvía `modificar` a la vista para que cargue la cita en el formulario. `HoraSelector` funciona con `v-model`. `ModalConfirm` recibe `abierto` y emite `confirmar` y `cancelar`. `FormField` usa `v-model` (`modelValue` y `update:modelValue`).
- **Directivas:** `v-model` en los formularios, `v-for` en listas de servicios y citas, `v-if` / `v-else-if` / `v-else` para los estados de carga, error y vacío, `v-bind` (`:to`, `:class`, `:disabled`) y `v-on` (`@submit.prevent`, `@click`, `@blur`).
- **Estado compartido:** `store/citas.js` guarda las citas en un objeto reactivo y las pasa a `localStorage`. La vista de agendar escribe en él y `Mis citas` lo lee, así que las dos siempre muestran lo mismo. `useServicios` hace lo mismo con la lista de servicios (se pide una vez y la usan tres vistas).

## Cómo ejecutarlo en local

Necesitas Node.js 18 o superior.

```bash
npm install
npm run dev
```

Vite muestra la dirección (normalmente `http://localhost:5173`). Para generar la versión de producción y revisarla:

```bash
npm run build     # crea la carpeta dist/
npm run preview   # sirve dist/ en local
```

## Despliegue

El repositorio incluye `.github/workflows/deploy.yml`, que construye el proyecto y lo publica en **GitHub Pages** en cada `push` a `main` (despliegue continuo).

1. Sube el proyecto a un repositorio de GitHub (rama `main`).
2. En el repositorio entra a **Settings > Pages** y en **Source** elige **GitHub Actions**.
3. Haz `push`. En la pestaña **Actions** se ve el despliegue; al terminar, la URL queda en **Settings > Pages** (algo como `https://usuario.github.io/nombre-del-repositorio/`).
4. Pega esa URL arriba, en "Aplicación publicada".

También sirve Vercel o Netlify: se importa el repositorio, el comando es `npm run build` y la carpeta de salida es `dist`.

## Avances anteriores

- **Avance 1:** HTML5 semántico y diseño responsive con Grid y Flexbox.
- **Avance 2:** JavaScript puro con DOM y eventos, `fetch`, `localStorage` y validaciones. Las reglas de validación y el formato de las citas guardadas son los mismos, por eso las citas del Avance 2 aparecen en **Mis citas** si se abre en el mismo navegador y la misma dirección.
