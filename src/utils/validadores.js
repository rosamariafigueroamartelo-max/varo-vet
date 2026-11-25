// Validadores pequeños: cada uno recibe (valor, datos) y devuelve el mensaje de error o ''.

const vacio = (v) => v === '' || v == null || (typeof v === 'string' && v.trim() === '');

export const requerido = (mensaje = 'Este campo es obligatorio.') => (v) => (vacio(v) ? mensaje : '');

// Ejecuta los validadores en orden y devuelve el primer error.
export const combinar = (...validadores) => (valor, datos) => {
  for (const validar of validadores) {
    const mensaje = validar(valor, datos);
    if (mensaje) return mensaje;
  }
  return '';
};

// Aplica el validador solo si el campo tiene algo escrito (campos opcionales).
export const siHayValor = (validador) => (valor, datos) => (vacio(valor) ? '' : validador(valor, datos));

export const nombreCompleto = (v) => {
  const texto = String(v).trim();
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]{3,60}$/.test(texto)) return 'Solo letras y espacios, entre 3 y 60 caracteres.';
  return texto.split(/\s+/).length < 2 ? 'Escribe tu nombre y tu apellido.' : '';
};

export const telefonoColombia = (v) =>
  /^3\d{9}$/.test(String(v).trim()) ? '' : 'Celular colombiano de 10 dígitos que empieza por 3.';

export const correo = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()) ? '' : 'Escribe un correo válido, por ejemplo nombre@correo.com.';

export const longitud = (min, max) => (v) => {
  const n = String(v).trim().length;
  if (n < min) return `Escribe al menos ${min} caracteres (llevas ${n}).`;
  if (n > max) return `Escribe máximo ${max} caracteres.`;
  return '';
};

export const entero = (min, max) => (v) => {
  const n = Number(v);
  if (!Number.isInteger(n)) return 'Escribe un número entero, sin decimales.';
  return n < min || n > max ? `Debe estar entre ${min} y ${max}.` : '';
};
