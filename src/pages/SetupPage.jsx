/* ──────────────────────────────────────────────
   Delhi RoadWatch — API Keys Setup Page
   Shown on first launch and accessible via Settings.
   ────────────────────────────────────────────── */

import { useState } from 'react';
import { getConfig, saveConfig } from '../lib/config';

export default function SetupPage({ onComplete, showBack, onBack }) {
    const existing = getConfig();
    const [gemini, setGemini] = useState(existing.gemini || '');
    const [seUser, setSeUser] = useState(existing.se_user || '');
    const [seSecret, setSeSecret] = useState(existing.se_secret || '');
    const [saved, setSaved] = useState(false);

    const canSave = gemini.trim();

    const handleSave = () => {
        saveConfig({
            gemini: gemini.trim(),
            se_user: seUser.trim(),
            se_secret: seSecret.trim(),
        });
        setSaved(true);
        setTimeout(() => { if (onComplete) onComplete(); }, 600);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '560px' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ fontWeight: 900, fontSize: '24px', letterSpacing: '-0.04em', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        ROAD<span style={{ color: 'var(--primary)', fontStyle: 'italic', fontWeight: 500 }}>WATCH</span>.
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '10px' }}>
                        {showBack ? 'Update API Keys' : 'Setup Required'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
                        This app uses your own API keys. They are stored locally in your browser and never sent anywhere except the respective APIs.
                    </p>
                </div>

                <div className="card" style={{ padding: '32px', marginBottom: '16px' }}>

                    {/* Gemini */}
                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 800 }}>
                            Google Gemini API Key <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: '1.5' }}>
                            Powers AI violation analysis, number plate detection, and the Legal FAQ bot.
                            Get a free key at{' '}
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                                aistudio.google.com
                            </a>{' '}
                            (free tier: 1,500 req/day).
                        </p>
                        <input
                            className="form-input"
                            type="password"
                            placeholder="AIza..."
                            value={gemini}
                            onChange={e => setGemini(e.target.value)}
                        />
                    </div>

                    {/* Sightengine (optional) */}
                    <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '24px', marginTop: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                            Optional — Deepfake Detection
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                            Sightengine detects AI-generated images in submitted evidence. Skip if not needed.
                            Free tier at{' '}
                            <a href="https://sightengine.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                                sightengine.com
                            </a>.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Sightengine User</label>
                                <input className="form-input" type="text" placeholder="API user" value={seUser} onChange={e => setSeUser(e.target.value)} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Sightengine Secret</label>
                                <input className="form-input" type="password" placeholder="API secret" value={seSecret} onChange={e => setSeSecret(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Demo accounts info */}
                {!showBack && (
                    <div className="card" style={{ padding: '20px', marginBottom: '16px', background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.15)' }}>
                        <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                            Demo Accounts (pre-seeded)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '12px' }}>
                            <div>
                                <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Citizen</div>
                                <div style={{ color: 'var(--text-muted)' }}>arjun@demo.com</div>
                                <div style={{ color: 'var(--text-muted)' }}>citizen123</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Police</div>
                                <div style={{ color: 'var(--text-muted)' }}>POL001</div>
                                <div style={{ color: 'var(--text-muted)' }}>police123</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Admin</div>
                                <div style={{ color: 'var(--text-muted)' }}>ADM001</div>
                                <div style={{ color: 'var(--text-muted)' }}>admin123</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    {showBack && (
                        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onBack}>
                            ← Back
                        </button>
                    )}
                    <button
                        className="btn btn-primary"
                        style={{ flex: 2, padding: '16px', borderRadius: '16px' }}
                        disabled={!canSave || saved}
                        onClick={handleSave}
                    >
                        {saved ? '✓ Saved!' : showBack ? 'Save Changes' : 'Save & Continue →'}
                    </button>
                </div>

                <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px' }}>
                    Keys are stored only in your browser's localStorage. You can update them anytime via Settings.
                </p>
            </div>
        </div>
    );
}
