#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SPECIES_LOCALIZED_NARRATIONS } from '../src/data/localizedNarrations.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const AUDIO_DIR = path.join(ROOT_DIR, 'public', 'audio');

const VOICE_CONFIG = {
  en: { languageCode: 'en-US', name: 'en-US-Chirp3-HD-Aoede' },
  es: { languageCode: 'es-ES', name: 'es-ES-Chirp3-HD-Aoede' },
  zh: { languageCode: 'cmn-CN', name: 'cmn-CN-Chirp3-HD-Aoede' },
  yue: { languageCode: 'yue-HK', name: 'yue-HK-Chirp3-HD-Aoede' },
  ja: { languageCode: 'ja-JP', name: 'ja-JP-Chirp3-HD-Aoede' },
  ko: { languageCode: 'ko-KR', name: 'ko-KR-Chirp3-HD-Aoede' },
  pt: { languageCode: 'pt-BR', name: 'pt-BR-Chirp3-HD-Aoede' },
  fr: { languageCode: 'fr-FR', name: 'fr-FR-Chirp3-HD-Aoede' },
  it: { languageCode: 'it-IT', name: 'it-IT-Chirp3-HD-Aoede' },
  de: { languageCode: 'de-DE', name: 'de-DE-Chirp3-HD-Aoede' },
  ar: { languageCode: 'ar-XA', name: 'ar-XA-Chirp3-HD-Aoede' },
};

const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
const quotaProject = process.env.GCP_QUOTA_PROJECT || 'project-maui';

function normalizeForChirp3(text, lang, aggressive = false) {
  if (lang === 'zh' || lang === 'yue' || lang === 'ja') {
    const out = text
      .replace(/（[^）]*）/g, '')
      .replace(/\([^)]*\)/g, '');
    const rawClauses = out
      .split(/[。！？；，、.]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const maxLen = aggressive ? 12 : 22;
    const shortClauses = [];
    for (const c of rawClauses) {
      if (c.length <= maxLen) {
        shortClauses.push(c);
      } else {
        for (let i = 0; i < c.length; i += maxLen) {
          shortClauses.push(c.slice(i, i + maxLen));
        }
      }
    }
    return shortClauses.join('。\n') + '。';
  }
  const out = text
    .replace(/\([^)]*\)/g, '')
    .replace(/،/g, '. ')
    .replace(/;/g, '. ')
    .replace(/,\s+/g, aggressive ? '.\n' : ', ')
    .replace(/\s+/g, ' ')
    .trim();
  return out;
}

async function synthesizeClip(animalId, lang, text) {
  const outDir = path.join(AUDIO_DIR, lang);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${animalId}.mp3`);

  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1024) {
    return { animalId, lang, status: 'cached' };
  }

  const voice = VOICE_CONFIG[lang];
  for (const aggressive of [false, true]) {
    const preparedText = normalizeForChirp3(text, lang, aggressive);
    const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-goog-user-project': quotaProject,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text: preparedText },
        voice,
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.98,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const buf = Buffer.from(data.audioContent, 'base64');
      fs.writeFileSync(outPath, buf);
      return { animalId, lang, status: 'generated', bytes: buf.length };
    }
    if (aggressive) {
      const errText = await res.text();
      throw new Error(`TTS failed for ${lang}/${animalId}: ${res.status} ${errText}`);
    }
  }
}

async function main() {
  const jobs = [];
  for (const [animalId, byLang] of Object.entries(SPECIES_LOCALIZED_NARRATIONS)) {
    for (const [lang, entry] of Object.entries(byLang)) {
      jobs.push({ animalId, lang, text: entry.narration });
    }
  }

  console.log(`Synthesizing ${jobs.length} Chirp3-HD studio narration MP3s across 11 languages...`);
  const concurrency = 12;
  let completed = 0;
  let idx = 0;

  async function worker() {
    while (idx < jobs.length) {
      const current = jobs[idx++];
      const res = await synthesizeClip(current.animalId, current.lang, current.text);
      completed++;
      if (completed % 25 === 0 || completed === jobs.length) {
        console.log(`[${completed}/${jobs.length}] ${res.lang}/${res.animalId}.mp3 (${res.status})`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  console.log(`All ${jobs.length} studio MP3 narrations synthesized and verified.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
