<script setup>
// Mensaje de estado: cargando, éxito, error o información.
// Si recibe "accion", muestra un botón y avisa al padre con el evento "accion".
defineProps({
  tipo: { type: String, default: 'info', validator: (v) => ['exito', 'error', 'info', 'cargando'].includes(v) },
  accion: { type: String, default: '' }
});
defineEmits(['accion']);

const iconos = { exito: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info', cargando: 'fa-spinner' };
</script>

<template>
  <p :class="['alert', `alert-${tipo}`]" :role="tipo === 'error' ? 'alert' : 'status'">
    <i :class="['fa-solid', iconos[tipo], { 'fa-spin': tipo === 'cargando' }]" aria-hidden="true"></i>
    <span class="alert-text"><slot /></span>
    <button v-if="accion" type="button" class="alert-btn" @click="$emit('accion')">{{ accion }}</button>
  </p>
</template>
