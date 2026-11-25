<script setup>
import { ref, nextTick } from 'vue';
import FormField from '@/components/FormField.vue';
import StatusAlert from '@/components/StatusAlert.vue';
import { useForm } from '@/composables/useForm';
import { enviarJSON, ApiError } from '@/services/api';
import { leer, guardar, nuevoId } from '@/services/storage';
import { requerido, combinar, siHayValor, nombreCompleto, telefonoColombia, correo, longitud } from '@/utils/validadores';
import fotoContacto from '@/assets/img/contacto.jpg';

const URL_API = 'https://jsonplaceholder.typicode.com/posts';

const datosContacto = [
  { icono: 'fa-solid fa-location-dot', titulo: 'Dirección', lineas: ['Cr 20 #123-45', 'Sahagún-Colombia'] },
  { icono: 'fa-solid fa-phone-volume', titulo: 'Teléfono', telefonos: ['3243630825', '3024369562'] },
  { icono: 'fa-regular fa-envelope', titulo: 'Correo', correo: 'VaroVet@gmail.com' },
  { icono: 'fa-regular fa-clock', titulo: 'Horario', lineas: ['Lunes a Viernes: 8:00 a.m - 6:00 p.m', 'Sábado: 8:00 a.m - 1:00 p.m'] }
];

const ASUNTOS = ['Consulta sobre un servicio', 'Cambiar o cancelar una cita', 'Resultados de exámenes', 'Otro'];

const reglas = {
  nombre: combinar(requerido(), nombreCompleto),
  correo: combinar(requerido(), correo),
  telefono: siHayValor(telefonoColombia),
  asunto: requerido('Selecciona una opción.'),
  mensaje: combinar(requerido(), longitud(10, 500)),
  acepto: (v) => (v ? '' : 'Debes aceptar para poder continuar.')
};

const form = useForm(
  { nombre: '', correo: '', telefono: '', asunto: '', mensaje: '', acepto: false },
  reglas,
  { claveBorrador: 'borrador-contacto', excluir: ['acepto'] }
);
const { datos, errores, tocados, tocar } = form;

const fase = ref('inactivo'); // inactivo | invalido | enviando | error | exito
const aviso = ref('');
const borradorVisible = ref(form.hayBorrador);

async function enviar() {
  if (fase.value === 'enviando') return;
  borradorVisible.value = false;

  const primero = form.validarTodo();
  if (primero) {
    const n = form.contarErrores();
    aviso.value = n === 1 ? 'Hay 1 campo por corregir antes de enviar.' : `Hay ${n} campos por corregir antes de enviar.`;
    fase.value = 'invalido';
    await nextTick();
    const campo = document.getElementById(`contacto-${primero}`);
    if (campo) campo.focus();
    return;
  }

  fase.value = 'enviando';
  try {
    const { acepto, ...cuerpo } = datos;
    await enviarJSON(URL_API, cuerpo);
    // Copia local de los mensajes enviados.
    const guardados = leer('mensajes', []);
    guardar('mensajes', [...(Array.isArray(guardados) ? guardados : []), { id: nuevoId(), creadaEn: new Date().toISOString(), ...cuerpo }]);
    aviso.value = `Gracias, ${cuerpo.nombre.split(' ')[0]}. Recibimos tu mensaje y te responderemos al correo ${cuerpo.correo}.`;
    form.reiniciar();
    fase.value = 'exito';
  } catch (err) {
    aviso.value = err instanceof ApiError ? err.message : 'Ocurrió un error inesperado. Intenta de nuevo.';
    fase.value = 'error';
  }
}

function borrarTodo() {
  form.reiniciar();
  fase.value = 'inactivo';
  borradorVisible.value = false;
}
</script>

<template>
  <section class="contact-hero" aria-labelledby="contacto-titulo">
    <span class="deco paw-line d1" aria-hidden="true"></span>
    <span class="deco leaf d2" aria-hidden="true"></span>
    <figure class="contact-photo" style="margin:0">
      <img :src="fotoContacto" alt="Un perro golden retriever y un gato gris, juntos" width="594" height="628">
    </figure>
    <article>
      <h1 id="contacto-titulo" class="sr-only">Contactos</h1>
      <dl class="contact-list">
        <div v-for="d in datosContacto" :key="d.titulo">
          <dt><i :class="d.icono" aria-hidden="true"></i></dt>
          <dd>
            <strong>{{ d.titulo }}</strong>
            <template v-if="d.lineas"><template v-for="(linea, i) in d.lineas" :key="linea">{{ linea }}<br v-if="i < d.lineas.length - 1"></template></template>
            <template v-else-if="d.telefonos"><template v-for="(tel, i) in d.telefonos" :key="tel"><a :href="`tel:+57${tel}`">{{ tel }}</a><template v-if="i < d.telefonos.length - 1">-</template></template></template>
            <a v-else :href="`mailto:${d.correo}`">{{ d.correo }}</a>
          </dd>
        </div>
      </dl>
    </article>
  </section>

  <section class="section light" aria-labelledby="mensaje-titulo">
    <section class="container">
      <header class="section-head"><h2 id="mensaje-titulo">Envíanos un <em>mensaje</em></h2></header>
      <form class="form form-box" novalidate @submit.prevent="enviar" @reset.prevent="borrarTodo">
        <section class="form-grid">
          <FormField id="contacto-nombre" v-model="datos.nombre" label="Nombre completo" required
            :error="errores.nombre" :tocado="tocados.nombre" maxlength="60" autocomplete="name"
            placeholder="Ingresar su nombre" @blur="tocar('nombre')" />
          <FormField id="contacto-correo" v-model="datos.correo" label="Correo electrónico" type="email" required
            :error="errores.correo" :tocado="tocados.correo" autocomplete="email"
            placeholder="nombre@correo.com" @blur="tocar('correo')" />
          <FormField id="contacto-telefono" v-model="datos.telefono" label="Teléfono" type="tel"
            :error="errores.telefono" :tocado="tocados.telefono" autocomplete="tel"
            placeholder="3001234567" @blur="tocar('telefono')" />
          <FormField id="contacto-asunto" v-model="datos.asunto" as="select" label="Asunto" required
            :error="errores.asunto" :tocado="tocados.asunto" @blur="tocar('asunto')">
            <option value="">Seleccione un asunto</option>
            <option v-for="a in ASUNTOS" :key="a" :value="a">{{ a }}</option>
          </FormField>
          <FormField id="contacto-mensaje" v-model="datos.mensaje" as="textarea" label="Mensaje" required full
            :error="errores.mensaje" :tocado="tocados.mensaje" maxlength="500" placeholder="Escribe tu mensaje"
            pista="Entre 10 y 500 caracteres." @blur="tocar('mensaje')" />
          <p class="check full">
            <input id="contacto-acepto" v-model="datos.acepto" type="checkbox"
              :aria-invalid="errores.acepto ? 'true' : null" :aria-describedby="errores.acepto ? 'error-contacto-acepto' : null"
              @change="tocar('acepto')">
            <label for="contacto-acepto">Acepto que VaRo Vet use mis datos para responder este mensaje. <span class="req">*</span></label>
            <small v-if="errores.acepto" id="error-contacto-acepto" class="field-error">{{ errores.acepto }}</small>
          </p>
        </section>

        <StatusAlert v-if="fase === 'enviando'" tipo="cargando">Enviando tu mensaje…</StatusAlert>
        <StatusAlert v-else-if="fase === 'invalido'" tipo="error">{{ aviso }}</StatusAlert>
        <StatusAlert v-else-if="fase === 'error'" tipo="error" accion="Reintentar" @accion="enviar">{{ aviso }} Tus datos siguen en el formulario.</StatusAlert>
        <StatusAlert v-else-if="fase === 'exito'" tipo="exito">{{ aviso }}</StatusAlert>
        <StatusAlert v-else-if="borradorVisible" tipo="info" accion="Descartar" @accion="borrarTodo">Recuperamos los datos que habías empezado a escribir.</StatusAlert>

        <p class="form-actions">
          <button class="btn btn-primary" type="submit" :disabled="fase === 'enviando'">{{ fase === 'enviando' ? 'Enviando…' : 'Enviar mensaje' }}</button>
          <button class="btn btn-outline" type="reset">Borrar</button>
        </p>
      </form>
    </section>
  </section>
</template>
