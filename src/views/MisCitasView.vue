<script setup>
import { RouterLink, useRouter } from 'vue-router';
import CitasPanel from '@/components/CitasPanel.vue';
import { useCitas } from '@/store/citas';

const router = useRouter();
const { citas } = useCitas();

// Modificar una cita = abrir el formulario de agendar con esa cita cargada.
function modificar(id) {
  router.push({ name: 'agendar', query: { editar: id } });
}
</script>

<template>
  <header class="page-title">
    <span class="deco paw-line d1" aria-hidden="true"></span>
    <span class="deco paw-line d2" aria-hidden="true"></span>
    <span class="hill" aria-hidden="true"></span>
    <h1>Mis citas</h1>
    <p>Consulta, modifica o cancela las citas que solicitaste</p>
  </header>

  <section class="section light">
    <section class="container">
      <CitasPanel @modificar="modificar" />
      <p class="btn-actions citas-nueva">
        <RouterLink class="btn btn-primary" to="/agendar-cita">{{ citas.length ? 'Agendar otra cita' : 'Agendar mi primera cita' }}</RouterLink>
      </p>
    </section>
  </section>
</template>
