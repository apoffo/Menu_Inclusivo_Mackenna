import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Venue, RubroType } from '../types';
import { checkMenuCompliance } from '../utils/compliance';
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Store,
  ExternalLink,
  Ban,
  Check,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface AdminDashboardProps {
  onViewVenueMenu: (venueId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewVenueMenu }) => {
  const {
    venues,
    products,
    categories,
    toggleVenueVerified,
    toggleVenueSuspended,
    addVenue,
    addCategory,
    addProduct,
  } = useData();

  const [showAddVenueModal, setShowAddVenueModal] = useState(false);
  const [newVenueForm, setNewVenueForm] = useState({
    name: '',
    rubro: 'restaurante' as RubroType,
    address: '',
    phone: '',
    hours: 'Lunes a Domingos 10:00 a 23:00 hs',
    logoUrl: 'https://static.arasaac.org/pictograms/2479/2479_500.png',
  });

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueForm.name.trim()) return;

    const created = await addVenue({
      name: newVenueForm.name.trim(),
      rubro: newVenueForm.rubro,
      address: newVenueForm.address.trim() || 'Dirección local, Argentina',
      phone: newVenueForm.phone.trim() || '011 4000-0000',
      hours: newVenueForm.hours.trim(),
      logoUrl: newVenueForm.logoUrl,
      isVerified: true, // El municipio lo crea ya verificado
      isSuspended: false,
      ownerId: 'admin_municipal_01',
      ownerEmail: 'admin@municipio.gob.ar',
      highlightedProductIds: [],
    });

    // Agregar categorías iniciales
    const cat1 = await addCategory({ venueId: created.id, name: 'Especialidades', order: 1 });
    const cat2 = await addCategory({ venueId: created.id, name: 'Bebidas', order: 2 });

    // Agregar platos iniciales con ARASAAC
    const p1 = await addProduct({
      venueId: created.id,
      categoryId: cat1.id,
      name: 'Plato del Día Accesible',
      description: 'Porción clásica con guarnición fresca y panera artesanal.',
      price: 6500,
      imageUrl: 'https://static.arasaac.org/pictograms/2516/2516_500.png',
      imageAlt: 'Plato servido con guarnición de ensalada o papas',
      isAvailable: true,
      isHighlighted: true,
      tags: ['sin_tacc'],
    });

    const p2 = await addProduct({
      venueId: created.id,
      categoryId: cat2.id,
      name: 'Limonada Natural',
      description: 'Jugo exprimido con hielo picado y menta fresca.',
      price: 3200,
      imageUrl: 'https://static.arasaac.org/pictograms/2356/2356_500.png',
      imageAlt: 'Vaso alto con jugo de limón fresco y hojas de menta',
      isAvailable: true,
      isHighlighted: true,
      tags: ['vegano'],
    });

    setShowAddVenueModal(false);
    setNewVenueForm({
      name: '',
      rubro: 'restaurante',
      address: '',
      phone: '',
      hours: 'Lunes a Domingos 10:00 a 23:00 hs',
      logoUrl: 'https://static.arasaac.org/pictograms/2479/2479_500.png',
    });
  };

  const verifiedCount = venues.filter((v) => v.isVerified && !v.isSuspended).length;
  const suspendedCount = venues.filter((v) => v.isSuspended).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
      {/* Encabezado */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-md border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-emerald-100 flex items-center justify-center font-black">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Municipalidad • Dirección de Accesibilidad e Inclusión
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Registro y Auditoría de Comercios Inclusivos
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1">
                Fiscalización de cartas con pictogramas y sistema Braille conforme Ordenanza Municipal (Art. 8).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddVenueModal(true)}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm rounded-xl flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Adherir nuevo comercio</span>
          </button>
        </div>

        {/* Métricas del municipio */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-800/80">
          <div>
            <div className="text-xs text-emerald-300">Total Adheridos</div>
            <div className="text-2xl font-black text-white">{venues.length}</div>
          </div>
          <div>
            <div className="text-xs text-emerald-300">Oblea Art. 8 Activa</div>
            <div className="text-2xl font-black text-emerald-300">{verifiedCount}</div>
          </div>
          <div>
            <div className="text-xs text-emerald-300">Comercios Suspendidos</div>
            <div className="text-2xl font-black text-rose-300">{suspendedCount}</div>
          </div>
          <div>
            <div className="text-xs text-emerald-300">Platos Inclusivos Auditados</div>
            <div className="text-2xl font-black text-white">{products.length}</div>
          </div>
        </div>
      </div>

      {/* Tabla de Comercios Registrados */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">
            Listado de Locales Gastronómicos Registrados
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {venues.length} comercios en el padrón
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" role="table">
            <thead className="bg-slate-50 text-slate-600 font-bold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Comercio</th>
                <th className="py-3 px-4">Rubro</th>
                <th className="py-3 px-4">Cumplimiento Ordenanza</th>
                <th className="py-3 px-4">Estado Oblea Art. 8</th>
                <th className="py-3 px-4 text-right">Acciones de Auditoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
              {venues.map((venue) => {
                const venueProds = products.filter((p) => p.venueId === venue.id);
                const compliance = checkMenuCompliance(venue, venueProds);

                return (
                  <tr key={venue.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Comercio */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border border-slate-200 p-0.5 bg-white shrink-0 overflow-hidden flex items-center justify-center">
                          <img
                            src={venue.logoUrl}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="font-black text-slate-900">{venue.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">{venue.address}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Rubro */}
                    <td className="py-4 px-4 uppercase font-bold text-xs text-slate-700">
                      {venue.rubro}
                    </td>

                    {/* Cumplimiento */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black text-xs px-2 py-0.5 rounded ${
                            compliance.score >= 90
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {compliance.score}%
                        </span>
                        <span className="text-xs text-slate-500">
                          ({venueProds.length} platos)
                        </span>
                      </div>
                    </td>

                    {/* Oblea Municipal */}
                    <td className="py-4 px-4">
                      {venue.isSuspended ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded">
                          <Ban className="w-3 h-3" />
                          SUSPENDIDO
                        </span>
                      ) : venue.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-400 px-2.5 py-1 rounded-lg">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          OBLEA ART. 8 OTORGADA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300 px-2 py-0.5 rounded">
                          En revisión
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botón Ver Carta */}
                        <button
                          type="button"
                          onClick={() => onViewVenueMenu(venue.id)}
                          className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                          title="Inspeccionar carta completa"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Carta</span>
                        </button>

                        {/* Toggle Oblea Municipal */}
                        <button
                          type="button"
                          onClick={() => toggleVenueVerified(venue.id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                            venue.isVerified
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                          }`}
                          title={
                            venue.isVerified
                              ? 'Revocar oblea municipal'
                              : 'Otorgar oblea oficial Comercio Inclusivo'
                          }
                        >
                          {venue.isVerified ? 'Revocar Oblea' : 'Otorgar Oblea'}
                        </button>

                        {/* Toggle Suspensión */}
                        <button
                          type="button"
                          onClick={() => toggleVenueSuspended(venue.id)}
                          className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                            venue.isSuspended
                              ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                              : 'text-slate-500 hover:text-rose-700 hover:bg-rose-50 border-slate-200'
                          }`}
                          title={venue.isSuspended ? 'Reactivar comercio' : 'Suspender comercio'}
                        >
                          {venue.isSuspended ? 'Reactivar' : 'Suspender'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Crear Comercio */}
      {showAddVenueModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Adherir Nuevo Comercio al Registro Municipal
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cargá los datos del comercio; el sistema generará automáticamente sus primeras categorías y platos accesibles iniciales.
            </p>

            <form onSubmit={handleCreateVenue} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nombre del Comercio *
                </label>
                <input
                  type="text"
                  required
                  value={newVenueForm.name}
                  onChange={(e) => setNewVenueForm({ ...newVenueForm, name: e.target.value })}
                  placeholder="Ej: Pizzería La Farola, Bar Central..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Rubro *
                  </label>
                  <select
                    value={newVenueForm.rubro}
                    onChange={(e) =>
                      setNewVenueForm({ ...newVenueForm, rubro: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white outline-hidden"
                  >
                    <option value="bar">Bar & Café</option>
                    <option value="restaurante">Restaurante</option>
                    <option value="cafeteria">Cafetería</option>
                    <option value="heladeria">Heladería</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={newVenueForm.phone}
                    onChange={(e) => setNewVenueForm({ ...newVenueForm, phone: e.target.value })}
                    placeholder="011 4444-5555"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Dirección Física
                </label>
                <input
                  type="text"
                  value={newVenueForm.address}
                  onChange={(e) => setNewVenueForm({ ...newVenueForm, address: e.target.value })}
                  placeholder="Calle y altura, Ciudad"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Horario de Atención
                </label>
                <input
                  type="text"
                  value={newVenueForm.hours}
                  onChange={(e) => setNewVenueForm({ ...newVenueForm, hours: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddVenueModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Registrar Comercio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
