<script setup>
import { ref, watch, nextTick } from 'vue';

// Ventana de confirmación con el elemento nativo <dialog>.
// El padre controla si está abierta (prop "abierto") y responde a los eventos "confirmar" y "cancelar".
const props = defineProps({
  abierto: Boolean,
  titulo: { type: String, required: true },
  mensaje: { type: String, default: '' },
  textoConfirmar: { type: String, default: 'Confirmar' }
});
const emit = defineEmits(['confirmar', 'cancelar']);

const dialogo = ref(null);

watch(() => props.abierto, async (abierto) => {
  await nextTick();
  const el = dialogo.value;
  if (!el) return;
  if (abierto && !el.open) el.showModal();
  if (!abierto && el.open) el.close();
});
</script>

<template>
  <dialog ref="dialogo" class="modal" aria-labelledby="modal-titulo" @cancel.prevent="emit('cancelar')">
    <h2 id="modal-titulo">{{ titulo }}</h2>
    <p>{{ mensaje }}</p>
    <p class="modal-acciones">
      <button type="button" class="btn btn-outline" @click="emit('cancelar')">Cancelar</button>
      <button type="button" class="btn btn-primary" @click="emit('confirmar')">{{ textoConfirmar }}</button>
    </p>
  </dialog>
</template>
