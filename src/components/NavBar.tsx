'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { usePreferences } from './PreferencesProvider';
import {
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Bell,
  Sun,
  Moon,
  Type,
  Globe,
  Accessibility,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getNotificacionesUsuario } from '@/lib/store';

export default function NavBar() {
  const { usuario, cerrarSesion } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { prefs, setPrefs } = usePreferences();
  const [pendientes, setPendientes] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (!usuario) return;
    const n = getNotificacionesUsuario(usuario.id).filter(n => !n.leida).length;
    setPendientes(n);
  }, [usuario]);

  const linksAdulto = [
    { href: '/actividades', label: { es: 'Actividades', en: 'Activities' } },
    { href: '/recomendaciones', label: { es: 'Recomendadas', en: 'Recommended' } },
    { href: '/calendario', label: { es: 'Calendario', en: 'Calendar' } },
    { href: '/mis-reservas', label: { es: 'Mis reservas', en: 'My bookings' } },
    { href: '/mensajes', label: { es: 'Mensajes', en: 'Messages' } },
    { href: '/propuestas', label: { es: 'Propuestas', en: 'Proposals' } },
    { href: '/juegos', label: { es: 'Juegos', en: 'Games' } },
    { href: '/salud', label: { es: 'Salud', en: 'Health' } },
    { href: '/notificaciones', label: { es: 'Notificaciones', en: 'Notifications' } },
    { href: '/perfil', label: { es: 'Mi perfil', en: 'Profile' } },
  ];

  const linksCuidador = [
    { href: '/actividades', label: { es: 'Actividades', en: 'Activities' } },
    { href: '/calendario', label: { es: 'Calendario', en: 'Calendar' } },
    { href: '/mis-reservas', label: { es: 'Seguimiento', en: 'Tracking' } },
    { href: '/mensajes', label: { es: 'Mensajes', en: 'Messages' } },
    { href: '/notificaciones', label: { es: 'Notificaciones', en: 'Notifications' } },
    { href: '/perfil', label: { es: 'Mi perfil', en: 'Profile' } },
  ];

  const linksProveedor = [
    { href: '/proveedor', label: { es: 'Mis actividades', en: 'My activities' } },
    { href: '/proveedor/nueva-actividad', label: { es: 'Publicar actividad', en: 'Publish activity' } },
    { href: '/mensajes', label: { es: 'Mensajes', en: 'Messages' } },
    { href: '/notificaciones', label: { es: 'Notificaciones', en: 'Notifications' } },
    { href: '/perfil', label: { es: 'Mi perfil', en: 'Profile' } },
  ];

  const links =
    usuario?.rol === 'proveedor'
      ? linksProveedor
      : usuario?.rol === 'cuidador'
        ? linksCuidador
        : linksAdulto;

  const linksPrincipales = links.slice(0, 4);
  const linksExtra = links.slice(4);

  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md border-b border-coffee/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-clay flex items-center justify-center shadow-soft transition-transform group-hover:rotate-6">
            <span className="font-display text-cream text-2xl leading-none pt-1">55</span>
          </div>
          <div className="font-display text-2xl text-ink">
            Club <span className="text-clay">55+</span>
          </div>
        </Link>

        {/* Links desktop */}
        {usuario && (
          <nav className="hidden md:flex items-center gap-2 flex-wrap">
            {linksPrincipales.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-5 py-2.5 rounded-pill text-base font-medium transition-colors ${
                  pathname === l.href
                    ? 'bg-ink text-cream'
                    : 'text-ink hover:bg-sand'
                }`}
              >
                {prefs.idioma === 'en' ? l.label.en : l.label.es}
              </Link>
            ))}
            {linksExtra.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    setMoreOpen(!moreOpen);
                    setPrefsOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-pill text-base font-medium text-ink hover:bg-sand"
                >
                  {prefs.idioma === 'en' ? 'More' : 'Más'}
                </button>
                {moreOpen && (
                  <div className="absolute mt-2 right-0 bg-cream border border-coffee/10 rounded-soft shadow-soft w-56 p-2">
                    {linksExtra.map(l => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="block px-4 py-2 rounded-soft text-sm text-ink hover:bg-sand"
                      >
                        {prefs.idioma === 'en' ? l.label.en : l.label.es}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>
        )}

        {/* Acciones desktop */}
        <div className="hidden md:flex items-center gap-3">
          {usuario ? (
            <>
              <Link
                href="/notificaciones"
                className="relative p-3 rounded-pill text-ink hover:bg-sand transition-colors"
                aria-label="Notificaciones"
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {pendientes > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-clay text-cream text-xs flex items-center justify-center">
                    {pendientes}
                  </span>
                )}
              </Link>
              <div className="relative">
                <button
                  onClick={() => { setPrefsOpen(!prefsOpen); setAbierto(false); setMoreOpen(false); }}
                  className="p-3 rounded-pill text-ink hover:bg-sand transition-colors"
                  aria-label="Accesibilidad"
                  title="Accesibilidad"
                >
                  <Accessibility className="w-5 h-5" />
                </button>
                {prefsOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-cream border border-coffee/10 rounded-soft shadow-soft p-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-coffee/60 uppercase mb-2">Tema</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPrefs({ tema: 'claro' })}
                          className={`flex-1 px-3 py-2 rounded-pill text-sm font-medium border ${
                            prefs.tema === 'claro' ? 'border-clay text-clay' : 'border-coffee/20'
                          }`}
                        >
                          <Sun className="w-4 h-4 inline mr-1" /> Claro
                        </button>
                        <button
                          onClick={() => setPrefs({ tema: 'oscuro' })}
                          className={`flex-1 px-3 py-2 rounded-pill text-sm font-medium border ${
                            prefs.tema === 'oscuro' ? 'border-clay text-clay' : 'border-coffee/20'
                          }`}
                        >
                          <Moon className="w-4 h-4 inline mr-1" /> Oscuro
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-coffee/60 uppercase mb-2">Fuente</p>
                      <div className="grid grid-cols-4 gap-2">
                        {(['md', 'lg', 'xl', 'xxl'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setPrefs({ tamanioFuente: t })}
                            className={`px-2 py-2 rounded-soft border text-sm ${
                              prefs.tamanioFuente === t ? 'border-clay text-clay' : 'border-coffee/20'
                            }`}
                          >
                            <Type className="w-4 h-4 inline" /> {t.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-coffee/60 uppercase mb-2">Idioma</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPrefs({ idioma: 'es' })}
                          className={`flex-1 px-3 py-2 rounded-pill text-sm font-medium border ${
                            prefs.idioma === 'es' ? 'border-clay text-clay' : 'border-coffee/20'
                          }`}
                        >
                          <Globe className="w-4 h-4 inline mr-1" /> ES
                        </button>
                        <button
                          onClick={() => setPrefs({ idioma: 'en' })}
                          className={`flex-1 px-3 py-2 rounded-pill text-sm font-medium border ${
                            prefs.idioma === 'en' ? 'border-clay text-clay' : 'border-coffee/20'
                          }`}
                        >
                          <Globe className="w-4 h-4 inline mr-1" /> EN
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setPrefs({ contraste: prefs.contraste === 'alto' ? 'normal' : 'alto' })}
                      className="w-full px-3 py-2 rounded-pill text-sm font-semibold border border-coffee/20 hover:border-clay"
                    >
                      Contraste {prefs.contraste === 'alto' ? 'normal' : 'alto'}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-pill bg-sand">
                <div className="w-8 h-8 rounded-full bg-coffee flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-cream" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold leading-tight">{usuario.nombre.split(' ')[0]}</div>
                  <div className="text-xs text-coffee/70 leading-tight">
                    {usuario.rol === 'proveedor'
                      ? (prefs.idioma === 'en' ? 'Provider' : 'Proveedor')
                      : usuario.rol === 'cuidador'
                        ? (prefs.idioma === 'en' ? 'Caregiver' : 'Cuidador')
                        : (prefs.idioma === 'en' ? 'User' : 'Usuario')}
                  </div>
                </div>
              </div>
              <button
                onClick={cerrarSesion}
                className="p-3 rounded-pill text-ink hover:bg-sand transition-colors"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-pill text-base font-medium text-ink hover:bg-sand transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="px-6 py-3 rounded-pill bg-clay text-cream font-semibold hover:bg-coffee transition-colors shadow-soft"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-3 rounded-soft hover:bg-sand"
          onClick={() => setAbierto(!abierto)}
          aria-label="Menú"
        >
          {abierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menú móvil */}
      {abierto && (
        <div className="md:hidden border-t border-coffee/10 px-6 py-4 space-y-2">
          {usuario ? (
            <>
              <div className="px-4 py-3 rounded-soft bg-sand mb-3">
                <div className="font-semibold">{usuario.nombre}</div>
                <div className="text-sm text-coffee/70">
                  {usuario.rol === 'proveedor' ? 'Proveedor' : 'Adulto Mayor'}
                </div>
              </div>
              {links.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setAbierto(false)}
                  className="block px-4 py-3 rounded-soft text-lg font-medium hover:bg-sand"
                >
                  {l.label.es}
                </Link>
              ))}
              <button
                onClick={() => { cerrarSesion(); setAbierto(false); }}
                className="w-full text-left px-4 py-3 rounded-soft text-lg font-medium text-clay hover:bg-clay/10"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setAbierto(false)} className="block px-4 py-3 rounded-soft text-lg font-medium hover:bg-sand">
                Iniciar sesión
              </Link>
              <Link href="/registro" onClick={() => setAbierto(false)} className="block px-4 py-3 rounded-soft text-lg font-medium bg-clay text-cream">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
