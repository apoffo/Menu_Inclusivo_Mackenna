import React from 'react';
import { Venue, Product } from '../types';
import { ShieldCheck, ArrowRight, MapPin, Phone, Clock, Store } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

interface VenueCardProps {
  venue: Venue;
  products: Product[];
  onSelectVenue: (venueId: string) => void;
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue, products, onSelectVenue }) => {
  const { pictogramMode } = useAccessibility();

  // Seleccionar exactamente 3 platos destacados:
  // Si el comercio eligió destacados, usar esos IDs; de lo contrario los primeros 3 productos disponibles
  let highlighted: Product[] = [];

  if (venue.highlightedProductIds && venue.highlightedProductIds.length > 0) {
    highlighted = venue.highlightedProductIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined && p.isAvailable);
  }

  if (highlighted.length < 3) {
    const remaining = products.filter(
      (p) => p.venueId === venue.id && p.isAvailable && !highlighted.some((h) => h.id === p.id)
    );
    highlighted = [...highlighted, ...remaining].slice(0, 3);
  } else {
    highlighted = highlighted.slice(0, 3);
  }

  const getRubroBadge = (rubro: string) => {
    switch (rubro) {
      case 'bar':
        return { label: 'Bar & Café', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'restaurante':
        return { label: 'Restaurante / Bodegón', color: 'bg-orange-100 text-orange-900 border-orange-300' };
      case 'cafeteria':
        return { label: 'Cafetería', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'heladeria':
        return { label: 'Heladería Artesanal', color: 'bg-cyan-100 text-cyan-900 border-cyan-300' };
      default:
        return { label: 'Gastronomía', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const rubroInfo = getRubroBadge(venue.rubro);

  return (
    <article
      className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm hover:shadow-lg hover:border-slate-400 transition-all flex flex-col justify-between overflow-hidden focus-within:ring-4 focus-within:ring-sky-500/20"
      aria-labelledby={`venue-title-${venue.id}`}
    >
      {/* Header del Comercio */}
      <div className="p-5 pb-4 border-b border-slate-200">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl border-2 border-slate-200 p-1 bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              {venue.logoUrl ? (
                <img
                  src={venue.logoUrl}
                  alt={`Logo de ${venue.name}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              ) : (
                <Store className="w-6 h-6 text-slate-400" />
              )}
            </div>

            <div>
              <h3
                id={`venue-title-${venue.id}`}
                className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug"
              >
                {venue.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded border ${rubroInfo.color}`}
                >
                  {rubroInfo.label}
                </span>
                {venue.isSuspended && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                    Suspendido temporalmente
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Insignia Comercio Inclusivo (Art. 8 Ordenanza) */}
          {venue.isVerified && (
            <div
              className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-400 px-2.5 py-1.5 rounded-xl shrink-0 shadow-xs"
              title="Comercio Inclusivo Adherido y Verificado por la Municipalidad (Art. 8)"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-600 fill-emerald-100 shrink-0" />
              <div className="text-left hidden sm:block">
                <div className="text-[10px] font-black uppercase tracking-wider leading-none">
                  Comercio
                </div>
                <div className="text-xs font-black text-emerald-800 leading-none">
                  Inclusivo
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Datos de contacto y ubicación */}
        <div className="space-y-1 text-xs text-slate-600 mt-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{venue.address}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{venue.hours}</span>
          </div>
        </div>
      </div>

      {/* Sección de los 3 Platos Destacados */}
      <div className="p-4 bg-slate-50/70 flex-1">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Platos destacados de la carta:
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            3 seleccionados
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {highlighted.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border-2 border-slate-200 rounded-xl p-2 flex flex-col justify-between shadow-2xs hover:border-amber-400 transition-colors"
            >
              <div className="w-full aspect-square bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center p-1.5 mb-1.5 border border-slate-100">
                <img
                  src={prod.imageUrl}
                  alt={prod.imageAlt || prod.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>

              <div>
                <h4
                  className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight mb-1"
                  title={prod.name}
                >
                  {prod.name}
                </h4>
                <div className="text-xs font-black text-emerald-700">
                  ${prod.price.toLocaleString('es-AR')}
                </div>
              </div>
            </div>
          ))}

          {highlighted.length === 0 && (
            <div className="col-span-3 py-6 text-center text-xs text-slate-500">
              No hay productos destacados cargados aún.
            </div>
          )}
        </div>
      </div>

      {/* Botón Grande: Ver Carta Completa */}
      <div className="p-4 bg-white border-t border-slate-200">
        <button
          type="button"
          onClick={() => onSelectVenue(venue.id)}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs group cursor-pointer"
          aria-label={`Ver carta completa y accesible de ${venue.name}`}
        >
          <span>Ver carta completa</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </article>
  );
};
