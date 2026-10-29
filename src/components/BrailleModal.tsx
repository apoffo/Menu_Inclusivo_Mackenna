import React, { useState } from 'react';
import { Venue, Category, Product } from '../types';
import {
  generateBrailleMenuContent,
  downloadBrfFile,
  downloadBraillePdf,
} from '../utils/braille';
import { BookOpen, FileText, Download, X, HelpCircle, Check, Printer } from 'lucide-react';

interface BrailleModalProps {
  venue: Venue;
  categories: Category[];
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
}

export const BrailleModal: React.FC<BrailleModalProps> = ({
  venue,
  categories,
  products,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'braille' | 'visual' | 'guia'>('braille');

  if (!isOpen) return null;

  const { visualText, brailleUnicode, brfText } = generateBrailleMenuContent(
    venue,
    categories,
    products
  );

  const handleDownloadBrf = () => {
    downloadBrfFile(venue.name, brfText);
  };

  const handleDownloadPdf = () => {
    downloadBraillePdf(venue, categories, products);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="braille-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h2 id="braille-modal-title" className="text-lg font-black leading-tight">
                Carta en Sistema Braille (Español)
              </h2>
              <p className="text-xs text-slate-300">
                {venue.name} — Conforme Ordenanza Municipal Inclusiva
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar modal de Braille"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Acciones principales de descarga */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-amber-950">
            <strong>Opciones de descarga para impresión accesible:</strong>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Descargar PDF en Braille (A4)</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadBrf}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              title="Formato Braille estándar (.brf) listo para conectar a impresora embosser Braille"
            >
              <Printer className="w-4 h-4" />
              <span>Descargar archivo .brf (Impresora Braille)</span>
            </button>
          </div>
        </div>

        {/* Pestañas de vista previa */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-slate-50 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('braille')}
            className={`pb-2.5 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
              activeTab === 'braille'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Puntos Unicode Braille (U+2800)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`pb-2.5 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
              activeTab === 'visual'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Texto en Español equivalente
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guia')}
            className={`pb-2.5 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-1 ${
              activeTab === 'guia'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Reglas del Braille en Español</span>
          </button>
        </div>

        {/* Área de Visualización */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {activeTab === 'braille' && (
            <div>
              <div className="mb-3 flex items-center justify-between text-xs text-slate-600">
                <span>Caracteres generados: <strong>{brailleUnicode.length}</strong></span>
                <span className="font-semibold text-emerald-800">
                  Cumple con prefijo de número ⠼, mayúscula ⠨ y acentos en español
                </span>
              </div>
              <div className="p-4 bg-white border-2 border-slate-300 rounded-xl font-mono text-xl sm:text-2xl tracking-widest leading-relaxed overflow-x-auto whitespace-pre-wrap select-all text-slate-900 shadow-inner">
                {brailleUnicode}
              </div>
            </div>
          )}

          {activeTab === 'visual' && (
            <div>
              <div className="p-4 bg-white border-2 border-slate-300 rounded-xl font-mono text-xs sm:text-sm whitespace-pre-wrap select-all text-slate-800 shadow-inner">
                {visualText}
              </div>
            </div>
          )}

          {activeTab === 'guia' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 bg-white p-5 rounded-xl border border-slate-200">
              <h3 className="font-black text-base text-slate-900 mb-1">
                Pautas de Transcripción Braille en Español (Grado 1)
              </h3>
              <p>
                El sistema Braille consta de celdas de 6 puntos en dos columnas de 3. Para el idioma español y la gastronomía argentina, el conversor aplica:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="font-bold text-amber-900 mb-1">Prefijo Numérico (⠼)</div>
                  <p className="text-xs text-amber-950">
                    Se antepone a los números para indicar que las letras a-j deben interpretarse como dígitos 1-0 (ej: $ 4200 = ⠠ ⠼⠙⠃⠚⠚).
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="font-bold text-amber-900 mb-1">Prefijo de Mayúscula (⠨)</div>
                  <p className="text-xs text-amber-950">
                    Marca el inicio de nombres propios de comercios y encabezados de categorías.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="font-bold text-amber-900 mb-1">Letra Ñ (⠻) y Vocales con Tilde</div>
                  <p className="text-xs text-amber-950">
                    á (⠷), é (⠮), í (⠌), ó (⠬), ú (⠾) y ü (⠳) con sus correspondientes celdas normalizadas.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="font-bold text-amber-900 mb-1">Formato Archivo .brf</div>
                  <p className="text-xs text-amber-950">
                    Archivo estándar para software de gofrado y máquinas de puntos (embossers) como Index Braille y Everest.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
