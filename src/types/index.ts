export type RubroType = 'bar' | 'restaurante' | 'cafeteria' | 'heladeria' | 'otro';

export type ProductTag = 'sin_tacc' | 'vegetariano' | 'vegano';

export interface Product {
  id: string;
  venueId: string;
  categoryId: string;
  name: string;
  foreignTranslation?: string; // Por ejemplo: "Croissant (Medialuna francesa hojaldrada)"
  description: string;
  price: number; // en pesos argentinos ARS
  imageUrl: string; // URL de ARASAAC o subida local
  imageAlt: string; // Descripción accesible para lectores de pantalla
  isAvailable: boolean;
  isHighlighted?: boolean; // Máximo 3 destacados por comercio
  tags?: ProductTag[];
  updatedAt: string;
}

export interface Category {
  id: string;
  venueId: string;
  name: string;
  order: number;
}

export interface Venue {
  id: string;
  name: string;
  rubro: RubroType;
  address: string;
  phone: string;
  hours: string;
  logoUrl: string;
  coverUrl?: string;
  isVerified: boolean; // Oblea Municipal "Comercio Inclusivo" (Art. 8)
  isSuspended: boolean;
  ownerId: string;
  ownerEmail: string;
  highlightedProductIds: string[]; // IDs de hasta 3 productos destacados
  updatedAt: string;
}

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: 'merchant' | 'admin' | 'public';
  venueId?: string; // id del comercio que gestiona
}

export type HighContrastMode = 'normal' | 'black-white' | 'yellow-black';
export type FontSizeScale = 'normal' | 'large' | 'extralarge';
export type FontFamilyPreference = 'sans' | 'hyperlegible';

export interface ArasaacResult {
  id: number;
  keywords: string[];
  imageUrl: string;
}

export interface ComplianceReport {
  totalProducts: number;
  missingPictograms: number;
  missingAltTexts: number;
  missingPrices: number;
  isOutdated: boolean;
  daysSinceUpdate: number;
  isCompliant: boolean;
  score: number;
  issues: string[];
}
