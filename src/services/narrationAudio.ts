import type { LanguageCode } from '../i18n';
import type { AnimalRecord } from '../types/atlas';

export const BCP_47_BY_LANG: Record<LanguageCode, string> = {
  en: 'en-US',
  es: 'es-ES',
  zh: 'zh-CN',
  yue: 'yue-HK',
  ja: 'ja-JP',
  ko: 'ko-KR',
  pt: 'pt-BR',
  fr: 'fr-FR',
  it: 'it-IT',
  de: 'de-DE',
  ar: 'ar-SA',
};

/**
 * macOS Eloquence & novelty synthesizer voices that sort alphabetically ahead of
 * natural neural/premium OS voices and must be excluded from device TTS selection.
 */
const NOVELTY_VOICE_RE =
  /\b(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Eddy|Flo|Good News|Grandma|Grandpa|Jester|Organ|Reed|Rocko|Sandy|Shelley|Superstar|Trinoids|Whisper|Wobble|Zarvox)\b/i;

const VOICE_RANKING: Record<LanguageCode, string[]> = {
  en: ['Samantha', 'Ava', 'Allison', 'Alex', 'Victoria', 'Google US English'],
  es: ['Mónica', 'Monica', 'Paulina', 'Jorge', 'Google español'],
  zh: ['Tingting', 'Ting-Ting', 'Meijia', 'Google 普通话'],
  yue: ['Sinji', 'Sin-ji', 'Sin-Ji', 'Google 粵語'],
  ja: ['Kyoko', 'Otoya', 'Hattori', 'Google 日本語'],
  ko: ['Yuna', 'Sora', 'Jian', 'Google 한국의'],
  pt: ['Luciana', 'Joana', 'Felipe', 'Google português do Brasil'],
  fr: ['Thomas', 'Amélie', 'Amelie', 'Audrey', 'Google français'],
  it: ['Alice', 'Luca', 'Federica', 'Google italiano'],
  de: ['Anna', 'Markus', 'Petra', 'Yannick', 'Google Deutsch'],
  ar: ['Majed', 'Maged', 'Tarik', 'Laila', 'Google العربية'],
};

export interface NarrationTelemetry {
  lang: LanguageCode;
  bcp47: string;
  animalId?: string;
  mode: 'studio-mp3' | 'browser-tts';
  audioSrc?: string;
  voiceName?: string;
  text: string;
  timestamp: number;
}

let lastNarrationTelemetry: NarrationTelemetry | null = null;
let activeAudioEl: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeSpeechSessionId = 0;
let activeVocalCtx: AudioContext | null = null;
const stopCallbacks = new Set<() => void>();

export function getLastNarrationTelemetry(): NarrationTelemetry | null {
  return lastNarrationTelemetry;
}

export function onNarrationStopped(cb: () => void): () => void {
  stopCallbacks.add(cb);
  return () => stopCallbacks.delete(cb);
}

function notifyStopped(): void {
  stopCallbacks.forEach((cb) => {
    try {
      cb();
    } catch {
      // ignore listener errors
    }
  });
}

export function stopAllNarration(): void {
  activeSpeechSessionId++;
  activeUtterance = null;
  if (activeAudioEl) {
    try {
      activeAudioEl.pause();
      activeAudioEl.currentTime = 0;
    } catch {
      // ignore
    }
    activeAudioEl = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
  notifyStopped();
}

export function normalizeVoiceBcp47(rawLang: string | undefined, fallback: string): string {
  if (!rawLang) return fallback;
  return rawLang.replace(/_/g, '-').trim() || fallback;
}

export function pickBestBrowserVoice(
  lang: LanguageCode,
  localOnly = false
): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const rawVoices = window.speechSynthesis.getVoices();
  if (!rawVoices || rawVoices.length === 0) return null;

  const nonNovelty = rawVoices.filter((v) => !NOVELTY_VOICE_RE.test(v.name));
  const pool = (nonNovelty.length > 0 ? nonNovelty : rawVoices).filter((v) =>
    localOnly ? v.localService !== false : true
  );
  if (pool.length === 0) return null;

  const targetBcp = BCP_47_BY_LANG[lang].toLowerCase();
  const baseLang = lang === 'yue' ? 'zh-hk' : targetBcp.split('-')[0];
  const preferredNames = VOICE_RANKING[lang] ?? [];

  for (const name of preferredNames) {
    const match = pool.find((v) => v.name.toLowerCase().includes(name.toLowerCase()));
    if (match) return match;
  }

  if (lang === 'yue') {
    const hk = pool.find((v) => {
      const vLang = normalizeVoiceBcp47(v.lang, '').toLowerCase();
      const vName = v.name.toLowerCase();
      return (
        vLang.includes('hk') ||
        vLang.includes('yue') ||
        vName.includes('cantonese') ||
        vName.includes('hong kong')
      );
    });
    if (hk) return hk;
  }

  const exact = pool.find(
    (v) => normalizeVoiceBcp47(v.lang, '').toLowerCase() === targetBcp
  );
  if (exact) return exact;

  const prefix = pool.find((v) =>
    normalizeVoiceBcp47(v.lang, '').toLowerCase().startsWith(baseLang)
  );
  return prefix ?? null;
}

export function sanitizeTextForSpeech(text: string): string {
  return text
    .replace(/\([^)]*\)/g, ' ')
    .replace(/（[^）]*）/g, ' ')
    .replace(/[•·]/g, ', ')
    .replace(/≈/g, ' ')
    .replace(/×/g, ' ')
    .replace(/–|—/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits narration text into sentence/clause chunks <= `maxLen` characters
 * so browser SpeechSynthesis engines never time out or truncate long paragraphs.
 */
export function splitSpeechChunks(rawText: string, maxLen = 140): string[] {
  const cleaned = sanitizeTextForSpeech(rawText);
  if (!cleaned) return [];
  if (cleaned.length <= maxLen) return [cleaned];

  const rawSentences = cleaned
    .split(/(?<=[.!?。！？；;])\s*|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = '';

  const pushSubChunks = (piece: string) => {
    const subParts = piece
      .split(/(?<=[,，、،:])\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const sub of subParts) {
      if (!current) {
        if (sub.length <= maxLen) {
          current = sub;
        } else {
          for (let i = 0; i < sub.length; i += maxLen) {
            chunks.push(sub.slice(i, i + maxLen));
          }
        }
      } else if (current.length + 1 + sub.length <= maxLen) {
        current = `${current} ${sub}`;
      } else {
        chunks.push(current);
        current = sub.length <= maxLen ? sub : '';
        if (sub.length > maxLen) {
          for (let i = 0; i < sub.length; i += maxLen) {
            chunks.push(sub.slice(i, i + maxLen));
          }
        }
      }
    }
  };

  for (const sentence of rawSentences) {
    if (sentence.length > maxLen) {
      if (current) {
        chunks.push(current);
        current = '';
      }
      pushSubChunks(sentence);
    } else if (!current) {
      current = sentence;
    } else if (current.length + 1 + sentence.length <= maxLen) {
      current = `${current} ${sentence}`;
    } else {
      chunks.push(current);
      current = sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Plays pre-synthesized Google Cloud Chirp3-HD Studio Audio (`/audio/<lang>/<animalId>.mp3`)
 * for species narration (or whenever a native browser voice for `lang` is unavailable),
 * and falls back seamlessly to localized Browser SpeechSynthesis with explicit BCP-47 matching.
 */
export async function playLocalizedNarration(options: {
  text: string;
  lang: LanguageCode;
  animalId?: string;
  preferStudioAudio?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
}): Promise<NarrationTelemetry> {
  const { text, lang, animalId, preferStudioAudio = false, onStart, onEnd } = options;
  stopAllNarration();

  const matchedVoice = pickBestBrowserVoice(lang);
  const bcp47 = normalizeVoiceBcp47(matchedVoice?.lang, BCP_47_BY_LANG[lang] ?? 'en-US');
  const useStudioMp3 = Boolean(
    animalId && (preferStudioAudio || !matchedVoice)
  );

  if (useStudioMp3 && animalId && typeof window !== 'undefined') {
    const audioUrl = `/audio/${lang}/${animalId}.mp3`;
    try {
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      activeAudioEl = audio;

      await new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          audio.removeEventListener('canplaythrough', onReady);
          audio.removeEventListener('loadeddata', onReady);
          audio.removeEventListener('error', onError);
        };
        const onReady = () => {
          cleanup();
          resolve();
        };
        const onError = () => {
          cleanup();
          reject(new Error(`Failed to load ${audioUrl}`));
        };
        audio.addEventListener('canplaythrough', onReady, { once: true });
        audio.addEventListener('loadeddata', onReady, { once: true });
        audio.addEventListener('error', onError, { once: true });
        audio.load();
      });

      audio.onended = () => {
        if (activeAudioEl === audio) activeAudioEl = null;
        onEnd?.();
        notifyStopped();
      };
      audio.onerror = () => {
        if (activeAudioEl === audio) activeAudioEl = null;
        onEnd?.();
        notifyStopped();
      };

      const telemetry: NarrationTelemetry = {
        lang,
        bcp47,
        animalId,
        mode: 'studio-mp3',
        audioSrc: audioUrl,
        text,
        timestamp: Date.now(),
      };
      lastNarrationTelemetry = telemetry;
      onStart?.();
      await audio.play();
      return telemetry;
    } catch {
      activeAudioEl = null;
      // Fall through to localized Browser SpeechSynthesis
    }
  }

  const telemetry: NarrationTelemetry = {
    lang,
    bcp47,
    animalId,
    mode: 'browser-tts',
    voiceName: matchedVoice?.name,
    text,
    timestamp: Date.now(),
  };
  lastNarrationTelemetry = telemetry;
  speakWithBrowserTTS(text, lang, onStart, onEnd);
  return telemetry;
}

export function speakWithBrowserTTS(
  rawText: string,
  lang: LanguageCode,
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const sessionId = ++activeSpeechSessionId;
    const chunks = splitSpeechChunks(rawText, 140);
    if (chunks.length === 0) {
      onEnd?.();
      return;
    }

    let preferLocalOnly = false;
    let started = false;

    const speakChunkAt = (index: number) => {
      if (sessionId !== activeSpeechSessionId) return;
      if (index >= chunks.length) {
        activeUtterance = null;
        onEnd?.();
        notifyStopped();
        return;
      }

      const chunkText = chunks[index];
      const utterance = new SpeechSynthesisUtterance(chunkText);
      activeUtterance = utterance;

      const voice =
        pickBestBrowserVoice(lang, preferLocalOnly) ??
        pickBestBrowserVoice(lang, false);
      const fallbackBcp = BCP_47_BY_LANG[lang] ?? 'en-US';
      if (voice) {
        utterance.voice = voice;
        utterance.lang = normalizeVoiceBcp47(voice.lang, fallbackBcp);
      } else {
        utterance.lang = fallbackBcp;
      }
      utterance.rate = lang === 'en' ? 0.98 : 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        if (!started && sessionId === activeSpeechSessionId) {
          started = true;
          onStart?.();
        }
      };

      utterance.onend = () => {
        if (sessionId !== activeSpeechSessionId) return;
        speakChunkAt(index + 1);
      };

      utterance.onerror = () => {
        if (sessionId !== activeSpeechSessionId) return;
        if (!preferLocalOnly && voice && voice.localService === false) {
          preferLocalOnly = true;
          speakChunkAt(index);
          return;
        }
        activeUtterance = null;
        onEnd?.();
        notifyStopped();
      };

      if (!started && index === 0) {
        started = true;
        onStart?.();
      }
      window.speechSynthesis.speak(utterance);
    };

    speakChunkAt(0);
  } catch {
    activeUtterance = null;
    onEnd?.();
  }
}

/**
 * Procedural Web Audio API Bio-Acoustic Vocalization Synthesizer.
 * Generates authentic species acoustic signatures without external sound dependencies.
 */
export function playAnimalVocalization(
  animal: AnimalRecord,
  onComplete?: () => void
): { durationMs: number; signatureLabel: string } {
  if (typeof window === 'undefined') {
    onComplete?.();
    return { durationMs: 0, signatureLabel: 'Silent' };
  }

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    onComplete?.();
    return { durationMs: 0, signatureLabel: 'Unavailable' };
  }

  if (activeVocalCtx) {
    try {
      activeVocalCtx.close();
    } catch {
      // ignore
    }
    activeVocalCtx = null;
  }

  const ctx = new AudioCtx();
  activeVocalCtx = ctx;
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.28, now);
  master.connect(ctx.destination);

  let durationSec = 1.8;
  let signatureLabel = 'Bio-Acoustic Call';

  if (animal.id === 'homo-sapiens') {
    signatureLabel = '72 BPM Cardiac Auscultation';
    durationSec = 2.0;
    const beats = [0.05, 0.88];
    beats.forEach((b) => {
      const s1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      s1.type = 'sine';
      s1.frequency.setValueAtTime(64, now + b);
      s1.frequency.exponentialRampToValueAtTime(36, now + b + 0.11);
      g1.gain.setValueAtTime(0.001, now + b);
      g1.gain.linearRampToValueAtTime(0.85, now + b + 0.02);
      g1.gain.exponentialRampToValueAtTime(0.001, now + b + 0.13);
      s1.connect(g1).connect(master);
      s1.start(now + b);
      s1.stop(now + b + 0.14);

      const s2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      s2.type = 'sine';
      s2.frequency.setValueAtTime(88, now + b + 0.28);
      s2.frequency.exponentialRampToValueAtTime(48, now + b + 0.37);
      g2.gain.setValueAtTime(0.001, now + b + 0.28);
      g2.gain.linearRampToValueAtTime(0.65, now + b + 0.3);
      g2.gain.exponentialRampToValueAtTime(0.001, now + b + 0.38);
      s2.connect(g2).connect(master);
      s2.start(now + b + 0.28);
      s2.stop(now + b + 0.4);
    });
  } else if (animal.id === 'blue-whale' || animal.id === 'basilosaurus-cetoides') {
    signatureLabel = 'Pelagic Cetacean Call';
    durationSec = 2.4;
    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const env = ctx.createGain();

    osc.type = 'sawtooth';
    sub.type = 'sine';
    osc.frequency.setValueAtTime(118, now);
    osc.frequency.exponentialRampToValueAtTime(52, now + 1.1);
    osc.frequency.exponentialRampToValueAtTime(38, now + 2.3);

    sub.frequency.setValueAtTime(59, now);
    sub.frequency.exponentialRampToValueAtTime(26, now + 2.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, now);
    filter.Q.setValueAtTime(4.5, now);

    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(0.85, now + 0.45);
    env.gain.setValueAtTime(0.75, now + 1.6);
    env.gain.exponentialRampToValueAtTime(0.001, now + 2.35);

    osc.connect(filter);
    sub.connect(filter);
    filter.connect(env).connect(master);
    osc.start(now);
    sub.start(now);
    osc.stop(now + 2.4);
    sub.stop(now + 2.4);
  } else if (animal.id === 'african-bush-elephant' || animal.id === 'woolly-mammoth') {
    signatureLabel = 'Proboscidean Trumpet';
    durationSec = 1.9;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const bp = ctx.createBiquadFilter();
    const env = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.35);
    osc.frequency.exponentialRampToValueAtTime(390, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(180, now + 1.85);

    lfo.frequency.setValueAtTime(16, now);
    lfoGain.gain.setValueAtTime(18, now);
    lfo.connect(lfoGain).connect(osc.frequency);

    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(780, now);
    bp.Q.setValueAtTime(2.4, now);

    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(0.9, now + 0.14);
    env.gain.exponentialRampToValueAtTime(0.001, now + 1.85);

    osc.connect(bp).connect(env).connect(master);
    osc.start(now);
    lfo.start(now);
    osc.stop(now + 1.9);
    lfo.stop(now + 1.9);
  } else if (
    animal.id === 'siberian-tiger' ||
    animal.id === 'polar-bear' ||
    animal.id === 'smilodon-fatalis' ||
    animal.id === 'inostrancevia-alexandri'
  ) {
    signatureLabel = 'Apex Carnivore Roar';
    durationSec = 2.0;
    const osc = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    const env = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.linearRampToValueAtTime(138, now + 0.35);
    osc.frequency.exponentialRampToValueAtTime(58, now + 1.9);

    mod.type = 'triangle';
    mod.frequency.setValueAtTime(28, now);
    modGain.gain.setValueAtTime(34, now);
    mod.connect(modGain).connect(osc.frequency);

    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(420, now);
    lp.Q.setValueAtTime(3.2, now);

    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(0.95, now + 0.18);
    env.gain.exponentialRampToValueAtTime(0.001, now + 1.95);

    osc.connect(lp).connect(env).connect(master);
    osc.start(now);
    mod.start(now);
    osc.stop(now + 2.0);
    mod.stop(now + 2.0);
  } else if (animal.id === 'peregrine-falcon' || animal.id === 'emperor-penguin') {
    signatureLabel = 'Avian Syrinx Call';
    durationSec = 1.5;
    [0, 0.42, 0.84].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      const baseFreq = animal.id === 'peregrine-falcon' ? 2100 - idx * 140 : 680 + idx * 90;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now + offset);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.72, now + offset + 0.34);
      env.gain.setValueAtTime(0.001, now + offset);
      env.gain.linearRampToValueAtTime(0.7, now + offset + 0.04);
      env.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.36);
      osc.connect(env).connect(master);
      osc.start(now + offset);
      osc.stop(now + offset + 0.38);
    });
  } else if (animal.id === 'golden-poison-frog' || animal.id === 'axolotl') {
    signatureLabel = 'Amphibian Vocal Trill';
    durationSec = 1.6;
    for (let i = 0; i < 9; i++) {
      const t = now + i * 0.15;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1450 + (i % 3) * 180, t);
      osc.frequency.exponentialRampToValueAtTime(1920, t + 0.1);
      env.gain.setValueAtTime(0.001, t);
      env.gain.linearRampToValueAtTime(0.65, t + 0.02);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      osc.connect(env).connect(master);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  } else {
    signatureLabel = 'Bio-Acoustic Resonance';
    durationSec = 1.7;
    const osc = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const env = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(76, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 1.6);
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(240, now);
    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(0.85, now + 0.2);
    env.gain.exponentialRampToValueAtTime(0.001, now + 1.65);
    osc.connect(lp).connect(env).connect(master);
    osc.start(now);
    osc.stop(now + 1.7);
  }

  const durationMs = Math.round(durationSec * 1000);
  setTimeout(() => {
    if (activeVocalCtx === ctx) {
      try {
        ctx.close();
      } catch {
        // ignore
      }
      activeVocalCtx = null;
    }
    onComplete?.();
  }, durationMs);

  return { durationMs, signatureLabel };
}
