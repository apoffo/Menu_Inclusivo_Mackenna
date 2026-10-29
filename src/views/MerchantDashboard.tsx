import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Venue, Category, Product, ProductTag, RubroType } from '../types';
import { ArasaacPickerModal } from '../components/ArasaacPickerModal';
import { checkMenuCompliance } from '../utils/compliance';
import { ProductCard } from '../components/ProductCard';
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Star,
  Eye,
  Store,
  Upload,
  Layers,
  Sparkles,
  Save,
  Check,
  X,
  Clock,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';

interface MerchantDashboardProps {
  onPreviewPublicMenu: (venueId: string) => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ onPreviewPublicMenu }) => {
  const {
    currentUser,
    venues,
    categories,
    products,
    updateVenue,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    setHighlightedProducts,
  } = useData();

  // Buscar el comercio asignado al usuario
  const venue = useMemo(() => {
    if (!currentUser) return venues[0];
    return venues.find((v) => v.id === currentUser.venueId) || venues[0];
  }, [venues, currentUser]);

  const venueCategories = useMemo(() => {
    return categories
      .filter((c) => c.venueId === venue?.id)
      .sort((a, b) => a.order - b.order);
  }, [categories, venue?.id]);

  const venueProducts = useMemo(() => {
    return products.filter((p) => p.venueId === venue?.id);
  }, [products, venue?.id]);

  // Auditoría de cumplimiento normativo
  const compliance = useMemo(() => {
    if (!venue) return null;
    return checkMenuCompliance(venue, venueProducts);
  }, [venue, venueProducts]);

  // Estados de pestañas del panel
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'venue' | 'preview'>('products');

  // Estados para modal de categoría
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');

  // Estados para modal de producto
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showArasaacModal, setShowArasaacModal] = useState(false);

  // Formulario de producto
  const [prodForm, setProdForm] = useState<{
    name: string;
    foreignTranslation: string;
    description: string;
    price: string;
    categoryId: string;
    imageUrl: string;
    imageAlt: string;
    isAvailable: boolean;
    tags: ProductTag[];
  }>({
    name: '',
    foreignTranslation: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    imageAlt: '',
    isAvailable: true,
    tags: [],
  });

  // Formulario de datos del comercio
  const [venueForm, setVenueForm] = useState({
    name: venue?.name || '',
    rubro: (venue?.rubro || 'bar') as RubroType,
    address: venue?.address || '',
    phone: venue?.phone || '',
    hours: venue?.hours || '',
    logoUrl: venue?.logoUrl || '',
  });

  const [venueSaveSuccess, setVenueSaveSuccess] = useState(false);

  if (!venue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Store className="w-16 h-16 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold">No hay un comercio asignado a tu cuenta</h2>
      </div>
    );
  }

  // Manejo de Destacados (máximo 3)
  const handleToggleHighlight = async (productId: string) => {
    const currentHighlights = venue.highlightedProductIds || [];
    let updated: string[];

    if (currentHighlights.includes(productId)) {
      updated = currentHighlights.filter((id) => id !== productId);
    } else {
      if (currentHighlights.length >= 3) {
        alert('Podés seleccionar como máximo 3 platos destacados para la página principal.');
        return;
      }
      updated = [...currentHighlights, productId];
    }

    await setHighlightedProducts(venue.id, updated);
  };

  // Abrir modal de creación/edición de producto
  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProdForm({
        name: product.name,
        foreignTranslation: product.foreignTranslation || '',
        description: product.description,
        price: String(product.price),
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
        imageAlt: product.imageAlt,
        isAvailable: product.isAvailable,
        tags: product.tags || [],
      });
    } else {
      setEditingProduct(null);
      setProdForm({
        name: '',
        foreignTranslation: '',
        description: '',
        price: '',
        categoryId: venueCategories[0]?.id || '',
        imageUrl: 'https://static.arasaac.org/pictograms/2349/2349_500.png',
        imageAlt: 'Pictograma de alimento',
        isAvailable: true,
        tags: [],
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prodForm.name.trim()) {
      alert('El nombre del plato es obligatorio.');
      return;
    }
    if (!prodForm.description.trim()) {
      alert('La descripción del plato es obligatoria.');
      return;
    }
    const parsedPrice = parseFloat(prodForm.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('El precio debe ser un número mayor a 0.');
      return;
    }
    if (!prodForm.categoryId) {
      alert('Debés seleccionar una categoría para el producto.');
      return;
    }
    if (!prodForm.imageAlt.trim()) {
      alert('La descripción alternativa para lectores de pantalla es obligatoria según la ordenanza.');
      return;
    }

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: prodForm.name.trim(),
        foreignTranslation: prodForm.foreignTranslation.trim() || undefined,
        description: prodForm.description.trim(),
        price: parsedPrice,
        categoryId: prodForm.categoryId,
        imageUrl: prodForm.imageUrl,
        imageAlt: prodForm.imageAlt.trim(),
        isAvailable: prodForm.isAvailable,
        tags: prodForm.tags,
      });
    } else {
      await addProduct({
        venueId: venue.id,
        name: prodForm.name.trim(),
        foreignTranslation: prodForm.foreignTranslation.trim() || undefined,
        description: prodForm.description.trim(),
        price: parsedPrice,
        categoryId: prodForm.categoryId,
        imageUrl: prodForm.imageUrl,
        imageAlt: prodForm.imageAlt.trim(),
        isAvailable: prodForm.isAvailable,
        isHighlighted: false,
        tags: prodForm.tags,
      });
    }

    setShowProductModal(false);
  };

  const handleSaveVenueDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateVenue(venue.id, {
      name: venueForm.name,
      rubro: venueForm.rubro,
      address: venueForm.address,
      phone: venueForm.phone,
      hours: venueForm.hours,
      logoUrl: venueForm.logoUrl,
    });
    setVenueSaveSuccess(true);
    setTimeout(() => setVenueSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
      {/* Encabezado del Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Panel de Administración: {venue.name}
              </h1>
              {venue.isVerified && (
                <span className="text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-400 px-2 py-0.5 rounded">
                  Oblea Art. 8 Activa
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Gestioná tu carta gastronómica con pictogramas ARASAAC, Braille y requisitos de accesibilidad.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPreviewPublicMenu(venue.id)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Ver carta pública</span>
          </button>
        </div>
      </div>

      {/* Semáforo / Checklist de Cumplimiento (Requerimiento de Ordenanza) */}
      {compliance && (
        <section
          className={`rounded-2xl p-5 mb-8 border-2 shadow-xs ${
            compliance.isCompliant
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
          aria-labelledby="compliance-checklist-title"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5">
              {compliance.isCompliant ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              )}
              <div>
                <h2 id="compliance-checklist-title" className="font-black text-base sm:text-lg">
                  Semáforo de Cumplimiento de Ordenanza Municipal
                </h2>
                <p className="text-xs">
                  {compliance.isCompliant
                    ? 'Tu carta cumple con todos los requisitos para recibir y conservar la Oblea Municipal "Comercio Inclusivo".'
                    : 'Hay puntos de accesibilidad que deben corregirse para obtener o mantener la certificación.'}
                </p>
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-300 shrink-0">
              <span className="text-xs font-bold text-slate-600">Cumplimiento:</span>
              <span
                className={`text-lg font-black ${
                  compliance.score >= 90 ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {compliance.score}%
              </span>
            </div>
          </div>

          {/* Grilla de items del checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-bold pt-2 border-t border-slate-200">
            <div className="flex items-center gap-1.5">
              {compliance.missingPictograms === 0 ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <X className="w-4 h-4 text-rose-600" />
              )}
              <span>Pictogramas en el 100% de platos</span>
            </div>

            <div className="flex items-center gap-1.5">
              {compliance.missingAltTexts === 0 ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <X className="w-4 h-4 text-rose-600" />
              )}
              <span>Descripciones alternativas accesibles</span>
            </div>

            <div className="flex items-center gap-1.5">
              {compliance.missingPrices === 0 ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <X className="w-4 h-4 text-rose-600" />
              )}
              <span>Precios claros en pesos argentinos</span>
            </div>

            <div className="flex items-center gap-1.5">
              {!compliance.isOutdated ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <X className="w-4 h-4 text-rose-600" />
              )}
              <span>Actualizada en los últimos 90 días</span>
            </div>
          </div>

          {compliance.issues.length > 0 && (
            <div className="mt-3 pt-2 text-xs bg-white/70 p-2.5 rounded-lg border border-amber-200">
              <span className="font-bold block mb-1">Observaciones pendientes:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-800">
                {compliance.issues.slice(0, 3).map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Pestañas del Panel */}
      <div className="flex border-b border-slate-200 gap-2 mb-6 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`py-3 px-4 font-black text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-amber-600 text-amber-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Platos y Bebidas ({venueProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`py-3 px-4 font-black text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'border-amber-600 text-amber-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categorías ({venueCategories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('venue')}
          className={`py-3 px-4 font-black text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'venue'
              ? 'border-amber-600 text-amber-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Datos del Local</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`py-3 px-4 font-black text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'preview'
              ? 'border-amber-600 text-amber-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Vista Previa en Vivo</span>
        </button>
      </div>

      {/* PESTAÑA 1: PLATOS Y BEBIDAS */}
      {activeTab === 'products' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-100 p-4 rounded-2xl border border-slate-300 mb-6">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Platos cargados en tu carta
              </h2>
              <p className="text-xs text-slate-600">
                Marcá hasta 3 productos con la estrella para destacarlos en la portada de la app.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenProductModal()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Cargar nuevo plato o bebida</span>
            </button>
          </div>

          {/* Grilla de productos en panel de comercio */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venueProducts.map((prod) => {
              const isHighlight = venue.highlightedProductIds?.includes(prod.id);
              const cat = venueCategories.find((c) => c.id === prod.categoryId);

              return (
                <div
                  key={prod.id}
                  className={`bg-white rounded-2xl border-2 p-4 flex flex-col justify-between shadow-xs transition-all ${
                    isHighlight ? 'border-amber-500 ring-2 ring-amber-300' : 'border-slate-300'
                  }`}
                >
                  <div>
                    {/* Header de la tarjeta */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                        {cat?.name || 'Categoría'}
                      </span>

                      {/* Botón de destacar (máx 3) */}
                      <button
                        type="button"
                        onClick={() => handleToggleHighlight(prod.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                          isHighlight
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title={
                          isHighlight
                            ? 'Quitar de los 3 destacados'
                            : 'Marcar como 1 de los 3 destacados en portada'
                        }
                      >
                        <Star
                          className={`w-4 h-4 ${isHighlight ? 'fill-slate-950 text-slate-950' : ''}`}
                        />
                        <span className="text-[10px]">{isHighlight ? 'Destacado' : 'Destacar'}</span>
                      </button>
                    </div>

                    {/* Pictograma y Nombre */}
                    <div className="flex gap-3 items-center mb-3">
                      <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={prod.imageUrl}
                          alt={prod.imageAlt}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-900 leading-snug">
                          {prod.name}
                        </h3>
                        {prod.foreignTranslation && (
                          <span className="text-xs text-slate-500 block">
                            ({prod.foreignTranslation})
                          </span>
                        )}
                        <span className="text-sm font-black text-emerald-700 block mt-0.5">
                          ${prod.price.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                      {prod.description}
                    </p>

                    <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-200 mb-3">
                      <strong>Texto alt:</strong> "{prod.imageAlt}"
                    </div>
                  </div>

                  {/* Acciones de edición */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span
                      className={`font-bold ${
                        prod.isAvailable ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {prod.isAvailable ? 'Disponible' : 'Agotado'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenProductModal(prod)}
                        className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar plato"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar "${prod.name}" de la carta?`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar plato"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: CATEGORÍAS */}
      {activeTab === 'categories' && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-slate-900">
              Categorías de la carta gastronómica
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                setCategoryNameInput('');
                setShowCategoryModal(true);
              }}
              className="px-3.5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva categoría</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-300 divide-y divide-slate-200">
            {venueCategories.map((cat, index) => {
              const count = venueProducts.filter((p) => p.categoryId === cat.id).length;
              return (
                <div key={cat.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{cat.name}</h3>
                      <span className="text-xs text-slate-500">
                        {count} {count === 1 ? 'plato' : 'platos'} asignados
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(cat);
                        setCategoryNameInput(cat.name);
                        setShowCategoryModal(true);
                      }}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      title="Editar nombre"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            `¿Estás seguro de eliminar la categoría "${cat.name}"? Los productos asignados a ella también se removerán.`
                          )
                        ) {
                          deleteCategory(cat.id);
                        }
                      }}
                      className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: DATOS DEL LOCAL */}
      {activeTab === 'venue' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-slate-300 p-6">
          <h2 className="text-lg font-black text-slate-900 mb-1">
            Información del Comercio Gastronómico
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Estos datos se exhibirán en el encabezado de tu carta accesible y en las descargas en PDF y Braille.
          </p>

          <form onSubmit={handleSaveVenueDetails} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nombre del Comercio *
              </label>
              <input
                type="text"
                required
                value={venueForm.name}
                onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Rubro Gastronómico *
                </label>
                <select
                  value={venueForm.rubro}
                  onChange={(e) => setVenueForm({ ...venueForm, rubro: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white outline-hidden"
                >
                  <option value="bar">Bar & Café</option>
                  <option value="restaurante">Restaurante / Bodegón</option>
                  <option value="cafeteria">Cafetería</option>
                  <option value="heladeria">Heladería Artesanal</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Teléfono de Contacto *
                </label>
                <input
                  type="text"
                  required
                  value={venueForm.phone}
                  onChange={(e) => setVenueForm({ ...venueForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Dirección Física (Local) *
              </label>
              <input
                type="text"
                required
                value={venueForm.address}
                onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Horario de Atención *
              </label>
              <input
                type="text"
                required
                value={venueForm.hours}
                onChange={(e) => setVenueForm({ ...venueForm, hours: e.target.value })}
                placeholder="Ej: Lunes a Sábados de 08:00 a 00:00 hs"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                URL del Logo o Imagen de Portada
              </label>
              <input
                type="url"
                value={venueForm.logoUrl}
                onChange={(e) => setVenueForm({ ...venueForm, logoUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl flex items-center gap-2 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Guardar cambios del local</span>
              </button>

              {venueSaveSuccess && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  ¡Datos guardados con éxito!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* PESTAÑA 4: VISTA PREVIA */}
      {activeTab === 'preview' && (
        <div className="bg-slate-100 p-6 rounded-3xl border border-slate-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Vista previa idéntica a la experiencia del visitante:
            </span>
            <button
              type="button"
              onClick={() => onPreviewPublicMenu(venue.id)}
              className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1"
            >
              <span>Abrir en pantalla completa</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-6">
            {venueCategories.map((cat) => {
              const catProds = venueProducts.filter((p) => p.categoryId === cat.id);
              if (catProds.length === 0) return null;
              return (
                <div key={cat.id} className="bg-white p-5 rounded-2xl border border-slate-200">
                  <h3 className="font-black text-lg text-slate-900 border-b pb-2 mb-4">
                    {cat.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {catProds.map((prod) => (
                      <ProductCard key={prod.id} product={prod} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL PARA CREAR / EDITAR PRODUCTO */}
      {showProductModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-base">
                {editingProduct ? 'Editar Plato o Bebida' : 'Nuevo Plato o Bebida Accesible'}
              </h3>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Nombre y traducción */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nombre del Plato (en español) *
                </label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  placeholder="Ej: Medialuna de manteca, Bife de chorizo, Helado..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Traducción o aclaración si contiene términos extranjeros (opcional)
                </label>
                <input
                  type="text"
                  value={prodForm.foreignTranslation}
                  onChange={(e) => setProdForm({ ...prodForm, foreignTranslation: e.target.value })}
                  placeholder="Ej: Croissant (Medialuna francesa hojaldrada) o IPA (Cerveza rubia amarga)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  La ordenanza exige que todo término culinario extranjero cuente con su explicación clara en español.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Precio en Pesos Argentinos (ARS) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500">$</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={prodForm.price}
                      onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                      placeholder="4500"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Categoría *
                  </label>
                  <select
                    value={prodForm.categoryId}
                    onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white outline-hidden"
                  >
                    {venueCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Descripción del Plato *
                </label>
                <textarea
                  required
                  rows={2}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  placeholder="Detallar ingredientes principales, cocción y presentación..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Selector de Pictograma ARASAAC */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 uppercase mb-2">
                  Pictograma Accesible (ARASAAC) o Foto *
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-xl border-2 border-slate-300 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    {prodForm.imageUrl ? (
                      <img
                        src={prodForm.imageUrl}
                        alt={prodForm.imageAlt || 'Pictograma'}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Store className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => setShowArasaacModal(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Buscar en Biblioteca ARASAAC o Subir Foto</span>
                    </button>
                    <span className="text-[11px] text-slate-500 block mt-1.5">
                      Buscador conectado con la API oficial de pictogramas en español.
                    </span>
                  </div>
                </div>
              </div>

              {/* Descripción alternativa (alt text) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Descripción Alternativa del Pictograma (Lectores de pantalla) *
                </label>
                <input
                  type="text"
                  required
                  value={prodForm.imageAlt}
                  onChange={(e) => setProdForm({ ...prodForm, imageAlt: e.target.value })}
                  placeholder="Ej: Plato con milanesa dorada gratinada y papas fritas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Etiquetas Dietarias */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Etiquetas de Dieta y Alérgenos
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { id: 'sin_tacc', label: 'Sin TACC (Apto Celíaco)' },
                    { id: 'vegetariano', label: 'Vegetariano' },
                    { id: 'vegano', label: 'Vegano' },
                  ].map((t) => {
                    const isChecked = prodForm.tags.includes(t.id as any);
                    return (
                      <label
                        key={t.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-amber-100 border-amber-400 text-amber-950'
                            : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProdForm({ ...prodForm, tags: [...prodForm.tags, t.id as any] });
                            } else {
                              setProdForm({
                                ...prodForm,
                                tags: prodForm.tags.filter((item) => item !== t.id),
                              });
                            }
                          }}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>{t.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Disponibilidad */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={prodForm.isAvailable}
                    onChange={(e) => setProdForm({ ...prodForm, isAvailable: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Producto disponible actualmente para la venta</span>
                </label>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CATEGORÍA */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-black text-base mb-3">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
            <input
              type="text"
              value={categoryNameInput}
              onChange={(e) => setCategoryNameInput(e.target.value)}
              placeholder="Ej: Minutas, Pastas, Postres..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-hidden focus:border-amber-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 rounded-lg hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!categoryNameInput.trim()) return;
                  if (editingCategory) {
                    await updateCategory(editingCategory.id, { name: categoryNameInput.trim() });
                  } else {
                    await addCategory({
                      venueId: venue.id,
                      name: categoryNameInput.trim(),
                      order: venueCategories.length + 1,
                    });
                  }
                  setShowCategoryModal(false);
                }}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE BÚSQUEDA ARASAAC */}
      <ArasaacPickerModal
        isOpen={showArasaacModal}
        onClose={() => setShowArasaacModal(false)}
        initialQuery={prodForm.name || ''}
        onSelect={(imageUrl, suggestedAlt) => {
          setProdForm((prev) => ({
            ...prev,
            imageUrl,
            imageAlt: prev.imageAlt || suggestedAlt,
          }));
        }}
      />
    </div>
  );
};
