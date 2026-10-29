/**
 * Módulo de Lectura en Voz Alta (Web Speech API)
 * Optimizado para lectura en español argentino (es-AR)
 */

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState = false;
  private listeners: ((speaking: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(callback: (speaking: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify(speaking: boolean) {
    this.isSpeakingState = speaking;
    this.listeners.forEach((cb) => cb(speaking));
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.notify(false);
    }
  }

  public speak(text: string, onEnd?: () => void): void {
    if (!this.synth) {
      console.warn('Web Speech API no disponible en este navegador');
      return;
    }

    this.stop();

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-AR';
    utterance.rate = 0.95; // Velocidad ligeramente pausada para máxima claridad
    utterance.pitch = 1.0;

    // Buscar voz en español
    const voices = this.synth.getVoices();
    const esVoice =
      voices.find((v) => v.lang.startsWith('es-AR')) ||
      voices.find((v) => v.lang.startsWith('es-') || v.lang === 'es') ||
      voices[0];

    if (esVoice) {
      utterance.voice = esVoice;
    }

    utterance.onstart = () => {
      this.notify(true);
    };

    utterance.onend = () => {
      this.notify(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.notify(false);
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public speakProduct(name: string, price: number, description: string, translation?: string): void {
    let text = `${name}. `;
    if (translation) {
      text += `Traducido como: ${translation}. `;
    }
    text += `Precio: ${price.toLocaleString('es-AR')} pesos argentinos. `;
    text += `Descripción: ${description}.`;
    this.speak(text);
  }
}

export const speechService = new SpeechService();
