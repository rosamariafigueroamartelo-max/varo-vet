<script setup>
import { RouterLink } from 'vue-router';
import logo from '@/assets/img/logo.png';

const enlaces = [
  { ruta: '/', texto: 'Inicio' },
  { ruta: '/nosotros', texto: 'Nosotros' },
  { ruta: '/servicios', texto: 'Servicios' },
  { ruta: '/contacto', texto: 'Contactos' },
  { ruta: '/agendar-cita', texto: 'Agenda tu cita' },
  { ruta: '/mis-citas', texto: 'Mis citas' }
];

const redes = [
  { nombre: 'Facebook', icono: 'fa-brands fa-facebook', url: 'https://www.facebook.com/' },
  { nombre: 'Instagram', icono: 'fa-brands fa-instagram', url: 'https://www.instagram.com/' },
  { nombre: 'WhatsApp', icono: 'fa-brands fa-whatsapp', url: 'https://wa.me/573243630825' }
];
</script>

<template>
  <footer class="site-footer">
    <section class="footer-grid" aria-label="Información de la clínica">
      <RouterLink class="brand" to="/" aria-label="VaRo Vet, ir al inicio">
        <img :src="logo" alt="" width="124" height="118">
        <span class="brand-text"><span class="brand-name">VaRO Vet</span><span class="brand-tag">Bienestar animal</span></span>
      </RouterLink>
      <nav aria-label="Enlaces del sitio">
        <h2>Explora</h2>
        <ul class="footer-links">
          <li v-for="enlace in enlaces" :key="enlace.ruta"><RouterLink :to="enlace.ruta">{{ enlace.texto }}</RouterLink></li>
        </ul>
      </nav>
      <article>
        <h2>Contacto</h2>
        <address>Cr 20 #123-45, Sahagún - Colombia<br><a href="mailto:VaroVet@gmail.com">VaroVet@gmail.com</a></address>
      </article>
      <ul class="social" aria-label="Redes sociales">
        <li v-for="red in redes" :key="red.nombre">
          <a :href="red.url" target="_blank" rel="noopener" :aria-label="`VaRo Vet en ${red.nombre}`"><i :class="red.icono" aria-hidden="true"></i></a>
        </li>
      </ul>
    </section>
    <p class="copy">© 2026 VaRo Vet. Proyecto académico de Desarrollo Web I, Universidad de Córdoba.</p>
  </footer>
</template>
