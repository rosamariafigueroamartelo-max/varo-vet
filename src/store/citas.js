import { reactive, computed, watch } from 'vue';
import { leer, guardar, nuevoId } from '@/services/storage';

// Estado centralizado de las citas. Lo comparten la vista de agendar y la de "Mis citas",
// y se guarda en localStorage (misma clave que en el Avance 2, así no se pierden las citas).
const CLAVE = 'citas';
const lista = (valor) => (Array.isArray(valor) ? valor : []);
const estado = reactive({ citas: lista(leer(CLAVE, [])) });

watch(() => estado.citas, (valor) => { guardar(CLAVE, valor); }, { deep: true });

// Si se abre otra pestaña de la página y cambia algo, esta se actualiza.
window.addEventListener('storage', (e) => {
  if (e.key === 'varovet:' + CLAVE) estado.citas = lista(leer(CLAVE, []));
});

export function useCitas() {
  const citas = computed(() =>
    [...estado.citas].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
  );
  const programadas = computed(() => estado.citas.filter((c) => c.estado === 'programada'));

  const obtener = (id) => estado.citas.find((c) => c.id === id) || null;

  function agregar(datos) {
    const nueva = { id: nuevoId(), creadaEn: new Date().toISOString(), estado: 'programada', ...datos };
    estado.citas.push(nueva);
    return nueva;
  }
  function actualizar(id, cambios) {
    const cita = obtener(id);
    if (!cita) return null;
    Object.assign(cita, cambios, { modificadaEn: new Date().toISOString() });
    return cita;
  }
  function alternar(id) {
    const cita = obtener(id);
    if (cita) cita.estado = cita.estado === 'cancelada' ? 'programada' : 'cancelada';
  }
  function eliminar(id) {
    estado.citas = estado.citas.filter((c) => c.id !== id);
  }
  function vaciar() {
    estado.citas = [];
  }
  // ¿Hay otra cita programada ese día a esa hora? (excluirId sirve al modificar una cita)
  function hayChoque(fecha, hora, excluirId = null) {
    return estado.citas.some((c) => c.id !== excluirId && c.estado === 'programada' && c.fecha === fecha && c.hora === hora);
  }
  function horasOcupadas(fecha, excluirId = null) {
    return estado.citas
      .filter((c) => c.id !== excluirId && c.estado === 'programada' && c.fecha === fecha)
      .map((c) => c.hora);
  }

  return { citas, programadas, obtener, agregar, actualizar, alternar, eliminar, vaciar, hayChoque, horasOcupadas };
}
