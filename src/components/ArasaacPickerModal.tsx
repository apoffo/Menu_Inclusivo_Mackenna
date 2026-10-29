import React, { useState, useEffect } from 'react';
import { ArasaacResult } from '../types';
import { searchArasaacPictograms, ARASAAC_POPULAR_PRESETS } from '../utils/arasaac';
import { Search, Upload, X, Check, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ArasaacPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string, suggestedAlt: string) => void;
  initialQuery?: string;
}

export const ArasaacPickerModal: React.FC<ArasaacPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialQuery = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState<ArasaacResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'arasaac' | 'upload'>('arasaac');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      handleSearch(initialQuery || '');
    }
  }, [isOpen, initialQuery]);

  const handleSearch = async (term: string) => {
    setLoading(true);
    try {
      const items = await searchArasaacPictograms(term);
      setResults(items);
    } catch {
      // Handled in utility
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen seleccionada supera el límite recomendado de 2MB. Por favor elegí una más liviana.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setUploadedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-arasaac-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header del Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <h2 id="modal-arasaac-title" className="text-lg font-bold">
              Seleccionar Pictograma Accesible
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar ventana de pictogramas"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas: Buscador ARASAAC o Foto Propia */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('arasaac')}
            className={`pb-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'arasaac'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Biblioteca ARASAAC (Recomendado)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Subir foto propia</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'arasaac' ? (
            <div>
              {/* Buscador */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(searchTerm);
                }}
                className="flex gap-2 mb-4"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar alimento o bebida (ej: café, medialuna, hamburguesa, cerveza)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-hidden"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
                </button>
              </form>

              {/* Sugerencias rápidas */}
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Términos frecuentes en gastronomía argentina:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ARASAAC_POPULAR_PRESETS.slice(0, 10).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSearchTerm(p.keyword);
                        handleSearch(p.keyword);
                      }}
                      className="px-2.5 py-1 bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 text-xs font-semibold rounded-lg transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grilla de resultados */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
                  <p className="text-sm font-medium">Buscando pictogramas oficiales en ARASAAC...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {results.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const altDesc = `Pictograma accesible de ${item.keywords[0] || 'alimento'}`;
                        onSelect(item.imageUrl, altDesc);
                        onClose();
                      }}
                      className="group p-2.5 bg-white border-2 border-slate-200 hover:border-amber-500 hover:shadow-md rounded-xl flex flex-col items-center justify-between text-center transition-all cursor-pointer"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-1.5 bg-slate-50 rounded-lg group-hover:bg-amber-50 transition-colors">
                        <img
                          src={item.imageUrl}
                          alt={item.keywords[0] || 'Pictograma'}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-amber-800">
                        {item.keywords[0]}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium">
                    No encontramos pictogramas para "{searchTerm}".
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Probá con términos más generales como "carne", "bebida", "postre" o subí una foto propia.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              {uploadedImage ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-md">
                    <img
                      src={uploadedImage}
                      alt="Vista previa de foto subida"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setUploadedImage(null)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50"
                    >
                      Elegir otra
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(uploadedImage, 'Fotografía del plato');
                        onClose();
                      }}
                      className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-600 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Usar esta foto</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-amber-500 cursor-pointer w-full max-w-md flex flex-col items-center justify-center transition-colors">
                  <Upload className="w-10 h-10 text-slate-400 mb-3" />
                  <span className="font-bold text-slate-800 text-base mb-1">
                    Hacé clic para cargar una foto
                  </span>
                  <span className="text-xs text-slate-500">
                    PNG, JPG o WEBP (fondo claro y buena iluminación recomendado)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
          <span>
            Pictogramas proporcionados bajo licencia Creative Commons por{' '}
            <strong className="text-slate-800">ARASAAC</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
