// =============================================================
// Tipos de dominio del Sistema Club 55+
// Basados en el modelo lógico del SRS (sección 4.1)
// =============================================================

export type Rol = 'adulto_mayor' | 'cuidador' | 'proveedor' | 'admin';
export type Idioma = 'es' | 'en';
export type ModalidadActividad = 'presencial' | 'virtual';
export type EstadoActividad = 'activa' | 'cancelada' | 'finalizada' | 'revision';
export type MetodoPago = 'tarjeta' | 'pse' | 'transferencia' | 'efectivo';
export type EstadoPago = 'aprobado' | 'rechazado' | 'reembolsado' | 'pendiente';
export type EstadoPropuesta = 'publicada' | 'revision';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  fechaNacimiento?: string; // ISO date — solo adultos mayores
  intereses?: string[];
  condicionFisica?: string;
  fotoUrl?: string;
  telefono?: string;
  ciudad?: string;
  direccion?: string;
  documento?: string;
  idiomaPreferido?: Idioma;
  verificado?: boolean;
  fechaRegistro: string;
}

export interface Actividad {
  id: string;
  proveedorId: string;
  proveedorNombre: string;
  titulo: string;
  descripcion: string;
  categoria: Categoria;
  ubicacion: string;
  ubicacionLat?: number;
  ubicacionLng?: number;
  fechaHora: string; // ISO datetime
  duracionMinutos: number;
  cuposTotales: number;
  cuposDisponibles: number;
  edadMinima: number;
  costo: number; // 0 = gratuita
  modalidad: ModalidadActividad;
  enlaceVirtual?: string;
  condiciones?: string;
  estado: EstadoActividad;
  imagenUrl: string;
  fechaCreacion: string;
}

export type Categoria =
  | 'fisica'
  | 'social'
  | 'cultural'
  | 'educativa'
  | 'recreativa'
  | 'bienestar';

export const CATEGORIAS: Record<Categoria, { nombre: string; emoji: string; color: string }> = {
  fisica:     { nombre: 'Actividad física',  emoji: '🌿', color: 'bg-sage/15 text-sage'   },
  social:     { nombre: 'Social',            emoji: '☕', color: 'bg-clay/15 text-clay'   },
  cultural:   { nombre: 'Cultural',          emoji: '🎭', color: 'bg-rose/15 text-rose'   },
  educativa:  { nombre: 'Educativa',         emoji: '📚', color: 'bg-coffee/15 text-coffee' },
  recreativa: { nombre: 'Recreativa',        emoji: '🎲', color: 'bg-gold/25 text-coffee' },
  bienestar:  { nombre: 'Bienestar',         emoji: '🌸', color: 'bg-rose/15 text-rose'   },
};

export type EstadoReserva = 'activa' | 'cancelada' | 'finalizada';

export interface Reserva {
  id: string;
  usuarioId: string;
  actividadId: string;
  estado: EstadoReserva;
  fechaCreacion: string;
  pagoId?: string;
  motivoCancelacion?: string;
}

export interface Pago {
  id: string;
  reservaId: string;
  usuarioId: string;
  monto: number;
  metodo: MetodoPago;
  estado: EstadoPago;
  fechaCreacion: string;
}

export interface Calificacion {
  id: string;
  actividadId: string;
  usuarioId: string;
  puntaje: number; // 1-5
  comentario?: string;
  fechaCreacion: string;
}

export interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: 'recordatorio' | 'reserva' | 'mensaje' | 'sistema' | 'salud';
  titulo: string;
  mensaje: string;
  enlace?: string;
  leida: boolean;
  fechaCreacion: string;
}

export interface Conversacion {
  id: string;
  participanteIds: string[]; // incluye al usuario actual
  tipo: 'proveedor' | 'cuidador' | 'buzon';
  titulo?: string;
  fechaActualizacion: string;
}

export interface Mensaje {
  id: string;
  conversacionId: string;
  remitenteId: string;
  texto: string;
  fechaCreacion: string;
}

export interface Propuesta {
  id: string;
  usuarioId: string;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  categoria: Categoria;
  votos: number;
  estado: EstadoPropuesta;
  fechaCreacion: string;
}

export interface PropuestaComentario {
  id: string;
  propuestaId: string;
  usuarioId: string;
  comentario: string;
  fechaCreacion: string;
}

export interface VinculoCuidador {
  id: string;
  adultoMayorId: string;
  cuidadorId: string;
  estado: 'pendiente' | 'activo' | 'revocado';
  fechaCreacion: string;
}

export interface ListaEspera {
  id: string;
  actividadId: string;
  usuarioId: string;
  fechaCreacion: string;
}

export interface JuegoSesion {
  id: string;
  usuarioId: string;
  juego: 'memoria' | 'sudoku' | 'crucigrama';
  dificultad: 'facil' | 'media' | 'dificil';
  puntaje: number;
  duracionSeg: number;
  fechaCreacion: string;
}

export interface RecomendacionSalud {
  id: string;
  categoria: 'alimentacion' | 'ejercicio' | 'salud_mental' | 'prevencion' | 'hidratacion';
  titulo: string;
  descripcion: string;
  fuenteUrl: string;
}

export interface FavoritoSalud {
  id: string;
  usuarioId: string;
  recomendacionId: string;
  fechaCreacion: string;
}

export interface PreferenciasAccesibilidad {
  tema: 'claro' | 'oscuro';
  contraste: 'normal' | 'alto';
  tamanioFuente: 'md' | 'lg' | 'xl' | 'xxl';
  idioma: Idioma;
}
