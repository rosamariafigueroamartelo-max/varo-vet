<script setup>
defineProps({
  // id del título, para que el aside quede asociado a su encabezado
  idTitulo: { type: String, default: 'horario-titulo' }
});

const horarios = [
  { dia: 'Lunes a viernes', horas: '8:00 a.m. - 6:00 p.m.' },
  { dia: 'Sábado', horas: '8:00 a.m. - 1:00 p.m.' },
  { dia: 'Domingos y festivos', horas: 'Cerrado' }
];
</script>

<template>
  <aside class="info-box" :aria-labelledby="idTitulo">
    <h2 :id="idTitulo">Horario de atención</h2>
    <ul class="hours">
      <li v-for="h in horarios" :key="h.dia"><span>{{ h.dia }}</span><strong>{{ h.horas }}</strong></li>
    </ul>
  </aside>
</template>
