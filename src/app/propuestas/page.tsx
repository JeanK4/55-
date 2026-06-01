'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  crearPropuesta,
  getPropuestas,
  votarPropuesta,
  comentarPropuesta,
  getPropuestaComentarios,
} from '@/lib/store';
import type { Categoria, Propuesta } from '@/lib/types';
import { CATEGORIAS } from '@/lib/types';
import { Plus, ThumbsUp, MessageCircle, AlertCircle } from 'lucide-react';

export default function PropuestasPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('social');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cargando && !usuario) router.push('/login');
  }, [cargando, usuario, router]);

  useEffect(() => {
    setPropuestas(getPropuestas().sort((a, b) => b.votos - a.votos));
  }, []);

  const handleCrear = () => {
    if (!usuario) return;
    setError('');
    if (!titulo.trim() || !descripcion.trim() || !ubicacion.trim()) {
      setError('Completa título, descripción y ubicación.');
      return;
    }
    crearPropuesta({
      usuarioId: usuario.id,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      ubicacion: ubicacion.trim(),
      categoria,
    });
    setTitulo('');
    setDescripcion('');
    setUbicacion('');
    setPropuestas(getPropuestas().sort((a, b) => b.votos - a.votos));
  };

  const handleVoto = (id: string) => {
    votarPropuesta(id);
    setPropuestas(getPropuestas().sort((a, b) => b.votos - a.votos));
  };

  const handleComentario = (id: string, comentario: string, limpiar: () => void) => {
    if (!usuario) return;
    try {
      comentarPropuesta(id, usuario.id, comentario);
      limpiar();
      setPropuestas(getPropuestas().sort((a, b) => b.votos - a.votos));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos publicar tu comentario.');
    }
  };

  if (cargando || !usuario) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl lg:text-5xl text-ink mb-2">Propuestas de la comunidad</h1>
        <p className="text-coffee/80">Sugiere nuevas actividades y vota por tus favoritas.</p>
      </div>

      <div className="bg-cream rounded-soft border border-coffee/10 p-6 mb-10 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Título de tu propuesta"
            className="px-4 py-3 rounded-soft border border-coffee/20 bg-cream"
          />
          <input
            value={ubicacion}
            onChange={e => setUbicacion(e.target.value)}
            placeholder="Ubicación deseada"
            className="px-4 py-3 rounded-soft border border-coffee/20 bg-cream"
          />
        </div>
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Describe la actividad que te gustaría ver"
          className="w-full px-4 py-3 rounded-soft border border-coffee/20 bg-cream resize-none"
          rows={3}
        />
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value as Categoria)}
            className="px-4 py-3 rounded-soft border border-coffee/20 bg-cream"
          >
            {(Object.keys(CATEGORIAS) as Categoria[]).map(cat => (
              <option key={cat} value={cat}>{CATEGORIAS[cat].nombre}</option>
            ))}
          </select>
          <button
            onClick={handleCrear}
            className="px-6 py-3 rounded-pill bg-clay text-cream font-semibold hover:bg-coffee transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Publicar propuesta
          </button>
        </div>
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-soft bg-clay/10 border border-clay/30">
            <AlertCircle className="w-5 h-5 text-clay flex-shrink-0 mt-0.5" />
            <p className="text-sm text-coffee">{error}</p>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {propuestas.map(p => (
          <PropuestaCard key={p.id} propuesta={p} onVotar={handleVoto} onComentar={handleComentario} />
        ))}
      </div>
    </div>
  );
}

function PropuestaCard({
  propuesta,
  onVotar,
  onComentar,
}: {
  propuesta: Propuesta;
  onVotar: (id: string) => void;
  onComentar: (id: string, comentario: string, limpiar: () => void) => void;
}) {
  const [comentario, setComentario] = useState('');
  const comentarios = getPropuestaComentarios(propuesta.id);
  const cat = CATEGORIAS[propuesta.categoria];

  return (
    <div className="bg-cream rounded-soft border border-coffee/10 p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-pill ${cat.color}`}>
            {cat.emoji} {cat.nombre}
          </div>
          <h3 className="font-display text-2xl text-ink mt-2">{propuesta.titulo}</h3>
          <p className="text-sm text-coffee/70 mt-1">{propuesta.ubicacion}</p>
        </div>
        <div className="text-right">
          <button
            onClick={() => onVotar(propuesta.id)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-pill border-2 border-coffee/20 text-sm font-semibold hover:border-clay"
          >
            <ThumbsUp className="w-4 h-4" /> {propuesta.votos}
          </button>
          {propuesta.estado === 'revision' && (
            <p className="text-xs text-clay mt-2">En revisión de contenido</p>
          )}
        </div>
      </div>
      <p className="text-coffee/80">{propuesta.descripcion}</p>

      <div className="pt-2">
        <p className="text-sm font-semibold text-ink mb-2 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" /> Comentarios
        </p>
        {comentarios.length > 0 ? (
          <div className="space-y-2 mb-3">
            {comentarios.slice(0, 3).map(c => (
              <div key={c.id} className="text-sm text-coffee/80 bg-sand/50 rounded-soft px-3 py-2">
                {c.comentario}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-coffee/60 mb-3">Sé el primero en comentar.</p>
        )}
        <div className="flex flex-wrap gap-3">
          <input
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            placeholder="Escribe un comentario..."
            className="flex-1 min-w-[220px] px-3 py-2 rounded-soft border border-coffee/20 bg-cream"
          />
          <button
            onClick={() => onComentar(propuesta.id, comentario, () => setComentario(''))}
            className="px-4 py-2 rounded-pill bg-clay text-cream text-sm font-semibold hover:bg-coffee"
          >
            Comentar
          </button>
        </div>
      </div>
    </div>
  );
}
