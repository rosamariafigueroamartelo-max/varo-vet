<script setup>
import { computed } from 'vue';
import { fechaLarga, horaLegible } from '@/utils/fechas';

// Tarjeta de una cita. No modifica nada por sí sola: avisa al padre con eventos personalizados.
const props = defineProps({
  cita: { type: Object, required: true },
  resaltada: Boolean // la cita que se está modificando en el formulario
});
const emit = defineEmits(['modificar', 'alternar', 'eliminar']);

const cancelada = computed(() => props.cita.estado === 'cancelada');
</script>

<template>
  <article :class="['cita', { cancelada, resaltada }]">
    <header class="cita-cabecera">
      <h3>{{ cita.mascota }} <small>({{ cita.tipo }})</small></h3>
      <span :class="['cita-estado', cita.estado]">{{ cancelada ? 'Cancelada' : 'Programada' }}</span>
    </header>
    <dl class="cita-datos">
      <div><dt>Servicio</dt><dd>{{ cita.servicioNombre }}</dd></div>
      <div><dt>Fecha</dt><dd>{{ fechaLarga(cita.fecha) }}</dd></div>
      <div><dt>Hora</dt><dd>{{ horaLegible(cita.hora) }}</dd></div>
      <div><dt>Responsable</dt><dd>{{ cita.propietario }}</dd></div>
      <div><dt>Teléfono</dt><dd>{{ cita.telefono }}</dd></div>
    </dl>
    <p v-if="resaltada" class="cita-editando"><i class="fa-solid fa-pen" aria-hidden="true"></i> Modificando en el formulario</p>
    <p class="cita-acciones">
      <button v-if="!cancelada" type="button" class="btn-mini" @click="emit('modificar', cita.id)">
        <i class="fa-solid fa-pen" aria-hidden="true"></i> Modificar
      </button>
      <button type="button" :class="['btn-mini', { aviso: !cancelada }]" @click="emit('alternar', cita.id)">
        <i :class="['fa-solid', cancelada ? 'fa-rotate-left' : 'fa-ban']" aria-hidden="true"></i> {{ cancelada ? 'Reactivar' : 'Cancelar cita' }}
      </button>
      <button type="button" class="btn-mini peligro" @click="emit('eliminar', cita.id)">
        <i class="fa-solid fa-trash" aria-hidden="true"></i> Eliminar
      </button>
    </p>
  </article>
</template>
