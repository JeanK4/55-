'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Actividad } from '@/lib/types';
import { CATEGORIAS } from '@/lib/types';
import { formatearFechaLarga, formatearHora, formatearDuracion, diasDesdeHoy } from '@/lib/format';
import { Clock, MapPin, Users, Star } from 'lucide-react';
import { getPromedioCalificacion } from '@/lib/store';

export default function ActividadCard({ actividad, animationDelay = 0 }: { actividad: Actividad; animationDelay?: number }) {
  const cat = CATEGORIAS[actividad.categoria];
  const dias = diasDesdeHoy(actividad.fechaHora);
  const cuposBajos = actividad.cuposDisponibles <= 3 && actividad.cuposDisponibles > 0;
  const sinCupos = actividad.cuposDisponibles === 0;
  const rating = getPromedioCalificacion(actividad.id);

  return (
    <Link
      href={`/actividades/${actividad.id}`}
      className="group block rounded-soft bg-cream border border-coffee/10 hover:border-clay/40 hover:shadow-lift transition-all overflow-hidden animate-fade-up"
      style={{ animationDelay: `${animationDelay}s`, opacity: 0 }}
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        <Image
          src={actividad.imagenUrl}
          alt={actividad.titulo}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badge categoría */}
        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-pill text-sm font-semibold backdrop-blur-md bg-cream/90 ${cat.color}`}>
          <span className="mr-1">{cat.emoji}</span>{cat.nombre}
        </div>
        {/* Badge cupos */}
        {sinCupos ? (
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-pill text-sm font-semibold bg-coffee text-cream">
            Sin cupos
          </div>
        ) : cuposBajos ? (
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-pill text-sm font-semibold bg-clay text-cream">
            ¡Últimos cupos!
          </div>
        ) : null}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-pill text-xs font-semibold bg-cream/90 backdrop-blur-md text-ink">
          {actividad.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-4">
        <div>
          <p className="text-sm font-semibold text-clay uppercase tracking-wider mb-2">
            {dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : dias > 0 ? `En ${dias} días` : 'Pasada'}
            <span className="mx-2 text-coffee/40">•</span>
            <span className="text-coffee normal-case font-medium">{formatearFechaLarga(actividad.fechaHora)}</span>
          </p>
          <h3 className="font-display text-2xl text-ink leading-tight group-hover:text-clay transition-colors">
            {actividad.titulo}
          </h3>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-coffee">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-clay" />
            <span>{formatearHora(actividad.fechaHora)} · {formatearDuracion(actividad.duracionMinutos)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-clay" />
            <span className="truncate">{actividad.ubicacion}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-clay" />
            <span>{actividad.cuposDisponibles} de {actividad.cuposTotales} cupos</span>
          </div>
        </div>

        <div className="pt-3 border-t border-coffee/10 flex items-center justify-between">
          <span className="text-sm text-coffee/70">
            Por <span className="font-semibold text-ink">{actividad.proveedorNombre}</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-sage">
              {actividad.costo === 0 ? 'Gratuita' : `$${actividad.costo.toLocaleString('es-CO')}`}
            </span>
            <span className="text-sm text-coffee/70 flex items-center gap-1">
              <Star className="w-4 h-4 text-gold" />
              {rating === 0 ? 'Nuevo' : rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
