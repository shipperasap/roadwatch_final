import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [role, setRole] = useState('citizen');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(role, identifier, password);
        if (result.success) {
            const dest = result.user.role === 'citizen' ? '/citizen'
                : result.user.role === 'police' ? '/police' : '/admin';
            navigate(dest, { replace: true });
        } else {
            setError(result.error || 'Invalid credentials.');
            setLoading(false);
        }
    };

    const placeholder = role === 'citizen' ? 'Email address'
        : role === 'police' ? 'Police ID (e.g. POL001)' : 'Admin ID (e.g. ADM001)';

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '380px' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '22px', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                        Road<span style={{ color: 'var(--primary)' }}>Watch</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-2)' }}>Delhi Traffic Violation Portal</p>
                </div>

                <div className="card" style={{ padding: '28px' }}>

                    {/* Role tabs */}
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg)', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
                        {['citizen', 'police', 'admin'].map(r => (
                            <button key={r} onClick={() => { setRole(r); setIdentifier(''); setError(''); }}
                                style={{
                                    flex: 1, padding: '7px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                    fontSize: '12px', fontWeight: '500', transition: 'var(--transition)',
                                    background: role === r ? 'var(--surface)' : 'transparent',
                                    color: role === r ? 'var(--primary)' : 'var(--text-3)',
                                    boxShadow: role === r ? 'var(--shadow)' : 'none',
                                    textTransform: 'capitalize',
                                }}>
                                {r}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '13px', padding: '10px 12px', borderRadius: '6px', marginBottom: '16px' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-2)', marginBottom: '5px' }}>
                                {placeholder}
                            </label>
                            <input
                                className="form-input"
                                type={role === 'citizen' ? 'email' : 'text'}
                                placeholder={placeholder}
                                value={identifier}
                                onChange={e => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-2)', marginBottom: '5px' }}>Password</label>
                            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '4px', padding: '10px' }}>
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    {role === 'citizen' && (
                        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-2)' }}>
                            No account? <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Create one</Link>
                        </p>
                    )}
                </div>

                {/* Demo credentials */}
                <div style={{ marginTop: '20px', padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: '500', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Demo accounts</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        {[
                            { label: 'Citizen', id: 'arjun@demo.com', pw: 'citizen123' },
                            { label: 'Police',  id: 'POL001',         pw: 'police123' },
                            { label: 'Admin',   id: 'ADM001',         pw: 'admin123' },
                        ].map(d => (
                            <div key={d.label} style={{ fontSize: '11px' }}>
                                <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '2px' }}>{d.label}</div>
                                <div style={{ color: 'var(--text-2)', wordBreak: 'break-all' }}>{d.id}</div>
                                <div style={{ color: 'var(--text-3)' }}>{d.pw}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
