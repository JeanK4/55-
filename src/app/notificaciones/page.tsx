'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getNotificacionesUsuario, marcarNotificacionLeida, marcarTodasLeidas } from '@/lib/store';
import type { Notificacion } from '@/lib/types';
import { Bell, Volume2, Check } from 'lucide-react';

export default function NotificacionesPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [filtro, setFiltro] = useState<'todas' | 'no_leidas'>('todas');
  const [notis, setNotis] = useState<Notificacion[]>([]);

  useEffect(() => {
    if (!cargando && !usuario) router.push('/login');
  }, [cargando, usuario, router]);

  useEffect(() => {
    if (!usuario) return;
    setNotis(getNotificacionesUsuario(usuario.id).sort(
      (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    ));
  }, [usuario]);

  const leer = (texto: string) => {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-CO';
    window.speechSynthesis.speak(u);
  };

  const marcarTodo = () => {
    if (!usuario) return;
    marcarTodasLeidas(usuario.id);
    setNotis(getNotificacionesUsuario(usuario.id));
  };

  const mostrar = notis.filter(n => (filtro === 'no_leidas' ? !n.leida : true));

  if (cargando || !usuario) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl lg:text-5xl text-ink mb-2">Notificaciones</h1>
          <p className="text-coffee/80">Mantente al día con tus actividades.</p>
        </div>
        <button
          onClick={marcarTodo}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-pill border-2 border-coffee/20 text-sm font-semibold hover:border-clay"
        >
          <Check className="w-4 h-4" />
          Marcar todo leído
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFiltro('todas')}
          className={`px-4 py-2 rounded-pill text-sm font-medium ${filtro === 'todas' ? 'bg-ink text-cream' : 'bg-sand text-ink'}`}
        >
          Todas
        </button>
        <button
          onClick={() => setFiltro('no_leidas')}
          className={`px-4 py-2 rounded-pill text-sm font-medium ${filtro === 'no_leidas' ? 'bg-ink text-cream' : 'bg-sand text-ink'}`}
        >
          No leídas
        </button>
      </div>

      {mostrar.length > 0 ? (
        <div className="space-y-4">
          {mostrar.map(n => (
            <div key={n.id} className={`p-5 rounded-soft border ${n.leida ? 'bg-cream border-coffee/10' : 'bg-sand/60 border-clay/30'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-4 h-4 text-clay" />
                    <h3 className="font-semibold text-ink">{n.titulo}</h3>
                  </div>
                  <p className="text-sm text-coffee/80">{n.mensaje}</p>
                  <p className="text-xs text-coffee/50 mt-2">{new Date(n.fechaCreacion).toLocaleString()}</p>
                  {n.enlace && (
                    <Link href={n.enlace} className="text-xs text-clay font-semibold hover:underline">
                      Ver detalle
                    </Link>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => leer(`${n.titulo}. ${n.mensaje}`)}
                    className="p-2 rounded-full hover:bg-sand"
                    aria-label="Leer notificación"
                  >
                    <Volume2 className="w-4 h-4 text-coffee" />
                  </button>
                  {!n.leida && (
                    <button
                      onClick={() => { marcarNotificacionLeida(n.id); setNotis(getNotificacionesUsuario(usuario.id)); }}
                      className="text-xs text-clay font-semibold"
                    >
                      Marcar leída
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="font-display text-8xl text-coffee/20 mb-6">🔔</div>
          <h2 className="font-display text-3xl text-ink mb-3">No hay notificaciones</h2>
          <p className="text-coffee/70">Las alertas y recordatorios aparecerán aquí.</p>
        </div>
      )}
    </div>
  );
}
