<script setup>
import { RouterLink, useRoute } from 'vue-router';
import StatusAlert from '@/components/StatusAlert.vue';

const route = useRoute();
</script>

<template>
  <header class="page-title">
    <span class="hill" aria-hidden="true"></span>
    <h1>Página no encontrada</h1>
    <p>La dirección que escribiste no existe</p>
  </header>
  <section class="section light">
    <section class="container">
      <StatusAlert tipo="error">La dirección «{{ route.fullPath }}» no existe en VaRo Vet.</StatusAlert>
      <p class="btn-actions">
        <RouterLink class="btn btn-primary" to="/">Ir al inicio</RouterLink>
        <RouterLink class="btn btn-outline" to="/servicios">Ver servicios</RouterLink>
      </p>
    </section>
  </section>
</template>
