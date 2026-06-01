'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import ActividadCard from '@/components/ActividadCard';
import { getActividadesPublicas } from '@/lib/store';
import type { Actividad, Categoria, ModalidadActividad } from '@/lib/types';
import { CATEGORIAS } from '@/lib/types';
import { Search, SlidersHorizontal, X, Mic, MapPin, BadgeDollarSign } from 'lucide-react';

export default function ActividadesPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | 'todas'>('todas');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [modalidadFiltro, setModalidadFiltro] = useState<ModalidadActividad | 'todas'>('todas');
  const [edadMax, setEdadMax] = useState(100);
  const [soloGratis, setSoloGratis] = useState(false);
  const [usarUbicacion, setUsarUbicacion] = useState(false);
  const [radioKm, setRadioKm] = useState(5);
  const [posicion, setPosicion] = useState<{ lat: number; lng: number } | null>(null);
  const [vozActiva, setVozActiva] = useState(false);
  const [vozError, setVozError] = useState('');
  const [ubicacionError, setUbicacionError] = useState('');
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    setActividades(getActividadesPublicas());
  }, []);

  useEffect(() => {
    if (!cargando && !usuario) router.push('/login');
  }, [cargando, usuario, router]);

  const expandirBusqueda = (texto: string) => {
    const base = texto.toLowerCase();
    const mapa: Record<string, string> = {
      walking: 'caminata',
      hike: 'caminata',
      meditation: 'meditacion',
      wellbeing: 'bienestar',
      wellness: 'bienestar',
      painting: 'pintura',
      reading: 'lectura',
      music: 'musica',
      culture: 'cultural',
      education: 'educativa',
      social: 'social',
      physical: 'fisica',
      online: 'virtual',
      virtual: 'virtual',
    };
    const tokens = base.split(' ').filter(Boolean);
    const extra = tokens.map(t => mapa[t]).filter(Boolean);
    return [...new Set([base, ...tokens, ...extra])];
  };

  const distanciaKm = (a: Actividad) => {
    if (!posicion || a.ubicacionLat == null || a.ubicacionLng == null) return null;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(a.ubicacionLat - posicion.lat);
    const dLng = toRad(a.ubicacionLng - posicion.lng);
    const lat1 = toRad(posicion.lat);
    const lat2 = toRad(a.ubicacionLat);
    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  };

  const filtradas = useMemo(() => {
    const tokens = expandirBusqueda(busqueda.trim()).filter(Boolean);
    return actividades.filter(a => {
      const coincideBusqueda = tokens.length === 0 || tokens.some(t =>
        a.titulo.toLowerCase().includes(t) ||
        a.descripcion.toLowerCase().includes(t) ||
        a.ubicacion.toLowerCase().includes(t) ||
        a.proveedorNombre.toLowerCase().includes(t) ||
        a.categoria.toLowerCase().includes(t) ||
        a.modalidad.toLowerCase().includes(t)
      );
      const coincideCategoria = categoriaFiltro === 'todas' || a.categoria === categoriaFiltro;
      const coincideDisponible = !soloDisponibles || a.cuposDisponibles > 0;
      const coincideModalidad = modalidadFiltro === 'todas' || a.modalidad === modalidadFiltro;
      const coincideEdad = a.edadMinima <= edadMax;
      const coincideCosto = !soloGratis || a.costo === 0;
      const dist = usarUbicacion ? distanciaKm(a) : null;
      const coincideUbicacion = !usarUbicacion || (dist != null && dist <= radioKm);
      return (
        coincideBusqueda &&
        coincideCategoria &&
        coincideDisponible &&
        coincideModalidad &&
        coincideEdad &&
        coincideCosto &&
        coincideUbicacion
      );
    });
  }, [actividades, busqueda, categoriaFiltro, soloDisponibles, modalidadFiltro, edadMax, soloGratis, usarUbicacion, radioKm, posicion]);

  const iniciarVoz = () => {
    setVozError('');
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
      .SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVozError('Tu navegador no soporta búsqueda por voz.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'es-CO';
    rec.onstart = () => setVozActiva(true);
    rec.onend = () => setVozActiva(false);
    rec.onerror = () => { setVozError('No pudimos capturar la voz. Intenta de nuevo.'); setVozActiva(false); };
    rec.onresult = (event: any) => {
      const texto = event.results[0][0].transcript;
      setBusqueda(texto);
    };
    rec.start();
  };

  const solicitarUbicacion = () => {
    setUbicacionError('');
    if (!navigator.geolocation) {
      setUbicacionError('Tu dispositivo no soporta geolocalización.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setPosicion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUsarUbicacion(true);
      },
      () => {
        setUbicacionError('No pudimos obtener tu ubicación.');
        setUsarUbicacion(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  if (!montado || cargando || !usuario) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl lg:text-5xl text-ink mb-2">
          Actividades disponibles
        </h1>
        <p className="text-lg text-coffee/80">
          {filtradas.length} actividad{filtradas.length !== 1 ? 'es' : ''} encontrada{filtradas.length !== 1 ? 's' : ''} en Cali
        </p>
      </div>

      {/* Barra de búsqueda — RF-01 */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-coffee/50" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Busca por nombre, lugar o proveedor..."
            className="w-full pl-14 pr-16 py-5 text-lg rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none transition-colors shadow-soft"
          />
          <button
            onClick={iniciarVoz}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-sand"
            aria-label="Buscar por voz"
            title="Buscar por voz"
          >
            <Mic className={`w-5 h-5 ${vozActiva ? 'text-clay animate-pulse' : 'text-coffee'}`} />
          </button>
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-sand"
            >
              <X className="w-5 h-5 text-coffee" />
            </button>
          )}
        </div>
        {vozError && (
          <p className="text-sm text-clay">{vozError}</p>
        )}

        {/* Filtros — RF-01 */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-coffee">
            <SlidersHorizontal className="w-4 h-4" />
            Filtrar:
          </div>

          {/* Categorías */}
          <button
            onClick={() => setCategoriaFiltro('todas')}
            className={`px-4 py-2 rounded-pill text-sm font-medium transition-colors ${
              categoriaFiltro === 'todas'
                ? 'bg-ink text-cream'
                : 'bg-sand text-ink hover:bg-coffee/15'
            }`}
          >
            Todas
          </button>
          {(Object.keys(CATEGORIAS) as Categoria[]).map(cat => {
            const c = CATEGORIAS[cat];
            return (
              <button
                key={cat}
                onClick={() => setCategoriaFiltro(cat === categoriaFiltro ? 'todas' : cat)}
                className={`px-4 py-2 rounded-pill text-sm font-medium transition-colors ${
                  categoriaFiltro === cat
                    ? 'bg-ink text-cream'
                    : 'bg-sand text-ink hover:bg-coffee/15'
                }`}
              >
                {c.emoji} {c.nombre}
              </button>
            );
          })}

          {/* Disponibilidad */}
          <label className="flex items-center gap-2 px-4 py-2 rounded-pill bg-sand cursor-pointer hover:bg-coffee/15 transition-colors">
            <input
              type="checkbox"
              checked={soloDisponibles}
              onChange={e => setSoloDisponibles(e.target.checked)}
              className="accent-clay w-4 h-4"
            />
            <span className="text-sm font-medium text-ink">Solo con cupos</span>
          </label>

          <label className="flex items-center gap-2 px-4 py-2 rounded-pill bg-sand cursor-pointer hover:bg-coffee/15 transition-colors">
            <input
              type="checkbox"
              checked={soloGratis}
              onChange={e => setSoloGratis(e.target.checked)}
              className="accent-clay w-4 h-4"
            />
            <span className="text-sm font-medium text-ink flex items-center gap-1">
              <BadgeDollarSign className="w-4 h-4" /> Solo gratis
            </span>
          </label>

          <div className="flex items-center gap-2">
            {(['todas', 'presencial', 'virtual'] as const).map(m => (
              <button
                key={m}
                onClick={() => setModalidadFiltro(m)}
                className={`px-4 py-2 rounded-pill text-sm font-medium transition-colors ${
                  modalidadFiltro === m
                    ? 'bg-ink text-cream'
                    : 'bg-sand text-ink hover:bg-coffee/15'
                }`}
              >
                {m === 'todas' ? 'Todas' : m === 'virtual' ? 'Virtual' : 'Presencial'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-pill bg-sand">
            <span className="text-sm font-medium text-ink">Edad mínima ≤</span>
            <input
              type="number"
              value={edadMax}
              onChange={e => setEdadMax(Number(e.target.value))}
              min={55}
              max={100}
              className="w-20 bg-cream border border-coffee/20 rounded-soft px-2 py-1 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-pill bg-sand">
            <MapPin className="w-4 h-4 text-clay" />
            <button
              onClick={solicitarUbicacion}
              className="text-sm font-medium text-ink"
            >
              {usarUbicacion ? 'Ubicación activa' : 'Buscar cerca'}
            </button>
            <input
              type="number"
              value={radioKm}
              onChange={e => setRadioKm(Number(e.target.value))}
              min={1}
              max={50}
              className="w-16 bg-cream border border-coffee/20 rounded-soft px-2 py-1 text-sm"
            />
            <span className="text-sm text-coffee/70">km</span>
          </div>
        </div>
        {ubicacionError && <p className="text-sm text-clay">{ubicacionError}</p>}
      </div>

      {/* Grid de actividades — RF-02 */}
      {filtradas.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtradas.map((a, i) => (
            <ActividadCard key={a.id} actividad={a} animationDelay={i * 0.07} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="font-display text-8xl text-coffee/20 mb-6">🔍</div>
          <h2 className="font-display text-3xl text-ink mb-3">Sin resultados</h2>
          <p className="text-coffee/70 mb-6">
            Intenta con otras palabras o amplía los filtros.
          </p>
          <button
            onClick={() => {
              setBusqueda('');
              setCategoriaFiltro('todas');
              setSoloDisponibles(false);
              setSoloGratis(false);
              setModalidadFiltro('todas');
              setEdadMax(100);
              setUsarUbicacion(false);
              setRadioKm(5);
            }}
            className="px-6 py-3 rounded-pill bg-clay text-cream font-semibold hover:bg-coffee transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
