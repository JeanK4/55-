'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Search, Calendar, Users, Heart, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [montado, setMontado] = useState(false);

  useEffect(() => { setMontado(true); }, []);

  // Si ya está logueado, redirigir
  useEffect(() => {
    if (!cargando && usuario) {
      if (usuario.rol === 'proveedor') router.push('/proveedor');
      else router.push('/actividades');
    }
  }, [cargando, usuario, router]);

  if (!montado || cargando || usuario) return null;

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-12 lg:pt-20 pb-24">
        {/* Decoración tipográfica de fondo */}
        <div className="absolute -top-8 right-0 lg:right-10 font-display text-[20rem] lg:text-[28rem] text-clay/[0.04] leading-none pointer-events-none select-none hidden md:block">
          55+
        </div>

        <div className="relative grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-sage/10 text-sage text-sm font-semibold animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              Una vida con propósito empieza ahora
            </div>

            <h1 className="font-display text-5xl lg:text-7xl text-ink leading-[1.05] animate-fade-up delay-1">
              Las mejores
              <br />
              <span className="italic text-clay">actividades</span> de Cali
              <br />
              están a un toque.
            </h1>

            <p className="text-xl text-coffee/80 max-w-xl animate-fade-up delay-2">
              Yoga suave, tertulias literarias, caminatas al amanecer, talleres de pintura...
              Todas pensadas, diseñadas y guiadas para personas de 55 años en adelante.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-3">
              <Link
                href="/registro"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-pill bg-clay text-cream text-lg font-semibold hover:bg-coffee transition-colors shadow-lift"
              >
                Crear mi cuenta gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-pill border-2 border-ink text-ink text-lg font-semibold hover:bg-ink hover:text-cream transition-colors"
              >
                Ya tengo cuenta
              </Link>
            </div>

            <div className="pt-6 flex items-center gap-6 text-sm text-coffee/70 animate-fade-up delay-4">
              <div>
                <span className="font-display text-2xl text-clay">+50</span>
                <span className="block">actividades cada semana</span>
              </div>
              <div className="w-px h-10 bg-coffee/20" />
              <div>
                <span className="font-display text-2xl text-clay">12</span>
                <span className="block">centros aliados en Cali</span>
              </div>
            </div>
          </div>

          {/* Tarjeta visual lateral */}
          <div className="lg:col-span-5 relative animate-fade-up delay-2">
            <div className="absolute -inset-4 rounded-soft bg-gradient-to-br from-gold/30 to-clay/20 blur-2xl" />
            <div className="relative bg-cream rounded-soft p-8 shadow-lift border border-coffee/10 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-clay uppercase tracking-wider">Hoy</p>
                  <h3 className="font-display text-3xl text-ink mt-1">Caminata al amanecer</h3>
                </div>
                <div className="px-3 py-1 rounded-pill bg-sage/15 text-sage text-xs font-semibold whitespace-nowrap">
                  🌿 Física
                </div>
              </div>

              <div className="aspect-[4/3] rounded-soft bg-gradient-to-br from-sage to-coffee overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(212,165,116,0.4),transparent_50%)]" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-coffee/80 to-transparent" />
                <div className="absolute bottom-6 left-6 text-cream">
                  <p className="font-display text-xl">Acuaparque de la Caña</p>
                  <p className="text-sm opacity-80">6:30 a.m. · 2 h 30 min</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="py-3 rounded-soft bg-sand">
                  <div className="font-display text-2xl text-clay">25</div>
                  <div className="text-xs text-coffee">cupos</div>
                </div>
                <div className="py-3 rounded-soft bg-sand">
                  <div className="font-display text-2xl text-clay">$0</div>
                  <div className="text-xs text-coffee">precio</div>
                </div>
                <div className="py-3 rounded-soft bg-sand">
                  <div className="font-display text-2xl text-clay">★ 4.9</div>
                  <div className="text-xs text-coffee">valoración</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section className="bg-sand/40 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-semibold text-clay uppercase tracking-wider mb-3">
              ¿Cómo funciona?
            </p>
            <h2 className="font-display text-4xl lg:text-5xl text-ink leading-tight">
              Hecho para que sea <span className="italic text-clay">así de fácil</span>.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                num: '01',
                title: 'Busca actividades cerca',
                desc: 'Filtra por categoría, fecha o lugar. Verás solo actividades pensadas para mayores de 55 años, con descripción clara y horario detallado.',
              },
              {
                icon: Calendar,
                num: '02',
                title: 'Reserva tu cupo',
                desc: 'Un toque y listo. Sin papeleo, sin filas. Recibes la confirmación al instante y puedes ver toda tu agenda en un solo lugar.',
              },
              {
                icon: Heart,
                num: '03',
                title: 'Vive la experiencia',
                desc: 'Llega tranquilo a la actividad. Después puedes consultar tu historial y descubrir nuevas opciones que te van a encantar.',
              },
            ].map((paso, i) => {
              const Icon = paso.icon;
              return (
                <div
                  key={paso.num}
                  className="relative bg-cream rounded-soft p-8 border border-coffee/10 hover:border-clay/30 transition-colors group"
                >
                  <div className="font-display text-7xl text-clay/15 absolute top-4 right-6 leading-none">
                    {paso.num}
                  </div>
                  <div className="relative">
                    <div className="w-14 h-14 rounded-soft bg-clay/10 flex items-center justify-center mb-6 group-hover:bg-clay group-hover:text-cream transition-colors">
                      <Icon className="w-6 h-6 text-clay group-hover:text-cream transition-colors" />
                    </div>
                    <h3 className="font-display text-2xl text-ink mb-3">{paso.title}</h3>
                    <p className="text-coffee/80">{paso.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <div className="relative overflow-hidden rounded-soft bg-coffee p-12 lg:p-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,165,116,0.2),transparent_50%)]" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-4xl lg:text-5xl text-cream leading-tight mb-6">
              Empieza hoy. <span className="italic text-gold">El primer paso es gratis.</span>
            </h2>
            <p className="text-xl text-cream/80 mb-8">
              Crea tu cuenta en menos de un minuto y descubre qué pasa esta semana en Cali.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/registro"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-pill bg-cream text-coffee text-lg font-semibold hover:bg-gold transition-colors"
              >
                Quiero unirme
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/registro?rol=proveedor"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-pill border-2 border-cream/30 text-cream text-lg font-semibold hover:bg-cream/10 transition-colors"
              >
                <Users className="w-5 h-5" />
                Soy un centro proveedor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
