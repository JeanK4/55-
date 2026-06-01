'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { actualizarActividad, getActividadPorId } from '@/lib/store';
import type { Categoria, ModalidadActividad } from '@/lib/types';
import { CATEGORIAS } from '@/lib/types';
import { ArrowLeft, Save, AlertCircle, Check } from 'lucide-react';

export default function EditarActividadPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'fisica' as Categoria,
    ubicacion: '',
    fecha: '',
    hora: '',
    duracionMinutos: 60,
    cuposTotales: 15,
    edadMinima: 55,
    costo: 0,
    modalidad: 'presencial' as ModalidadActividad,
    enlaceVirtual: '',
    condiciones: '',
    ubicacionLat: '',
    ubicacionLng: '',
    imagenUrl: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => { setMontado(true); }, []);

  useEffect(() => {
    if (!cargando && !usuario) router.push('/login');
    if (!cargando && usuario && usuario.rol !== 'proveedor') router.push('/actividades');
  }, [cargando, usuario, router]);

  useEffect(() => {
    const act = getActividadPorId(id);
    if (!act) return;
    const [fecha, hora] = act.fechaHora.split('T');
    setForm({
      titulo: act.titulo,
      descripcion: act.descripcion,
      categoria: act.categoria,
      ubicacion: act.ubicacion,
      fecha,
      hora: hora?.slice(0, 5) ?? '',
      duracionMinutos: act.duracionMinutos,
      cuposTotales: act.cuposTotales,
      edadMinima: act.edadMinima,
      costo: act.costo,
      modalidad: act.modalidad,
      enlaceVirtual: act.enlaceVirtual ?? '',
      condiciones: act.condiciones ?? '',
      ubicacionLat: act.ubicacionLat?.toString() ?? '',
      ubicacionLng: act.ubicacionLng?.toString() ?? '',
      imagenUrl: act.imagenUrl,
    });
  }, [id]);

  if (!montado || cargando || !usuario || usuario.rol !== 'proveedor') return null;

  const set = (field: string, value: string | number) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEnviando(true);

    if (!form.titulo.trim()) { setError('El título es obligatorio.'); setEnviando(false); return; }
    if (!form.descripcion.trim()) { setError('La descripción es obligatoria.'); setEnviando(false); return; }
    if (!form.ubicacion.trim()) { setError('La ubicación es obligatoria.'); setEnviando(false); return; }
    if (!form.fecha || !form.hora) { setError('La fecha y la hora son obligatorias.'); setEnviando(false); return; }
    if (form.modalidad === 'virtual' && !form.enlaceVirtual.trim()) {
      setError('El enlace virtual es obligatorio.');
      setEnviando(false);
      return;
    }

    const fechaHoraISO = `${form.fecha}T${form.hora}:00`;
    const imagenFinal = form.imagenUrl.trim() ||
      `https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&q=80`;

    const act = getActividadPorId(id);
    const ocupados = act ? act.cuposTotales - act.cuposDisponibles : 0;
    const cuposDisponibles = Math.max(Number(form.cuposTotales) - ocupados, 0);

    try {
      actualizarActividad(id, {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        categoria: form.categoria,
        ubicacion: form.ubicacion.trim(),
        ubicacionLat: form.ubicacionLat ? Number(form.ubicacionLat) : undefined,
        ubicacionLng: form.ubicacionLng ? Number(form.ubicacionLng) : undefined,
        fechaHora: fechaHoraISO,
        duracionMinutos: Number(form.duracionMinutos),
        cuposTotales: Number(form.cuposTotales),
        cuposDisponibles,
        edadMinima: Number(form.edadMinima),
        costo: Number(form.costo),
        modalidad: form.modalidad,
        enlaceVirtual: form.modalidad === 'virtual' ? form.enlaceVirtual.trim() : undefined,
        condiciones: form.condiciones.trim() || undefined,
        imagenUrl: imagenFinal,
      });
      setExito(true);
      setTimeout(() => router.push('/proveedor'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la actividad.');
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-sage flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-cream" />
        </div>
        <h2 className="font-display text-4xl text-ink mb-3">¡Actividad actualizada!</h2>
        <p className="text-coffee/80">Redirigiendo a tu panel...</p>
      </div>
    );
  }

  const labelCls = "block text-base font-semibold text-ink mb-2";
  const inputCls = "w-full px-5 py-4 text-base rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none transition-colors";

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-12">
      <Link
        href="/proveedor"
        className="inline-flex items-center gap-2 text-coffee hover:text-clay transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al panel
      </Link>

      <div className="mb-10">
        <h1 className="font-display text-4xl lg:text-5xl text-ink mb-2">Editar actividad</h1>
        <p className="text-coffee/80">Actualiza la información y guarda los cambios.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-cream rounded-soft border border-coffee/10 p-8 lg:p-10 space-y-8 shadow-soft">
        <div>
          <label htmlFor="titulo" className={labelCls}>Título de la actividad *</label>
          <input id="titulo" type="text" value={form.titulo}
            onChange={e => set('titulo', e.target.value)}
            required placeholder="Ej: Yoga suave para articulaciones"
            className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Categoría *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(Object.keys(CATEGORIAS) as Categoria[]).map(cat => {
              const c = CATEGORIAS[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('categoria', cat)}
                  className={`p-3 rounded-soft border-2 text-left transition-colors ${
                    form.categoria === cat
                      ? 'border-clay bg-clay/5'
                      : 'border-coffee/20 hover:border-coffee/40'
                  }`}
                >
                  <span className="text-xl">{c.emoji}</span>
                  <div className="text-sm font-semibold mt-1">{c.nombre}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="desc" className={labelCls}>Descripción *</label>
          <textarea id="desc" rows={5} value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
            required
            placeholder="Describe qué se hará, para quién es ideal, qué traer..."
            className={inputCls + ' resize-none'} />
        </div>

        <div>
          <label htmlFor="ubicacion" className={labelCls}>Ubicación *</label>
          <input id="ubicacion" type="text" value={form.ubicacion}
            onChange={e => set('ubicacion', e.target.value)}
            required placeholder="Ej: Sede Comfandi El Prado, Cali"
            className={inputCls} />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="fecha" className={labelCls}>Fecha *</label>
            <input id="fecha" type="date" value={form.fecha}
              onChange={e => set('fecha', e.target.value)}
              required className={inputCls} />
          </div>
          <div>
            <label htmlFor="hora" className={labelCls}>Hora de inicio *</label>
            <input id="hora" type="time" value={form.hora}
              onChange={e => set('hora', e.target.value)}
              required className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Modalidad *</label>
          <div className="flex gap-3">
            {(['presencial', 'virtual'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => set('modalidad', m)}
                className={`px-4 py-3 rounded-pill border-2 text-sm font-semibold ${
                  form.modalidad === m ? 'border-clay bg-clay/5' : 'border-coffee/20 hover:border-coffee/40'
                }`}
              >
                {m === 'virtual' ? 'Virtual' : 'Presencial'}
              </button>
            ))}
          </div>
        </div>

        {form.modalidad === 'virtual' && (
          <div>
            <label htmlFor="enlace" className={labelCls}>Enlace virtual *</label>
            <input id="enlace" type="url" value={form.enlaceVirtual}
              onChange={e => set('enlaceVirtual', e.target.value)}
              required placeholder="https://meet.google.com/..."
              className={inputCls} />
          </div>
        )}

        <div>
          <label htmlFor="condiciones" className={labelCls}>Condiciones o limitaciones</label>
          <textarea id="condiciones" rows={3} value={form.condiciones}
            onChange={e => set('condiciones', e.target.value)}
            placeholder="Ej: llevar ropa cómoda, traer botella de agua..."
            className={inputCls + ' resize-none'} />
        </div>

        <div className="grid sm:grid-cols-4 gap-5">
          <div>
            <label htmlFor="duracion" className={labelCls}>Duración (min)</label>
            <input id="duracion" type="number" value={form.duracionMinutos}
              onChange={e => set('duracionMinutos', parseInt(e.target.value))}
              min={15} max={480} step={15} className={inputCls} />
          </div>
          <div>
            <label htmlFor="cupos" className={labelCls}>Cupos totales</label>
            <input id="cupos" type="number" value={form.cuposTotales}
              onChange={e => set('cuposTotales', parseInt(e.target.value))}
              min={1} max={200} className={inputCls} />
          </div>
          <div>
            <label htmlFor="edad" className={labelCls}>Edad mínima</label>
            <input id="edad" type="number" value={form.edadMinima}
              onChange={e => set('edadMinima', parseInt(e.target.value))}
              min={55} max={100} className={inputCls} />
          </div>
          <div>
            <label htmlFor="costo" className={labelCls}>Costo (COP)</label>
            <input id="costo" type="number" value={form.costo}
              onChange={e => set('costo', parseInt(e.target.value))}
              min={0} max={500000} className={inputCls} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="lat" className={labelCls}>Latitud (opcional)</label>
            <input id="lat" type="number" value={form.ubicacionLat}
              onChange={e => set('ubicacionLat', e.target.value)}
              placeholder="3.4516" className={inputCls} />
          </div>
          <div>
            <label htmlFor="lng" className={labelCls}>Longitud (opcional)</label>
            <input id="lng" type="number" value={form.ubicacionLng}
              onChange={e => set('ubicacionLng', e.target.value)}
              placeholder="-76.5319" className={inputCls} />
          </div>
        </div>

        <div>
          <label htmlFor="imagen" className={labelCls}>
            URL de imagen <span className="font-normal text-coffee/60">(opcional)</span>
          </label>
          <input id="imagen" type="url" value={form.imagenUrl}
            onChange={e => set('imagenUrl', e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className={inputCls} />
        </div>

        <div className="pt-2 bg-sand/30 -mx-8 lg:-mx-10 px-8 lg:px-10 py-5 border-t border-coffee/10 rounded-b-soft">
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-soft bg-clay/10 border border-clay/30 mb-4">
              <AlertCircle className="w-5 h-5 text-clay flex-shrink-0 mt-0.5" />
              <p className="text-sm text-coffee">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-pill bg-clay text-cream text-lg font-semibold hover:bg-coffee transition-colors shadow-soft disabled:opacity-50"
          >
            {enviando
              ? 'Guardando...'
              : <><Save className="w-5 h-5" /> Guardar cambios</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
