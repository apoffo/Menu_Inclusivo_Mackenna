import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { LogIn, UserPlus, X, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { RubroType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: 'merchant' | 'admin') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, switchUser } = useData();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [venueName, setVenueName] = useState('');
  const [rubro, setRubro] = useState<RubroType>('restaurante');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      const ok = await login(
        email.trim(),
        mode === 'register' ? 'merchant' : undefined,
        venueName.trim() || undefined,
        rubro
      );
      if (ok) {
        onSuccess(email.includes('admin') ? 'admin' : 'merchant');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (userId: string, role: 'merchant' | 'admin') => {
    switchUser(userId);
    onSuccess(role);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-amber-400" />
            <h2 id="auth-modal-title" className="text-base font-black">
              {mode === 'login' ? 'Iniciar Sesión' : 'Registrar Comercio'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label="Cerrar modal de autenticación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Acceso Rápido de Prueba (Demo) */}
        <div className="p-5 bg-amber-50/80 border-b border-amber-200">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Acceso rápido con un clic (Perfiles de muestra)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('user_patriotis', 'merchant')}
              className="p-2 bg-white hover:bg-amber-100 rounded-xl border border-amber-300 text-slate-800 text-left font-bold transition-colors"
            >
              <div>Café Los Patriotas</div>
              <span className="text-[10px] text-slate-500 font-normal">Rol: Bar / Café</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('user_don_mateo', 'merchant')}
              className="p-2 bg-white hover:bg-amber-100 rounded-xl border border-amber-300 text-slate-800 text-left font-bold transition-colors"
            >
              <div>Bodegón Don Mateo</div>
              <span className="text-[10px] text-slate-500 font-normal">Rol: Restaurante</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('user_glaciar', 'merchant')}
              className="p-2 bg-white hover:bg-amber-100 rounded-xl border border-amber-300 text-slate-800 text-left font-bold transition-colors"
            >
              <div>Heladería Glaciar</div>
              <span className="text-[10px] text-slate-500 font-normal">Rol: Heladería</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin_municipal_01', 'admin')}
              className="p-2 bg-emerald-800 hover:bg-emerald-900 rounded-xl border border-emerald-950 text-white text-left font-bold transition-colors"
            >
              <div>Auditor Municipal</div>
              <span className="text-[10px] text-emerald-200 font-normal">Oblea Art. 8</span>
            </button>
          </div>
        </div>

        {/* Formulario Estándar */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Correo Electrónico *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucomercio@ejemplo.com.ar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Contraseña *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden focus:border-amber-500"
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nombre de tu Comercio Gastronómico *
                </label>
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="Ej: Cafetería San Martín"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Rubro *
                </label>
                <select
                  value={rubro}
                  onChange={(e) => setRubro(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white outline-hidden"
                >
                  <option value="bar">Bar & Café</option>
                  <option value="restaurante">Restaurante / Bodegón</option>
                  <option value="cafeteria">Cafetería</option>
                  <option value="heladeria">Heladería Artesanal</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{mode === 'login' ? 'Ingresar a mi cuenta' : 'Crear cuenta de comercio'}</span>
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
            >
              {mode === 'login'
                ? '¿No tenés cuenta todavía? Registrá tu comercio aquí'
                : '¿Ya tenés cuenta? Iniciar sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
