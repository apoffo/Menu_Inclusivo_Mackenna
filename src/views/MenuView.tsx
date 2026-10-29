import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { ProductCard } from '../components/ProductCard';
import { QRModal } from '../components/QRModal';
import { BrailleModal } from '../components/BrailleModal';
import { generateAccessiblePdf } from '../utils/pdfGenerator';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  FileDown,
  BookOpen,
  QrCode,
  ArrowLeft,
  Volume2,
  VolumeX,
  Share2,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface MenuViewProps {
  venueId: string;
  onBack: () => void;
}

export const MenuView: React.FC<MenuViewProps> = ({ venueId, onBack }) => {
  const { venues, categories, products } = useData();
  const { speakText, isSpeaking, stopSpeaking } = useAccessibility();

  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showBrailleModal, setShowBrailleModal] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const venue = useMemo(() => venues.find((v) => v.id === venueId), [venues, venueId]);

  const venueCategories = useMemo(() => {
    return categories
      .filter((c) => c.venueId === venueId)
      .sort((a, b) => a.order - b.order);
  }, [categories, venueId]);

  const venueProducts = useMemo(() => {
    return products.filter((p) => p.venueId === venueId);
  }, [products, venueId]);

  const displayedCategories = useMemo(() => {
    if (activeCategoryTab === 'all') {
      return venueCategories;
    }
    return venueCategories.filter((c) => c.id === activeCategoryTab);
  }, [venueCategories, activeCategoryTab]);

  if (!venue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Store className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">Comercio no encontrado</h2>
        <p className="text-sm text-slate-600 mb-6">El comercio seleccionado no existe o fue deshabilitado.</p>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl"
        >
          Volver al directorio
        </button>
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      await generateAccessiblePdf(venue, venueCategories, venueProducts);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Hubo un inconveniente al generar el PDF. Por favor intentá nuevamente.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleReadFullMenu = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    let fullSpeech = `Carta accesible de ${venue.name}. `;
    for (const cat of venueCategories) {
      const prods = venueProducts.filter((p) => p.categoryId === cat.id && p.isAvailable);
      if (prods.length === 0) continue;
      fullSpeech += `Categoría ${cat.name}. `;
      for (const p of prods) {
        fullSpeech += `${p.name}, precio ${p.price} pesos argentinos. ${p.description}. `;
      }
    }
    speakText(fullSpeech);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
      {/* Botón de regreso */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950 mb-4 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
        aria-label="Volver al listado de comercios"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al directorio</span>
      </button>

      {/* Tarjeta de Encabezado del Comercio */}
      <section
        className="bg-white rounded-3xl border-2 border-slate-300 p-6 sm:p-8 mb-8 shadow-sm relative overflow-hidden"
        aria-labelledby="menu-venue-title"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-slate-200 bg-white p-2 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
              {venue.logoUrl ? (
                <img
                  src={venue.logoUrl}
                  alt={`Logo oficial de ${venue.name}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Store className="w-10 h-10 text-slate-400" />
              )}
            </div>

            {/* Datos */}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                <h1
                  id="menu-venue-title"
                  className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight"
                >
                  {venue.name}
                </h1>
                {venue.isVerified && (
                  <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-400 text-xs font-black px-2.5 py-1 rounded-xl shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>COMERCIO INCLUSIVO (ART. 8)</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-slate-600 mt-2">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  {venue.address}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  {venue.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  {venue.hours}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de Acción de Documentos Accesibles (Requerimiento de la Ordenanza) */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
            {/* Descargar PDF con pictogramas */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
              className="flex-1 sm:flex-initial px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              title="Descargar carta completa en tamaño A4 con pictogramas y texto legible (14pt+)"
            >
              {generatingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <FileDown className="w-4 h-4 text-amber-400" />
              )}
              <span>Descargar PDF con Pictogramas</span>
            </button>

            {/* Descargar Braille */}
            <button
              type="button"
              onClick={() => setShowBrailleModal(true)}
              className="flex-1 sm:flex-initial px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              title="Ver transcripción y descargar carta en Sistema Braille (.brf y PDF)"
            >
              <BookOpen className="w-4 h-4" />
              <span>Carta en Braille</span>
            </button>

            {/* Código QR */}
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition-colors"
              title="Ver y descargar código QR del menú"
              aria-label="Ver código QR para imprimir"
            >
              <QrCode className="w-5 h-5" />
            </button>

            {/* Leer carta completa en voz alta */}
            <button
              type="button"
              onClick={handleReadFullMenu}
              className={`p-3 rounded-xl border transition-colors ${
                isSpeaking
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
              title={isSpeaking ? 'Detener lectura en voz alta' : 'Leer toda la carta en voz alta'}
              aria-label="Leer toda la carta en voz alta"
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </section>

      {/* Navegación rápida entre categorías */}
      <nav
        aria-label="Categorías del menú"
        className="sticky top-14 z-20 bg-slate-100/90 backdrop-blur-md p-2 rounded-2xl border border-slate-300 mb-8 shadow-xs flex items-center gap-1.5 overflow-x-auto"
      >
        <button
          type="button"
          onClick={() => setActiveCategoryTab('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-colors ${
            activeCategoryTab === 'all'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
          aria-pressed={activeCategoryTab === 'all'}
        >
          Todas las categorías ({venueProducts.length})
        </button>

        {venueCategories.map((cat) => {
          const count = venueProducts.filter((p) => p.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryTab(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-colors ${
                activeCategoryTab === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
              aria-pressed={activeCategoryTab === cat.id}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </nav>

      {/* Contenido de la Carta por Categorías */}
      <div className="space-y-10">
        {displayedCategories.map((category) => {
          const catProducts = venueProducts.filter((p) => p.categoryId === category.id);
          if (catProducts.length === 0) return null;

          return (
            <section
              key={category.id}
              aria-labelledby={`cat-heading-${category.id}`}
              className="bg-slate-50/60 p-4 sm:p-6 rounded-3xl border border-slate-200"
            >
              <div className="flex items-center justify-between border-b-2 border-slate-300 pb-3 mb-6">
                <h2
                  id={`cat-heading-${category.id}`}
                  className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide flex items-center gap-2"
                >
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span>{category.name}</span>
                </h2>
                <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {catProducts.length} {catProducts.length === 1 ? 'opción' : 'opciones'}
                </span>
              </div>

              {/* Grilla de productos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}

        {venueProducts.length === 0 && (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center">
            <Store className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Este comercio todavía no ha cargado platos en su carta
            </h3>
            <p className="text-sm text-slate-500">
              El comerciante puede acceder con su cuenta para cargar categorías y productos con pictogramas ARASAAC.
            </p>
          </div>
        )}
      </div>

      {/* Modales Accesibles */}
      <QRModal
        venue={venue}
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
      />

      <BrailleModal
        venue={venue}
        categories={venueCategories}
        products={venueProducts}
        isOpen={showBrailleModal}
        onClose={() => setShowBrailleModal(false)}
      />
    </div>
  );
};
