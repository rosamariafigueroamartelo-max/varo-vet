<script setup>
import { RouterLink } from 'vue-router';
import HorarioBox from '@/components/HorarioBox.vue';
import fotoNosotros from '@/assets/img/nosotros.png';

const areas = [
  { titulo: 'Medicina general', texto: 'Consultas, vacunación y control del crecimiento.' },
  { titulo: 'Cirugía y hospitalización', texto: 'Procedimientos y cuidado durante la recuperación.' }
];
</script>

<template>
  <section class="hero" aria-labelledby="nosotros-titulo">
    <span class="blob-mint bl" aria-hidden="true"></span>
    <span class="deco paw-brown d3" aria-hidden="true"></span>
    <span class="deco paw-brown d5" aria-hidden="true"></span>
    <span class="deco paw-brown d6" aria-hidden="true"></span>
    <article class="hero-text">
      <h1 id="nosotros-titulo">Sobre <em>Nosotros</em></h1>
      <p>Amamos a los animales tanto como tú. Somos una clínica entregada al bienestar</p>
      <p class="pill"><i class="fa-solid fa-paw" aria-hidden="true"></i> Tu mascota es nuestra prioridad</p>
      <p class="btn-actions"><RouterLink class="btn btn-primary btn-block" to="/agendar-cita">Agenda tu cita</RouterLink></p>
    </article>
    <picture class="hero-photo">
      <img :src="fotoNosotros" alt="Veterinario sonriente sostiene a un perro que se apoya en su pecho" width="862" height="661" fetchpriority="high">
    </picture>
  </section>

  <section class="section light" aria-labelledby="mision-titulo">
    <section class="container cols">
      <article>
        <h2 id="mision-titulo">Nuestra <em>misión</em></h2>
        <p>Cuidar la salud y el bienestar de las mascotas con atención profesional, cercana y honesta. Te explicamos cada procedimiento con palabras sencillas para que decidas con tranquilidad.</p>
        <section class="cols even">
          <article v-for="a in areas" :key="a.titulo" class="mini-card">
            <h3>{{ a.titulo }}</h3>
            <p>{{ a.texto }}</p>
          </article>
        </section>
      </article>
      <HorarioBox />
    </section>
  </section>
</template>
