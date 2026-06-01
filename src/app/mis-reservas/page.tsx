'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  getReservasUsuario,
  getActividadPorId,
  cancelarReserva,
  getVinculosAdulto,
  getVinculoPorCuidador,
  getUsuarioPorId,
} from '@/lib/store';
import type { Reserva, Actividad, Categoria } from '@/lib/types';
import { CATEGORIAS } from '@/lib/types';
import { formatearFechaLarga, formatearHora, diasDesdeHoy } from '@/lib/format';
import { CalendarCheck, Clock, MapPin, X, Loader2, Search } from 'lucide-react';

type ReservaConActividad = Reserva & { actividad: Actividad };
type Pestana = 'activas' | 'historial' | 'cuidador';

export default function MisReservasPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [reservas, setReservas] = useState<ReservaConActividad[]>([]);
  const [reservasCuidador, setReservasCuidador] = useState<ReservaConActividad[]>([]);
  const [pestana, setPestana] = useState<Pestana>('activas');
  const [cancelando, setCancelando] = useState<string | null>(null);
  const [montado, setMontado] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<Categoria | 'todas'>('todas');
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const cargar = () => {
    if (!usuario) return;
    const res = getReservasUsuario(usuario.id)
      .map(r => {
        const a = getActividadPorId(r.actividadId);
        return a ? { ...r, actividad: a } : null;
      })
      .filter(Boolean) as ReservaConActividad[];
    res.sort((a, b) =>
      new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    );
    setReservas(res);

    const vinculo = usuario.rol === 'cuidador'
      ? getVinculoPorCuidador(usuario.id)
      : getVinculosAdulto(usuario.id)[0];
    if (vinculo) {
      const otroId = usuario.rol === 'cuidador' ? vinculo.adultoMayorId : vinculo.cuidadorId;
      const resOtro = getReservasUsuario(otroId)
        .map(r => {
          const a = getActividadPorId(r.actividadId);
          return a ? { ...r, actividad: a } : null;
        })
        .filter(Boolean) as ReservaConActividad[];
      setReservasCuidador(resOtro);
    } else {
      setReservasCuidador([]);
    }
  };

  useEffect(() => {
    setMontado(true);
    cargar();
  }, [usuario]);

  useEffect(() => {
    if (!cargando && !usuario) router.push('/login');
  }, [cargando, usuario, router]);

  const activas = reservas.filter(r => r.estado === 'activa');
const historial = reservas.filter(r => r.estado !== 'activa');

const mostrarBase =
  pestana === 'activas'
    ? activas
    : pestana === 'historial'
      ? historial
      : reservasCuidador;

const mostrar = useMemo(() => {
  return mostrarBase.filter(r => {
    if (
      filtroCategoria !== 'todas' &&
      r.actividad.categoria !== filtroCategoria
    ) return false;

    if (
      filtroProveedor &&
      !r.actividad.proveedorNombre
        .toLowerCase()
        .includes(filtroProveedor.toLowerCase())
    ) return false;

    if (desde && new Date(r.actividad.fechaHora) < new Date(desde))
      return false;

    if (hasta && new Date(r.actividad.fechaHora) > new Date(hasta))
      return false;

    return true;
  });
}, [mostrarBase, filtroCategoria, filtroProveedor, desde, hasta]);

// AHORA sí
if (!montado || cargando || !usuario) {
  return null;
}

  const handleCancelar = async (reservaId: string) => {
    setCancelando(reservaId);
    cancelarReserva(reservaId);
    cargar();
    setCancelando(null);
  };

  const vinculo = usuario.rol === 'cuidador'
    ? getVinculoPorCuidador(usuario.id)
    : getVinculosAdulto(usuario.id)[0];
  const nombreVinculo = vinculo
    ? getUsuarioPorId(usuario.rol === 'cuidador' ? vinculo.adultoMayorId : vinculo.cuidadorId)?.nombre
    : null;

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-10 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl lg:text-5xl text-ink mb-2">Mis reservas</h1>
        <p className="text-coffee/80">
          {activas.length} reserva{activas.length !== 1 ? 's' : ''} activa{activas.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Pestañas — RF-06 */}
      <div className="flex gap-1 p-1 rounded-soft bg-sand/60 border border-coffee/10 mb-6 w-fit flex-wrap">
        {(['activas', 'historial'] as Pestana[]).map(p => (
          <button
            key={p}
            onClick={() => setPestana(p)}
            className={`px-6 py-3 rounded-soft text-base font-semibold transition-colors capitalize ${
              pestana === p ? 'bg-ink text-cream shadow-soft' : 'text-coffee hover:text-ink'
            }`}
          >
            {p === 'activas' ? `Próximas (${activas.length})` : `Historial (${historial.length})`}
          </button>
        ))}
        {vinculo && (
          <button
            onClick={() => setPestana('cuidador')}
            className={`px-6 py-3 rounded-soft text-base font-semibold transition-colors capitalize ${
              pestana === 'cuidador' ? 'bg-ink text-cream shadow-soft' : 'text-coffee hover:text-ink'
            }`}
          >
            {usuario.rol === 'cuidador' ? `Adulto mayor (${reservasCuidador.length})` : `Cuidador (${reservasCuidador.length})`}
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="mb-8 grid md:grid-cols-4 gap-4">
        <select
          value={filtroCategoria}
          onChange={e => setFiltroCategoria(e.target.value as Categoria | 'todas')}
          className="px-4 py-3 rounded-soft border border-coffee/20 bg-cream"
        >
          <option value="todas">Todas las categorías</option>
          {(Object.keys(CATEGORIAS) as Categoria[]).map(cat => (
            <option key={cat} value={cat}>{CATEGORIAS[cat].nombre}</option>
          ))}
        </select>
        <input
          value={filtroProveedor}
          onChange={e => setFiltroProveedor(e.target.value)}
          placeholder="Proveedor"
          className="px-4 py-3 rounded-soft border border-coffee/20 bg-cream"
        />
        <input
          type="date"
          value={desde}
          onChange={e => setDesde(e.target.value)}
          className="px-4 py-3 rounded-soft border border-coffee/20 bg-cream"
        />
        <input
          type="date"
          value={hasta}
          onChange={e => setHasta(e.target.value)}
          className="px-4 py-3 rounded-soft border border-coffee/20 bg-cream"
        />
      </div>

      {/* Lista */}
      {mostrar.length > 0 ? (
        <div className="space-y-5">
          {mostrar.map(r => {
            const a = r.actividad;
            const cat = CATEGORIAS[a.categoria];
            const dias = diasDesdeHoy(a.fechaHora);
            const esActiva = r.estado === 'activa';
            return (
              <div
                key={r.id}
                className={`bg-cream rounded-soft border overflow-hidden transition-all ${
                  esActiva ? 'border-coffee/10 hover:border-clay/30 hover:shadow-soft' : 'border-coffee/10 opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Imagen */}
                  <div className="relative w-full sm:w-44 aspect-[4/3] sm:aspect-auto flex-shrink-0 bg-sand">
                    <Image src={a.imagenUrl} alt={a.titulo} fill className="object-cover" />
                    {r.estado === 'cancelada' && (
                      <div className="absolute inset-0 bg-coffee/60 flex items-center justify-center">
                        <span className="text-cream font-semibold text-sm">Cancelada</span>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-pill mr-2 ${cat.color}`}>
                            {cat.emoji} {cat.nombre}
                          </span>
                          {esActiva && dias === 0 && <span className="inline-flex text-xs font-semibold px-2.5 py-1 rounded-pill bg-clay/15 text-clay">Hoy</span>}
                          {esActiva && dias === 1 && <span className="inline-flex text-xs font-semibold px-2.5 py-1 rounded-pill bg-sage/15 text-sage">Mañana</span>}
                        </div>
                        {esActiva && pestana !== 'cuidador' && (
                          <button
                            onClick={() => handleCancelar(r.id)}
                            disabled={cancelando === r.id}
                            className="text-xs text-coffee/60 hover:text-clay transition-colors flex items-center gap-1"
                            aria-label="Cancelar reserva"
                          >
                            {cancelando === r.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <X className="w-3.5 h-3.5" />
                            }
                            Cancelar
                          </button>
                        )}
                      </div>

                      <Link href={`/actividades/${a.id}`}>
                        <h3 className="font-display text-2xl text-ink mt-2 hover:text-clay transition-colors">
                          {a.titulo}
                        </h3>
                      </Link>
                      {r.motivoCancelacion && (
                        <p className="text-xs text-coffee/70 mt-2">Motivo: {r.motivoCancelacion}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-coffee/80">
                      <div className="flex items-center gap-1.5">
                        <CalendarCheck className="w-4 h-4 text-clay" />
                        <span>{formatearFechaLarga(a.fechaHora)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-clay" />
                        <span>{formatearHora(a.fechaHora)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-clay" />
                        <span>{a.ubicacion}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="font-display text-8xl text-coffee/20 mb-6">
            {pestana === 'activas' ? '📅' : '📋'}
          </div>
          <h2 className="font-display text-3xl text-ink mb-3">
            {pestana === 'activas' ? 'Aún no tienes reservas' : 'Historial vacío'}
          </h2>
          <p className="text-coffee/70 mb-6">
            {pestana === 'activas'
              ? 'Explora las actividades disponibles y reserva tu lugar.'
              : pestana === 'cuidador'
                ? `No hay actividades para ${nombreVinculo ?? 'el vínculo'}.`
                : 'Las reservas canceladas o finalizadas aparecerán aquí.'}
          </p>
          {pestana === 'activas' && (
            <Link
              href="/actividades"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-clay text-cream font-semibold hover:bg-coffee transition-colors"
            >
              <Search className="w-4 h-4" />
              Explorar actividades
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
