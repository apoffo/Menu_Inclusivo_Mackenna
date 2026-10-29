import React, { createContext, useContext, useState, useEffect } from 'react';
import { HighContrastMode, FontSizeScale, FontFamilyPreference } from '../types';
import { speechService } from '../utils/speech';

interface AccessibilityContextType {
  contrastMode: HighContrastMode;
  setContrastMode: (mode: HighContrastMode) => void;
  fontSize: FontSizeScale;
  setFontSize: (size: FontSizeScale) => void;
  fontFamily: FontFamilyPreference;
  setFontFamily: (font: FontFamilyPreference) => void;
  pictogramMode: boolean;
  setPictogramMode: (enabled: boolean) => void;
  togglePictogramMode: () => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
  speakText: (text: string) => void;
  speakProduct: (name: string, price: number, description: string, translation?: string) => void;
  resetAccessibility: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contrastMode, setContrastModeState] = useState<HighContrastMode>(() => {
    return (localStorage.getItem('menu_inc_contrast') as HighContrastMode) || 'normal';
  });

  const [fontSize, setFontSizeState] = useState<FontSizeScale>(() => {
    return (localStorage.getItem('menu_inc_fontsize') as FontSizeScale) || 'normal';
  });

  const [fontFamily, setFontFamilyState] = useState<FontFamilyPreference>(() => {
    return (localStorage.getItem('menu_inc_fontfamily') as FontFamilyPreference) || 'sans';
  });

  const [pictogramMode, setPictogramModeState] = useState<boolean>(() => {
    return localStorage.getItem('menu_inc_pictogram_mode') === 'true';
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    const unsub = speechService.subscribe(setIsSpeaking);
    return unsub;
  }, []);

  const setContrastMode = (mode: HighContrastMode) => {
    setContrastModeState(mode);
    localStorage.setItem('menu_inc_contrast', mode);
  };

  const setFontSize = (size: FontSizeScale) => {
    setFontSizeState(size);
    localStorage.setItem('menu_inc_fontsize', size);
  };

  const setFontFamily = (font: FontFamilyPreference) => {
    setFontFamilyState(font);
    localStorage.setItem('menu_inc_fontfamily', font);
  };

  const setPictogramMode = (enabled: boolean) => {
    setPictogramModeState(enabled);
    localStorage.setItem('menu_inc_pictogram_mode', String(enabled));
  };

  const togglePictogramMode = () => {
    setPictogramMode(!pictogramMode);
  };

  const stopSpeaking = () => {
    speechService.stop();
  };

  const speakText = (text: string) => {
    speechService.speak(text);
  };

  const speakProduct = (name: string, price: number, description: string, translation?: string) => {
    speechService.speakProduct(name, price, description, translation);
  };

  const resetAccessibility = () => {
    setContrastMode('normal');
    setFontSize('normal');
    setFontFamily('sans');
    setPictogramMode(false);
    speechService.stop();
  };

  // Aplicar clases dinámicas al documento raíz para accesibilidad global
  useEffect(() => {
    const root = document.documentElement;

    // Contraste
    root.classList.remove('contrast-normal', 'contrast-black-white', 'contrast-yellow-black');
    root.classList.add(`contrast-${contrastMode}`);

    // Tamaño de fuente
    root.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-extralarge');
    root.classList.add(`font-scale-${fontSize}`);

    // Familia tipográfica
    root.classList.remove('font-sans', 'font-accessible');
    if (fontFamily === 'hyperlegible') {
      root.classList.add('font-accessible');
    } else {
      root.classList.add('font-sans');
    }
  }, [contrastMode, fontSize, fontFamily]);

  return (
    <AccessibilityContext.Provider
      value={{
        contrastMode,
        setContrastMode,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        pictogramMode,
        setPictogramMode,
        togglePictogramMode,
        isSpeaking,
        stopSpeaking,
        speakText,
        speakProduct,
        resetAccessibility,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
