'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import ActividadCard from '@/components/ActividadCard';
import { getActividadesPublicas, getReservasUsuario, getActividadPorId } from '@/lib/store';
import type { Actividad } from '@/lib/types';
import { Sparkles, X } from 'lucide-react';

export default function RecomendacionesPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [descartadas, setDescartadas] = useState<string[]>([]);

  useEffect(() => {
    if (!cargando && !usuario) router.push('/login');
  }, [cargando, usuario, router]);

  const recomendaciones = useMemo(() => {
    if (!usuario) return [] as Actividad[];
    const actividades = getActividadesPublicas();
    const historial = getReservasUsuario(usuario.id)
      .map(r => getActividadPorId(r.actividadId))
      .filter(Boolean) as Actividad[];
    const categoriasHist = new Set(historial.map(a => a.categoria));
    const intereses = (usuario.intereses ?? []).map(i => i.toLowerCase());
    const ciudad = (usuario.ciudad ?? '').toLowerCase();

    const puntuar = (a: Actividad) => {
      let score = 0;
      if (intereses.some(i => a.titulo.toLowerCase().includes(i) || a.descripcion.toLowerCase().includes(i))) score += 3;
      if (categoriasHist.has(a.categoria)) score += 2;
      if (ciudad && a.ubicacion.toLowerCase().includes(ciudad)) score += 1;
      if (a.cuposDisponibles > 0) score += 1;
      return score;
    };

    return actividades
      .filter(a => !descartadas.includes(a.id))
      .map(a => ({ ...a, _score: puntuar(a) }))
      .sort((a, b) => (b as any)._score - (a as any)._score)
      .slice(0, 9);
  }, [usuario, descartadas]);

  if (cargando || !usuario) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl lg:text-5xl text-ink mb-2">
          Recomendadas para ti
        </h1>
        <p className="text-coffee/80">
          Basadas en tus intereses, historial y ubicación.
        </p>
      </div>

      {recomendaciones.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recomendaciones.map((a, i) => (
            <div key={a.id} className="relative">
              <ActividadCard actividad={a} animationDelay={i * 0.07} />
              <button
                onClick={() => setDescartadas(prev => [...prev, a.id])}
                className="absolute top-4 right-4 p-2 rounded-full bg-cream/90 border border-coffee/10"
                title="Descartar"
              >
                <X className="w-4 h-4 text-coffee" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="font-display text-8xl text-coffee/20 mb-6">✨</div>
          <h2 className="font-display text-3xl text-ink mb-3">Sin recomendaciones</h2>
          <p className="text-coffee/70 mb-6">
            Explora actividades para que podamos sugerirte mejores opciones.
          </p>
          <a
            href="/actividades"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-clay text-cream font-semibold hover:bg-coffee transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Explorar actividades
          </a>
        </div>
      )}
    </div>
  );
}
