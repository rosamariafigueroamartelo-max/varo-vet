<script setup>
import { RouterLink } from 'vue-router';

// Tarjeta de un servicio. Recibe el objeto por props; todo el recuadro es el enlace al detalle.
defineProps({
  servicio: { type: Object, required: true }
});
</script>

<template>
  <article class="service-card">
    <span class="icon" aria-hidden="true"><i :class="['fa-solid', servicio.icono]"></i></span>
    <div class="service-text">
      <h2><RouterLink :to="{ name: 'servicio-detalle', params: { id: servicio.id } }">{{ servicio.nombre }}</RouterLink></h2>
      <p class="service-desc">{{ servicio.descripcion }}</p>
    </div>
    <i class="fa-solid fa-chevron-right go" aria-hidden="true"></i>
  </article>
</template>
