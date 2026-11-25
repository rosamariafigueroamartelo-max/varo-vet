<script setup>
import { computed, useAttrs } from 'vue';

// Campo de formulario reutilizable. Funciona con v-model (modelValue / update:modelValue)
// y muestra su mensaje de error. Los atributos extra (min, max, placeholder...) van al control.
defineOptions({ inheritAttrs: false });

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: [String, Number], default: '' },
  as: { type: String, default: 'input' },        // input | select | textarea
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
  tocado: Boolean,
  required: Boolean,
  full: Boolean,
  pista: { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue', 'blur']);
const attrs = useAttrs();

const clases = computed(() => ({
  'is-invalid': Boolean(props.error),
  'is-valid': props.tocado && !props.error && String(props.modelValue) !== ''
}));
const descrito = computed(() => (props.error ? `error-${props.id}` : null));
const conContador = computed(() => props.as === 'textarea' && attrs.maxlength);

const alEscribir = (e) => emit('update:modelValue', e.target.value);
</script>

<template>
  <p :class="['field', { full }]">
    <label :for="id">{{ label }} <span v-if="required" class="req">*</span></label>
    <select
      v-if="as === 'select'"
      :id="id" v-bind="$attrs" :class="clases" :value="modelValue"
      :aria-invalid="error ? 'true' : null" :aria-describedby="descrito"
      @change="alEscribir" @blur="emit('blur')"
    >
      <slot />
    </select>
    <textarea
      v-else-if="as === 'textarea'"
      :id="id" v-bind="$attrs" :class="clases" :value="modelValue"
      :aria-invalid="error ? 'true' : null" :aria-describedby="descrito"
      @input="alEscribir" @blur="emit('blur')"
    ></textarea>
    <input
      v-else
      :id="id" :type="type" v-bind="$attrs" :class="clases" :value="modelValue"
      :aria-invalid="error ? 'true' : null" :aria-describedby="descrito"
      @input="alEscribir" @blur="emit('blur')"
    >
    <small v-if="pista">{{ pista }}</small>
    <small v-if="conContador" class="contador" aria-hidden="true">{{ String(modelValue).length }}/{{ attrs.maxlength }}</small>
    <small v-if="error" :id="`error-${id}`" class="field-error">{{ error }}</small>
  </p>
</template>
