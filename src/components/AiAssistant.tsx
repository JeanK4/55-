'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bot, X, Send, Mic } from 'lucide-react';

interface Mensaje {
  id: string;
  autor: 'user' | 'bot';
  texto: string;
}

function generarRespuesta(texto: string) {
  const t = texto.toLowerCase();
  if (t.includes('reservar')) return 'Para reservar, abre una actividad y presiona "Reservar mi cupo".';
  if (t.includes('calendario')) return 'Puedes ver tu agenda en la sección Calendario.';
  if (t.includes('salud')) return 'En Recomendaciones de salud encontrarás tips personalizados.';
  if (t.includes('mensaje') || t.includes('chat')) return 'Abre Mensajes para hablar con tu proveedor o cuidador.';
  if (t.includes('juego')) return 'En Juegos tienes ejercicios de memoria y concentración.';
  return 'Puedo ayudarte a buscar actividades, reservar cupos o explicar funciones de la plataforma.';
}

export default function AiAssistant() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { id: 'm1', autor: 'bot', texto: 'Hola, soy tu asistente. ¿En qué te puedo ayudar?' },
  ]);
  const [texto, setTexto] = useState('');
  const [vozError, setVozError] = useState('');

  const enviar = () => {
    if (!texto.trim()) return;
    const userMsg: Mensaje = { id: crypto.randomUUID(), autor: 'user', texto: texto.trim() };
    const botMsg: Mensaje = { id: crypto.randomUUID(), autor: 'bot', texto: generarRespuesta(texto) };
    setMensajes(prev => [...prev, userMsg, botMsg]);
    setTexto('');
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
    rec.onresult = (event: any) => {
      const textoVoz = event.results[0][0].transcript;
      setTexto(textoVoz);
    };
    rec.onerror = () => setVozError('No pudimos capturar la voz.');
    rec.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {abierto && (
        <div className="w-80 bg-cream rounded-soft border border-coffee/10 shadow-lift mb-3 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-coffee/10 bg-sand/60">
            <div className="flex items-center gap-2 font-semibold text-ink">
              <Bot className="w-5 h-5 text-clay" /> Asistente 55+
            </div>
            <button onClick={() => setAbierto(false)} className="p-1 rounded-full hover:bg-sand">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {mensajes.map(m => (
              <div key={m.id} className={`px-3 py-2 rounded-soft text-sm ${
                m.autor === 'user' ? 'bg-clay text-cream ml-6' : 'bg-sand/60 text-ink mr-6'
              }`}>
                {m.texto}
              </div>
            ))}
            <div className="flex flex-wrap gap-2 pt-2">
              <Link href="/actividades" className="text-xs px-3 py-1 rounded-pill bg-sand/60">Buscar actividades</Link>
              <Link href="/calendario" className="text-xs px-3 py-1 rounded-pill bg-sand/60">Ver calendario</Link>
              <Link href="/mensajes" className="text-xs px-3 py-1 rounded-pill bg-sand/60">Ir a mensajes</Link>
            </div>
          </div>
          {vozError && <p className="text-xs text-clay px-4 pb-2">{vozError}</p>}
          <div className="p-3 border-t border-coffee/10 flex items-center gap-2">
            <button onClick={iniciarVoz} className="p-2 rounded-pill border border-coffee/20">
              <Mic className="w-4 h-4 text-coffee" />
            </button>
            <input
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Escribe tu pregunta..."
              className="flex-1 px-3 py-2 rounded-soft border border-coffee/20 bg-cream"
            />
            <button onClick={enviar} className="p-2 rounded-pill bg-clay text-cream">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-14 h-14 rounded-full bg-clay text-cream flex items-center justify-center shadow-lift hover:bg-coffee"
        aria-label="Abrir asistente"
      >
        <Bot className="w-6 h-6" />
      </button>
    </div>
  );
}
