'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import {
  getActividadPorId,
  crearReserva,
  cancelarReserva,
  getReservaActiva,
  getListaEsperaActividad,
  unirListaEspera,
  salirListaEspera,
  crearConversacion,
  getCalificacionesActividad,
  getCalificacionUsuario,
  crearCalificacion,
  getPromedioCalificacion,
  getPagoPorId,
} from '@/lib/store';
import type { Actividad, Reserva, MetodoPago, Calificacion } from '@/lib/types';
import { CATEGORIAS } from '@/lib/types';
import { formatearFechaLarga, formatearHora, formatearDuracion, diasDesdeHoy } from '@/lib/format';
import { RatingStars } from '@/components/RatingStars';
import {
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Check,
  CalendarCheck,
  AlertCircle,
  Loader2,
  MessageCircle,
  CalendarPlus,
  Video,
  ListPlus,
} from 'lucide-react';

export default function ActividadDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  const [actividad, setActividad] = useState<Actividad | null>(null);
  const [reserva, setReserva] = useState<Reserva | undefined>(undefined);
  const [procesando, setProcesando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'error'; msg: string } | null>(null);
  const [montado, setMontado] = useState(false);
  const [enEspera, setEnEspera] = useState(false);
  const [esperaCount, setEsperaCount] = useState(0);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('tarjeta');
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');

  const cargar = () => {
    const a = getActividadPorId(id);
    setActividad(a ?? null);
    if (usuario && a) {
      setReserva(getReservaActiva(usuario.id, a.id));
      const lista = getListaEsperaActividad(a.id);
      setEsperaCount(lista.length);
      setEnEspera(lista.some(l => l.usuarioId === usuario.id));
      setCalificaciones(getCalificacionesActividad(a.id));
      const miCal = getCalificacionUsuario(a.id, usuario.id);
      if (miCal) {
        setRating(miCal.puntaje);
        setComentario(miCal.comentario ?? '');
      }
    }
  };

  useEffect(() => {
    setMontado(true);
    cargar();
  }, [id, usuario]);

  useEffect(() => {
    if (!cargando && !usuario) router.push('/login');
  }, [cargando, usuario, router]);

  if (!montado || cargando || !usuario) return null;

  if (!actividad) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-3xl text-ink mb-4">Actividad no encontrada</h2>
        <Link href="/actividades" className="text-clay font-semibold hover:underline">
          ← Volver a actividades
        </Link>
      </div>
    );
  }

  const cat = CATEGORIAS[actividad.categoria];
  const dias = diasDesdeHoy(actividad.fechaHora);
  const sinCupos = actividad.cuposDisponibles === 0;
  const cuposBajos = actividad.cuposDisponibles <= 3 && actividad.cuposDisponibles > 0;
  const yaReservado = !!reserva;
  const promedio = getPromedioCalificacion(actividad.id);
  const pago = reserva?.pagoId ? getPagoPorId(reserva.pagoId) : undefined;
  const esVirtual = actividad.modalidad === 'virtual';
  const puedeUnirse = esVirtual && yaReservado && new Date(actividad.fechaHora) <= new Date(Date.now() + 60 * 60 * 1000);

  const handleReserva = async () => {
    if (!usuario) return;
    setProcesando(true);
    setFeedback(null);
    try {
      crearReserva(usuario.id, actividad.id, actividad.costo > 0 ? metodoPago : undefined);
      cargar();
      setFeedback({ tipo: 'ok', msg: '¡Cupo reservado con éxito! Te esperamos.' });
    } catch (err) {
      setFeedback({
        tipo: 'error',
        msg: err instanceof Error ? err.message : 'No pudimos completar la reserva.',
      });
    } finally {
      setProcesando(false);
    }
  };

  const handleCancelar = async () => {
    if (!reserva) return;
    setProcesando(true);
    setFeedback(null);
    try {
      cancelarReserva(reserva.id);
      cargar();
      setFeedback({ tipo: 'ok', msg: 'Reserva cancelada. El cupo quedó disponible.' });
    } catch {
      setFeedback({ tipo: 'error', msg: 'No pudimos cancelar la reserva.' });
    } finally {
      setProcesando(false);
    }
  };

  const handleListaEspera = () => {
    try {
      if (enEspera) {
        salirListaEspera(usuario.id, actividad.id);
      } else {
        unirListaEspera(usuario.id, actividad.id);
      }
      cargar();
    } catch (err) {
      setFeedback({
        tipo: 'error',
        msg: err instanceof Error ? err.message : 'No pudimos actualizar la lista de espera.',
      });
    }
  };

  const abrirChatProveedor = () => {
    const conv = crearConversacion('proveedor', [usuario.id, actividad.proveedorId], actividad.titulo);
    router.push(`/mensajes?conv=${conv.id}`);
  };

  const descargarICS = () => {
    const start = new Date(actividad.fechaHora);
    const end = new Date(start.getTime() + actividad.duracionMinutos * 60000);
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Club55+//ES',
      'BEGIN:VEVENT',
      `UID:${actividad.id}`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${actividad.titulo}`,
      `LOCATION:${actividad.ubicacion}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `club55-${actividad.titulo.replace(/\s+/g, '-')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCalificar = () => {
    if (rating === 0) {
      setFeedback({ tipo: 'error', msg: 'Selecciona una calificación.' });
      return;
    }
    try {
      crearCalificacion(actividad.id, usuario.id, rating, comentario);
      setFeedback({ tipo: 'ok', msg: 'Gracias por tu calificación.' });
      cargar();
    } catch (err) {
      setFeedback({
        tipo: 'error',
        msg: err instanceof Error ? err.message : 'No pudimos registrar tu calificación.',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-10 py-12">
      {/* Breadcrumb */}
      <Link
        href="/actividades"
        className="inline-flex items-center gap-2 text-coffee hover:text-clay transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Todas las actividades
      </Link>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Columna principal */}
        <div className="lg:col-span-7 space-y-8">
          {/* Imagen */}
          <div className="relative aspect-[16/9] rounded-soft overflow-hidden bg-sand">
            <Image
              src={actividad.imagenUrl}
              alt={actividad.titulo}
              fill
              className="object-cover"
              priority
            />
            <div className={`absolute top-5 left-5 px-3 py-1.5 rounded-pill text-sm font-semibold backdrop-blur-md bg-cream/90 ${cat.color}`}>
              {cat.emoji} {cat.nombre}
            </div>
            <div className="absolute top-5 right-5 px-3 py-1.5 rounded-pill text-sm font-semibold backdrop-blur-md bg-cream/90 text-ink">
              {actividad.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}
            </div>
          </div>

          {/* Título y meta */}
          <div>
            <p className="text-sm font-semibold text-clay uppercase tracking-wider mb-3">
              {dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : dias > 0 ? `En ${dias} días` : 'Actividad pasada'}
              <span className="mx-2 text-coffee/40">·</span>
              <span className="text-coffee normal-case font-medium">{formatearFechaLarga(actividad.fechaHora)}</span>
            </p>
            <h1 className="font-display text-4xl lg:text-5xl text-ink leading-tight">
              {actividad.titulo}
            </h1>
            <p className="mt-2 text-lg text-coffee/80">
              Por <span className="font-semibold text-ink">{actividad.proveedorNombre}</span>
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-coffee/70">
              <RatingStars value={Math.round(promedio)} readOnly />
              <span>{promedio === 0 ? 'Sin calificaciones' : promedio.toFixed(1)} · {calificaciones.length} opiniones</span>
            </div>
          </div>

          {/* Detalles */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Clock,  label: 'Horario', value: `${formatearHora(actividad.fechaHora)} · ${formatearDuracion(actividad.duracionMinutos)}` },
              { icon: MapPin, label: 'Lugar',   value: actividad.ubicacion },
              { icon: Users,  label: 'Cupos',   value: `${actividad.cuposDisponibles} de ${actividad.cuposTotales} disponibles` },
              { icon: CalendarCheck, label: 'Edad mínima', value: `${actividad.edadMinima} años o más` },
            ].map(d => {
              const Icon = d.icon;
              return (
                <div key={d.label} className="flex gap-4 p-5 rounded-soft bg-sand/60 border border-coffee/10">
                  <div className="w-10 h-10 flex-shrink-0 rounded-soft bg-clay/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-clay" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-coffee/60 uppercase tracking-wider">{d.label}</div>
                    <div className="font-semibold text-ink mt-0.5">{d.value}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Descripción */}
          <div>
            <h2 className="font-display text-2xl text-ink mb-4">Sobre esta actividad</h2>
            <p className="text-lg text-coffee/80 leading-relaxed">{actividad.descripcion}</p>
            {actividad.condiciones && (
              <div className="mt-4 p-4 rounded-soft bg-sand/60 border border-coffee/10 text-sm text-coffee/80">
                <strong className="text-ink">Condiciones:</strong> {actividad.condiciones}
              </div>
            )}
          </div>

          {/* Calificación */}
          {yaReservado && dias < 0 && (
            <div className="p-6 rounded-soft border border-coffee/10 bg-cream space-y-4">
              <h3 className="font-display text-2xl text-ink">Califica esta actividad</h3>
              <RatingStars value={rating} onChange={setRating} />
              <textarea
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder="Cuéntanos tu experiencia (opcional)"
                className="w-full px-4 py-3 rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none transition-colors resize-none"
                rows={3}
              />
              <button
                onClick={handleCalificar}
                className="px-6 py-3 rounded-pill bg-clay text-cream font-semibold hover:bg-coffee transition-colors"
              >
                Enviar calificación
              </button>
            </div>
          )}

          {/* Comentarios */}
          {calificaciones.length > 0 && (
            <div>
              <h3 className="font-display text-2xl text-ink mb-4">Comentarios recientes</h3>
              <div className="space-y-3">
                {calificaciones.slice(0, 4).map(c => (
                  <div key={c.id} className="p-4 rounded-soft bg-sand/50 border border-coffee/10">
                    <div className="flex items-center gap-2 mb-2">
                      <RatingStars value={c.puntaje} readOnly />
                      <span className="text-xs text-coffee/60">· {new Date(c.fechaCreacion).toLocaleDateString()}</span>
                    </div>
                    {c.comentario && <p className="text-sm text-coffee/80">{c.comentario}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: reserva — RF-05 */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-5">
            <div className="bg-cream rounded-soft border border-coffee/10 p-8 shadow-lift space-y-6">
              {/* Precio */}
              <div className="text-center pb-5 border-b border-coffee/10">
                <div className="font-display text-4xl text-clay">
                  {actividad.costo === 0 ? 'Gratuita' : `$${actividad.costo.toLocaleString('es-CO')}`}
                </div>
                <div className="text-sm text-coffee/60 mt-1">por persona</div>
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`flex items-start gap-3 p-4 rounded-soft ${
                  feedback.tipo === 'ok'
                    ? 'bg-sage/10 border border-sage/30'
                    : 'bg-clay/10 border border-clay/30'
                }`}>
                  {feedback.tipo === 'ok'
                    ? <Check className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
                    : <AlertCircle className="w-5 h-5 text-clay flex-shrink-0 mt-0.5" />
                  }
                  <p className="text-sm text-ink">{feedback.msg}</p>
                </div>
              )}

              {/* Pago */}
              {!yaReservado && actividad.costo > 0 && (
                <div>
                  <p className="text-sm font-semibold text-ink mb-2">Método de pago</p>
                  <select
                    value={metodoPago}
                    onChange={e => setMetodoPago(e.target.value as MetodoPago)}
                    className="w-full px-4 py-3 rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none"
                  >
                    <option value="tarjeta">Tarjeta débito/crédito</option>
                    <option value="pse">PSE</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="efectivo">Pago en efectivo</option>
                  </select>
                </div>
              )}

              {/* Botón acción principal */}
              {yaReservado ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-soft bg-sage/10 border border-sage/30">
                    <Check className="w-5 h-5 text-sage flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-sage">¡Ya tienes tu cupo!</div>
                      <div className="text-sm text-coffee/70">Te esperamos el {formatearFechaLarga(actividad.fechaHora)}</div>
                    </div>
                  </div>
                  {pago && (
                    <div className="text-sm text-coffee/70">
                      Estado del pago: <strong className="text-ink">{pago.estado}</strong>
                    </div>
                  )}
                  <button
                    onClick={handleCancelar}
                    disabled={procesando}
                    className="w-full py-3 rounded-pill border-2 border-coffee/30 text-coffee font-semibold hover:border-clay hover:text-clay transition-colors text-sm disabled:opacity-50"
                  >
                    {procesando ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />Cancelando...
                      </span>
                    ) : 'Cancelar reserva'}
                  </button>
                </div>
              ) : sinCupos ? (
                <div className="text-center py-4 space-y-3">
                  <div className="font-semibold text-coffee">Sin cupos disponibles</div>
                  <p className="text-sm text-coffee/60">Lista de espera: {esperaCount} personas.</p>
                  <button
                    onClick={handleListaEspera}
                    className="w-full py-3 rounded-pill bg-clay text-cream font-semibold hover:bg-coffee transition-colors"
                  >
                    <ListPlus className="w-4 h-4 inline mr-1" />
                    {enEspera ? 'Salir de lista' : 'Unirme a lista de espera'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleReserva}
                  disabled={procesando}
                  className="w-full py-4 rounded-pill bg-clay text-cream text-lg font-semibold hover:bg-coffee transition-colors shadow-soft disabled:opacity-50"
                >
                  {procesando ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />Reservando...
                    </span>
                  ) : 'Reservar mi cupo'}
                </button>
              )}

              {/* Cupos alert */}
              {cuposBajos && !yaReservado && (
                <p className="text-center text-sm font-semibold text-clay">
                  ⚡ Solo quedan {actividad.cuposDisponibles} cupos
                </p>
              )}

              {esVirtual && (
                <div className="p-4 rounded-soft bg-sand/60 border border-coffee/10 text-sm text-coffee/80">
                  Actividad virtual. Te enviaremos el botón de acceso en el horario.
                </div>
              )}

              <p className="text-center text-xs text-coffee/50">
                La reserva es inmediata. Notificamos al proveedor automáticamente.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={abrirChatProveedor}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-pill border-2 border-coffee/20 text-coffee font-semibold hover:border-clay transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Escribir al proveedor
              </button>
              <button
                onClick={descargarICS}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-pill border-2 border-coffee/20 text-coffee font-semibold hover:border-clay transition-colors"
              >
                <CalendarPlus className="w-4 h-4" />
                Agregar a mi calendario
              </button>
              {esVirtual && puedeUnirse && actividad.enlaceVirtual && (
                <a
                  href={actividad.enlaceVirtual}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-pill bg-sage text-cream font-semibold hover:bg-coffee transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Unirse a la sala
                </a>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(actividad.ubicacion)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-pill border-2 border-coffee/20 text-coffee font-semibold hover:border-clay transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Ver en mapa
              </a>
              <Link
                href="/mis-reservas"
                className="block text-center text-sm text-coffee hover:text-clay transition-colors font-medium"
              >
                Ver mis reservas →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
