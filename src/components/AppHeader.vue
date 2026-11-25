<script setup>
import { ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import logo from '@/assets/img/logo.png';

const enlaces = [
  { ruta: '/', texto: 'Inicio' },
  { ruta: '/nosotros', texto: 'Nosotros' },
  { ruta: '/servicios', texto: 'Servicios' },
  { ruta: '/contacto', texto: 'Contactos' },
  { ruta: '/mis-citas', texto: 'Mis citas' }
];

// El menú móvil sigue siendo un checkbox con CSS; aquí solo se cierra al cambiar de página.
const menuAbierto = ref(false);
const route = useRoute();
watch(() => route.fullPath, () => { menuAbierto.value = false; });
</script>

<template>
  <header class="site-header">
    <RouterLink class="brand" to="/" aria-label="VaRo Vet, bienestar animal. Ir al inicio">
      <img :src="logo" alt="" width="124" height="118">
      <span class="brand-text"><span class="brand-name">VaRO Vet</span><span class="brand-tag">Bienestar animal</span></span>
    </RouterLink>
    <input id="menu-toggle" v-model="menuAbierto" type="checkbox" class="nav-toggle" aria-label="Abrir o cerrar el menú">
    <label for="menu-toggle" class="menu-button"><i class="fa-solid fa-bars" aria-hidden="true"></i><span class="label">Menú</span></label>
    <nav class="site-nav" aria-label="Navegación principal">
      <ul class="nav-list">
        <li v-for="enlace in enlaces" :key="enlace.ruta">
          <RouterLink :to="enlace.ruta">{{ enlace.texto }}</RouterLink>
        </li>
        <li class="nav-cta"><RouterLink to="/agendar-cita">Agenda tu cita</RouterLink></li>
      </ul>
    </nav>
  </header>
</template>
