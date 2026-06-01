'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  actualizarUsuario,
  eliminarUsuario,
  generarCodigoVinculo,
  getVinculosAdulto,
  getUsuarioPorId,
  revocarVinculo,
  crearVinculoCuidador,
  obtenerAdultoPorCodigo,
} from '@/lib/store';
import type { Usuario } from '@/lib/types';
import { AlertCircle, Check, User, Link2, Trash2 } from 'lucide-react';

export default function PerfilPage() {
  const { usuario, cargando, cerrarSesion } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<Usuario | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [codigoVinculo, setCodigoVinculo] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    if (!cargando && !usuario) router.push('/login');
  }, [cargando, usuario, router]);

  useEffect(() => {
    if (!usuario) return;
    setForm(usuario);
  }, [usuario]);

  if (cargando || !usuario || !form) return null;

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    actualizarUsuario(usuario.id, form);
    setMensaje('Perfil actualizado correctamente.');
  };

  const handleEliminar = () => {
    const ok = window.confirm('¿Seguro que deseas eliminar tu perfil? Esta acción no se puede deshacer.');
    if (!ok) return;
    eliminarUsuario(usuario.id);
    cerrarSesion();
    router.push('/');
  };

  const handleSubirFoto = (file: File | null) => {
    if (!file) return;
    setSubiendo(true);
    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => (prev ? { ...prev, fotoUrl: reader.result as string } : prev));
      setSubiendo(false);
    };
    reader.onerror = () => {
      setSubiendo(false);
      setError('No pudimos cargar la foto.');
    };
    reader.readAsDataURL(file);
  };

  const handleVincular = () => {
    setError('');
    if (!codigoVinculo.trim()) {
      setError('Ingresa el código de vinculación.');
      return;
    }
    const adulto = obtenerAdultoPorCodigo(codigoVinculo.trim());
    if (!adulto) {
      setError('El código no es válido.');
      return;
    }
    crearVinculoCuidador(adulto.id, usuario.id);
    setMensaje('Vínculo creado correctamente.');
  };

  const vinculos = usuario.rol === 'adulto_mayor' ? getVinculosAdulto(usuario.id) : [];

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl lg:text-5xl text-ink mb-2">Mi perfil</h1>
        <p className="text-coffee/80">Actualiza tus datos y preferencias.</p>
      </div>

      <form onSubmit={handleGuardar} className="bg-cream rounded-soft border border-coffee/10 p-8 space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-sand overflow-hidden flex items-center justify-center">
            {form.fotoUrl
              ? <img src={form.fotoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
              : <User className="w-8 h-8 text-coffee/60" />}
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Foto de perfil</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => handleSubirFoto(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            {subiendo && <p className="text-xs text-coffee/60">Subiendo foto...</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-base font-semibold text-ink mb-2">Nombre</label>
            <input
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-5 py-4 rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-ink mb-2">Correo</label>
            <input
              type="email"
              value={form.correo}
              onChange={e => setForm({ ...form, correo: e.target.value })}
              className="w-full px-5 py-4 rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-base font-semibold text-ink mb-2">Teléfono</label>
            <input
              value={form.telefono ?? ''}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              className="w-full px-5 py-4 rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-ink mb-2">Ciudad</label>
            <input
              value={form.ciudad ?? ''}
              onChange={e => setForm({ ...form, ciudad: e.target.value })}
              className="w-full px-5 py-4 rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none"
            />
          </div>
        </div>

        {usuario.rol === 'adulto_mayor' && (
          <div>
            <label className="block text-base font-semibold text-ink mb-2">Condición física</label>
            <textarea
              value={form.condicionFisica ?? ''}
              onChange={e => setForm({ ...form, condicionFisica: e.target.value })}
              className="w-full px-5 py-4 rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none resize-none"
              rows={3}
            />
          </div>
        )}

        {mensaje && (
          <div className="flex items-start gap-3 p-4 rounded-soft bg-sage/10 border border-sage/30">
            <Check className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
            <p className="text-sm text-ink">{mensaje}</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-soft bg-clay/10 border border-clay/30">
            <AlertCircle className="w-5 h-5 text-clay flex-shrink-0 mt-0.5" />
            <p className="text-sm text-coffee">{error}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="px-6 py-3 rounded-pill bg-clay text-cream font-semibold hover:bg-coffee transition-colors"
          >
            Guardar cambios
          </button>
          <button
            type="button"
            onClick={handleEliminar}
            className="px-6 py-3 rounded-pill border-2 border-clay text-clay font-semibold hover:bg-clay/10 transition-colors"
          >
            <Trash2 className="w-4 h-4 inline mr-1" /> Eliminar perfil
          </button>
        </div>
      </form>

      {usuario.rol === 'adulto_mayor' && (
        <div className="mt-10 bg-cream rounded-soft border border-coffee/10 p-8 space-y-4">
          <h2 className="font-display text-2xl text-ink">Vincular cuidador</h2>
          <p className="text-coffee/70">Comparte este código con tu cuidador:</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-sand">
            <Link2 className="w-4 h-4 text-clay" />
            <span className="font-semibold text-ink">{generarCodigoVinculo(usuario.id)}</span>
          </div>
          {vinculos.length > 0 && (
            <div className="pt-4">
              <p className="text-sm font-semibold text-ink mb-2">Cuidadores vinculados</p>
              <div className="space-y-2">
                {vinculos.map(v => {
                  const cuidador = getUsuarioPorId(v.cuidadorId);
                  return (
                    <div key={v.id} className="flex items-center justify-between px-4 py-3 rounded-soft bg-sand/60 border border-coffee/10">
                      <div>
                        <div className="font-semibold text-ink">{cuidador?.nombre ?? 'Cuidador'}</div>
                        <div className="text-xs text-coffee/60">{cuidador?.correo}</div>
                      </div>
                      <button
                        onClick={() => revocarVinculo(v.id)}
                        className="text-xs text-clay font-semibold"
                      >
                        Revocar
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {usuario.rol === 'cuidador' && (
        <div className="mt-10 bg-cream rounded-soft border border-coffee/10 p-8 space-y-4">
          <h2 className="font-display text-2xl text-ink">Vincular adulto mayor</h2>
          <p className="text-coffee/70">Ingresa el código compartido por el adulto mayor.</p>
          <div className="flex flex-wrap gap-3">
            <input
              value={codigoVinculo}
              onChange={e => setCodigoVinculo(e.target.value)}
              className="flex-1 min-w-[220px] px-4 py-3 rounded-soft border border-coffee/20 bg-cream"
              placeholder="C55-XXXXXX"
            />
            <button
              onClick={handleVincular}
              className="px-6 py-3 rounded-pill bg-clay text-cream font-semibold hover:bg-coffee transition-colors"
            >
              Vincular
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
