'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getActividadesPorProveedor, getReservas, getPagoPorId, cancelarActividad, getPromedioCalificacion } from '@/lib/store';
import type { Actividad } from '@/lib/types';
import { CATEGORIAS } from '@/lib/types';
import { formatearFechaLarga, formatearHora, diasDesdeHoy } from '@/lib/format';
import { Plus, Users, Calendar, TrendingUp, Clock, Star, Pencil, Ban } from 'lucide-react';

export default function ProveedorDashboardPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    if (usuario?.rol === 'proveedor') {
      setActividades(getActividadesPorProveedor(usuario.id));
    }
  }, [usuario]);

  useEffect(() => {
    if (!cargando && !usuario) router.push('/login');
    if (!cargando && usuario && usuario.rol !== 'proveedor') router.push('/actividades');
  }, [cargando, usuario, router]);

  if (!montado || cargando || !usuario || usuario.rol !== 'proveedor') return null;

  const todasReservas = getReservas();
  const totalInscritos = actividades.reduce((sum, a) =>
    sum + todasReservas.filter(r => r.actividadId === a.id && r.estado === 'activa').length, 0
  );
  const cuposTotales = actividades.reduce((s, a) => s + a.cuposTotales, 0);
  const cuposOcupados = cuposTotales - actividades.reduce((s, a) => s + a.cuposDisponibles, 0);
  const ingresos = todasReservas
    .filter(r => actividades.some(a => a.id === r.actividadId))
    .reduce((sum, r) => {
      const pago = r.pagoId ? getPagoPorId(r.pagoId) : undefined;
      if (!pago || pago.estado !== 'aprobado') return sum;
      return sum + pago.monto;
    }, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl lg:text-5xl text-ink">Panel del proveedor</h1>
          <p className="text-coffee/80 mt-1">{usuario.nombre}</p>
        </div>
        <Link
          href="/proveedor/nueva-actividad"
          className="inline-flex items-center gap-2 px-6 py-4 rounded-pill bg-clay text-cream text-base font-semibold hover:bg-coffee transition-colors shadow-soft whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Publicar nueva actividad
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {[
          { icon: Calendar,    label: 'Actividades',    value: actividades.length },
          { icon: Users,       label: 'Inscritos activos', value: totalInscritos },
          { icon: TrendingUp,  label: 'Ingresos',  value: `$${ingresos.toLocaleString('es-CO')}` },
          { icon: Clock,       label: 'Cupos totales',   value: cuposTotales },
        ].map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-cream rounded-soft border border-coffee/10 p-6 hover:shadow-soft transition-shadow">
              <div className="w-12 h-12 rounded-soft bg-clay/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-clay" />
              </div>
               <div className="font-display text-4xl text-ink">{m.value}</div>
               <div className="text-sm text-coffee/70 mt-1">{m.label}</div>
            </div>
          );
        })}
      </div>

      {/* Lista de actividades — RF-04 */}
      <div>
        <h2 className="font-display text-3xl text-ink mb-6">Mis actividades</h2>

        {actividades.length > 0 ? (
          <div className="space-y-5">
            {actividades.map(a => {
              const cat = CATEGORIAS[a.categoria];
              const dias = diasDesdeHoy(a.fechaHora);
              const inscritos = todasReservas.filter(
                r => r.actividadId === a.id && r.estado === 'activa'
              ).length;
              const pct = Math.round((inscritos / a.cuposTotales) * 100);
              const promedio = getPromedioCalificacion(a.id);

              return (
                <div
                  key={a.id}
                  className="bg-cream rounded-soft border border-coffee/10 overflow-hidden hover:border-clay/30 hover:shadow-soft transition-all"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-44 aspect-[4/3] sm:aspect-auto flex-shrink-0 bg-sand">
                      <Image src={a.imagenUrl} alt={a.titulo} fill className="object-cover" />
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-pill ${cat.color}`}>
                            {cat.emoji} {cat.nombre}
                          </span>
                          <span className="text-xs text-coffee/60 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-gold" />
                            {promedio === 0 ? 'Nuevo' : promedio.toFixed(1)}
                          </span>
                          <span className="text-xs text-coffee/60">
                            {dias < 0 ? 'Pasada' : dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `En ${dias} días`}
                          </span>
                        </div>
                        <h3 className="font-display text-2xl text-ink mt-2">{a.titulo}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-coffee/80 mt-2">
                          <span>{formatearFechaLarga(a.fechaHora)} · {formatearHora(a.fechaHora)}</span>
                          <span>{a.ubicacion}</span>
                        </div>
                        {a.estado !== 'activa' && (
                          <div className="mt-2 text-xs font-semibold text-clay">
                            {a.estado === 'revision' ? 'En revisión de contenido' : 'Actividad cancelada'}
                          </div>
                        )}
                      </div>

                      {/* Barra de cupos */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-medium text-ink">
                            {inscritos} / {a.cuposTotales} inscritos
                          </span>
                          <span className="text-coffee/60">{pct}% ocupado</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-sand overflow-hidden">
                          <div
                            className="h-full rounded-full bg-clay transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-3">
                        <Link
                          href={`/proveedor/editar/${a.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-pill border-2 border-coffee/20 text-sm font-semibold text-coffee hover:border-clay transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                          Editar
                        </Link>
                        <button
                          onClick={() => cancelarActividad(a.id, 'Cancelada por el proveedor')}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-pill border-2 border-coffee/20 text-sm font-semibold text-coffee hover:border-clay transition-colors"
                        >
                          <Ban className="w-4 h-4" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-coffee/20 rounded-soft">
            <div className="font-display text-8xl text-coffee/20 mb-6">📋</div>
            <h2 className="font-display text-3xl text-ink mb-3">Aún no has publicado actividades</h2>
            <p className="text-coffee/70 mb-6">
              Crea tu primera actividad y llega a cientos de adultos mayores en Cali.
            </p>
            <Link
              href="/proveedor/nueva-actividad"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-clay text-cream font-semibold hover:bg-coffee transition-colors"
            >
              <Plus className="w-4 h-4" />
              Publicar mi primera actividad
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
