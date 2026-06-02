import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Lock, Shield, CheckCircle } from 'lucide-react';

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

export default function Profile() {
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const roleLabel: Record<string, string> = {
    SYSTEM_ADMIN: 'System Administrator',
    NORMAL_USER: 'Normal User',
    STORE_OWNER: 'Store Owner',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!passwordRegex.test(passwords.newPassword)) {
      return setError('New password must be 8–16 characters, with at least one uppercase letter and one special character.');
    }

    if (passwords.oldPassword === passwords.newPassword) {
      return setError('New password must be different from current password.');
    }

    setLoading(true);
    try {
      const res = await axios.put('/auth/password', passwords);
      setMessage(res.data.message || 'Password updated successfully!');
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const roleBadgeClass: Record<string, string> = {
    SYSTEM_ADMIN: 'badge badge-admin',
    NORMAL_USER: 'badge badge-user',
    STORE_OWNER: 'badge badge-owner',
  };

  return (
    <div className="page-container" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>
      </div>

      {/* Account Info */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{user?.name}</h2>
            <p className="text-muted" style={{ margin: '0.25rem 0' }}>{user?.email}</p>
            <span className={roleBadgeClass[user?.role || ''] || 'badge'} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
              {roleLabel[user?.role || ''] || user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Shield size={20} color="var(--primary)" />
          <h3 style={{ margin: 0 }}>Change Password</h3>
        </div>

        {message && (
          <div className="alert alert-success">
            <CheckCircle size={16} /> {message}
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Current Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="profile-old-pass"
                type="password"
                name="oldPassword"
                className="input-field input-with-icon"
                placeholder="Your current password"
                value={passwords.oldPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">New Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="profile-new-pass"
                type="password"
                name="newPassword"
                className="input-field input-with-icon"
                placeholder="8–16 chars, 1 uppercase, 1 special"
                value={passwords.newPassword}
                onChange={handleChange}
                required
              />
            </div>
            <small className="field-hint">8–16 characters · at least one uppercase letter · one special character</small>
          </div>

          <button
            id="profile-save-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? (
              <span className="btn-loading"><span className="spinner"></span> Updating...</span>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
