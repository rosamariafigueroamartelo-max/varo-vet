<script setup>
import { RouterLink } from 'vue-router';
import HorarioBox from '@/components/HorarioBox.vue';
import fotoInicio from '@/assets/img/inicio.png';

const destacados = [
  { titulo: 'Consulta veterinaria', texto: 'Revisión general y recomendaciones para el cuidado diario.' },
  { titulo: 'Vacunación', texto: 'Esquemas de vacunas según la edad de tu mascota.' },
  { titulo: 'Cirugía', texto: 'Procedimientos con seguimiento después de la operación.' }
];
</script>

<template>
  <section class="hero" aria-labelledby="hero-titulo">
    <span class="blob-mint tl" aria-hidden="true"></span>
    <span class="deco paw-line d1" aria-hidden="true"></span>
    <span class="deco paw-line d3" aria-hidden="true"></span>
    <span class="deco leaf d2" aria-hidden="true"></span>
    <span class="deco leaf d4" aria-hidden="true"></span>
    <article class="hero-text">
      <h1 id="hero-titulo">Cuidamos de tu <em>mascota</em> como parte de tu familia</h1>
      <p>Brindamos atención veterinaria integral</p>
      <p class="btn-actions">
        <RouterLink class="btn btn-primary" to="/agendar-cita">Agenda tu cita</RouterLink>
        <RouterLink class="btn btn-outline" to="/servicios">Servicios</RouterLink>
      </p>
    </article>
    <picture class="hero-photo">
      <img :src="fotoInicio" alt="Cachorro blanco abrazado por una veterinaria, con un estetoscopio en la boca" width="843" height="555" fetchpriority="high">
    </picture>
  </section>

  <section class="section light" aria-labelledby="destacados-titulo">
    <section class="container">
      <header class="section-head"><h2 id="destacados-titulo">Para qué puedes <em>visitarnos</em></h2></header>
      <section class="cols three">
        <article v-for="d in destacados" :key="d.titulo" class="mini-card">
          <h3>{{ d.titulo }}</h3>
          <p>{{ d.texto }}</p>
        </article>
      </section>
      <p style="margin-top:1.25rem"><RouterLink to="/servicios">Ver los seis servicios</RouterLink></p>
    </section>
  </section>

  <section class="section" aria-labelledby="horario-titulo">
    <section class="container">
      <HorarioBox />
    </section>
  </section>
</template>
