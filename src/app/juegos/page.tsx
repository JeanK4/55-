'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { crearJuegoSesion } from '@/lib/store';
import { Brain, RefreshCw, Trophy } from 'lucide-react';

type Dificultad = 'facil' | 'media' | 'dificil';

const ICONOS = ['🍎', '🎵', '🌿', '🎨', '📚', '☀️', '🌼', '🍵', '🎲', '🧩', '🚶', '💡'];

export default function JuegosPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [dificultad, setDificultad] = useState<Dificultad>('facil');
  const [cartas, setCartas] = useState<string[]>([]);
  const [abiertas, setAbiertas] = useState<number[]>([]);
  const [aciertos, setAciertos] = useState<number[]>([]);
  const [movimientos, setMovimientos] = useState(0);
  const [inicio, setInicio] = useState<number | null>(null);
  const [finalizado, setFinalizado] = useState(false);

  useEffect(() => {
    if (!cargando && !usuario) router.push('/login');
  }, [cargando, usuario, router]);

  const pares = dificultad === 'facil' ? 4 : dificultad === 'media' ? 6 : 8;

  const reiniciar = () => {
    const seleccion = ICONOS.slice(0, pares);
    const mix = [...seleccion, ...seleccion].sort(() => Math.random() - 0.5);
    setCartas(mix);
    setAbiertas([]);
    setAciertos([]);
    setMovimientos(0);
    setInicio(Date.now());
    setFinalizado(false);
  };

  useEffect(() => {
    reiniciar();
  }, [dificultad]);

  useEffect(() => {
    if (aciertos.length === pares * 2 && inicio && usuario && !finalizado) {
      const duracion = Math.floor((Date.now() - inicio) / 1000);
      crearJuegoSesion({
        usuarioId: usuario.id,
        juego: 'memoria',
        dificultad,
        puntaje: Math.max(1000 - movimientos * 10 - duracion, 100),
        duracionSeg: duracion,
      });
      setFinalizado(true);
    }
  }, [aciertos, pares, inicio, usuario, dificultad, movimientos, finalizado]);

  const handleClick = (idx: number) => {
    if (abiertas.includes(idx) || aciertos.includes(idx) || abiertas.length === 2) return;
    const nuevas = [...abiertas, idx];
    setAbiertas(nuevas);
    if (nuevas.length === 2) {
      setMovimientos(m => m + 1);
      const [a, b] = nuevas;
      if (cartas[a] === cartas[b]) {
        setAciertos(prev => [...prev, a, b]);
        setTimeout(() => setAbiertas([]), 400);
      } else {
        setTimeout(() => setAbiertas([]), 700);
      }
    }
  };

  const gridCols = dificultad === 'facil' ? 'grid-cols-4' : dificultad === 'media' ? 'grid-cols-4' : 'grid-cols-4';

  if (cargando || !usuario) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-10 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl lg:text-5xl text-ink mb-2">Juegos cognitivos</h1>
        <p className="text-coffee/80">Ejercita tu memoria con desafíos simples y divertidos.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        {(['facil', 'media', 'dificil'] as const).map(d => (
          <button
            key={d}
            onClick={() => setDificultad(d)}
            className={`px-4 py-2 rounded-pill text-sm font-medium ${
              dificultad === d ? 'bg-ink text-cream' : 'bg-sand text-ink'
            }`}
          >
            {d === 'facil' ? 'Fácil' : d === 'media' ? 'Media' : 'Difícil'}
          </button>
        ))}
        <button
          onClick={reiniciar}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-pill border-2 border-coffee/20 text-sm font-semibold hover:border-clay"
        >
          <RefreshCw className="w-4 h-4" />
          Reiniciar
        </button>
      </div>

      <div className="bg-cream rounded-soft border border-coffee/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-coffee/70">Movimientos: <strong>{movimientos}</strong></div>
          {finalizado && (
            <div className="text-sm text-sage font-semibold flex items-center gap-1">
              <Trophy className="w-4 h-4" /> ¡Completado!
            </div>
          )}
        </div>
        <div className={`grid ${gridCols} gap-3`}>
          {cartas.map((c, i) => {
            const abierta = abiertas.includes(i) || aciertos.includes(i);
            return (
              <button
                key={`${c}-${i}`}
                onClick={() => handleClick(i)}
                className={`h-20 rounded-soft text-2xl font-semibold border ${
                  abierta ? 'bg-sand/60 border-clay' : 'bg-cream border-coffee/20'
                }`}
              >
                {abierta ? c : <Brain className="w-6 h-6 mx-auto text-coffee/40" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
