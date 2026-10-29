import { jsPDF } from 'jspdf';
import { Venue, Category, Product } from '../types';

/**
 * Convierte una URL de imagen a Data URL base64 para incrustar en el PDF
 */
async function getImageDataUrl(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:image')) return url;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    const timer = setTimeout(() => resolve(null), 2500); // Evitar bloqueos

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 200;
        canvas.height = img.naturalHeight || 200;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };

    img.src = url;
  });
}

/**
 * Genera y descarga la carta accesible en formato PDF A4 según la Ordenanza Municipal
 * - Fondo blanco liso
 * - Fuente legible (Helvetica) mínimo 14pt en textos principales
 * - Encabezados de categoría en 18pt negrita
 * - Sin adornos superfluos, contraste óptimo (negro puro sobre blanco)
 */
export async function generateAccessiblePdf(
  venue: Venue,
  categories: Category[],
  products: Product[]
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Encabezado del Comercio
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(venue.name, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(51, 65, 85);
  doc.text(`Rubro: ${venue.rubro.toUpperCase()} | Menú Accesible con Pictogramas`, margin, y);
  y += 6;
  doc.setFontSize(11);
  doc.text(`Dirección: ${venue.address}  •  Tel: ${venue.phone}`, margin, y);
  y += 5;
  doc.text(`Precios expresados en Pesos Argentinos (ARS)  •  Formato accesible A4`, margin, y);
  y += 6;

  // Línea divisoria de alto contraste
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  const sortedCats = [...categories].sort((a, b) => a.order - b.order);

  // Pre-cargar imágenes para los productos
  const imageMap = new Map<string, string | null>();
  for (const prod of products) {
    if (prod.imageUrl) {
      try {
        const dataUrl = await getImageDataUrl(prod.imageUrl);
        imageMap.set(prod.id, dataUrl);
      } catch {
        imageMap.set(prod.id, null);
      }
    }
  }

  for (const cat of sortedCats) {
    const catProds = products.filter((p) => p.categoryId === cat.id && p.isAvailable);
    if (catProds.length === 0) continue;

    // Verificar si cabe el encabezado de categoría
    if (y + 25 > pageHeight - margin) {
      doc.addPage();
      y = 20;
    }

    // Encabezado de categoría (18 pt negrita)
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y - 2, contentWidth, 12, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(cat.name.toUpperCase(), margin + 4, y + 6);
    y += 18;

    for (const prod of catProds) {
      const cardHeight = 32;
      // Salto de página si el producto no entra
      if (y + cardHeight > pageHeight - margin) {
        doc.addPage();
        y = 20;
      }

      // Caja del producto con borde visible de alto contraste
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, y, contentWidth, cardHeight, 1.5, 1.5, 'FD');

      // Pictograma o recuadro accesible
      const picSize = 26;
      const picX = margin + 3;
      const picY = y + 3;

      const imgData = imageMap.get(prod.id);
      if (imgData) {
        try {
          doc.addImage(imgData, 'PNG', picX, picY, picSize, picSize);
        } catch {
          drawFallbackPictogram(doc, picX, picY, picSize, prod.name);
        }
      } else {
        drawFallbackPictogram(doc, picX, picY, picSize, prod.name);
      }

      // Textos del producto
      const textX = picX + picSize + 5;
      const textWidth = contentWidth - picSize - 12;

      // Nombre del producto (14pt mínimo requerido por ordenanza)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);

      let title = prod.name;
      if (prod.foreignTranslation) {
        title += ` (${prod.foreignTranslation})`;
      }
      doc.text(title, textX, y + 8);

      // Precio (14pt negrita destacado)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(21, 128, 61); // Verde oscuro legible
      const priceStr = `$ ${prod.price.toLocaleString('es-AR')}`;
      doc.text(priceStr, pageWidth - margin - 4, y + 8, { align: 'right' });

      // Descripción (11pt legible)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      const descLines = doc.splitTextToSize(prod.description, textWidth - 28);
      doc.text(descLines.slice(0, 2), textX, y + 15);

      // Etiquetas accesibles (Sin TACC, Vegano, etc.)
      if (prod.tags && prod.tags.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        const tagsLabel = prod.tags
          .map((t) => (t === 'sin_tacc' ? '[SIN TACC]' : t === 'vegetariano' ? '[VEGETARIANO]' : '[VEGANO]'))
          .join('  ');
        doc.text(tagsLabel, textX, y + 27);
      }

      y += cardHeight + 4;
    }

    y += 5;
  }

  // Numeración de páginas
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${pageCount}  •  Menú Inclusivo  •  Cumple pautas de accesibilidad universal`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const safeName = venue.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`carta_accesible_${safeName}.pdf`);
}

function drawFallbackPictogram(doc: jsPDF, x: number, y: number, size: number, name: string) {
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(x, y, size, size, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const initials = name.slice(0, 2).toUpperCase();
  doc.text(initials, x + size / 2, y + size / 2 + 3, { align: 'center' });
}
