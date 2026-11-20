import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { PreferencesProvider } from '@/components/PreferencesProvider';
import NavBar from '@/components/NavBar';
import AiAssistant from '@/components/AiAssistant';

export const metadata: Metadata = {
  title: 'Club 55+ — Actividades para una vida con propósito',
  description: 'Plataforma para descubrir y reservar actividades pensadas para adultos mayores de 55 años. Yoga, tertulias, talleres, caminatas y más.',
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#161412' },
  ],
};

// Aplica las preferencias guardadas antes del primer pintado (evita el parpadeo de tema)
const prefsScript = `try{var p=JSON.parse(localStorage.getItem('club55_preferencias')||'{}'),d=document.documentElement;if(p.tema)d.dataset.theme=p.tema;if(p.contraste)d.dataset.contrast=p.contraste;if(p.tamanioFuente)d.dataset.font=p.tamanioFuente}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
      </head>
      <body className="min-h-screen">
        <PreferencesProvider>
          <AuthProvider>
            <NavBar />
            <main>{children}</main>
            <AiAssistant />
            <footer className="mt-24 py-12 border-t border-coffee/10 bg-sand/40">
              <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <div className="font-display text-xl text-ink">
                      Club <span className="text-clay">55+</span>
                    </div>
                    <p className="text-sm text-coffee/70 mt-1">
                      Sprint 1 · Pontificia Universidad Javeriana Cali
                    </p>
                  </div>
                  <div className="text-sm text-coffee/70">
                    Procesos y Diseño de Software · 2026-1
                  </div>
                </div>
              </div>
            </footer>
          </AuthProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
