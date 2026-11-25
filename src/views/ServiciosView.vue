<script setup>
import { ref, computed } from 'vue';
import FormField from '@/components/FormField.vue';
import ServiceCard from '@/components/ServiceCard.vue';
import StatusAlert from '@/components/StatusAlert.vue';
import { useServicios } from '@/composables/useServicios';
import { normalizar } from '@/utils/fechas';

const { servicios, cargando, error, recargar } = useServicios();
const busqueda = ref('');

const visibles = computed(() => {
  const texto = normalizar(busqueda.value);
  return servicios.value.filter((s) => !texto || normalizar(`${s.nombre} ${s.descripcion}`).includes(texto));
});
</script>

<template>
  <header class="page-title">
    <span class="deco paw-line d1" aria-hidden="true"></span>
    <span class="deco paw-line d2" aria-hidden="true"></span>
    <span class="hill" aria-hidden="true"></span>
    <h1>Nuestros servicios</h1>
    <p>Cuidado integral para tu mascota</p>
  </header>
  <section class="services" aria-label="Lista de servicios">
    <span class="deco leaf d-leaf-l" aria-hidden="true"></span>
    <span class="deco leaf d-leaf-r" aria-hidden="true"></span>
    <span class="deco paw-brown d-paw-a" aria-hidden="true"></span>

    <section class="services-buscar" role="search" aria-label="Buscar servicios">
      <FormField id="servicios-buscar" v-model="busqueda" label="Buscar un servicio" type="search" placeholder="Por ejemplo: vacunas" autocomplete="off" :disabled="cargando || Boolean(error)" />
      <p v-if="servicios.length && visibles.length" class="citas-resumen" aria-live="polite">Mostrando {{ visibles.length }} de {{ servicios.length }} servicios.</p>
    </section>

    <section class="services-estado">
      <StatusAlert v-if="cargando" tipo="cargando">Cargando servicios…</StatusAlert>
      <StatusAlert v-else-if="error" tipo="error" accion="Reintentar" @accion="recargar">{{ error }}</StatusAlert>
      <StatusAlert v-else-if="servicios.length && !visibles.length" tipo="error" accion="Limpiar búsqueda" @accion="busqueda = ''">
        No encontramos ningún servicio con «{{ busqueda.trim() }}». Revisa cómo lo escribiste o prueba con otra palabra, por ejemplo «vacuna» o «baño».
      </StatusAlert>
    </section>

    <ul class="service-list">
      <li v-for="s in visibles" :key="s.id"><ServiceCard :servicio="s" /></li>
    </ul>
  </section>
</template>
