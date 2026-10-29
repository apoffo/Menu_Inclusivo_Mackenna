import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { VenueCard } from '../components/VenueCard';
import { RubroType } from '../types';
import { Search, Filter, ShieldCheck, Sparkles, Store, Info, BookOpen } from 'lucide-react';

interface HomeViewProps {
  onSelectVenue: (venueId: string) => void;
  onOpenAuth: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectVenue, onOpenAuth }) => {
  const { venues, products } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRubro, setSelectedRubro] = useState<RubroType | 'todos'>('todos');
  const [onlyVerified, setOnlyVerified] = useState(false);

  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      // Búsqueda por nombre o dirección
      const matchesSearch =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.address.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por rubro
      const matchesRubro = selectedRubro === 'todos' || v.rubro === selectedRubro;

      // Filtro de sólo verificados
      const matchesVerified = !onlyVerified || v.isVerified;

      return matchesSearch && matchesRubro && matchesVerified;
    });
  }, [venues, searchTerm, selectedRubro, onlyVerified]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
      {/* Banner Informativo de la Ordenanza Municipal */}
      <section
        className="bg-amber-500 text-slate-950 rounded-3xl p-6 sm:p-8 mb-8 shadow-md border-2 border-amber-600 relative overflow-hidden"
        aria-labelledby="hero-title"
      >
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-slate-950 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Proyecto de Ordenanza Municipal de Inclusión Gastronómica</span>
          </div>

          <h1 id="hero-title" className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
            Cartas gastronómicas con pictogramas y sistema Braille
          </h1>

          <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed mb-6">
            Garantizamos el derecho de acceso a la información y autonomía a personas con discapacidad visual, TEA, discapacidad cognitiva, afasia o barreras idiomáticas en bares, restaurantes, cafés y heladerías de Argentina.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#directorio"
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-black text-sm rounded-xl transition-colors shadow-xs"
            >
              Explorar comercios adheridos
            </a>
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-950 font-black text-sm rounded-xl transition-colors shadow-xs border border-amber-600"
            >
              Sumar mi comercio
            </button>
          </div>
        </div>
      </section>

      {/* Sección del Directorio y Filtros */}
      <div id="directorio" className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Directorio de Comercios Inclusivos
            </h2>
            <p className="text-sm text-slate-600">
              Explorá la carta completa y descargala en formato accesible o en Braille.
            </p>
          </div>

          {/* Buscador */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o dirección..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-300 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-hidden shadow-2xs"
              aria-label="Buscar comercios por nombre o dirección"
            />
          </div>
        </div>

        {/* Barra de Filtros por Rubro y Oblea */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar por rubro gastronómico">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Rubro:
            </span>

            {[
              { id: 'todos', label: 'Todos los rubros' },
              { id: 'bar', label: 'Bares' },
              { id: 'restaurante', label: 'Restaurantes' },
              { id: 'cafeteria', label: 'Cafeterías' },
              { id: 'heladeria', label: 'Heladerías' },
              { id: 'otro', label: 'Otros' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRubro(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selectedRubro === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-pressed={selectedRubro === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filtro Oblea Municipal */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Solo con Oblea Municipal (Art. 8)</span>
          </label>
        </div>
      </div>

      {/* Grilla de Comercios */}
      {filteredVenues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              products={products}
              onSelectVenue={onSelectVenue}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
          <Store className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            No se encontraron comercios con los filtros seleccionados
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Intentá modificar el término de búsqueda o quitar los filtros de rubro.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedRubro('todos');
              setOnlyVerified(false);
            }}
            className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
          >
            Limpiar filtros de búsqueda
          </button>
        </div>
      )}

      {/* Resumen pedagógico del Proyecto de Ordenanza */}
      <section className="mt-12 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800">
        <div className="flex items-center gap-2.5 text-amber-400 mb-3">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-lg font-black uppercase tracking-wider">
            Aspectos clave del Proyecto de Ordenanza Municipal
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-300 mt-4">
          <div className="border-l-2 border-amber-400 pl-4">
            <h3 className="font-bold text-white text-base mb-1">1. Pictogramas y Accesibilidad Cognitiva</h3>
            <p>
              Toda carta debe incorporar pictogramas estandarizados (ARASAAC) en platos y bebidas para personas con TEA, afasia, dificultades cognitivas o que no hablen el idioma.
            </p>
          </div>

          <div className="border-l-2 border-amber-400 pl-4">
            <h3 className="font-bold text-white text-base mb-1">2. Sistema Braille y Macrotipo</h3>
            <p>
              Disponibilidad obligatoria de versiones en Braille español (Grado 1) y macrotipo con contraste aumentado y fuentes de alta legibilidad tipo Verdana / Arial.
            </p>
          </div>

          <div className="border-l-2 border-amber-400 pl-4">
            <h3 className="font-bold text-white text-base mb-1">3. Oblea "Comercio Inclusivo" (Art. 8)</h3>
            <p>
              Los locales gastronómicos verificados por la auditoría municipal reciben la insignia oficial y acceso al registro de comercios accesibles del municipio.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
