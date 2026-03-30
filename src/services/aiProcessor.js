/* ──────────────────────────────────────────────
   Delhi RoadWatch — AI Processor
   Pure REST API (no SDK, maximum reliability)
   ────────────────────────────────────────────── */

import { getAll, setAll } from '../lib/store';
import { getGeminiKey, getSEUser, getSESecret } from '../lib/config';

// ─────────────────────────────────────────────
// Base64 (chunk safe)
// ─────────────────────────────────────────────
function toB64(bytes) {
    const CHUNK = 8192;
    let s = '';
    for (let i = 0; i < bytes.length; i += CHUNK)
        s += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    return btoa(s);
}

// ─────────────────────────────────────────────
// Load image  (fetch → canvas → null)
// ─────────────────────────────────────────────
async function loadImage(url) {
    try {
        const r = await fetch(url);
        if (r.ok) {
            const mime = (r.headers.get('content-type') || 'image/jpeg').split(';')[0];
            const b64 = toB64(new Uint8Array(await r.arrayBuffer()));
            console.log(`[AI] fetch OK — ${Math.round(b64.length / 1000)}KB`);
            return { mimeType: mime, data: b64 };
        }
        console.warn('[AI] fetch status:', r.status);
    } catch (e) { console.warn('[AI] fetch threw:', e.message); }

    try {
        const b64 = await new Promise((res, rej) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const MAX = 1024, sc = img.width > MAX ? MAX / img.width : 1;
                const cv = document.createElement('canvas');
                cv.width = Math.round(img.width * sc);
                cv.height = Math.round(img.height * sc);
                cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
                res(cv.toDataURL('image/jpeg', 0.85).split(',')[1]);
            };
            img.onerror = () => rej(new Error('img.onerror'));
            img.src = url;
        });
        console.log(`[AI] canvas OK — ${Math.round(b64.length / 1000)}KB`);
        return { mimeType: 'image/jpeg', data: b64 };
    } catch (e) { console.warn('[AI] canvas threw:', e.message); }

    console.error('[AI] Could not load image — will run text-only');
    return null;
}

// ─────────────────────────────────────────────
// Raw Gemini REST call
// ─────────────────────────────────────────────
async function geminiREST(parts, wantJson = false) {
    const key = getGeminiKey();
    if (!key) throw new Error('Gemini API key not configured. Go to Settings to add your key.');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

    const body = {
        contents: [{ role: 'user', parts }],
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ],
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 800,
            ...(wantJson ? { responseMimeType: 'application/json' } : {})
        }
    };
    const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const json = await r.json();
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${json?.error?.message || JSON.stringify(json?.error)}`);
    const candidate = json?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    if (text === undefined) throw new Error('Gemini returned no text. Finish reason: ' + (candidate?.finishReason || 'Unknown'));
    return text;
}

// ─────────────────────────────────────────────
// PLATE DETECTION
// ─────────────────────────────────────────────
async function detectPlate(imgData) {
    if (!imgData) return null;

    const parts = [
        {
            text: `Look at this image. Find any vehicle number plate.
Indian plates: white/yellow rectangle, black text e.g. HR26DQ5588 DL1CAB1234 MH12AB1234.
Even if it is slightly blurry or partial, try your very best to extract every readable character.

Respond with ONLY a JSON object:
{
  "detected_plate": "<plate string without spaces, e.g. HR26DQ5588, or null if absolutely no plate is visible>"
}` },
        { inline_data: { mime_type: imgData.mimeType, data: imgData.data } }
    ];

    try {
        const text = await geminiREST(parts, true);
        console.log('[PLATE] Raw JSON:', text);
        const parsed = JSON.parse(text);
        if (!parsed.detected_plate) return null;
        const raw = parsed.detected_plate.toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (raw.length < 4 || raw === 'NONE' || raw === 'NULL') return null;
        return raw;
    } catch (e) {
        console.error('[PLATE] Error:', e.message);
        return null;
    }
}

// ─────────────────────────────────────────────
// VIOLATION ANALYSIS
// ─────────────────────────────────────────────
async function analyseViolation(imgData, crimeType, remarks) {
    const prompt = `You are a traffic violation analyst for Delhi Police.
${imgData ? 'Analyse the attached image.' : 'No image provided.'}

Violation: ${crimeType}
Remarks: ${remarks || 'none'}

Respond with ONLY a JSON object (no markdown):
{
  "confidence_score": <integer 0-100, probability that a real traffic violation is shown in the image (100 = obvious violation, 0 = no violation at all)>,
  "verdict": "<CONFIRMED_VIOLATION|PROBABLE_VIOLATION|INSUFFICIENT_EVIDENCE|NO_VIOLATION_DETECTED>",
  "ai_comments": "<40-80 words describing what is visible and why. End with 'I am very sure.' if score>=75, 'Research more.' if 45-74, or 'Research more, but I don't think so.' if <45>"
}`;

    const parts = imgData
        ? [{ text: prompt }, { inline_data: { mime_type: imgData.mimeType, data: imgData.data } }]
        : [{ text: prompt }];

    try {
        const text = await geminiREST(parts, true);
        console.log('[ANALYSIS] Raw:', text.slice(0, 300));
        return JSON.parse(text);
    } catch (e) {
        const text2 = await geminiREST(parts, false);
        let m = text2.match(/\{[\s\S]*\}/);
        if (!m) {
            const start = text2.indexOf('{');
            if (start !== -1) {
                let salvaged = text2.slice(start).trim();
                if (!salvaged.endsWith('}')) {
                    if (!salvaged.endsWith('"')) salvaged += '"';
                    salvaged += '}';
                }
                m = [salvaged];
            }
        }
        if (m) {
            try { return JSON.parse(m[0]); } catch {
                return { confidence_score: 0, verdict: "INSUFFICIENT_EVIDENCE", ai_comments: "Analysis yielded partial response. " + fixEnding('', 0) };
            }
        }
        throw new Error("No JSON object found: " + text2.slice(0, 100) + "...");
    }
}

// ─────────────────────────────────────────────
// SIGHTENGINE (optional deepfake detection)
// ─────────────────────────────────────────────
async function deepfakeScore(imageUrl) {
    const seUser   = getSEUser();
    const seSecret = getSESecret();
    if (!seUser || !seSecret) return 0;
    try {
        const f = new URLSearchParams({ api_user: seUser, api_secret: seSecret, url: imageUrl, models: 'genai' });
        const r = await fetch('https://api.sightengine.com/1.0/check.json', { method: 'POST', body: f });
        const d = await r.json();
        const s = d?.type?.ai_generated ?? d?.ai_generated?.score;
        if (typeof s === 'number') return Math.round(s * 100);
    } catch (e) { console.warn('[SE]', e.message); }
    return 0;
}

// ─────────────────────────────────────────────
// Ending phrase enforcement
// ─────────────────────────────────────────────
function fixEnding(text, score) {
    const OK = ['I am very sure.', 'Research more.', "Research more, but I don't think so."];
    if (OK.some(p => text.trim().endsWith(p))) return text.trim();
    const phrase = score >= 75 ? OK[0] : score >= 45 ? OK[1] : OK[2];
    return text.trim().replace(/[.!?]+$/, '') + ' ' + phrase;
}

// ─────────────────────────────────────────────
// localStorage persist
// ─────────────────────────────────────────────
function save(reportId, payload) {
    const analyses = getAll('ai_analysis');
    const i = analyses.findIndex(a => a.report_id === reportId);
    if (i !== -1) {
        analyses[i] = { ...analyses[i], ...payload };
    } else {
        analyses.push({ report_id: reportId, ...payload });
    }
    setAll('ai_analysis', analyses);

    const reports = getAll('reports');
    const ri = reports.findIndex(r => r.report_id === reportId);
    if (ri !== -1) {
        reports[ri] = { ...reports[ri], status: 'AI Processed' };
        setAll('reports', reports);
    }
}

// ─────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────
export async function processReportWithAI(reportId, imageUrl, crimeType, comments) {
    if (!imageUrl) return;
    console.log(`\n[AI] ═══ ${reportId} ═══`);

    let confidence = 0, deepfake = 0;
    let plate = 'REVIEW REQUIRED';
    let summary = '[INSUFFICIENT_EVIDENCE] Analysis could not complete. Manual review required.';

    const imgData = await loadImage(imageUrl);

    const [plateRes, analysisRes, seRes] = await Promise.allSettled([
        detectPlate(imgData),
        analyseViolation(imgData, crimeType, comments),
        deepfakeScore(imageUrl)
    ]);

    if (plateRes.status === 'fulfilled' && plateRes.value) plate = plateRes.value;
    if (seRes.status === 'fulfilled') deepfake = seRes.value;

    if (analysisRes.status === 'fulfilled' && analysisRes.value) {
        const g = analysisRes.value;
        confidence = typeof g.confidence_score === 'number'
            ? Math.min(100, Math.max(0, Math.round(g.confidence_score))) : 0;
        const verdict  = g.verdict || 'INSUFFICIENT_EVIDENCE';
        const comment  = fixEnding(g.ai_comments || '', confidence);
        summary = `[${verdict}] ${comment}`;
    } else {
        const errMsg = analysisRes.status === 'rejected'
            ? analysisRes.reason?.message
            : 'Gemini returned no parseable JSON';
        console.error('[AI] Analysis error:', errMsg);
        summary = `[INSUFFICIENT_EVIDENCE] AI Error: ${errMsg?.slice(0, 200) || 'Unknown'}`;
    }

    console.log(`[AI] plate=${plate} conf=${confidence}% deepfake=${deepfake}%`);
    save(reportId, {
        ai_summary: summary,
        confidence_score: confidence,
        detected_vehicle_number: plate,
        ai_generated_score: deepfake,
    });
    console.log('[AI] Saved\n');
}

export async function rerunAIAnalysis(report) {
    const url = report.media_urls?.[0];
    if (!url) throw new Error('No media on this report.');
    await processReportWithAI(
        report.report_id, url,
        report.crime_type || 'Unknown Violation',
        report.comments || ''
    );
}
