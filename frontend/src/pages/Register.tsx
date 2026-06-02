import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, MapPin, Lock, UserPlus, Star } from 'lucide-react';

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.name.length < 20 || formData.name.length > 60) {
      return setError('Name must be between 20 and 60 characters.');
    }
    if (formData.address.length > 400) {
      return setError('Address cannot exceed 400 characters.');
    }
    if (!passwordRegex.test(formData.password)) {
      return setError('Password must be 8–16 characters with at least one uppercase letter and one special character.');
    }

    setLoading(true);
    try {
      const response = await axios.post('/auth/register', formData);
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div className="logo-icon"><Star size={28} fill="white" color="white" /></div>
          <h1 className="auth-brand">StoreRating</h1>
        </div>

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join the platform and start rating stores</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">
              Full Name
              <span className="input-hint">({formData.name.length}/60, min 20)</span>
            </label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="reg-name"
                type="text"
                name="name"
                className="input-field input-with-icon"
                placeholder="Your full name (min 20 characters)"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={20}
                maxLength={60}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="reg-email"
                type="email"
                name="email"
                className="input-field input-with-icon"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">
              Address
              <span className="input-hint">({formData.address.length}/400)</span>
            </label>
            <div className="input-wrapper">
              <MapPin size={18} className="input-icon" style={{ top: '1rem' }} />
              <textarea
                id="reg-address"
                name="address"
                className="input-field input-with-icon"
                placeholder="Your full address"
                value={formData.address}
                onChange={handleChange}
                required
                maxLength={400}
                rows={2}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="reg-password"
                type="password"
                name="password"
                className="input-field input-with-icon"
                placeholder="8–16 chars, 1 uppercase, 1 special"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <small className="field-hint">8–16 characters · at least one uppercase · one special character</small>
          </div>

          <button
            id="reg-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading"><span className="spinner"></span> Creating account...</span>
            ) : (
              <><UserPlus size={18} /> Create Account</>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
