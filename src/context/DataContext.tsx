import React, { createContext, useContext, useState, useEffect } from 'react';
import { Venue, Category, Product, AppUser } from '../types';
import {
  SEED_VENUES,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_USERS,
  SEED_ADMIN_USER,
} from '../data/seedData';
import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';

interface DataContextType {
  venues: Venue[];
  categories: Category[];
  products: Product[];
  currentUser: AppUser | null;
  loading: boolean;
  // Auth operations
  login: (email: string, role?: 'merchant' | 'admin', venueName?: string, rubro?: any) => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string) => void;
  // Venue operations
  addVenue: (venue: Omit<Venue, 'id' | 'updatedAt'>) => Promise<Venue>;
  updateVenue: (id: string, updates: Partial<Venue>) => Promise<void>;
  toggleVenueVerified: (id: string) => Promise<void>;
  toggleVenueSuspended: (id: string) => Promise<void>;
  // Category operations
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  // Product operations
  addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setHighlightedProducts: (venueId: string, productIds: string[]) => Promise<void>;
  resetToSampleData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY_VENUES = 'menu_inc_venues_v1';
const STORAGE_KEY_CATEGORIES = 'menu_inc_categories_v1';
const STORAGE_KEY_PRODUCTS = 'menu_inc_products_v1';
const STORAGE_KEY_USERS = 'menu_inc_users_v1';
const STORAGE_KEY_CURRENT_USER = 'menu_inc_current_user_v1';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [venues, setVenues] = useState<Venue[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VENUES);
    return saved ? JSON.parse(saved) : SEED_VENUES;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    return saved ? JSON.parse(saved) : SEED_CATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    return saved ? JSON.parse(saved) : SEED_PRODUCTS;
  });

  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    return saved ? JSON.parse(saved) : SEED_USERS;
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  // Guardar en localStorage ante cualquier cambio
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VENUES, JSON.stringify(venues));
  }, [venues]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  }, [currentUser]);

  // Sincronización inicial con Firestore si está disponible
  useEffect(() => {
    async function syncFirestore() {
      try {
        const venuesSnap = await getDocs(collection(db, 'venues'));
        if (!venuesSnap.empty) {
          const loadedVenues: Venue[] = [];
          venuesSnap.forEach((d) => loadedVenues.push({ id: d.id, ...d.data() } as Venue));
          if (loadedVenues.length > 0) {
            setVenues(loadedVenues);
          }
        }
      } catch (err) {
        // En caso de que no haya permisos de Firestore o esté inicializándose, usamos el almacenamiento local pre-cargado
        console.log('Usando almacenamiento sincronizado local para inicio inmediato:', err);
      }
    }
    syncFirestore();
  }, []);

  const login = async (
    email: string,
    role: 'merchant' | 'admin' = 'merchant',
    venueName?: string,
    rubro: any = 'restaurante'
  ): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();

    // Si es el email del admin registrado
    if (cleanEmail === 'o.andrespoffo@gmail.com' || cleanEmail.includes('admin') || role === 'admin') {
      setCurrentUser(SEED_ADMIN_USER);
      return true;
    }

    // Buscar entre usuarios existentes
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUser(existing);
      return true;
    }

    // Si no existe, registrar nuevo comercio
    const newUserId = 'user_' + Date.now();
    const newVenueId = 'venue_' + Date.now();
    const finalVenueName = venueName?.trim() || 'Nuevo Comercio Accesible';

    const newVenue: Venue = {
      id: newVenueId,
      name: finalVenueName,
      rubro: rubro || 'restaurante',
      address: 'Dirección por definir, Argentina',
      phone: '011 0000-0000',
      hours: 'Lunes a Sábados de 10:00 a 22:00 hs',
      logoUrl: 'https://static.arasaac.org/pictograms/2349/2349_500.png',
      isVerified: false,
      isSuspended: false,
      ownerId: newUserId,
      ownerEmail: cleanEmail,
      highlightedProductIds: [],
      updatedAt: new Date().toISOString(),
    };

    const newUser: AppUser = {
      id: newUserId,
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0],
      role: 'merchant',
      venueId: newVenueId,
    };

    // Crear categorías iniciales básicas
    const initialCats: Category[] = [
      { id: 'cat_' + Date.now() + '_1', venueId: newVenueId, name: 'Entradas', order: 1 },
      { id: 'cat_' + Date.now() + '_2', venueId: newVenueId, name: 'Platos Principales', order: 2 },
      { id: 'cat_' + Date.now() + '_3', venueId: newVenueId, name: 'Bebidas', order: 3 },
      { id: 'cat_' + Date.now() + '_4', venueId: newVenueId, name: 'Postres', order: 4 },
    ];

    setVenues((prev) => [newVenue, ...prev]);
    setCategories((prev) => [...prev, ...initialCats]);
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);

    try {
      await setDoc(doc(db, 'venues', newVenueId), newVenue);
      await setDoc(doc(db, 'users', newUserId), newUser);
    } catch {
      // guardado local garantizado
    }

    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const addVenue = async (venueData: Omit<Venue, 'id' | 'updatedAt'>): Promise<Venue> => {
    const newId = 'venue_' + Date.now();
    const newVenue: Venue = {
      ...venueData,
      id: newId,
      updatedAt: new Date().toISOString(),
    };
    setVenues((prev) => [newVenue, ...prev]);

    try {
      await setDoc(doc(db, 'venues', newId), newVenue);
    } catch (e) {
      console.warn('Guardado en Firestore offline:', e);
    }

    return newVenue;
  };

  const updateVenue = async (id: string, updates: Partial<Venue>) => {
    const updatedDate = new Date().toISOString();
    setVenues((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates, updatedAt: updatedDate } : v))
    );

    try {
      await updateDoc(doc(db, 'venues', id), { ...updates, updatedAt: updatedDate });
    } catch (e) {
      console.warn('Actualización en Firestore offline:', e);
    }
  };

  const toggleVenueVerified = async (id: string) => {
    const venue = venues.find((v) => v.id === id);
    if (!venue) return;
    const nextVal = !venue.isVerified;
    await updateVenue(id, { isVerified: nextVal });
  };

  const toggleVenueSuspended = async (id: string) => {
    const venue = venues.find((v) => v.id === id);
    if (!venue) return;
    const nextVal = !venue.isSuspended;
    await updateVenue(id, { isSuspended: nextVal });
  };

  const addCategory = async (catData: Omit<Category, 'id'>): Promise<Category> => {
    const newId = 'cat_' + Date.now();
    const newCat: Category = { ...catData, id: newId };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    // Borrar también productos asociados
    setProducts((prev) => prev.filter((p) => p.categoryId !== id));
  };

  const addProduct = async (prodData: Omit<Product, 'id' | 'updatedAt'>): Promise<Product> => {
    const newId = 'prod_' + Date.now();
    const newProd: Product = {
      ...prodData,
      id: newId,
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);

    // Actualizar fecha del venue para mantener vigencia de los 90 días
    await updateVenue(prodData.venueId, { updatedAt: new Date().toISOString() });
    return newProd;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updatedDate = new Date().toISOString();
    let venueIdToTouch: string | null = null;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          venueIdToTouch = p.venueId;
          return { ...p, ...updates, updatedAt: updatedDate };
        }
        return p;
      })
    );

    if (venueIdToTouch) {
      await updateVenue(venueIdToTouch, { updatedAt: updatedDate });
    }
  };

  const deleteProduct = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      // Si estaba en destacados, removerlo
      const targetVenue = venues.find((v) => v.id === prod.venueId);
      if (targetVenue && targetVenue.highlightedProductIds.includes(id)) {
        await setHighlightedProducts(
          prod.venueId,
          targetVenue.highlightedProductIds.filter((pId) => pId !== id)
        );
      }
    }
  };

  const setHighlightedProducts = async (venueId: string, productIds: string[]) => {
    // Máximo 3 productos destacados según requerimiento
    const validIds = productIds.slice(0, 3);
    await updateVenue(venueId, { highlightedProductIds: validIds });
    // Actualizar flag en los productos
    setProducts((prev) =>
      prev.map((p) => {
        if (p.venueId === venueId) {
          return { ...p, isHighlighted: validIds.includes(p.id) };
        }
        return p;
      })
    );
  };

  const resetToSampleData = async () => {
    setVenues(SEED_VENUES);
    setCategories(SEED_CATEGORIES);
    setProducts(SEED_PRODUCTS);
    setUsers(SEED_USERS);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_VENUES);
    localStorage.removeItem(STORAGE_KEY_CATEGORIES);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  };

  return (
    <DataContext.Provider
      value={{
        venues,
        categories,
        products,
        currentUser,
        loading,
        login,
        logout,
        switchUser,
        addVenue,
        updateVenue,
        toggleVenueVerified,
        toggleVenueSuspended,
        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        setHighlightedProducts,
        resetToSampleData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
