'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getUsuarioPorCorreo } from '@/lib/store';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { iniciarSesion } = useAuth();
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const u = getUsuarioPorCorreo(correo.trim());
    if (!u) {
      setError('No encontramos una cuenta con ese correo. ¿Quieres crear una?');
      return;
    }

    iniciarSesion(u);
    if (u.rol === 'proveedor') router.push('/proveedor');
    else router.push('/actividades');
  };


  return (
    <div className="max-w-md mx-auto px-6 py-16 lg:py-24">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl lg:text-5xl text-ink mb-3">
          Bienvenido de nuevo
        </h1>
        <p className="text-coffee/80">
          Tu lugar para descubrir actividades te está esperando.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-cream rounded-soft border border-coffee/10 p-8 space-y-6 shadow-soft"
      >
        <div>
          <label htmlFor="correo" className="block text-base font-semibold text-ink mb-2">
            Tu correo electrónico
          </label>
          <input
            id="correo"
            type="email"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            required
            autoComplete="email"
            placeholder="ejemplo@correo.com"
            className="w-full px-5 py-4 text-lg rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-soft bg-clay/10 border border-clay/30">
            <AlertCircle className="w-5 h-5 text-clay flex-shrink-0 mt-0.5" />
            <p className="text-sm text-coffee">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-pill bg-clay text-cream text-lg font-semibold hover:bg-coffee transition-colors shadow-soft"
        >
          <LogIn className="w-5 h-5" />
          Entrar a mi cuenta
        </button>

        <p className="text-center text-coffee/80">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/registro" className="font-semibold text-clay hover:underline">
            Créala aquí
          </Link>
        </p>
      </form>

      {/* Cuentas demo */}
      <div className="mt-8 p-5 rounded-soft bg-sand/50 border border-coffee/10">
        <p className="text-sm font-semibold text-ink mb-3">Cuentas de prueba</p>
        <div className="space-y-1.5 text-sm text-coffee">
          <div>👵 <code className="bg-cream px-2 py-0.5 rounded text-clay">maria@club55.demo</code> — Adulto mayor</div>
          <div>🧑‍⚕️ <code className="bg-cream px-2 py-0.5 rounded text-clay">laura@club55.demo</code> — Cuidador</div>
          <div>🏛️ <code className="bg-cream px-2 py-0.5 rounded text-clay">tertulia@club55.demo</code> — Proveedor</div>
          <div className="pt-2 text-xs">O crea una cuenta nueva en el registro.</div>
        </div>
      </div>
    </div>
  );
}
