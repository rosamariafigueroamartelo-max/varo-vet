// Fechas en hora local (toISOString usaría UTC y cambiaría el día por la noche en Colombia).

// Festivos de Colombia dentro del rango del formulario: la clínica cierra.
export const FESTIVOS = new Set([
  '2026-12-08', '2026-12-25', '2027-01-01', '2027-01-11', '2027-03-22', '2027-03-25', '2027-03-26'
]);

export function fechaISO(fecha = new Date()) {
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${m}-${d}`;
}

export function aFecha(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

export function fechaLarga(iso) {
  return aFecha(iso).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function horaLegible(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const sufijo = h >= 12 ? 'p.m.' : 'a.m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${sufijo}`;
}

// Para buscar sin importar tildes ni mayúsculas.
export function normalizar(texto) {
  return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
