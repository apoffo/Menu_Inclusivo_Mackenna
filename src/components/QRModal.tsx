import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Venue } from '../types';
import { QrCode, Download, X, Printer, Check } from 'lucide-react';

interface QRModalProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ venue, isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // URL del menú del comercio
  const menuUrl = `${window.location.origin}/#menu-${venue.id}`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(menuUrl, {
        width: 380,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generando QR:', err));
    }
  }, [isOpen, menuUrl]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    const safeName = venue.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `codigo_qr_menu_${safeName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-500" />
            <h2 id="qr-modal-title" className="text-lg font-black text-slate-900">
              Código QR del Menú
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            aria-label="Cerrar modal de código QR"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800 mb-1">{venue.name}</p>
          <p className="text-xs text-slate-500 mb-4">
            Imprimí este código para colocarlo en mesas, servilleteros o en el ingreso del local.
          </p>

          {/* Imagen del QR */}
          <div className="inline-block p-4 bg-white border-2 border-slate-300 rounded-2xl shadow-inner mb-4">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Código QR para acceder a la carta accesible de ${venue.name}`}
                className="w-56 h-56 mx-auto object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                Generando código QR...
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 text-left mb-5">
            <strong>Requisito de ordenanza municipal:</strong> El código QR debe estar ubicado en un lugar visible y señalizado con altorrelieve o Braille para facilitar la lectura por parte de clientes con discapacidad.
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PNG para imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-300"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : null}
              <span>{copied ? 'Copiado' : 'Copiar enlace'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
