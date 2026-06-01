import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { PreferencesProvider } from '@/components/PreferencesProvider';
import NavBar from '@/components/NavBar';
import AiAssistant from '@/components/AiAssistant';

export const metadata: Metadata = {
  title: 'Club 55+ — Actividades para una vida con propósito',
  description: 'Plataforma para descubrir y reservar actividades pensadas para adultos mayores de 55 años. Yoga, tertulias, talleres, caminatas y más.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="paper-texture min-h-screen">
        <PreferencesProvider>
          <AuthProvider>
            <NavBar />
            <main>{children}</main>
            <AiAssistant />
            <footer className="mt-24 py-12 border-t border-coffee/10 bg-sand/30">
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
