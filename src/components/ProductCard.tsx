import React from 'react';
import { Product } from '../types';
import { Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { pictogramMode, speakProduct, isSpeaking, stopSpeaking } = useAccessibility();

  const handleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakProduct(product.name, product.price, product.description, product.foreignTranslation);
    }
  };

  const getTagBadge = (tag: string) => {
    switch (tag) {
      case 'sin_tacc':
        return { label: 'Sin TACC', color: 'bg-amber-100 text-amber-950 border-amber-300' };
      case 'vegetariano':
        return { label: 'Vegetariano', color: 'bg-emerald-100 text-emerald-950 border-emerald-300' };
      case 'vegano':
        return { label: 'Vegano', color: 'bg-green-100 text-green-950 border-green-300' };
      default:
        return { label: tag, color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  // VISTA MODO PICTOGRAMAS (Ultra simplificada para TEA, discapacidad cognitiva, afasia)
  if (pictogramMode) {
    return (
      <article
        className="bg-white rounded-2xl border-4 border-slate-900 shadow-md p-4 flex flex-col items-center justify-between text-center transition-transform hover:scale-[1.02]"
        aria-label={`${product.name}, precio ${product.price} pesos`}
      >
        <div className="w-full aspect-square max-w-[200px] bg-slate-50 rounded-xl p-3 flex items-center justify-center border-2 border-slate-200 mb-3">
          <img
            src={product.imageUrl}
            alt={product.imageAlt || product.name}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-950 leading-tight mb-2">
          {product.name}
        </h3>

        <div className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xl sm:text-2xl font-black shadow-xs">
          ${product.price.toLocaleString('es-AR')}
        </div>

        <button
          type="button"
          onClick={handleSpeech}
          className="mt-3 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm rounded-lg flex items-center justify-center gap-2 border border-slate-300"
          aria-label={`Escuchar ${product.name}`}
        >
          <Volume2 className="w-4 h-4 text-sky-600" />
          <span>Escuchar</span>
        </button>
      </article>
    );
  }

  // VISTA ESTÁNDAR ACCESIBLE
  return (
    <article
      className="bg-white rounded-2xl border-2 border-slate-300 p-4 sm:p-5 shadow-xs hover:border-slate-400 hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 justify-between"
      aria-labelledby={`prod-name-${product.id}`}
    >
      {/* Columna Izquierda: Pictograma / Imagen grande */}
      <div className="sm:w-36 sm:h-36 w-full aspect-square max-w-[160px] mx-auto sm:mx-0 shrink-0 bg-slate-50 border-2 border-slate-200 rounded-xl p-2 flex items-center justify-center overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.imageAlt || `Foto o pictograma de ${product.name}`}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      {/* Columna Central: Información del plato */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3
              id={`prod-name-${product.id}`}
              className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug"
            >
              {product.name}
              {product.foreignTranslation && (
                <span className="block sm:inline text-sm sm:text-base font-semibold text-slate-600 sm:ml-2">
                  ({product.foreignTranslation})
                </span>
              )}
            </h3>

            {/* Precio destacado */}
            <div className="text-lg sm:text-xl font-black text-emerald-800 shrink-0">
              ${product.price.toLocaleString('es-AR')}
            </div>
          </div>

          {/* Descripción del plato */}
          <p className="text-sm text-slate-700 leading-relaxed font-normal mb-3">
            {product.description}
          </p>

          {/* Etiquetas (Sin TACC, Vegano, Vegetariano) */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {product.tags.map((tag) => {
                const info = getTagBadge(tag);
                return (
                  <span
                    key={tag}
                    className={`text-xs font-bold px-2 py-0.5 rounded-md border ${info.color}`}
                  >
                    {info.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Texto accesible (descripción alternativa) explícita para lectura */}
          <div className="text-[11px] text-slate-500 bg-slate-50 rounded-lg px-2.5 py-1 border border-slate-200 flex items-center gap-1.5">
            <span className="font-bold text-slate-600">Lectura accesible del pictograma:</span>
            <span className="italic">"{product.imageAlt}"</span>
          </div>
        </div>

        {/* Botón de reproducción de audio */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSpeech}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-900 border border-sky-300 hover:bg-sky-100 transition-colors"
            title="Escuchar nombre, precio y descripción de este plato"
            aria-label={`Escuchar descripción de ${product.name}`}
          >
            <Volume2 className="w-3.5 h-3.5 text-sky-700" />
            <span>Escuchar plato</span>
          </button>

          {!product.isAvailable && (
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Agotado temporalmente
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
