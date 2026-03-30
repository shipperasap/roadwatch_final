// ─────────────────────────────────────────────────────────────────────────────
//  sarvamService.js  –  Unified Sarvam AI API wrapper for Delhi RoadWatch
//  Covers: STT (Saaras v3), TTS (Bulbul v2), Translation, Chat (sarvam-m)
// ─────────────────────────────────────────────────────────────────────────────

import { getSarvamKey } from '../lib/config';

const STT_URL       = 'https://api.sarvam.ai/speech-to-text';
const TTS_URL       = 'https://api.sarvam.ai/text-to-speech';
const TRANSLATE_URL = 'https://api.sarvam.ai/translate';
const CHAT_URL      = 'https://api.sarvam.ai/v1/chat/completions';

function jsonHeaders() {
  return {
    'Content-Type': 'application/json',
    'api-subscription-key': getSarvamKey(),
  };
}

// ── Supported Languages ────────────────────────────────────────────────────
export const SUPPORTED_LANGUAGES = {
  'hi-IN': 'हिन्दी (Hindi)',
  'bn-IN': 'বাংলা (Bengali)',
  'ta-IN': 'தமிழ் (Tamil)',
  'te-IN': 'తెలుగు (Telugu)',
  'mr-IN': 'मराठी (Marathi)',
  'gu-IN': 'ગુજરાતી (Gujarati)',
  'kn-IN': 'ಕನ್ನಡ (Kannada)',
  'ml-IN': 'മലയാളം (Malayalam)',
  'pa-IN': 'ਪੰਜਾਬੀ (Punjabi)',
  'od-IN': 'ଓଡ଼ିଆ (Odia)',
  'en-IN': 'English',
};

export const LANGUAGES = Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({ code, name }));

// ── Helper ─────────────────────────────────────────────────────────────────
async function handleResponse(res) {
  if (!res.ok) {
    let msg = `Sarvam API error ${res.status}`;
    try {
      const body = await res.json();
      msg = body?.error?.message || body?.message || msg;
    } catch (_) { }
    throw new Error(msg);
  }
  return res.json();
}

// ── 1. Speech-to-Text ──────────────────────────────────────────────────────
export async function speechToText(audioBlob, langCode = 'hi-IN') {
  const key = getSarvamKey();
  if (!key) throw new Error('Sarvam API key not configured. Please go to Settings.');
  try {
    const form = new FormData();
    form.append('file', audioBlob, 'recording.webm');
    form.append('model', 'saaras:v3');
    form.append('language_code', langCode);
    form.append('with_timestamps', 'false');

    const res = await fetch(STT_URL, {
      method: 'POST',
      headers: { 'api-subscription-key': key },
      body: form,
    });

    const data = await handleResponse(res);
    return { transcript: data.transcript ?? '', language_code: data.language_code ?? langCode };
  } catch (err) {
    if (err.message?.includes('fetch')) throw new Error('Sarvam AI service is unreachable. Please check your connection.');
    throw err;
  }
}

// ── 2. Text-to-Speech ──────────────────────────────────────────────────────
export async function textToSpeech(text, langCode = 'en-IN') {
  const key = getSarvamKey();
  if (!key) throw new Error('Sarvam API key not configured. Please go to Settings.');
  try {
    const res = await fetch(TTS_URL, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({
        inputs: [text],
        target_language_code: langCode,
        model: 'bulbul:v2',
        enable_preprocessing: true,
      }),
    });

    const data = await handleResponse(res);
    const audioBase64 = data.audios?.[0] ?? '';
    if (!audioBase64) throw new Error('No audio received from Sarvam TTS.');
    return { audioBase64 };
  } catch (err) {
    if (err.message?.includes('fetch')) throw new Error('Sarvam AI service is unreachable. Please check your connection.');
    throw err;
  }
}

// ── 3. Translation ─────────────────────────────────────────────────────────
export async function translateText(text, srcLang = 'auto', tgtLang = 'hi-IN') {
  const key = getSarvamKey();
  if (!key) throw new Error('Sarvam API key not configured. Please go to Settings.');
  try {
    const res = await fetch(TRANSLATE_URL, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({
        input: text,
        source_language_code: srcLang === 'Unknown' ? 'auto' : srcLang,
        target_language_code: tgtLang,
        model: 'sarvam-translate:v1',
        enable_preprocessing: false,
      }),
    });

    const data = await handleResponse(res);
    return { translated_text: data.translated_text ?? text };
  } catch (err) {
    if (err.message?.includes('fetch')) throw new Error('Sarvam AI service is unreachable. Please check your connection.');
    throw err;
  }
}

// ── 4. Indic LLM (sarvam-m) ───────────────────────────────────────────────
export async function chatWithLegalBot(messages) {
  const key = getSarvamKey();
  if (!key) throw new Error('Sarvam API key not configured. Please go to Settings.');
  try {
    const res = await fetch(CHAT_URL, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ model: 'sarvam-m', messages, temperature: 0.4, max_tokens: 512 }),
    });

    const data = await handleResponse(res);
    return { reply: data.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.' };
  } catch (err) {
    if (err.message?.includes('fetch')) throw new Error('Sarvam AI service is unreachable. Please check your connection.');
    throw err;
  }
}

// ── Utility: Play base64 audio ────────────────────────────────────────────
export function playBase64Audio(base64) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  audio.play();
  return audio;
}
