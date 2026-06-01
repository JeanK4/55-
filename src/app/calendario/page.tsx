'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getReservasUsuario, getActividadPorId, getActividadesPublicas } from '@/lib/store';
import type { Actividad, Categoria } from '@/lib/types';
import { CATEGORIAS } from '@/lib/types';
import { ChevronLeft, ChevronRight, CalendarPlus } from 'lucide-react';

type Vista = 'dia' | 'semana' | 'mes';

export default function CalendarioPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [vista, setVista] = useState<Vista>('mes');
  const [fechaBase, setFechaBase] = useState(new Date());
  const [categoria, setCategoria] = useState<Categoria | 'todas'>('todas');

  useEffect(() => {
    if (!cargando && !usuario) router.push('/login');
  }, [cargando, usuario, router]);

  const actividades = useMemo(() => {
    if (!usuario) return [] as Actividad[];
    const reservas = getReservasUsuario(usuario.id)
      .map(r => getActividadPorId(r.actividadId))
      .filter(Boolean) as Actividad[];
    const publicas = getActividadesPublicas();
    const todas = [...reservas, ...publicas];
    return categoria === 'todas' ? todas : todas.filter(a => a.categoria === categoria);
  }, [usuario, categoria]);

  const inicioMes = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), 1);
  const finMes = new Date(fechaBase.getFullYear(), fechaBase.getMonth() + 1, 0);

  const diasMes = useMemo(() => {
    const dias: Date[] = [];
    const start = new Date(inicioMes);
    start.setDate(start.getDate() - start.getDay());
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dias.push(d);
    }
    return dias;
  }, [inicioMes]);

  const actividadesPorDia = (d: Date) => {
    return actividades.filter(a => {
      const fecha = new Date(a.fechaHora);
      return fecha.toDateString() === d.toDateString();
    });
  };

  const exportarICS = () => {
    const eventos = actividades.filter(a => new Date(a.fechaHora) >= new Date());
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const contenido = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Club55+//ES',
      ...eventos.flatMap(a => {
        const start = new Date(a.fechaHora);
        const end = new Date(start.getTime() + a.duracionMinutos * 60000);
        return [
          'BEGIN:VEVENT',
          `UID:${a.id}`,
          `DTSTAMP:${fmt(new Date())}`,
          `DTSTART:${fmt(start)}`,
          `DTEND:${fmt(end)}`,
          `SUMMARY:${a.titulo}`,
          `LOCATION:${a.ubicacion}`,
          'END:VEVENT',
        ];
      }),
      'END:VCALENDAR',
    ].join('\n');
    const blob = new Blob([contenido], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'club55-calendario.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (cargando || !usuario) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl lg:text-5xl text-ink mb-2">Calendario</h1>
          <p className="text-coffee/80">Organiza tus actividades por día, semana o mes.</p>
        </div>
        <button
          onClick={exportarICS}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-pill border-2 border-coffee/20 text-sm font-semibold hover:border-clay"
        >
          <CalendarPlus className="w-4 h-4" />
          Exportar .ics
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        {(['dia', 'semana', 'mes'] as const).map(v => (
          <button
            key={v}
            onClick={() => setVista(v)}
            className={`px-4 py-2 rounded-pill text-sm font-medium ${
              vista === v ? 'bg-ink text-cream' : 'bg-sand text-ink'
            }`}
          >
            {v === 'dia' ? 'Día' : v === 'semana' ? 'Semana' : 'Mes'}
          </button>
        ))}
        <select
          value={categoria}
          onChange={e => setCategoria(e.target.value as Categoria | 'todas')}
          className="px-4 py-2 rounded-pill bg-cream border border-coffee/20"
        >
          <option value="todas">Todas las categorías</option>
          {(Object.keys(CATEGORIAS) as Categoria[]).map(cat => (
            <option key={cat} value={cat}>{CATEGORIAS[cat].nombre}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setFechaBase(new Date(fechaBase.getFullYear(), fechaBase.getMonth() - 1, 1))}
            className="p-2 rounded-full hover:bg-sand"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-ink">
            {fechaBase.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => setFechaBase(new Date(fechaBase.getFullYear(), fechaBase.getMonth() + 1, 1))}
            className="p-2 rounded-full hover:bg-sand"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {vista === 'mes' && (
        <div className="grid grid-cols-7 gap-3">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
            <div key={d} className="text-xs font-semibold text-coffee/60 uppercase">{d}</div>
          ))}
          {diasMes.map(d => {
            const eventos = actividadesPorDia(d);
            const esMes = d.getMonth() === fechaBase.getMonth();
            return (
              <div key={d.toISOString()} className={`min-h-[120px] p-3 rounded-soft border ${esMes ? 'bg-cream border-coffee/10' : 'bg-sand/30 border-coffee/10'}`}>
                <div className="text-xs font-semibold text-coffee/60">{d.getDate()}</div>
                <div className="space-y-1 mt-2">
                  {eventos.slice(0, 2).map(ev => (
                    <div key={ev.id} className="text-xs px-2 py-1 rounded-soft bg-sand/60 text-ink">
                      {ev.titulo}
                    </div>
                  ))}
                  {eventos.length > 2 && (
                    <div className="text-[10px] text-coffee/60">+{eventos.length - 2} más</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {vista !== 'mes' && (
        <div className="bg-cream rounded-soft border border-coffee/10 p-6">
          <h2 className="font-display text-2xl text-ink mb-4">Vista {vista}</h2>
          <div className="space-y-3">
            {actividades
              .filter(a => vista === 'dia'
                ? new Date(a.fechaHora).toDateString() === fechaBase.toDateString()
                : new Date(a.fechaHora) >= new Date(fechaBase.getTime() - 3 * 86400000) &&
                  new Date(a.fechaHora) <= new Date(fechaBase.getTime() + 3 * 86400000)
              )
              .map(a => (
                <div key={a.id} className="p-4 rounded-soft bg-sand/50">
                  <div className="font-semibold text-ink">{a.titulo}</div>
                  <div className="text-sm text-coffee/70">{new Date(a.fechaHora).toLocaleString()}</div>
                </div>
              ))}
            {actividades.length === 0 && (
              <p className="text-coffee/60">No hay actividades en este rango.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
