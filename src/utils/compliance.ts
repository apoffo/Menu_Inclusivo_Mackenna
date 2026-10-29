import { Product, Venue, ComplianceReport } from '../types';

export function checkMenuCompliance(venue: Venue, products: Product[]): ComplianceReport {
  const issues: string[] = [];
  const totalProducts = products.length;

  if (totalProducts === 0) {
    return {
      totalProducts: 0,
      missingPictograms: 0,
      missingAltTexts: 0,
      missingPrices: 0,
      isOutdated: false,
      daysSinceUpdate: 0,
      isCompliant: false,
      score: 0,
      issues: ['No hay productos cargados en la carta del comercio.'],
    };
  }

  let missingPictograms = 0;
  let missingAltTexts = 0;
  let missingPrices = 0;

  products.forEach((p) => {
    if (!p.imageUrl || p.imageUrl.trim() === '') {
      missingPictograms++;
      issues.push(`El producto "${p.name}" no tiene pictograma o imagen asignada.`);
    }
    if (!p.imageAlt || p.imageAlt.trim() === '') {
      missingAltTexts++;
      issues.push(`El producto "${p.name}" no posee descripción alternativa (texto accesible).`);
    }
    if (!p.price || p.price <= 0) {
      missingPrices++;
      issues.push(`El producto "${p.name}" no tiene precio válido en pesos.`);
    }
  });

  // Cálculo de antigüedad de la carta (límite 90 días por ordenanza)
  const lastUpdatedDate = venue.updatedAt ? new Date(venue.updatedAt) : new Date();
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastUpdatedDate.getTime());
  const daysSinceUpdate = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const isOutdated = daysSinceUpdate > 90;

  if (isOutdated) {
    issues.push(`La carta no fue actualizada en los últimos 90 días (${daysSinceUpdate} días transcurridos).`);
  }

  // Cálculo de puntaje (0 a 100)
  let deductions = 0;
  deductions += (missingPictograms / totalProducts) * 35;
  deductions += (missingAltTexts / totalProducts) * 35;
  deductions += (missingPrices / totalProducts) * 20;
  if (isOutdated) deductions += 10;

  const score = Math.max(0, Math.min(100, Math.round(100 - deductions)));
  const isCompliant = score >= 90 && missingPictograms === 0 && missingAltTexts === 0 && missingPrices === 0;

  return {
    totalProducts,
    missingPictograms,
    missingAltTexts,
    missingPrices,
    isOutdated,
    daysSinceUpdate,
    isCompliant,
    score,
    issues,
  };
}
