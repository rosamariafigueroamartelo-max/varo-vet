// Lectura y escritura en localStorage (todo en JSON, con el prefijo "varovet:").
const PREFIJO = 'varovet:';

export function leer(clave, porDefecto) {
  try {
    const crudo = localStorage.getItem(PREFIJO + clave);
    return crudo === null ? porDefecto : JSON.parse(crudo);
  } catch (err) {
    return porDefecto; // JSON dañado o almacenamiento bloqueado
  }
}

export function guardar(clave, valor) {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
    return true;
  } catch (err) {
    return false; // modo privado o cuota llena
  }
}

export function borrar(clave) {
  try {
    localStorage.removeItem(PREFIJO + clave);
  } catch (err) {
    /* sin acceso */
  }
}

export function nuevoId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
