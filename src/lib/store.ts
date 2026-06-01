'use client';

import type {
  Usuario,
  Actividad,
  Reserva,
  Pago,
  Calificacion,
  Notificacion,
  Conversacion,
  Mensaje,
  Propuesta,
  PropuestaComentario,
  VinculoCuidador,
  ListaEspera,
  JuegoSesion,
  FavoritoSalud,
  RecomendacionSalud,
  MetodoPago,
  EstadoPago,
} from './types';
import {
  ACTIVIDADES_DEMO,
  PROVEEDORES_DEMO,
  ADULTOS_DEMO,
  CUIDADORES_DEMO,
} from '@/data/seed';

// =============================================================
// Capa de persistencia (Sprint 1)
// Usa localStorage para que el demo funcione sin backend.
// En Sprint 2 se reemplaza por API REST / Supabase.
// =============================================================

const KEYS = {
  usuarios: 'club55_usuarios',
  actividades: 'club55_actividades',
  reservas: 'club55_reservas',
  pagos: 'club55_pagos',
  calificaciones: 'club55_calificaciones',
  notificaciones: 'club55_notificaciones',
  conversaciones: 'club55_conversaciones',
  mensajes: 'club55_mensajes',
  propuestas: 'club55_propuestas',
  propuestaComentarios: 'club55_propuestas_comentarios',
  vinculos: 'club55_vinculos',
  listaEspera: 'club55_lista_espera',
  juegos: 'club55_juegos',
  saludFavs: 'club55_salud_favs',
  saludRecs: 'club55_salud_recs',
  sesion: 'club55_sesion',
} as const;

const isBrowser = () => typeof window !== 'undefined';

function readArray<T>(key: string): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, value: T[]) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

const BAD_WORDS = [
  'spam',
  'fraude',
  'apuesta',
  'inapropiado',
  'violencia',
  'odio',
  'porn',
  'xxx',
];

function contieneContenidoInapropiado(texto: string) {
  const t = texto.toLowerCase();
  return BAD_WORDS.some(w => t.includes(w));
}

const RECOMENDACIONES_SALUD_SEED: RecomendacionSalud[] = [
  {
    id: 'salud-1',
    categoria: 'hidratacion',
    titulo: 'Hidrátate durante el día',
    descripcion: 'Bebe agua en pequeños sorbos cada 2 horas. Puedes sumar infusiones sin azúcar.',
    fuenteUrl: 'https://www.who.int/',
  },
  {
    id: 'salud-2',
    categoria: 'ejercicio',
    titulo: 'Camina 20 minutos suaves',
    descripcion: 'Una caminata ligera mejora la circulación y el ánimo. Ajusta el ritmo a tu comodidad.',
    fuenteUrl: 'https://www.minsalud.gov.co/',
  },
  {
    id: 'salud-3',
    categoria: 'salud_mental',
    titulo: 'Respiración consciente',
    descripcion: 'Inhala 4 segundos, retén 4, exhala 6. Repite 5 veces para reducir ansiedad.',
    fuenteUrl: 'https://www.who.int/',
  },
  {
    id: 'salud-4',
    categoria: 'alimentacion',
    titulo: 'Plato balanceado',
    descripcion: 'Incluye verduras, proteína magra y carbohidratos integrales para mantener energía estable.',
    fuenteUrl: 'https://www.fao.org/',
  },
  {
    id: 'salud-5',
    categoria: 'prevencion',
    titulo: 'Chequeos periódicos',
    descripcion: 'Realiza controles médicos y de presión arterial al menos cada 6 meses.',
    fuenteUrl: 'https://www.minsalud.gov.co/',
  },
];

// Inicializa datos de demo la primera vez
export function initStore() {
  if (!isBrowser()) return;
  const usuarios = readArray<Usuario>(KEYS.usuarios);

if (
  usuarios.some(u => u.correo === 'maria@club55.demo') &&
  usuarios.some(u => u.correo === 'laura@club55.demo') &&
  usuarios.some(u => u.correo === 'tertulia@club55.demo')
) {
  return;
}

  writeArray(KEYS.usuarios, [...PROVEEDORES_DEMO, ...ADULTOS_DEMO, ...CUIDADORES_DEMO]);
  writeArray(KEYS.actividades, ACTIVIDADES_DEMO);
  writeArray(KEYS.reservas, []);
  writeArray(KEYS.pagos, []);
  writeArray(KEYS.calificaciones, []);
  writeArray(KEYS.notificaciones, []);
  writeArray(KEYS.conversaciones, []);
  writeArray(KEYS.mensajes, []);
  writeArray(KEYS.propuestas, []);
  writeArray(KEYS.propuestaComentarios, []);
  writeArray(KEYS.vinculos, []);
  writeArray(KEYS.listaEspera, []);
  writeArray(KEYS.juegos, []);
  writeArray(KEYS.saludFavs, []);
  writeArray(KEYS.saludRecs, RECOMENDACIONES_SALUD_SEED);
  localStorage.setItem('club55_init', '1');
}

// ----------------- Usuarios -----------------

export function getUsuarios(): Usuario[] {
  return readArray<Usuario>(KEYS.usuarios);
}

export function getUsuarioPorCorreo(correo: string): Usuario | undefined {
  return getUsuarios().find(u => u.correo.toLowerCase() === correo.toLowerCase());
}

export function getUsuarioPorId(id: string): Usuario | undefined {
  return getUsuarios().find(u => u.id === id);
}

export function crearUsuario(u: Omit<Usuario, 'id' | 'fechaRegistro'>): Usuario {
  const usuarios = getUsuarios();
  if (usuarios.some(x => x.correo.toLowerCase() === u.correo.toLowerCase())) {
    throw new Error('Ya existe una cuenta con ese correo.');
  }
  const nuevo: Usuario = {
    ...u,
    id: generateId('u'),
    fechaRegistro: nowIso(),
  };
  writeArray(KEYS.usuarios, [...usuarios, nuevo]);
  return nuevo;
}

export function actualizarUsuario(id: string, cambios: Partial<Usuario>) {
  const usuarios = getUsuarios();
  const idx = usuarios.findIndex(u => u.id === id);
  if (idx === -1) return;
  usuarios[idx] = { ...usuarios[idx], ...cambios };
  writeArray(KEYS.usuarios, usuarios);
}

export function eliminarUsuario(id: string) {
  const usuarios = getUsuarios().filter(u => u.id !== id);
  writeArray(KEYS.usuarios, usuarios);
  writeArray(KEYS.reservas, getReservas().filter(r => r.usuarioId !== id));
  writeArray(KEYS.notificaciones, getNotificaciones().filter(n => n.usuarioId !== id));
  writeArray(KEYS.conversaciones, getConversaciones().filter(c => !c.participanteIds.includes(id)));
  writeArray(KEYS.mensajes, getMensajes().filter(m => m.remitenteId !== id));
  writeArray(KEYS.vinculos, getVinculos().filter(v => v.adultoMayorId !== id && v.cuidadorId !== id));
  if (isBrowser()) localStorage.removeItem(KEYS.sesion);
}

// ----------------- Sesión -----------------

export function getSesion(): Usuario | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEYS.sesion);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  } catch {
    return null;
  }
}

export function setSesion(u: Usuario | null) {
  if (!isBrowser()) return;
  if (u) localStorage.setItem(KEYS.sesion, JSON.stringify(u));
  else localStorage.removeItem(KEYS.sesion);
}

// ----------------- Actividades -----------------

export function getActividades(): Actividad[] {
  return readArray<Actividad>(KEYS.actividades);
}

export function getActividadesPublicas(): Actividad[] {
  return getActividades().filter(a => a.estado === 'activa');
}

export function getActividadPorId(id: string): Actividad | undefined {
  return getActividades().find(a => a.id === id);
}

export function getActividadesPorProveedor(proveedorId: string): Actividad[] {
  return getActividades().filter(a => a.proveedorId === proveedorId);
}

export function crearActividad(a: Omit<Actividad, 'id' | 'fechaCreacion' | 'cuposDisponibles' | 'estado'>): Actividad {
  const actividades = getActividades();
  const contenido = `${a.titulo} ${a.descripcion} ${a.condiciones ?? ''}`;
  const enRevision = contieneContenidoInapropiado(contenido);
  const nueva: Actividad = {
    ...a,
    id: generateId('act'),
    fechaCreacion: nowIso(),
    cuposDisponibles: a.cuposTotales,
    estado: enRevision ? 'revision' : 'activa',
  };
  writeArray(KEYS.actividades, [...actividades, nueva]);
  crearNotificacion(a.proveedorId, {
    tipo: 'sistema',
    titulo: enRevision ? 'Actividad en revisión' : 'Actividad publicada',
    mensaje: enRevision
      ? 'Detectamos contenido a revisar. Tu actividad quedará visible cuando sea aprobada.'
      : 'Tu actividad ya está disponible en el catálogo.',
    enlace: '/proveedor',
  });
  return nueva;
}

export function actualizarActividad(id: string, cambios: Partial<Actividad>) {
  const actividades = getActividades();
  const idx = actividades.findIndex(a => a.id === id);
  if (idx === -1) return;
  actividades[idx] = { ...actividades[idx], ...cambios };
  writeArray(KEYS.actividades, actividades);
}

export function cancelarActividad(id: string, motivo: string) {
  const act = getActividadPorId(id);
  if (!act) return;
  actualizarActividad(id, { estado: 'cancelada' });

  const reservas = getReservas();
  const actualizadas = reservas.map(r => {
    if (r.actividadId !== id || r.estado !== 'activa') return r;
    return { ...r, estado: 'cancelada', motivoCancelacion: motivo };
  });
  writeArray(KEYS.reservas, actualizadas);

  actualizadas
    .filter(r => r.actividadId === id)
    .forEach(r => {
      if (r.pagoId) actualizarPago(r.pagoId, { estado: 'reembolsado' });
      crearNotificacion(r.usuarioId, {
        tipo: 'reserva',
        titulo: 'Actividad cancelada',
        mensaje: `La actividad "${act.titulo}" fue cancelada. ${motivo}`,
        enlace: '/mis-reservas',
      });
    });
}

// ----------------- Reservas -----------------

export function getReservas(): Reserva[] {
  return normalizarReservas(readArray<Reserva>(KEYS.reservas));
}

export function getReservasUsuario(usuarioId: string): Reserva[] {
  return getReservas().filter(r => r.usuarioId === usuarioId);
}

export function getReservaActiva(usuarioId: string, actividadId: string): Reserva | undefined {
  return getReservas().find(
    r => r.usuarioId === usuarioId && r.actividadId === actividadId && r.estado === 'activa'
  );
}

function normalizarReservas(reservas: Reserva[]): Reserva[] {
  const actividades = getActividades();
  let cambio = false;

  const actualizadas: Reserva[] = reservas.map((r): Reserva => {
    if (r.estado !== 'activa') return r;

    const act = actividades.find(a => a.id === r.actividadId);
    if (!act) return r;

    if (new Date(act.fechaHora) < new Date()) {
      cambio = true;

      return {
        ...r,
        estado: 'finalizada',
      };
    }

    return r;
  });

  if (cambio) {
    writeArray(KEYS.reservas, actualizadas);
  }

  return actualizadas;
}

export function crearReserva(usuarioId: string, actividadId: string, metodoPago?: MetodoPago): Reserva {
  const actividad = getActividadPorId(actividadId);
  if (!actividad) throw new Error('Actividad no encontrada.');
  if (actividad.estado !== 'activa') throw new Error('Esta actividad no está disponible.');
  if (actividad.cuposDisponibles <= 0) throw new Error('No hay cupos disponibles.');
  if (getReservaActiva(usuarioId, actividadId)) {
    throw new Error('Ya tienes una reserva activa para esta actividad.');
  }

  const usuario = getUsuarioPorId(usuarioId);
  if (usuario?.fechaNacimiento) {
    const edad = calcularEdad(usuario.fechaNacimiento);
    if (edad < actividad.edadMinima) {
      throw new Error(`Esta actividad requiere edad mínima de ${actividad.edadMinima} años.`);
    }
  }

  let pagoId: string | undefined;
  if (actividad.costo > 0) {
    if (!metodoPago) throw new Error('Selecciona un método de pago para continuar.');
    const estado: EstadoPago = metodoPago === 'efectivo' ? 'pendiente' : 'aprobado';
    const pago = crearPago(usuarioId, actividad.costo, metodoPago, estado);
    pagoId = pago.id;
  }

  const nueva: Reserva = {
    id: generateId('res'),
    usuarioId,
    actividadId,
    estado: 'activa',
    fechaCreacion: nowIso(),
    pagoId,
  };
  writeArray(KEYS.reservas, [...getReservas(), nueva]);
  if (pagoId) vincularPagoReserva(pagoId, nueva.id);
  actualizarActividad(actividadId, { cuposDisponibles: actividad.cuposDisponibles - 1 });

  crearNotificacion(usuarioId, {
    tipo: 'reserva',
    titulo: 'Reserva confirmada',
    mensaje: `Tu cupo para "${actividad.titulo}" quedó confirmado.`,
    enlace: '/mis-reservas',
  });
  crearNotificacion(actividad.proveedorId, {
    tipo: 'reserva',
    titulo: 'Nueva reserva',
    mensaje: `Un usuario reservó "${actividad.titulo}".`,
    enlace: '/proveedor',
  });

  return nueva;
}

export function cancelarReserva(reservaId: string, motivo = 'Cancelación solicitada por el usuario') {
  const reservas = getReservas();
  const idx = reservas.findIndex(r => r.id === reservaId);
  if (idx === -1) return;
  if (reservas[idx].estado !== 'activa') return;

  reservas[idx] = { ...reservas[idx], estado: 'cancelada', motivoCancelacion: motivo };
  writeArray(KEYS.reservas, reservas);

  const act = getActividadPorId(reservas[idx].actividadId);
  if (act) actualizarActividad(act.id, { cuposDisponibles: act.cuposDisponibles + 1 });

  if (reservas[idx].pagoId) actualizarPago(reservas[idx].pagoId, { estado: 'reembolsado' });

  if (act) {
    crearNotificacion(reservas[idx].usuarioId, {
      tipo: 'reserva',
      titulo: 'Reserva cancelada',
      mensaje: `Tu reserva para "${act.titulo}" fue cancelada.`,
      enlace: '/mis-reservas',
    });
  }

  asignarDesdeListaEspera(reservas[idx].actividadId);
}

// ----------------- Lista de espera -----------------

export function getListaEsperaActividad(actividadId: string): ListaEspera[] {
  return readArray<ListaEspera>(KEYS.listaEspera).filter(l => l.actividadId === actividadId);
}

export function unirListaEspera(usuarioId: string, actividadId: string) {
  if (getReservaActiva(usuarioId, actividadId)) {
    throw new Error('Ya tienes una reserva activa para esta actividad.');
  }
  const lista = readArray<ListaEspera>(KEYS.listaEspera);
  if (lista.some(l => l.usuarioId === usuarioId && l.actividadId === actividadId)) {
    throw new Error('Ya estás en la lista de espera.');
  }
  const nueva: ListaEspera = {
    id: generateId('wait'),
    usuarioId,
    actividadId,
    fechaCreacion: nowIso(),
  };
  writeArray(KEYS.listaEspera, [...lista, nueva]);
}

export function salirListaEspera(usuarioId: string, actividadId: string) {
  const lista = readArray<ListaEspera>(KEYS.listaEspera).filter(
    l => !(l.usuarioId === usuarioId && l.actividadId === actividadId)
  );
  writeArray(KEYS.listaEspera, lista);
}

function asignarDesdeListaEspera(actividadId: string) {
  const actividad = getActividadPorId(actividadId);
  if (!actividad || actividad.cuposDisponibles <= 0) return;
  const lista = getListaEsperaActividad(actividadId).sort(
    (a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()
  );
  const siguiente = lista[0];
  if (!siguiente) return;

  salirListaEspera(siguiente.usuarioId, actividadId);
  let pagoId: string | undefined;
  if (actividad.costo > 0) {
    const pago = crearPago(siguiente.usuarioId, actividad.costo, 'efectivo', 'pendiente');
    pagoId = pago.id;
  }
  const reserva: Reserva = {
    id: generateId('res'),
    usuarioId: siguiente.usuarioId,
    actividadId,
    estado: 'activa',
    fechaCreacion: nowIso(),
    pagoId,
  };
  writeArray(KEYS.reservas, [...getReservas(), reserva]);
  if (pagoId) vincularPagoReserva(pagoId, reserva.id);
  actualizarActividad(actividadId, { cuposDisponibles: actividad.cuposDisponibles - 1 });
  crearNotificacion(siguiente.usuarioId, {
    tipo: 'reserva',
    titulo: 'Cupo liberado',
    mensaje: `Se liberó un cupo en "${actividad.titulo}". Tu reserva quedó confirmada.`,
    enlace: '/mis-reservas',
  });
}

// ----------------- Pagos -----------------

export function getPagos(): Pago[] {
  return readArray<Pago>(KEYS.pagos);
}

export function getPagoPorId(id: string): Pago | undefined {
  return getPagos().find(p => p.id === id);
}

export function crearPago(usuarioId: string, monto: number, metodo: MetodoPago, estado: EstadoPago): Pago {
  const pago: Pago = {
    id: generateId('pay'),
    reservaId: '',
    usuarioId,
    monto,
    metodo,
    estado,
    fechaCreacion: nowIso(),
  };
  writeArray(KEYS.pagos, [...getPagos(), pago]);
  return pago;
}

export function vincularPagoReserva(pagoId: string, reservaId: string) {
  actualizarPago(pagoId, { reservaId });
}

export function actualizarPago(id: string, cambios: Partial<Pago>) {
  const pagos = getPagos();
  const idx = pagos.findIndex(p => p.id === id);
  if (idx === -1) return;
  pagos[idx] = { ...pagos[idx], ...cambios };
  writeArray(KEYS.pagos, pagos);
}

// ----------------- Calificaciones -----------------

export function getCalificacionesActividad(actividadId: string): Calificacion[] {
  return readArray<Calificacion>(KEYS.calificaciones).filter(c => c.actividadId === actividadId);
}

export function getCalificacionUsuario(actividadId: string, usuarioId: string): Calificacion | undefined {
  return getCalificacionesActividad(actividadId).find(c => c.usuarioId === usuarioId);
}

export function crearCalificacion(
  actividadId: string,
  usuarioId: string,
  puntaje: number,
  comentario?: string
) {
  const actividad = getActividadPorId(actividadId);
  if (!actividad) throw new Error('Actividad no encontrada.');
  if (new Date(actividad.fechaHora) > new Date()) {
    throw new Error('Solo puedes calificar una actividad finalizada.');
  }
  if (!getReservasUsuario(usuarioId).some(r => r.actividadId === actividadId)) {
    throw new Error('Debes haber participado para calificar.');
  }
  if (comentario && contieneContenidoInapropiado(comentario)) {
    throw new Error('El comentario contiene contenido inapropiado.');
  }
  const ya = getCalificacionUsuario(actividadId, usuarioId);
  if (ya) throw new Error('Ya calificaste esta actividad.');
  const nueva: Calificacion = {
    id: generateId('cal'),
    actividadId,
    usuarioId,
    puntaje,
    comentario: comentario?.trim() || undefined,
    fechaCreacion: nowIso(),
  };
  writeArray(KEYS.calificaciones, [...readArray<Calificacion>(KEYS.calificaciones), nueva]);
}

export function getPromedioCalificacion(actividadId: string) {
  const cal = getCalificacionesActividad(actividadId);
  if (cal.length === 0) return 0;
  return cal.reduce((s, c) => s + c.puntaje, 0) / cal.length;
}

// ----------------- Notificaciones -----------------

export function getNotificaciones(): Notificacion[] {
  return readArray<Notificacion>(KEYS.notificaciones);
}

export function getNotificacionesUsuario(usuarioId: string): Notificacion[] {
  return getNotificaciones().filter(n => n.usuarioId === usuarioId);
}

export function crearNotificacion(
  usuarioId: string,
  data: Omit<Notificacion, 'id' | 'usuarioId' | 'leida' | 'fechaCreacion'>
) {
  const noti: Notificacion = {
    id: generateId('noti'),
    usuarioId,
    leida: false,
    fechaCreacion: nowIso(),
    ...data,
  };
  writeArray(KEYS.notificaciones, [...getNotificaciones(), noti]);
}

export function marcarNotificacionLeida(id: string) {
  const notis = getNotificaciones();
  const idx = notis.findIndex(n => n.id === id);
  if (idx === -1) return;
  notis[idx] = { ...notis[idx], leida: true };
  writeArray(KEYS.notificaciones, notis);
}

export function marcarTodasLeidas(usuarioId: string) {
  const notis = getNotificaciones().map(n =>
    n.usuarioId === usuarioId ? { ...n, leida: true } : n
  );
  writeArray(KEYS.notificaciones, notis);
}

// ----------------- Mensajes -----------------

export function getConversaciones(): Conversacion[] {
  return readArray<Conversacion>(KEYS.conversaciones);
}

export function getMensajes(): Mensaje[] {
  return readArray<Mensaje>(KEYS.mensajes);
}

export function getConversacionesUsuario(usuarioId: string): Conversacion[] {
  return getConversaciones()
    .filter(c => c.participanteIds.includes(usuarioId))
    .sort((a, b) => new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime());
}

export function getMensajesConversacion(conversacionId: string): Mensaje[] {
  return getMensajes()
    .filter(m => m.conversacionId === conversacionId)
    .sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime());
}

export function crearConversacion(
  tipo: Conversacion['tipo'],
  participanteIds: string[],
  titulo?: string
) {
  const existentes = getConversaciones().find(c =>
    c.tipo === tipo &&
    c.participanteIds.length === participanteIds.length &&
    c.participanteIds.every(p => participanteIds.includes(p))
  );
  if (existentes) return existentes;
  const nueva: Conversacion = {
    id: generateId('conv'),
    participanteIds,
    tipo,
    titulo,
    fechaActualizacion: nowIso(),
  };
  writeArray(KEYS.conversaciones, [...getConversaciones(), nueva]);
  return nueva;
}

export function enviarMensaje(conversacionId: string, remitenteId: string, texto: string) {
  if (contieneContenidoInapropiado(texto)) {
    throw new Error('El mensaje contiene contenido inapropiado.');
  }
  const mensaje: Mensaje = {
    id: generateId('msg'),
    conversacionId,
    remitenteId,
    texto: texto.trim(),
    fechaCreacion: nowIso(),
  };
  writeArray(KEYS.mensajes, [...getMensajes(), mensaje]);
  const conversaciones = getConversaciones();
  const idx = conversaciones.findIndex(c => c.id === conversacionId);
  if (idx !== -1) {
    conversaciones[idx] = { ...conversaciones[idx], fechaActualizacion: nowIso() };
    writeArray(KEYS.conversaciones, conversaciones);
  }
}

// ----------------- Propuestas -----------------

export function getPropuestas(): Propuesta[] {
  return readArray<Propuesta>(KEYS.propuestas);
}

export function crearPropuesta(
  data: Omit<Propuesta, 'id' | 'votos' | 'estado' | 'fechaCreacion'>
) {
  const contenido = `${data.titulo} ${data.descripcion}`;
  const enRevision = contieneContenidoInapropiado(contenido);
  const propuesta: Propuesta = {
    id: generateId('prop'),
    votos: 0,
    estado: enRevision ? 'revision' : 'publicada',
    fechaCreacion: nowIso(),
    ...data,
  };
  writeArray(KEYS.propuestas, [...getPropuestas(), propuesta]);
  return propuesta;
}

export function votarPropuesta(id: string) {
  const propuestas = getPropuestas();
  const idx = propuestas.findIndex(p => p.id === id);
  if (idx === -1) return;
  propuestas[idx] = { ...propuestas[idx], votos: propuestas[idx].votos + 1 };
  writeArray(KEYS.propuestas, propuestas);
}

export function getPropuestaComentarios(propuestaId: string): PropuestaComentario[] {
  return readArray<PropuestaComentario>(KEYS.propuestaComentarios).filter(c => c.propuestaId === propuestaId);
}

export function comentarPropuesta(propuestaId: string, usuarioId: string, comentario: string) {
  if (contieneContenidoInapropiado(comentario)) {
    throw new Error('El comentario contiene contenido inapropiado.');
  }
  const nuevo: PropuestaComentario = {
    id: generateId('propc'),
    propuestaId,
    usuarioId,
    comentario: comentario.trim(),
    fechaCreacion: nowIso(),
  };
  writeArray(KEYS.propuestaComentarios, [...readArray<PropuestaComentario>(KEYS.propuestaComentarios), nuevo]);
}

// ----------------- Vínculos cuidador -----------------

export function getVinculos(): VinculoCuidador[] {
  return readArray<VinculoCuidador>(KEYS.vinculos);
}

export function getVinculosAdulto(adultoMayorId: string): VinculoCuidador[] {
  return getVinculos().filter(v => v.adultoMayorId === adultoMayorId && v.estado === 'activo');
}

export function getVinculoPorCuidador(cuidadorId: string): VinculoCuidador | undefined {
  return getVinculos().find(v => v.cuidadorId === cuidadorId && v.estado === 'activo');
}

export function generarCodigoVinculo(adultoMayorId: string) {
  return `C55-${adultoMayorId.slice(-6).toUpperCase()}`;
}

export function obtenerAdultoPorCodigo(codigo: string): Usuario | undefined {
  const limpio = codigo.replace('C55-', '').toLowerCase();
  return getUsuarios().find(u => u.id.toLowerCase().endsWith(limpio) && u.rol === 'adulto_mayor');
}

export function crearVinculoCuidador(adultoMayorId: string, cuidadorId: string) {
  const existe = getVinculos().find(v => v.adultoMayorId === adultoMayorId && v.cuidadorId === cuidadorId);
  if (existe) return existe;
  const nuevo: VinculoCuidador = {
    id: generateId('link'),
    adultoMayorId,
    cuidadorId,
    estado: 'activo',
    fechaCreacion: nowIso(),
  };
  writeArray(KEYS.vinculos, [...getVinculos(), nuevo]);
  crearNotificacion(adultoMayorId, {
    tipo: 'sistema',
    titulo: 'Cuidador vinculado',
    mensaje: 'Se vinculó un cuidador a tu cuenta.',
    enlace: '/perfil',
  });
  return nuevo;
}

export function revocarVinculo(id: string) {
  const vinculos = getVinculos();
  const idx = vinculos.findIndex(v => v.id === id);
  if (idx === -1) return;
  vinculos[idx] = { ...vinculos[idx], estado: 'revocado' };
  writeArray(KEYS.vinculos, vinculos);
}

// ----------------- Juegos -----------------

export function getJuegosUsuario(usuarioId: string): JuegoSesion[] {
  return readArray<JuegoSesion>(KEYS.juegos).filter(j => j.usuarioId === usuarioId);
}

export function crearJuegoSesion(data: Omit<JuegoSesion, 'id' | 'fechaCreacion'>) {
  const nueva: JuegoSesion = {
    id: generateId('game'),
    fechaCreacion: nowIso(),
    ...data,
  };
  writeArray(KEYS.juegos, [...readArray<JuegoSesion>(KEYS.juegos), nueva]);
}

// ----------------- Salud -----------------

export function getRecomendacionesSalud(): RecomendacionSalud[] {
  return readArray<RecomendacionSalud>(KEYS.saludRecs);
}

export function getFavoritosSalud(usuarioId: string): FavoritoSalud[] {
  return readArray<FavoritoSalud>(KEYS.saludFavs).filter(f => f.usuarioId === usuarioId);
}

export function toggleFavoritoSalud(usuarioId: string, recomendacionId: string) {
  const favs = readArray<FavoritoSalud>(KEYS.saludFavs);
  const existe = favs.find(f => f.usuarioId === usuarioId && f.recomendacionId === recomendacionId);
  if (existe) {
    writeArray(KEYS.saludFavs, favs.filter(f => f.id !== existe.id));
    return;
  }
  const nuevo: FavoritoSalud = {
    id: generateId('fav'),
    usuarioId,
    recomendacionId,
    fechaCreacion: nowIso(),
  };
  writeArray(KEYS.saludFavs, [...favs, nuevo]);
}

// ----------------- Helpers -----------------

export function calcularEdad(fechaNacimientoIso: string): number {
  const nac = new Date(fechaNacimientoIso);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}
