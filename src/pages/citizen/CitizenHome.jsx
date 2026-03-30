import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchReports, fetchViolationsByEmail } from '../../data/db';

export default function CitizenHome() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [myReports, setMyReports] = useState([]);
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const reports = await fetchReports({ citizen_id: currentUser?.user_id });
            setMyReports(reports);
            if (currentUser?.email) {
                const v = await fetchViolationsByEmail(currentUser.email);
                setViolations(v);
            }
            setLoading(false);
        }
        load();
    }, [currentUser]);

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>Loading…</div>;

    const resolved = myReports.filter(r => ['Admin Accepted', 'Police Confirmed', 'Owner Notified'].includes(r.status)).length;
    const pending  = myReports.filter(r => ['Submitted', 'AI Processed'].includes(r.status)).length;
    const firstName = currentUser?.name?.split(' ')[0] || 'there';
    const isPolice  = currentUser?.role === 'police';

    return (
        <div className="animate-up" style={{ maxWidth: '420px', margin: '0 auto' }}>

            {/* Greeting */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ marginBottom: '2px' }}>
                    {isPolice ? 'Hello, Officer' : `Hello, ${firstName}`}
                </h1>
                <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>New Delhi, DL</p>
            </div>

            {/* Violation alert */}
            {violations.length > 0 && (
                <div style={{ background: 'var(--danger-bg)', border: '1px solid #FECACA', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px' }}>⚠️</span>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--danger)' }}>
                            {violations.length} pending {violations.length === 1 ? 'violation' : 'violations'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--danger)', opacity: 0.8 }}>You have unresolved road violations on record.</div>
                    </div>
                </div>
            )}

            {/* Report CTA */}
            <div className="card" style={{ marginBottom: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', background: 'var(--primary-dim)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', margin: '0 auto 14px' }}>
                    📸
                </div>
                <h2 style={{ marginBottom: '6px', fontSize: '16px' }}>Report a violation</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '18px', lineHeight: '1.5' }}>
                    Upload a photo or video. AI will verify the evidence automatically.
                </p>
                <button className="btn btn-primary" style={{ width: '100%', padding: '10px' }}
                    onClick={() => navigate(isPolice ? '/police/report' : '/citizen/report')}>
                    Open camera
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '26px', fontWeight: '600', color: 'var(--success)', marginBottom: '2px' }}>{resolved}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Resolved</div>
                </div>
                <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '26px', fontWeight: '600', color: 'var(--warning)', marginBottom: '2px' }}>{pending}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Pending</div>
                </div>
            </div>

        </div>
    );
}
