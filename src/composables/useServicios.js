import { ref } from 'vue';
import { obtenerJSON, ApiError } from '@/services/api';

// Estado compartido: la lista se pide una sola vez y la usan varias vistas.
const servicios = ref([]);
const cargando = ref(false);
const error = ref('');
let pendiente = null;

function cargar(forzar = false) {
  if (!forzar && servicios.value.length) return Promise.resolve();
  if (pendiente) return pendiente;

  cargando.value = true;
  error.value = '';
  pendiente = (async () => {
    try {
      const datos = await obtenerJSON(`${import.meta.env.BASE_URL}data/servicios.json`);
      if (!Array.isArray(datos) || !datos.length) {
        throw new ApiError('El archivo de servicios llegó vacío.', { tipo: 'formato' });
      }
      servicios.value = datos;
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'No pudimos cargar los servicios.';
    } finally {
      cargando.value = false;
      pendiente = null;
    }
  })();
  return pendiente;
}

export function useServicios() {
  cargar();
  return { servicios, cargando, error, recargar: () => cargar(true) };
}
