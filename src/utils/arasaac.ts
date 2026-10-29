import { ArasaacResult } from '../types';

export const ARASAAC_POPULAR_PRESETS: { keyword: string; id: number; name: string }[] = [
  { keyword: 'café', id: 2349, name: 'Café' },
  { keyword: 'medialuna', id: 2471, name: 'Medialuna / Croissant' },
  { keyword: 'tostado', id: 32668, name: 'Tostado de jamón y queso' },
  { keyword: 'submarino', id: 2368, name: 'Chocolate caliente / Submarino' },
  { keyword: 'churros', id: 11132, name: 'Churros' },
  { keyword: 'milanesa', id: 2516, name: 'Milanesa con guarnición' },
  { keyword: 'hamburguesa', id: 2479, name: 'Hamburguesa' },
  { keyword: 'pizza', id: 2529, name: 'Pizza' },
  { keyword: 'empanada', id: 36772, name: 'Empanada' },
  { keyword: 'papas fritas', id: 2522, name: 'Papas fritas' },
  { keyword: 'ensalada', id: 2465, name: 'Ensalada' },
  { keyword: 'pasta', id: 2525, name: 'Pastas / Fideos' },
  { keyword: 'helado', id: 2480, name: 'Helado' },
  { keyword: 'cucurucho', id: 5971, name: 'Cucurucho de helado' },
  { keyword: 'flan', id: 2469, name: 'Flan / Postre' },
  { keyword: 'cerveza', id: 2351, name: 'Cerveza' },
  { keyword: 'vino', id: 2374, name: 'Vino' },
  { keyword: 'gaseosa', id: 2369, name: 'Gaseosa / Refresco' },
  { keyword: 'agua', id: 2348, name: 'Agua' },
  { keyword: 'jugo', id: 2356, name: 'Jugo natural' },
  { keyword: 'mate', id: 32906, name: 'Mate' },
  { keyword: 'sandwich', id: 2542, name: 'Sándwich' },
  { keyword: 'carne', id: 2449, name: 'Carne asada / Bife' },
  { keyword: 'pescado', id: 2528, name: 'Pescado' },
  { keyword: 'sopa', id: 2546, name: 'Sopa' },
  { keyword: 'panqueque', id: 31737, name: 'Panqueque' },
  { keyword: 'torta', id: 2549, name: 'Torta / Pastel' },
  { keyword: 'dulce de leche', id: 32441, name: 'Dulce de leche' },
];

export function getArasaacImageUrl(id: number | string, size: 300 | 500 = 500): string {
  return `https://static.arasaac.org/pictograms/${id}/${id}_${size}.png`;
}

/**
 * Busca pictogramas en la API pública de ARASAAC en idioma español
 */
export async function searchArasaacPictograms(query: string): Promise<ArasaacResult[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return ARASAAC_POPULAR_PRESETS.map((p) => ({
      id: p.id,
      keywords: [p.name, p.keyword],
      imageUrl: getArasaacImageUrl(p.id, 500),
    }));
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `https://api.arasaac.org/api/pictograms/es/search/${encodeURIComponent(cleanQuery)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!response.ok) {
      // Fallback a presets filtrados
      return fallbackSearch(cleanQuery);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return fallbackSearch(cleanQuery);
    }

    return data.slice(0, 24).map((item: any) => ({
      id: item._id,
      keywords: item.keywords?.map((k: any) => (typeof k === 'string' ? k : k.keyword)) || [cleanQuery],
      imageUrl: getArasaacImageUrl(item._id, 500),
    }));
  } catch (err) {
    console.warn('ARASAAC API request error or timeout, using local presets:', err);
    return fallbackSearch(cleanQuery);
  }
}

function fallbackSearch(query: string): ArasaacResult[] {
  const filtered = ARASAAC_POPULAR_PRESETS.filter(
    (p) => p.name.toLowerCase().includes(query) || p.keyword.toLowerCase().includes(query)
  );
  const items = filtered.length > 0 ? filtered : ARASAAC_POPULAR_PRESETS;
  return items.map((p) => ({
    id: p.id,
    keywords: [p.name, p.keyword],
    imageUrl: getArasaacImageUrl(p.id, 500),
  }));
}
