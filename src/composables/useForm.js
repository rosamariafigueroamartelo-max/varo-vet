import { reactive, watch } from 'vue';
import { leer, guardar, borrar } from '@/services/storage';

/**
 * Formulario reactivo con validación en tiempo real.
 * - datos: valores de los campos (se usan con v-model)
 * - errores: mensaje de error de cada campo
 * - tocados: campos que el usuario ya visitó (solo a esos se les muestra el error mientras escribe)
 * - claveBorrador: si se pasa, lo que se escribe queda guardado en localStorage
 */
export function useForm(iniciales, reglas, { claveBorrador = null, excluir = [], guardarSi = () => true } = {}) {
  const datos = reactive({ ...iniciales });
  const errores = reactive({});
  const tocados = reactive({});
  const nombres = Object.keys(reglas);
  let hayBorrador = false;

  if (claveBorrador) {
    const guardado = leer(claveBorrador, null);
    if (guardado && typeof guardado === 'object') {
      Object.keys(iniciales).forEach((nombre) => {
        const valor = guardado[nombre];
        if (!excluir.includes(nombre) && typeof valor === 'string' && valor !== '') {
          datos[nombre] = valor;
          hayBorrador = true;
        }
      });
    }
  }

  function validarCampo(nombre) {
    const regla = reglas[nombre];
    errores[nombre] = regla ? regla(datos[nombre], datos) || '' : '';
    return errores[nombre];
  }

  function tocar(nombre) {
    tocados[nombre] = true;
    validarCampo(nombre);
  }

  // Cada vez que cambia algo, se revalidan los campos ya tocados (así "hora" reacciona a "fecha")
  // y se actualiza el borrador.
  watch(datos, () => {
    nombres.forEach((nombre) => {
      if (tocados[nombre]) validarCampo(nombre);
    });
    if (!claveBorrador || !guardarSi()) return;
    const copia = {};
    Object.keys(iniciales).forEach((nombre) => {
      if (!excluir.includes(nombre) && typeof datos[nombre] === 'string') copia[nombre] = datos[nombre];
    });
    if (Object.values(copia).every((v) => v === '')) borrar(claveBorrador);
    else guardar(claveBorrador, copia);
  }, { deep: true });

  // Valida todo y devuelve el nombre del primer campo con error ('' si todo está bien).
  function validarTodo() {
    let primero = '';
    nombres.forEach((nombre) => {
      tocados[nombre] = true;
      if (validarCampo(nombre) && !primero) primero = nombre;
    });
    return primero;
  }

  const contarErrores = () => nombres.filter((nombre) => errores[nombre]).length;

  // Llena el formulario con valores (por ejemplo, una cita que se va a modificar).
  function cargar(valores) {
    Object.keys(iniciales).forEach((nombre) => {
      if (valores[nombre] !== undefined) datos[nombre] = valores[nombre];
    });
    nombres.forEach((nombre) => { tocados[nombre] = false; errores[nombre] = ''; });
  }

  function reiniciar() {
    Object.keys(iniciales).forEach((nombre) => { datos[nombre] = iniciales[nombre]; });
    nombres.forEach((nombre) => { tocados[nombre] = false; errores[nombre] = ''; });
    if (claveBorrador) borrar(claveBorrador);
  }

  return { datos, errores, tocados, tocar, validarTodo, contarErrores, cargar, reiniciar, hayBorrador };
}
