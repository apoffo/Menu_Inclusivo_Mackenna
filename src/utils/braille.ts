/**
 * Utilidades de transcripción a Sistema Braille en Español
 * Basado en las pautas de la Comisión Braille Española / Código Braille en Español.
 * Soporta salida en Unicode Braille (U+2800 - U+28FF) y formato .brf (ASCII Braille estándar).
 */

import { jsPDF } from 'jspdf';
import { Venue, Category, Product } from '../types';

// Mapeo de caracteres individuales a Unicode Braille (Grado 1 - Español)
const UNICODE_BRAILLE_MAP: Record<string, string> = {
  // Letras minúsculas
  a: '⠁', b: '⠃', c: '⠉', d: '⠙', e: '⠑',
  f: '⠋', g: '⠛', h: '⠓', i: '⠊', j: '⠚',
  k: '⠅', l: '⠇', m: '⠍', n: '⠝', ñ: '⠻',
  o: '⠕', p: '⠏', q: '⠟', r: '⠗', s: '⠎',
  t: '⠞', u: '⠥', v: '⠧', w: '⠺', x: '⠭',
  y: '⠽', z: '⠵',
  // Vocales con tilde y diéresis
  á: '⠷', é: '⠮', í: '⠌', ó: '⠬', ú: '⠾', ü: '⠳',
  // Puntuación
  ' ': '⠀',
  ',': '⠂',
  ';': '⠆',
  ':': '⠒',
  '.': '⠲',
  '-': '⠤',
  '—': '⠤',
  '(': '⠶',
  ')': '⠶',
  '?': '⠢',
  '¿': '⠢',
  '!': '⠖',
  '¡': '⠖',
  '"': '⠦',
  '/': '⠌',
  '$': '⠠',
};

// Dígitos tras prefijo numérico ⠼
const DIGIT_BRAILLE_MAP: Record<string, string> = {
  '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙', '5': '⠑',
  '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊', '0': '⠚',
  '.': '⠲', ',': '⠂',
};

const NUMBER_PREFIX = '⠼'; // Prefijo de número Braille (puntos 3-4-5-6)
const CAPITAL_PREFIX = '⠨'; // Prefijo de mayúscula (punto 4-6)

/**
 * Convierte un texto en español a caracteres Unicode Braille
 */
export function textToUnicodeBraille(text: string): string {
  let result = '';
  let inNumber = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Manejo de números
    if (/[0-9]/.test(char)) {
      if (!inNumber) {
        result += NUMBER_PREFIX;
        inNumber = true;
      }
      result += DIGIT_BRAILLE_MAP[char] || char;
      continue;
    } else if (inNumber && (char === '.' || char === ',') && i + 1 < text.length && /[0-9]/.test(text[i + 1])) {
      // Separador decimal o de miles dentro de una cifra
      result += DIGIT_BRAILLE_MAP[char] || char;
      continue;
    } else {
      inNumber = false;
    }

    // Salto de línea
    if (char === '\n') {
      result += '\n';
      continue;
    }

    // Mayúscula
    const isUpper = char >= 'A' && char <= 'Z' || 'ÁÉÍÓÚÑÜ'.includes(char);
    const lower = char.toLowerCase();

    if (isUpper) {
      result += CAPITAL_PREFIX;
    }

    if (UNICODE_BRAILLE_MAP[lower]) {
      result += UNICODE_BRAILLE_MAP[lower];
    } else if (char === ' ') {
      result += ' ';
    } else {
      // Caracter no mapeado: conservar o mapear espacio
      result += char;
    }
  }

  return result;
}

/**
 * Tabla de conversión Unicode Braille a ASCII-Braille para archivos .brf
 * Estándar de la National Braille Association / North American ASCII Braille Table
 */
const UNICODE_TO_ASCII_BRF: Record<string, string> = {
  '⠀': ' ', ' ': ' ', '\n': '\n', '\r': '\r',
  '⠁': 'a', '⠃': 'b', '⠉': 'c', '⠙': 'd', '⠑': 'e',
  '⠋': 'f', '⠛': 'g', '⠓': 'h', '⠊': 'i', '⠚': 'j',
  '⠅': 'k', '⠇': 'l', '⠍': 'm', '⠝': 'n', '⠕': 'o',
  '⠏': 'p', '⠟': 'q', '⠗': 'r', '⠎': 's', '⠞': 't',
  '⠥': 'u', '⠧': 'v', '⠺': 'w', '⠭': 'x', '⠽': 'y',
  '⠵': 'z',
  // Signos especiales
  '⠼': '#', // Prefijo numérico
  '⠨': ',', // Prefijo mayúscula
  '⠷': '(', // á
  '⠮': '$', // é
  '⠌': '/', // í
  '⠬': '\\', // ó
  '⠾': ')', // ú
  '⠻': ']', // ñ
  '⠳': '[', // ü
  '⠂': '1', // coma
  '⠲': '4', // punto
  '⠒': '3', // dos puntos
  '⠆': ';', // punto y coma
  '⠤': '-', // guión
  '⠶': '7', // paréntesis
  '⠢': '8', // interrogación
  '⠖': '6', // exclamación
  '⠦': '?', // comilla
  '⠠': '@', // signo moneda o punto 4
};

/**
 * Convierte Unicode Braille a formato estándar ASCII-Braille (.brf)
 */
export function unicodeBrailleToBrf(unicodeBraille: string): string {
  let brf = '';
  for (const char of unicodeBraille) {
    if (UNICODE_TO_ASCII_BRF[char] !== undefined) {
      brf += UNICODE_TO_ASCII_BRF[char];
    } else {
      brf += char;
    }
  }
  return brf;
}

/**
 * Genera el documento completo de la carta en Braille (texto + transcripción)
 */
export function generateBrailleMenuContent(
  venue: Venue,
  categories: Category[],
  products: Product[]
): { visualText: string; brailleUnicode: string; brfText: string } {
  let visual = `CARTA ACCESIBLE EN SISTEMA BRAILLE\n`;
  visual += `${venue.name.toUpperCase()}\n`;
  visual += `Rubro: ${venue.rubro.toUpperCase()} | Dirección: ${venue.address} | Tel: ${venue.phone}\n`;
  visual += `Ordenanza Municipal de Menús Inclusivos - Versión Braille Grado 1 (Español)\n\n`;

  const sortedCats = [...categories].sort((a, b) => a.order - b.order);

  for (const cat of sortedCats) {
    const catProds = products.filter((p) => p.categoryId === cat.id && p.isAvailable);
    if (catProds.length === 0) continue;

    visual += `\n--- ${cat.name.toUpperCase()} ---\n\n`;

    for (const prod of catProds) {
      visual += `* ${prod.name}`;
      if (prod.foreignTranslation) {
        visual += ` (${prod.foreignTranslation})`;
      }
      visual += ` : $${prod.price.toLocaleString('es-AR')}\n`;
      visual += `  ${prod.description}\n`;
      if (prod.tags && prod.tags.length > 0) {
        const tagNames = prod.tags.map((t) => {
          if (t === 'sin_tacc') return 'Sin TACC';
          if (t === 'vegetariano') return 'Vegetariano';
          return 'Vegano';
        });
        visual += `  [${tagNames.join(', ')}]\n`;
      }
      visual += `\n`;
    }
  }

  const brailleUnicode = textToUnicodeBraille(visual);
  const brfText = unicodeBrailleToBrf(brailleUnicode);

  return {
    visualText: visual,
    brailleUnicode,
    brfText,
  };
}

/**
 * Descarga el archivo .brf listo para embosser/impresora Braille
 */
export function downloadBrfFile(venueName: string, brfContent: string): void {
  const blob = new Blob([brfContent], { type: 'text/plain;charset=us-ascii' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = venueName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.download = `menu_braille_${safeName}.brf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Descarga el PDF A4 con el texto Braille Unicode y referencia en español
 */
export function downloadBraillePdf(
  venue: Venue,
  categories: Category[],
  products: Product[]
): void {
  const { brailleUnicode } = generateBrailleMenuContent(venue, categories, products);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Encabezado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`CARTA EN SISTEMA BRAILLE - ${venue.name.toUpperCase()}`, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Transcripción Grado 1 (Español) conforme Ordenanza Municipal de Inclusión Gastronómica`, margin, y);
  y += 5;
  doc.text(`Dirección: ${venue.address} | Teléfono: ${venue.phone} | Precios en Pesos Argentinos (ARS)`, margin, y);
  y += 10;

  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Texto Braille
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13); // Tamaño legible para caracteres Braille
  doc.setTextColor(0, 0, 0);

  const lines = doc.splitTextToSize(brailleUnicode, contentWidth);

  for (const line of lines) {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += 6.5;
  }

  // Pie de página en última página
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generado por Menú Inclusivo - Compatible con impresoras de puntos Braille y lectura táctil`,
    margin,
    285
  );

  const safeName = venue.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`carta_braille_${safeName}.pdf`);
}
