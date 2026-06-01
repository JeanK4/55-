// Helpers de formato de fechas en español (Colombia)

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const DIAS = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado',
];

export function formatearFechaLarga(iso: string): string {
  const d = new Date(iso);
  const dia = DIAS[d.getDay()];
  const num = d.getDate();
  const mes = MESES[d.getMonth()];
  return `${capitalizar(dia)} ${num} de ${mes}`;
}

export function formatearFechaCorta(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`;
}

export function formatearHora(iso: string): string {
  const d = new Date(iso);
  let hh = d.getHours();
  const mm = d.getMinutes().toString().padStart(2, '0');
  const ampm = hh >= 12 ? 'p.m.' : 'a.m.';
  hh = hh % 12 || 12;
  return `${hh}:${mm} ${ampm}`;
}

export function formatearDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

function capitalizar(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function diasDesdeHoy(iso: string): number {
  const d = new Date(iso);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}
