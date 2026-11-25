<script setup>
import { computed, watch } from 'vue';
import { RouterLink } from 'vue-router';
import StatusAlert from '@/components/StatusAlert.vue';
import { useServicios } from '@/composables/useServicios';

// El id llega como prop desde la ruta /servicios/:id (props: true en el router).
const props = defineProps({
  id: { type: String, required: true }
});

const { servicios, cargando, error, recargar } = useServicios();
const servicio = computed(() => servicios.value.find((s) => s.id === props.id));

watch(servicio, (s) => {
  if (s) document.title = `${s.nombre} | VaRo Vet`;
}, { immediate: true });
</script>

<template>
  <header class="page-title">
    <span class="deco paw-line d1" aria-hidden="true"></span>
    <span class="hill" aria-hidden="true"></span>
    <h1>{{ servicio ? servicio.nombre : 'Servicio' }}</h1>
    <p>Detalle del servicio</p>
  </header>

  <section class="section light" aria-label="Detalle del servicio">
    <section class="container detalle">
      <StatusAlert v-if="cargando" tipo="cargando">Cargando el servicio…</StatusAlert>
      <StatusAlert v-else-if="error" tipo="error" accion="Reintentar" @accion="recargar">{{ error }}</StatusAlert>

      <article v-else-if="servicio" class="detalle-tarjeta">
        <span class="icon detalle-icono" aria-hidden="true"><i :class="['fa-solid', servicio.icono]"></i></span>
        <h2>{{ servicio.nombre }}</h2>
        <p>{{ servicio.descripcion }}</p>
        <h3>Qué incluye</h3>
        <ul class="detalle-lista">
          <li v-for="item in servicio.incluye" :key="item"><i class="fa-solid fa-paw" aria-hidden="true"></i> {{ item }}</li>
        </ul>
        <p class="btn-actions">
          <RouterLink class="btn btn-primary" :to="{ name: 'agendar', query: { servicio: servicio.id } }">Agendar este servicio</RouterLink>
          <RouterLink class="btn btn-outline" to="/servicios">Ver todos los servicios</RouterLink>
        </p>
      </article>

      <template v-else>
        <StatusAlert tipo="error">No encontramos el servicio «{{ id }}». Puede que el enlace esté mal escrito.</StatusAlert>
        <p class="btn-actions"><RouterLink class="btn btn-primary" to="/servicios">Ver todos los servicios</RouterLink></p>
      </template>
    </section>
  </section>
</template>
