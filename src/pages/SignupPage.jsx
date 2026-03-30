import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [aadhaar, setAadhaar] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) { setError('Passwords do not match.'); return; }
        if (aadhaar.length !== 12) { setError('Aadhaar must be 12 digits.'); return; }
        setLoading(true);
        const result = await signup(name, email, phone, aadhaar, password);
        if (result.success) {
            navigate('/citizen');
        } else {
            setError(result.error || 'Signup failed.');
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '480px' }}>

                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ fontSize: '22px', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                        Road<span style={{ color: 'var(--primary)' }}>Watch</span>
                    </div>
                    <h1 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Create account</h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                        Already have one? <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign in</Link>
                    </p>
                </div>

                <div className="card" style={{ padding: '28px' }}>

                    {error && (
                        <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '13px', padding: '10px 12px', borderRadius: '6px', marginBottom: '16px' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label className="form-label">Full name</label>
                                <input className="form-input" type="text" placeholder="Rahul Verma" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div>
                                <label className="form-label">Email</label>
                                <input className="form-input" type="email" placeholder="rahul@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label className="form-label">Mobile number</label>
                                <input className="form-input" type="tel" placeholder="9876500000" value={phone} onChange={e => setPhone(e.target.value)} required />
                            </div>
                            <div>
                                <label className="form-label">Aadhaar (12 digits)</label>
                                <input className="form-input" type="text" placeholder="xxxxxxxxxxxx" value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))} required />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label className="form-label">Password</label>
                                <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                            <div>
                                <label className="form-label">Confirm password</label>
                                <input className="form-input" type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '10px', marginTop: '4px' }}>
                            {loading ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
