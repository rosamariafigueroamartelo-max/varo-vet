<script setup>
import { RouterView } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';

// Con el router en modo hash, un enlace "#contenido" cambiaría de ruta; por eso se maneja con código.
function irAlContenido() {
  const principal = document.getElementById('contenido');
  if (principal) {
    principal.focus();
    principal.scrollIntoView();
  }
}
</script>

<template>
  <a class="skip-link" href="#contenido" @click.prevent="irAlContenido">Saltar al contenido</a>
  <AppHeader />
  <main id="contenido" tabindex="-1">
    <RouterView />
  </main>
  <AppFooter />
</template>
