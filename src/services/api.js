// Peticiones HTTP con fetch + async/await y manejo de errores (404, 500, red, tiempo de espera).

export class ApiError extends Error {
  constructor(mensaje, { status = 0, tipo = 'desconocido' } = {}) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.tipo = tipo;
  }
}

function mensajeParaEstado(status) {
  if (status === 404) return 'No encontramos lo que buscabas (error 404).';
  if (status === 400 || status === 422) return `El servidor no aceptó los datos enviados (error ${status}).`;
  if (status === 401 || status === 403) return `No tienes permiso para hacer esta acción (error ${status}).`;
  if (status >= 500) return `El servidor tuvo un problema (error ${status}). Intenta de nuevo en unos minutos.`;
  return `La solicitud falló (error ${status}).`;
}

async function pedir(url, opciones = {}, tiempoMax = 10000) {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), tiempoMax);
  let respuesta;
  try {
    respuesta = await fetch(url, { ...opciones, signal: controlador.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('La solicitud tardó demasiado. Revisa tu conexión e intenta de nuevo.', { tipo: 'timeout' });
    }
    throw new ApiError('No pudimos conectarnos con el servidor. Revisa tu conexión a internet.', { tipo: 'red' });
  } finally {
    clearTimeout(temporizador);
  }

  if (!respuesta.ok) {
    throw new ApiError(mensajeParaEstado(respuesta.status), { status: respuesta.status, tipo: 'http' });
  }
  try {
    return await respuesta.json();
  } catch (err) {
    throw new ApiError('La respuesta del servidor no tiene el formato esperado.', { status: respuesta.status, tipo: 'formato' });
  }
}

export function obtenerJSON(url) {
  return pedir(url, { headers: { Accept: 'application/json' } });
}

export function enviarJSON(url, datos, metodo = 'POST') {
  return pedir(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json; charset=UTF-8', Accept: 'application/json' },
    body: JSON.stringify(datos)
  });
}
