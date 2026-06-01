'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  crearConversacion,
  enviarMensaje,
  getConversacionesUsuario,
  getMensajesConversacion,
  getUsuarioPorId,
  getVinculosAdulto,
  getVinculoPorCuidador,
} from '@/lib/store';
import type { Conversacion } from '@/lib/types';
import { MessageCircle, Send, Mic } from 'lucide-react';

export default function MensajesPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const [texto, setTexto] = useState('');
  const [vozError, setVozError] = useState('');
  const [vozActiva, setVozActiva] = useState(false);

  useEffect(() => {
    if (!cargando && !usuario) router.push('/login');
  }, [cargando, usuario, router]);

  useEffect(() => {
    if (!usuario) return;
    const convs = getConversacionesUsuario(usuario.id);
    if (!convs.some(c => c.tipo === 'buzon')) {
      crearConversacion('buzon', [usuario.id], 'Buzón de sugerencias');
    }
    setConversaciones(getConversacionesUsuario(usuario.id));
  }, [usuario]);

  useEffect(() => {
    const param = searchParams.get('conv');
    if (param) setConvId(param);
  }, [searchParams]);

  const actual = conversaciones.find(c => c.id === convId) ?? conversaciones[0];

  const mensajes = useMemo(() => {
    if (!actual) return [];
    return getMensajesConversacion(actual.id);
  }, [actual, conversaciones]);

  const handleEnviar = () => {
    if (!usuario || !actual || !texto.trim()) return;
    enviarMensaje(actual.id, usuario.id, texto.trim());
    setTexto('');
    setConversaciones(getConversacionesUsuario(usuario.id));
  };

  const iniciarVoz = () => {
    setVozError('');
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
      .SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVozError('Tu navegador no soporta dictado por voz.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'es-CO';
    rec.onstart = () => setVozActiva(true);
    rec.onend = () => setVozActiva(false);
    rec.onerror = () => { setVozError('No pudimos capturar la voz.'); setVozActiva(false); };
    rec.onresult = (event: any) => {
      const textoVoz = event.results[0][0].transcript;
      setTexto(prev => `${prev} ${textoVoz}`.trim());
    };
    rec.start();
  };

  const nombreConversacion = (conv: Conversacion) => {
    if (conv.titulo) return conv.titulo;
    if (!usuario) return 'Conversación';
    const otro = conv.participanteIds.find(p => p !== usuario.id);
    return otro ? getUsuarioPorId(otro)?.nombre ?? 'Contacto' : 'Conversación';
  };

  const vinculo = usuario && (usuario.rol === 'cuidador'
    ? getVinculoPorCuidador(usuario.id)
    : getVinculosAdulto(usuario.id)[0]);

  if (cargando || !usuario) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl lg:text-5xl text-ink mb-2">Mensajes</h1>
        <p className="text-coffee/80">Comunícate con proveedores, cuidadores y el buzón de sugerencias.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <div className="bg-cream rounded-soft border border-coffee/10 p-4 space-y-2">
            {conversaciones.map(c => (
              <button
                key={c.id}
                onClick={() => setConvId(c.id)}
                className={`w-full text-left px-4 py-3 rounded-soft transition-colors ${
                  actual?.id === c.id ? 'bg-sand/70' : 'hover:bg-sand/40'
                }`}
              >
                <div className="font-semibold text-ink">{nombreConversacion(c)}</div>
                <div className="text-xs text-coffee/60">{new Date(c.fechaActualizacion).toLocaleString()}</div>
              </button>
            ))}
            {!vinculo && usuario.rol !== 'proveedor' && (
              <div className="text-xs text-coffee/60 px-3">
                Vincula un cuidador para abrir un chat directo.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-cream rounded-soft border border-coffee/10 p-6 flex flex-col h-[520px]">
            <div className="flex-1 overflow-y-auto space-y-3">
              {actual ? (
                mensajes.length > 0 ? (
                  mensajes.map(m => (
                    <div
                      key={m.id}
                      className={`max-w-[70%] px-4 py-3 rounded-soft ${
                        m.remitenteId === usuario.id
                          ? 'ml-auto bg-clay text-cream'
                          : 'bg-sand/60 text-ink'
                      }`}
                    >
                      <p className="text-sm">{m.texto}</p>
                      <span className="text-[11px] opacity-70">{new Date(m.fechaCreacion).toLocaleTimeString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-coffee/60 mt-24">
                    <MessageCircle className="w-10 h-10 mx-auto mb-3" />
                    No hay mensajes todavía.
                  </div>
                )
              ) : (
                <div className="text-center text-coffee/60 mt-24">
                  Selecciona una conversación.
                </div>
              )}
            </div>

            {vozError && <p className="text-xs text-clay mt-2">{vozError}</p>}
            <div className="pt-4 flex items-center gap-2">
              <button
                onClick={iniciarVoz}
                className="p-3 rounded-pill border-2 border-coffee/20 hover:border-clay"
                title="Dictado por voz"
              >
                <Mic className={`w-5 h-5 ${vozActiva ? 'text-clay animate-pulse' : 'text-coffee'}`} />
              </button>
              <input
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-3 rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none"
              />
              <button
                onClick={handleEnviar}
                className="px-4 py-3 rounded-pill bg-clay text-cream font-semibold hover:bg-coffee"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
