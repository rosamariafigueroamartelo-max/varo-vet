<script setup>
import { ref, computed } from 'vue';
import CitaCard from '@/components/CitaCard.vue';
import FormField from '@/components/FormField.vue';
import ModalConfirm from '@/components/ModalConfirm.vue';
import StatusAlert from '@/components/StatusAlert.vue';
import { useCitas } from '@/store/citas';
import { normalizar } from '@/utils/fechas';

// Lista de citas con buscador, filtro y acciones. Se usa en "Agenda tu cita" y en "Mis citas".
// Las citas salen del estado compartido; para modificar una, avisa al padre con el evento "modificar".
defineProps({
  editandoId: { type: String, default: '' },
  titulo: { type: String, default: 'Mis citas' }
});
const emit = defineEmits(['modificar']);

const { citas, programadas, alternar, eliminar, vaciar, obtener } = useCitas();

const busqueda = ref('');
const estado = ref('todas');
const aviso = ref('');
const pendiente = ref(null); // { tipo: 'eliminar' | 'vaciar', cita }

const visibles = computed(() => {
  const texto = normalizar(busqueda.value);
  return citas.value.filter((c) =>
    (estado.value === 'todas' || c.estado === estado.value) &&
    (!texto || normalizar(`${c.mascota} ${c.propietario} ${c.servicioNombre}`).includes(texto))
  );
});

const textoModal = computed(() => {
  if (!pendiente.value) return { titulo: '', mensaje: '', boton: '' };
  if (pendiente.value.tipo === 'vaciar') {
    return { titulo: '¿Borrar todas las citas?', mensaje: 'Se eliminan todas las citas guardadas en este navegador. Esta acción no se puede deshacer.', boton: 'Sí, borrar todas' };
  }
  return { titulo: `¿Eliminar la cita de ${pendiente.value.cita.mascota}?`, mensaje: 'La cita se borra de la lista. Si solo quieres que no se haga, usa "Cancelar cita".', boton: 'Sí, eliminar' };
});

function cambiarEstado(id) {
  alternar(id);
  const cita = obtener(id);
  if (cita) aviso.value = `La cita de ${cita.mascota} quedó ${cita.estado === 'cancelada' ? 'cancelada' : 'programada otra vez'}.`;
}

function pedirEliminar(id) {
  const cita = obtener(id);
  if (cita) pendiente.value = { tipo: 'eliminar', cita };
}

function confirmar() {
  if (!pendiente.value) return;
  if (pendiente.value.tipo === 'vaciar') {
    vaciar();
    aviso.value = 'Borramos todas las citas guardadas en este navegador.';
  } else {
    eliminar(pendiente.value.cita.id);
    aviso.value = `Eliminamos la cita de ${pendiente.value.cita.mascota}.`;
  }
  pendiente.value = null;
}

function limpiarFiltros() {
  busqueda.value = '';
  estado.value = 'todas';
}
</script>

<template>
  <section class="citas-panel" aria-labelledby="panel-citas-titulo">
    <header class="section-head">
      <h2 id="panel-citas-titulo">{{ titulo }} <em>solicitadas</em></h2>
      <p>Se guardan en este navegador, así que siguen aquí aunque recargues la página.</p>
    </header>

    <section v-if="citas.length" class="citas-herramientas" role="search" aria-label="Buscar y filtrar citas">
      <FormField id="citas-buscar" v-model="busqueda" label="Buscar" type="search" placeholder="Mascota, responsable o servicio" autocomplete="off" />
      <FormField id="citas-estado" v-model="estado" as="select" label="Estado">
        <option value="todas">Todas</option>
        <option value="programada">Programadas</option>
        <option value="cancelada">Canceladas</option>
      </FormField>
      <p class="citas-vaciar">
        <button type="button" class="btn-mini peligro" @click="pendiente = { tipo: 'vaciar' }">
          <i class="fa-solid fa-trash" aria-hidden="true"></i> Vaciar lista
        </button>
      </p>
    </section>

    <StatusAlert v-if="aviso" tipo="info" accion="Cerrar" @accion="aviso = ''">{{ aviso }}</StatusAlert>

    <StatusAlert v-if="!citas.length" tipo="info">Todavía no has solicitado ninguna cita desde este navegador. Cuando envíes una, aparecerá aquí.</StatusAlert>
    <StatusAlert v-else-if="!visibles.length" tipo="error" accion="Limpiar búsqueda" @accion="limpiarFiltros">
      No encontramos citas<template v-if="busqueda.trim()"> que coincidan con «{{ busqueda.trim() }}»</template><template v-if="estado !== 'todas'"> en estado {{ estado === 'programada' ? 'programada' : 'cancelada' }}</template>. Revisa lo que escribiste o cambia el filtro.
    </StatusAlert>
    <p v-else class="citas-resumen" aria-live="polite">
      Mostrando {{ visibles.length }} de {{ citas.length }} {{ citas.length === 1 ? 'cita' : 'citas' }} ({{ programadas.length }} {{ programadas.length === 1 ? 'programada' : 'programadas' }}).
    </p>

    <section v-if="visibles.length" class="citas-lista" aria-label="Citas guardadas">
      <CitaCard v-for="c in visibles" :key="c.id" :cita="c" :resaltada="c.id === editandoId"
        @modificar="emit('modificar', $event)" @alternar="cambiarEstado" @eliminar="pedirEliminar" />
    </section>

    <ModalConfirm
      :abierto="Boolean(pendiente)"
      :titulo="textoModal.titulo"
      :mensaje="textoModal.mensaje"
      :texto-confirmar="textoModal.boton"
      @confirmar="confirmar"
      @cancelar="pendiente = null"
    />
  </section>
</template>
