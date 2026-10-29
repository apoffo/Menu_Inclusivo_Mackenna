import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  UtensilsCrossed,
  ShieldCheck,
  Building2,
  LogIn,
  LogOut,
  UserCheck,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'menu' | 'merchant' | 'admin';
  onNavigate: (view: 'home' | 'menu' | 'merchant' | 'admin', venueId?: string) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { currentUser, logout, switchUser, venues, resetToSampleData } = useData();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  // Comercio vinculado al usuario actual si es merchant
  const userVenue = currentUser?.venueId
    ? venues.find((v) => v.id === currentUser.venueId)
    : null;

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs" role="banner">
      <div className="max-w-7xl mx-auto px-4 py-3.5 sm:px-6 flex flex-wrap items-center justify-between gap-4">
        {/* Logo y título */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNavigate('home')}
          aria-label="Ir a la página principal de Menú Inclusivo"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-xs group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Menú Inclusivo
              </span>
              <span className="hidden sm:inline-block text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                ORDENANZA ARGENTINA
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Cartas gastronómicas con pictogramas y sistema Braille
            </p>
          </div>
        </div>

        {/* Acciones principales y sesión */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Botón Directorio Público */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`px-3 py-2 text-sm font-bold rounded-lg border transition-colors ${
              currentView === 'home'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Directorio de Comercios
          </button>

          {/* Si está logueado como Comercio */}
          {currentUser && currentUser.role === 'merchant' && (
            <button
              type="button"
              onClick={() => onNavigate('merchant')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-lg border transition-colors ${
                currentView === 'merchant'
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Panel de mi Comercio</span>
              {userVenue && (
                <span className="hidden md:inline text-xs font-normal opacity-85">
                  ({userVenue.name.split(' ')[0]})
                </span>
              )}
            </button>
          )}

          {/* Si está logueado como Admin */}
          {currentUser && currentUser.role === 'admin' && (
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-lg border transition-colors ${
                currentView === 'admin'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Auditoría Municipal</span>
            </button>
          )}

          {/* Menú de cambio rápido de demostración */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 transition-colors"
              title="Cambiar rápidamente de usuario de prueba para explorar los distintos roles"
              aria-expanded={showDemoMenu}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Perfiles de prueba</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                <div className="px-2 py-1.5 font-bold text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 mb-1">
                  Acceso de prueba rápido (Demo)
                </div>

                <button
                  type="button"
                  onClick={() => {
                    switchUser('user_patriotis');
                    setShowDemoMenu(false);
                    onNavigate('merchant');
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-amber-50 text-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold">Café & Bar Los Patriotas</div>
                    <div className="text-[11px] text-slate-500">Rol: Comercio (Bar/Café)</div>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">Bar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchUser('user_don_mateo');
                    setShowDemoMenu(false);
                    onNavigate('merchant');
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-amber-50 text-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold">Bodegón Don Mateo</div>
                    <div className="text-[11px] text-slate-500">Rol: Comercio (Restaurante)</div>
                  </div>
                  <span className="text-[10px] bg-orange-100 text-orange-900 px-1.5 py-0.5 rounded font-bold">Resto</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchUser('user_glaciar');
                    setShowDemoMenu(false);
                    onNavigate('merchant');
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-amber-50 text-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold">Heladería Artesanal Glaciar</div>
                    <div className="text-[11px] text-slate-500">Rol: Comercio (Heladería)</div>
                  </div>
                  <span className="text-[10px] bg-cyan-100 text-cyan-900 px-1.5 py-0.5 rounded font-bold">Helados</span>
                </button>

                <div className="my-1 border-t border-slate-100"></div>

                <button
                  type="button"
                  onClick={() => {
                    switchUser('admin_municipal_01');
                    setShowDemoMenu(false);
                    onNavigate('admin');
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-50 text-emerald-900 flex items-center justify-between font-bold"
                >
                  <div>
                    <div>Auditor Municipal</div>
                    <div className="text-[11px] text-emerald-700 font-normal">Verifica comercios y otorga oblea</div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </button>

                <div className="my-1 border-t border-slate-100"></div>

                <button
                  type="button"
                  onClick={() => {
                    resetToSampleData();
                    setShowDemoMenu(false);
                    onNavigate('home');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center gap-1.5 text-[11px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer datos originales de ejemplo</span>
                </button>
              </div>
            )}
          </div>

          {/* Autenticación / Cerrar Sesión */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                {currentUser.displayName}
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  onNavigate('home');
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Cerrar sesión actual"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-xs transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Ingresar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
