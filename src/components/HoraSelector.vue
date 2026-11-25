<script setup>
import { computed } from 'vue';
import { aFecha, fechaISO, horaLegible, FESTIVOS } from '@/utils/fechas';

// Selector de hora con botones (cada 30 minutos). Reemplaza al reloj del navegador.
// Funciona con v-model y desactiva las horas ocupadas o que ya pasaron.
const props = defineProps({
  modelValue: { type: String, default: '' },
  fecha: { type: String, default: '' },
  ocupadas: { type: Array, default: () => [] },
  error: { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue', 'blur']);

const aMinutos = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const aTexto = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

// Por qué no se pueden mostrar horas para la fecha elegida ('' = sí se pueden).
const aviso = computed(() => {
  if (!props.fecha) return 'Elige primero una fecha para ver las horas disponibles.';
  if (props.fecha < fechaISO()) return 'La fecha ya pasó. Elige otra para ver las horas.';
  const dia = aFecha(props.fecha).getDay();
  if (dia === 0) return 'Los domingos la clínica está cerrada.';
  if (FESTIVOS.has(props.fecha)) return 'Ese día es festivo y la clínica está cerrada.';
  return '';
});

const horas = computed(() => {
  if (aviso.value) return [];
  const sabado = aFecha(props.fecha).getDay() === 6;
  const ultima = sabado ? 12 * 60 + 30 : 17 * 60 + 30;
  const esHoy = props.fecha === fechaISO();
  const ahora = new Date();
  const minAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const lista = [];
  for (let min = 8 * 60; min <= ultima; min += 30) {
    const valor = aTexto(min);
    const ocupada = props.ocupadas.includes(valor);
    const pasada = esHoy && min <= minAhora;
    lista.push({ valor, texto: horaLegible(valor), ocupada, pasada, deshabilitada: ocupada || pasada });
  }
  return lista;
});

const manana = computed(() => horas.value.filter((h) => aMinutos(h.valor) < 12 * 60));
const tarde = computed(() => horas.value.filter((h) => aMinutos(h.valor) >= 12 * 60));
const libres = computed(() => horas.value.filter((h) => !h.deshabilitada).length);
const sabado = computed(() => props.fecha && aFecha(props.fecha).getDay() === 6);

function elegir(h) {
  if (h.deshabilitada) return;
  emit('update:modelValue', h.valor);
  emit('blur');
}
</script>

<template>
  <fieldset id="cita-hora" :class="['field', 'full', 'hora-selector', { 'is-invalid': error }]" tabindex="-1"
    :aria-describedby="error ? 'error-cita-hora' : null">
    <legend>Hora <span class="req">*</span></legend>

    <p v-if="aviso" class="hora-aviso"><i class="fa-regular fa-clock" aria-hidden="true"></i> {{ aviso }}</p>

    <template v-else>
      <small>{{ sabado ? 'Sábado: de 8:00 a.m. a 12:30 p.m.' : 'De 8:00 a.m. a 5:30 p.m.' }}, cada 30 minutos. {{ libres }} {{ libres === 1 ? 'hora libre' : 'horas libres' }}.</small>
      <div v-for="grupo in [{ nombre: 'Mañana', lista: manana }, { nombre: 'Tarde', lista: tarde }]" :key="grupo.nombre" v-show="grupo.lista.length" class="hora-grupo">
        <span class="hora-grupo-titulo">{{ grupo.nombre }}</span>
        <div class="hora-opciones" role="radiogroup" :aria-label="`Horas de la ${grupo.nombre.toLowerCase()}`">
          <button v-for="h in grupo.lista" :key="h.valor" type="button" role="radio"
            :class="['hora-chip', { activa: modelValue === h.valor }]"
            :aria-checked="modelValue === h.valor ? 'true' : 'false'"
            :disabled="h.deshabilitada"
            :title="h.ocupada ? 'Ya tienes una cita a esta hora' : h.pasada ? 'Esta hora ya pasó' : ''"
            @click="elegir(h)">
            {{ h.texto }}<span v-if="h.ocupada" class="sr-only"> (ocupada)</span>
          </button>
        </div>
      </div>
      <small v-if="ocupadas.length" class="hora-leyenda"><span class="hora-chip muestra" aria-hidden="true"></span> Las horas grises no están disponibles.</small>
    </template>

    <small v-if="error" id="error-cita-hora" class="field-error">{{ error }}</small>
  </fieldset>
</template>
