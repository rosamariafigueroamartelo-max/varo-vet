<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import FormField from '@/components/FormField.vue';
import HoraSelector from '@/components/HoraSelector.vue';
import CitasPanel from '@/components/CitasPanel.vue';
import StatusAlert from '@/components/StatusAlert.vue';
import { useForm } from '@/composables/useForm';
import { useServicios } from '@/composables/useServicios';
import { useCitas } from '@/store/citas';
import { enviarJSON, ApiError } from '@/services/api';
import { aFecha, fechaISO, fechaLarga, horaLegible, FESTIVOS } from '@/utils/fechas';
import { requerido, combinar, siHayValor, nombreCompleto, telefonoColombia, correo, longitud, entero } from '@/utils/validadores';
import fotoAgendar from '@/assets/img/agendar.png';

// Servicio simulado (JSONPlaceholder): responde 201 al crear y 200 al modificar, pero no guarda nada de verdad.
const URL_API = 'https://jsonplaceholder.typicode.com/posts';
const FECHA_MAX = '2027-03-31';
const TIPOS = ['Perro', 'Gato', 'Ave', 'Conejo', 'Otro'];

const route = useRoute();
const router = useRouter();
const { servicios, cargando: cargandoServicios, error: errorServicios, recargar } = useServicios();
const { obtener, agregar, actualizar, hayChoque, horasOcupadas } = useCitas();
const hoy = fechaISO();

// Id de la cita que se está modificando ('' = cita nueva).
const editandoId = ref('');
const editando = computed(() => Boolean(editandoId.value));

/* ---------- Reglas de negocio ---------- */
function reglaFecha(iso) {
  if (iso < hoy) return 'La fecha no puede ser anterior a hoy.';
  if (iso > FECHA_MAX) return `Solo agendamos hasta el ${fechaLarga(FECHA_MAX)}.`;
  if (aFecha(iso).getDay() === 0) return 'Los domingos la clínica está cerrada. Elige de lunes a sábado.';
  if (FESTIVOS.has(iso)) return 'Ese día es festivo y la clínica está cerrada.';
  return '';
}

function reglaHora(hhmm, datos) {
  if (!datos.fecha) return 'Elige primero la fecha.';
  const [h, m] = hhmm.split(':').map(Number);
  const minutos = h * 60 + m;
  if (m % 30 !== 0) return 'Las citas son cada 30 minutos (por ejemplo 9:00 o 9:30).';

  const sabado = aFecha(datos.fecha).getDay() === 6;
  const ultima = sabado ? 12 * 60 + 30 : 17 * 60 + 30;
  if (minutos < 8 * 60) return 'La clínica abre a las 8:00 a.m.';
  if (minutos > ultima) return `La última cita ${sabado ? 'del sábado' : 'del día'} es a las ${sabado ? '12:30 p.m.' : '5:30 p.m.'} Elige otra hora.`;

  if (datos.fecha === hoy) {
    const ahora = new Date();
    if (minutos <= ahora.getHours() * 60 + ahora.getMinutes()) return 'Esa hora ya pasó. Elige una posterior.';
  }
  if (hayChoque(datos.fecha, hhmm, editandoId.value)) return 'Ya tienes una cita programada para ese día y esa hora.';
  return '';
}

const reglas = {
  propietario: combinar(requerido(), nombreCompleto),
  telefono: combinar(requerido(), telefonoColombia),
  correo: combinar(requerido(), correo),
  mascota: combinar(requerido(), longitud(2, 30)),
  tipo: requerido('Selecciona una opción.'),
  edad: siHayValor(entero(0, 30)),
  servicio: requerido('Selecciona una opción.'),
  fecha: combinar(requerido(), reglaFecha),
  hora: combinar(requerido('Elige una hora.'), reglaHora),
  acepto: (v) => (v ? '' : 'Debes aceptar para poder continuar.')
};

const VACIO = { propietario: '', telefono: '', correo: '', mascota: '', tipo: '', edad: '', servicio: '', fecha: '', hora: '', acepto: false };
const form = useForm(VACIO, reglas, {
  claveBorrador: 'borrador-cita',
  excluir: ['acepto'],
  guardarSi: () => !editando.value // al modificar una cita no se toca el borrador
});
const { datos, errores, tocados, tocar } = form;

const ocupadas = computed(() => (datos.fecha ? horasOcupadas(datos.fecha, editandoId.value) : []));

// Si cambia la fecha y la hora elegida ya no existe ese día (por ejemplo un sábado por la tarde), se borra.
watch(() => datos.fecha, (nueva, vieja) => {
  if (vieja !== undefined && nueva !== vieja && datos.hora && reglaHora(datos.hora, datos)) datos.hora = '';
});

/* ---------- Estado del envío ---------- */
const fase = ref('inactivo'); // inactivo | invalido | enviando | error | exito
const mensaje = ref('');
const resultado = ref(null);
const borradorVisible = ref(form.hayBorrador);

/* ---------- Modificar una cita (?editar=id) ---------- */
function abrirEdicion(id) {
  const cita = obtener(id);
  if (!cita || cita.estado !== 'programada') {
    if (id) {
      fase.value = 'error';
      mensaje.value = 'No encontramos esa cita o ya está cancelada, así que no se puede modificar.';
    }
    editandoId.value = '';
    return;
  }
  editandoId.value = id;
  borradorVisible.value = false;
  fase.value = 'inactivo';
  form.cargar({ ...VACIO, ...cita, edad: cita.edad ? String(cita.edad) : '', acepto: true });
  nextTick(() => document.getElementById('cita-titulo')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

watch(() => route.query.editar, (id) => {
  if (id) abrirEdicion(String(id));
  else if (editando.value) salirEdicion(false);
}, { immediate: true });

function salirEdicion(cambiarRuta = true) {
  editandoId.value = '';
  form.reiniciar();
  if (cambiarRuta && route.query.editar) router.replace({ name: 'agendar' });
}

function modificarDesdeLista(id) {
  router.replace({ name: 'agendar', query: { editar: id } });
}

// Si llegas desde el detalle de un servicio (?servicio=vacunacion), queda preseleccionado.
watch(servicios, (lista) => {
  const pedido = route.query.servicio;
  if (!editando.value && pedido && lista.some((s) => s.id === pedido)) datos.servicio = pedido;
}, { immediate: true });

/* ---------- Envío ---------- */
async function enviar() {
  if (fase.value === 'enviando') return;
  borradorVisible.value = false;

  const primero = form.validarTodo();
  if (primero) {
    const n = form.contarErrores();
    mensaje.value = n === 1 ? 'Hay 1 campo por corregir antes de enviar.' : `Hay ${n} campos por corregir antes de enviar.`;
    fase.value = 'invalido';
    await nextTick();
    document.getElementById(`cita-${primero}`)?.focus();
    return;
  }

  fase.value = 'enviando';
  try {
    const { acepto, ...cuerpo } = datos; // el consentimiento no hace falta enviarlo
    const servicio = servicios.value.find((s) => s.id === cuerpo.servicio);
    const cita = { ...cuerpo, servicioNombre: servicio ? servicio.nombre : cuerpo.servicio };

    if (editando.value) {
      await enviarJSON(`${URL_API}/1`, cita, 'PUT'); // PUT = modificar
      resultado.value = { ...actualizar(editandoId.value, cita), modificada: true };
      editandoId.value = '';
      form.reiniciar();
      if (route.query.editar) router.replace({ name: 'agendar' });
    } else {
      await enviarJSON(URL_API, cita); // POST = crear
      resultado.value = { ...agregar(cita), modificada: false };
      form.reiniciar();
    }
    fase.value = 'exito';
  } catch (err) {
    mensaje.value = err instanceof ApiError ? err.message : 'Ocurrió un error inesperado. Intenta de nuevo.';
    fase.value = 'error';
  }
}

function irALista() {
  document.getElementById('panel-citas-titulo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function descartarBorrador() {
  form.reiniciar();
  borradorVisible.value = false;
}
</script>

<template>
  <section class="booking" aria-labelledby="cita-titulo">
    <picture class="booking-photo">
      <img :src="fotoAgendar" alt="Gato atigrado en brazos de una veterinaria con guantes azules" width="612" height="595" fetchpriority="high">
    </picture>
    <header class="booking-title">
      <h1 id="cita-titulo"><template v-if="editando"><em>Modificar</em> tu cita</template><template v-else><em>Datos</em> para tu cita</template></h1>
    </header>

    <form :class="['form', 'form-box', 'booking-form', { editando }]" novalidate @submit.prevent="enviar">
      <StatusAlert v-if="editando" tipo="info" accion="Cancelar modificación" @accion="salirEdicion()">
        Estás modificando la cita de {{ datos.mascota || 'tu mascota' }}. Cambia lo que necesites y pulsa «Guardar cambios».
      </StatusAlert>

      <section class="form-grid">
        <FormField id="cita-propietario" v-model="datos.propietario" label="Nombre completo" required full
          :error="errores.propietario" :tocado="tocados.propietario" maxlength="60" autocomplete="name"
          placeholder="Ingresar su nombre" @blur="tocar('propietario')" />
        <FormField id="cita-telefono" v-model="datos.telefono" label="Teléfono" type="tel" required
          :error="errores.telefono" :tocado="tocados.telefono" autocomplete="tel" maxlength="10"
          placeholder="Ingresar su teléfono" @blur="tocar('telefono')" />
        <FormField id="cita-correo" v-model="datos.correo" label="Correo electrónico" type="email" required
          :error="errores.correo" :tocado="tocados.correo" autocomplete="email"
          placeholder="nombre@correo.com" @blur="tocar('correo')" />
        <FormField id="cita-mascota" v-model="datos.mascota" label="Mascota" required
          :error="errores.mascota" :tocado="tocados.mascota" maxlength="30"
          placeholder="Ingrese el nombre de la mascota" @blur="tocar('mascota')" />
        <FormField id="cita-tipo" v-model="datos.tipo" as="select" label="Tipo de mascota" required
          :error="errores.tipo" :tocado="tocados.tipo" @blur="tocar('tipo')">
          <option value="">Seleccione el tipo de mascota</option>
          <option v-for="tipo in TIPOS" :key="tipo" :value="tipo">{{ tipo }}</option>
        </FormField>
        <FormField id="cita-edad" v-model="datos.edad" label="Edad de la mascota (años)" type="number"
          :error="errores.edad" :tocado="tocados.edad" min="0" max="30" step="1" inputmode="numeric"
          placeholder="Entre 0 y 30" @blur="tocar('edad')" />

        <FormField v-if="servicios.length" id="cita-servicio" v-model="datos.servicio" as="select" label="Servicio" required
          :error="errores.servicio" :tocado="tocados.servicio" @blur="tocar('servicio')">
          <option value="">Seleccione un servicio</option>
          <option v-for="s in servicios" :key="s.id" :value="s.id">{{ s.nombre }}</option>
        </FormField>
        <StatusAlert v-else-if="cargandoServicios" tipo="cargando">Cargando servicios…</StatusAlert>
        <StatusAlert v-else tipo="error" accion="Reintentar" @accion="recargar">{{ errorServicios }}</StatusAlert>

        <FormField id="cita-fecha" v-model="datos.fecha" label="Fecha" type="date" required
          :error="errores.fecha" :tocado="tocados.fecha" :min="hoy" :max="FECHA_MAX" @blur="tocar('fecha')" />

        <HoraSelector v-model="datos.hora" :fecha="errores.fecha ? '' : datos.fecha" :ocupadas="ocupadas"
          :error="errores.hora" @blur="tocar('hora')" />

        <p class="check full">
          <input id="cita-acepto" v-model="datos.acepto" type="checkbox"
            :aria-invalid="errores.acepto ? 'true' : null" :aria-describedby="errores.acepto ? 'error-cita-acepto' : null"
            @change="tocar('acepto')">
          <label for="cita-acepto">Acepto que VaRo Vet use mis datos para gestionar esta cita. <span class="req">*</span></label>
          <small v-if="errores.acepto" id="error-cita-acepto" class="field-error">{{ errores.acepto }}</small>
        </p>
      </section>

      <StatusAlert v-if="fase === 'enviando'" tipo="cargando">{{ editando ? 'Guardando los cambios…' : 'Enviando tu solicitud…' }}</StatusAlert>
      <StatusAlert v-else-if="fase === 'invalido'" tipo="error">{{ mensaje }}</StatusAlert>
      <StatusAlert v-else-if="fase === 'error'" tipo="error" accion="Reintentar" @accion="enviar">{{ mensaje }} Tus datos siguen en el formulario.</StatusAlert>
      <StatusAlert v-else-if="fase === 'exito'" tipo="exito">
        <template v-if="resultado.modificada">Guardamos los cambios. La cita de {{ resultado.mascota }} quedó para el {{ fechaLarga(resultado.fecha) }} a las {{ horaLegible(resultado.hora) }}</template>
        <template v-else>¡Listo! Recibimos la solicitud para {{ resultado.mascota }}: {{ fechaLarga(resultado.fecha) }} a las {{ horaLegible(resultado.hora) }}</template>
        &nbsp;<a href="#panel-citas-titulo" @click.prevent="irALista">Ver la cita en la lista</a>
      </StatusAlert>
      <StatusAlert v-else-if="borradorVisible" tipo="info" accion="Descartar" @accion="descartarBorrador">Recuperamos los datos que habías empezado a escribir.</StatusAlert>

      <p class="form-actions">
        <button class="btn btn-primary btn-block" type="submit" :disabled="fase === 'enviando'">
          <template v-if="fase === 'enviando'">{{ editando ? 'Guardando…' : 'Enviando…' }}</template>
          <template v-else>{{ editando ? 'Guardar cambios' : 'Enviar solicitud de cita' }}</template>
        </button>
        <button v-if="editando" class="btn btn-outline btn-block" type="button" @click="salirEdicion()">Cancelar modificación</button>
      </p>
    </form>
  </section>

  <section class="section light">
    <section class="container">
      <CitasPanel :editando-id="editandoId" @modificar="modificarDesdeLista" />
      <p class="citas-nueva"><RouterLink to="/mis-citas">Abrir «Mis citas» en su propia página</RouterLink></p>
    </section>
  </section>
</template>
