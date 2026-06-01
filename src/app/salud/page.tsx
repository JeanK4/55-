'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  getRecomendacionesSalud,
  getFavoritosSalud,
  toggleFavoritoSalud,
  crearNotificacion,
  getVinculosAdulto,
  getVinculoPorCuidador,
} from '@/lib/store';
import type { RecomendacionSalud } from '@/lib/types';
import { Heart, Share2, Info } from 'lucide-react';

export default function SaludPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [categoria, setCategoria] = useState<'todas' | RecomendacionSalud['categoria']>('todas');

  useEffect(() => {
    if (!cargando && !usuario) router.push('/login');
  }, [cargando, usuario, router]);

  const recs = getRecomendacionesSalud();
  const favoritos = usuario ? getFavoritosSalud(usuario.id) : [];
  const favoritosSet = new Set(favoritos.map(f => f.recomendacionId));

  const mostrar = useMemo(() => {
    return categoria === 'todas' ? recs : recs.filter(r => r.categoria === categoria);
  }, [recs, categoria]);

  const compartir = (rec: RecomendacionSalud) => {
    if (!usuario) return;
    const vinculo = usuario.rol === 'cuidador'
      ? getVinculoPorCuidador(usuario.id)
      : getVinculosAdulto(usuario.id)[0];
    if (!vinculo) return;
    const destino = usuario.rol === 'cuidador' ? vinculo.adultoMayorId : vinculo.cuidadorId;
    crearNotificacion(destino, {
      tipo: 'salud',
      titulo: 'Recomendación de salud compartida',
      mensaje: rec.titulo,
      enlace: '/salud',
    });
  };

  if (cargando || !usuario) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl lg:text-5xl text-ink mb-2">Recomendaciones de salud</h1>
        <p className="text-coffee/80">Consejos personalizados para tu bienestar.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(['todas', 'alimentacion', 'ejercicio', 'salud_mental', 'prevencion', 'hidratacion'] as const).map(c => (
          <button
            key={c}
            onClick={() => setCategoria(c)}
            className={`px-4 py-2 rounded-pill text-sm font-medium ${
              categoria === c ? 'bg-ink text-cream' : 'bg-sand text-ink'
            }`}
          >
            {c === 'todas' ? 'Todas' : c.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {mostrar.map(r => (
          <div key={r.id} className="bg-cream rounded-soft border border-coffee/10 p-6 space-y-3">
            <h3 className="font-display text-2xl text-ink">{r.titulo}</h3>
            <p className="text-coffee/80">{r.descripcion}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => usuario && toggleFavoritoSalud(usuario.id, r.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-pill border-2 ${
                  favoritosSet.has(r.id) ? 'border-clay text-clay' : 'border-coffee/20'
                }`}
              >
                <Heart className="w-4 h-4" />
                {favoritosSet.has(r.id) ? 'Favorito' : 'Guardar'}
              </button>
              <button
                onClick={() => compartir(r)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-pill border-2 border-coffee/20"
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
              <a
                href={r.fuenteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-pill border-2 border-coffee/20"
              >
                <Info className="w-4 h-4" />
                Fuente
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-5 rounded-soft bg-sand/60 border border-coffee/10 text-sm text-coffee/80">
        Estas recomendaciones no sustituyen el criterio de un profesional de la salud.
      </div>
    </div>
  );
}
