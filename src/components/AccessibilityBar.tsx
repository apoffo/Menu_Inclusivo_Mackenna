import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  Volume2,
  VolumeX,
  Type,
  Sun,
  Eye,
  Sliders,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const AccessibilityBar: React.FC = () => {
  const {
    contrastMode,
    setContrastMode,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    pictogramMode,
    togglePictogramMode,
    isSpeaking,
    stopSpeaking,
    speakText,
    resetAccessibility,
  } = useAccessibility();

  const [isExpanded, setIsExpanded] = useState(false);

  const handleTestSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(
        'Barra de accesibilidad activada. Puede ajustar el tamaño de texto, el contraste y el modo pictogramas.'
      );
    }
  };

  return (
    <aside
      aria-label="Barra de herramientas de accesibilidad"
      className="bg-slate-900 text-white border-b-2 border-slate-700 py-2.5 px-4 sticky top-0 z-50 shadow-md"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
        {/* Etiqueta principal y acceso rápido */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold tracking-wide uppercase text-xs bg-sky-600 text-white px-2.5 py-1 rounded">
            <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
            Accesibilidad
          </span>

          <span className="hidden sm:inline text-xs text-slate-300">
            Conforme Ordenanza Municipal Inclusiva (WCAG 2.1 AA)
          </span>
        </div>

        {/* Botones principales de acceso directo */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Tamaño de texto */}
          <div className="flex items-center bg-slate-800 rounded border border-slate-600 p-0.5" role="group" aria-label="Tamaño del texto">
            <button
              type="button"
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                fontSize === 'normal' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'
              }`}
              title="Tamaño normal de texto"
              aria-label="Texto estándar"
              aria-pressed={fontSize === 'normal'}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 text-sm font-bold rounded transition-colors ${
                fontSize === 'large' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'
              }`}
              title="Aumentar tamaño de texto a grande"
              aria-label="Texto grande"
              aria-pressed={fontSize === 'large'}
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setFontSize('extralarge')}
              className={`px-2.5 py-1 text-base font-bold rounded transition-colors ${
                fontSize === 'extralarge' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'
              }`}
              title="Aumentar tamaño de texto a muy grande"
              aria-label="Texto extra grande"
              aria-pressed={fontSize === 'extralarge'}
            >
              A++
            </button>
          </div>

          {/* Selector de Contraste */}
          <div className="flex items-center bg-slate-800 rounded border border-slate-600 p-0.5" role="group" aria-label="Contraste de pantalla">
            <button
              type="button"
              onClick={() => setContrastMode('normal')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                contrastMode === 'normal' ? 'bg-sky-500 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
              title="Contraste estándar"
              aria-label="Modo color estándar"
              aria-pressed={contrastMode === 'normal'}
            >
              Estándar
            </button>
            <button
              type="button"
              onClick={() => setContrastMode('black-white')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                contrastMode === 'black-white' ? 'bg-white text-black font-extrabold' : 'text-slate-300 hover:text-white'
              }`}
              title="Alto contraste blanco sobre fondo negro"
              aria-label="Alto contraste blanco y negro"
              aria-pressed={contrastMode === 'black-white'}
            >
              B/N
            </button>
            <button
              type="button"
              onClick={() => setContrastMode('yellow-black')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                contrastMode === 'yellow-black' ? 'bg-yellow-300 text-black font-extrabold' : 'text-yellow-300 hover:text-yellow-200'
              }`}
              title="Alto contraste amarillo sobre fondo negro para baja visión"
              aria-label="Alto contraste amarillo sobre negro"
              aria-pressed={contrastMode === 'yellow-black'}
            >
              Amarillo
            </button>
          </div>

          {/* Modo Pictogramas */}
          <button
            type="button"
            onClick={togglePictogramMode}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold border transition-colors ${
              pictogramMode
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                : 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700'
            }`}
            title="Activa o desactiva la vista ultra-simplificada con predominio de pictogramas para personas con TEA, afasia o barreras del lenguaje"
            aria-label="Modo solo pictogramas y texto simple"
            aria-pressed={pictogramMode}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Modo Pictogramas</span>
            {pictogramMode && <span className="bg-slate-900 text-white px-1.5 py-0.2 text-[10px] rounded">ACTIVO</span>}
          </button>

          {/* Leer en voz alta */}
          <button
            type="button"
            onClick={handleTestSpeech}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold border transition-colors ${
              isSpeaking
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-emerald-700 text-white border-emerald-500 hover:bg-emerald-600'
            }`}
            title={isSpeaking ? 'Detener voz en audio' : 'Leer instrucciones o contenido en voz alta'}
            aria-label={isSpeaking ? 'Detener lectura en voz alta' : 'Activar lectura en voz alta'}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Detener Voz</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Leer en Voz Alta</span>
              </>
            )}
          </button>

          {/* Botón desplegable para más opciones */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 rounded border border-slate-700"
            aria-expanded={isExpanded}
            aria-label="Más opciones de accesibilidad"
          >
            <span className="hidden sm:inline">Más</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Menú extendido de accesibilidad */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Fuente accesible */}
            <div className="flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              <span>Tipografía:</span>
              <button
                type="button"
                onClick={() => setFontFamily('sans')}
                className={`px-2 py-0.5 rounded border ${
                  fontFamily === 'sans' ? 'bg-sky-500 text-white border-sky-400 font-bold' : 'border-slate-700'
                }`}
              >
                Estándar
              </button>
              <button
                type="button"
                onClick={() => setFontFamily('hyperlegible')}
                className={`px-2 py-0.5 rounded border ${
                  fontFamily === 'hyperlegible' ? 'bg-sky-500 text-white border-sky-400 font-bold font-accessible' : 'border-slate-700'
                }`}
                title="Tipografía de máxima legibilidad para dislexia y baja visión"
              >
                Verdana / Hiperlegible
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetAccessibility}
              className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-white transition-colors"
              title="Restablecer configuración predeterminada"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer opciones</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
