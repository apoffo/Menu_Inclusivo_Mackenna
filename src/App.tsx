import React, { useState, useEffect } from 'react';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { DataProvider, useData } from './context/DataContext';
import { AccessibilityBar } from './components/AccessibilityBar';
import { Header } from './components/Header';
import { HomeView } from './views/HomeView';
import { MenuView } from './views/MenuView';
import { MerchantDashboard } from './views/MerchantDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { AuthModal } from './views/AuthModal';
import { ShieldCheck, BookOpen, UtensilsCrossed, Heart, Eye } from 'lucide-react';

function MainApp() {
  const { currentUser, venues } = useData();
  const [currentView, setCurrentView] = useState<'home' | 'menu' | 'merchant' | 'admin'>('home');
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Soporte de navegación por hash para QR (ej: #menu-venue_patriotis)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#menu-')) {
        const targetId = hash.replace('#menu-', '');
        setSelectedVenueId(targetId);
        setCurrentView('menu');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = (view: 'home' | 'menu' | 'merchant' | 'admin', venueId?: string) => {
    if (view === 'menu' && venueId) {
      setSelectedVenueId(venueId);
      window.location.hash = `#menu-${venueId}`;
    } else {
      window.location.hash = '';
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors">
      {/* 1. Barra de Accesibilidad Global (WCAG 2.1 AA) */}
      <AccessibilityBar />

      {/* 2. Encabezado de la Aplicación */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* 3. Vistas Principales */}
      <main className="flex-1" id="main-content" role="main">
        {currentView === 'home' && (
          <HomeView
            onSelectVenue={(id) => handleNavigate('menu', id)}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {currentView === 'menu' && selectedVenueId && (
          <MenuView
            venueId={selectedVenueId}
            onBack={() => handleNavigate('home')}
          />
        )}

        {currentView === 'merchant' && (
          <MerchantDashboard
            onPreviewPublicMenu={(id) => handleNavigate('menu', id)}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onViewVenueMenu={(id) => handleNavigate('menu', id)}
          />
        )}
      </main>

      {/* 4. Pie de Página Accesible con Marco Normativo Argentino */}
      <footer className="bg-slate-900 text-slate-300 py-10 px-4 sm:px-6 border-t-2 border-slate-800 mt-16 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Columna 1: Sobre el proyecto */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-black text-lg">
              <UtensilsCrossed className="w-5 h-5 text-amber-400" />
              <span>Menú Inclusivo</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">
              Plataforma desarrollada según el proyecto de ordenanza municipal argentina para la inclusión en locales gastronómicos (bares, restaurantes, confiterías y heladerías). Garantiza cartas físicas y digitales con pictogramas ARASAAC, macrotipo y sistema Braille.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Oblea Art. 8 • Comercio Inclusivo
              </span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs">
                Precios en ARS (Pesos Argentinos)
              </span>
            </div>
          </div>

          {/* Columna 2: Atribución ARASAAC y Braille */}
          <div>
            <h3 className="text-white font-black text-xs uppercase tracking-wider mb-2.5">
              Accesibilidad Universal
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Pictogramas oficiales provistos por <strong>ARASAAC</strong> (Gobierno de Aragón, España) bajo licencia CC (BY-NC-SA).</li>
              <li>• Transcripción conforme al <strong>Código Braille en Español</strong> (Grado 1) y formato estándar <code>.brf</code>.</li>
              <li>• Cumplimiento con las pautas <strong>WCAG 2.1 nivel AA</strong>.</li>
            </ul>
          </div>

          {/* Columna 3: Enlaces de roles */}
          <div>
            <h3 className="text-white font-black text-xs uppercase tracking-wider mb-2.5">
              Acceso Rápido
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleNavigate('home')}
                className="block text-slate-400 hover:text-white transition-colors"
              >
                Directorio público
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentUser?.role === 'merchant') {
                    handleNavigate('merchant');
                  } else {
                    setShowAuthModal(true);
                  }
                }}
                className="block text-slate-400 hover:text-white transition-colors"
              >
                Panel de comercios gastronómicos
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentUser?.role === 'admin') {
                    handleNavigate('admin');
                  } else {
                    setShowAuthModal(true);
                  }
                }}
                className="block text-slate-400 hover:text-white transition-colors"
              >
                Auditoría municipal
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Menú Inclusivo — Iniciativa por la accesibilidad cognitiva y visual en la gastronomía argentina.
          </div>
          <div className="flex items-center gap-1">
            <span>Diseñado con compromiso por la inclusión</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </footer>

      {/* Modal de Autenticación */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(role) => {
          if (role === 'admin') {
            handleNavigate('admin');
          } else {
            handleNavigate('merchant');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AccessibilityProvider>
  );
}
