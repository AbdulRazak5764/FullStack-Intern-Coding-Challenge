import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Users, Store, Star, ChevronUp, ChevronDown, Plus, X, Search, TrendingUp } from 'lucide-react';

type SortOrder = 'asc' | 'desc';

interface SortConfig {
  key: string;
  order: SortOrder;
}

const SortIcon = ({ active, order }: { active: boolean; order: SortOrder }) => (
  <span className="sort-icon">
    {active ? (
      order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    ) : (
      <ChevronDown size={14} className="sort-icon-inactive" />
    )}
  </span>
);

const roleBadgeClass: Record<string, string> = {
  SYSTEM_ADMIN: 'badge badge-admin',
  NORMAL_USER: 'badge badge-user',
  STORE_OWNER: 'badge badge-owner',
};

const roleLabel: Record<string, string> = {
  SYSTEM_ADMIN: 'Admin',
  NORMAL_USER: 'User',
  STORE_OWNER: 'Store Owner',
};

const StarDisplay = ({ rating }: { rating: number }) => (
  <div className="star-display">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} size={14} fill={s <= Math.round(rating) ? '#f59e0b' : 'transparent'} color="#f59e0b" />
    ))}
    <span className="star-value">{rating.toFixed(1)}</span>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userSort, setUserSort] = useState<SortConfig>({ key: 'name', order: 'asc' });
  const [storeSort, setStoreSort] = useState<SortConfig>({ key: 'name', order: 'asc' });

  const [activeTab, setActiveTab] = useState<'users' | 'stores'>('users');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);

  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
  const [storeForm, setStoreForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get('/dashboard/admin');
      setStats(res.data);
    } catch {}
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get('/users', {
        params: { search, role: roleFilter, sortBy: userSort.key, sortOrder: userSort.order }
      });
      setUsers(res.data);
    } catch {}
  }, [search, roleFilter, userSort]);

  const fetchStores = useCallback(async () => {
    try {
      const res = await axios.get('/stores', {
        params: { sortBy: storeSort.key, sortOrder: storeSort.order }
      });
      setStores(res.data);
    } catch {}
  }, [storeSort]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchStores(); }, [fetchStores]);

  const toggleUserSort = (key: string) => {
    setUserSort(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleStoreSort = (key: string) => {
    setStoreSort(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await axios.post('/users', userForm);
      setShowUserModal(false);
      setUserForm({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.map((e: any) => e.message).join(', ') : (msg || 'Error creating user'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await axios.post('/stores', storeForm);
      setShowStoreModal(false);
      setStoreForm({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
      fetchStats();
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.map((e: any) => e.message).join(', ') : (msg || 'Error creating store'));
    } finally {
      setFormLoading(false);
    }
  };

  const openUserModal = () => { setFormError(''); setShowUserModal(true); };
  const openStoreModal = () => { setFormError(''); setShowStoreModal(true); };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage users, stores and platform analytics</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon stat-icon-primary"><Users size={22} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{stats.totalUsers}</span>
          </div>
          <TrendingUp size={16} className="stat-trend" />
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon stat-icon-success"><Store size={22} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Stores</span>
            <span className="stat-value">{stats.totalStores}</span>
          </div>
          <TrendingUp size={16} className="stat-trend" />
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon stat-icon-warning"><Star size={22} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Ratings</span>
            <span className="stat-value">{stats.totalRatings}</span>
          </div>
          <TrendingUp size={16} className="stat-trend" />
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button
          id="tab-users"
          className={`tab-btn ${activeTab === 'users' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} /> Users Directory
        </button>
        <button
          id="tab-stores"
          className={`tab-btn ${activeTab === 'stores' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          <Store size={16} /> Stores Directory
        </button>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="tab-content">
          <div className="section-header">
            <h2 className="section-title">Users ({users.length})</h2>
            <button id="btn-add-user" className="btn btn-primary" onClick={openUserModal}>
              <Plus size={16} /> Add User
            </button>
          </div>

          <div className="filter-bar">
            <div className="input-wrapper" style={{ flex: 1, maxWidth: 360 }}>
              <Search size={16} className="input-icon" />
              <input
                id="user-search"
                type="text"
                className="input-field input-with-icon"
                placeholder="Search by name, email, address..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              id="user-role-filter"
              className="input-field"
              style={{ width: 'auto', minWidth: 160 }}
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="NORMAL_USER">Normal User</option>
              <option value="SYSTEM_ADMIN">System Admin</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
          </div>

          <div className="glass-card table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => toggleUserSort('name')} className="sortable-th">
                    Name <SortIcon active={userSort.key === 'name'} order={userSort.order} />
                  </th>
                  <th onClick={() => toggleUserSort('email')} className="sortable-th">
                    Email <SortIcon active={userSort.key === 'email'} order={userSort.order} />
                  </th>
                  <th onClick={() => toggleUserSort('address')} className="sortable-th">
                    Address <SortIcon active={userSort.key === 'address'} order={userSort.order} />
                  </th>
                  <th onClick={() => toggleUserSort('role')} className="sortable-th">
                    Role <SortIcon active={userSort.key === 'role'} order={userSort.order} />
                  </th>
                  <th>Store Rating</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="empty-row">No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u.id}>
                    <td className="td-name">{u.name}</td>
                    <td className="td-email">{u.email}</td>
                    <td className="td-address">{u.address}</td>
                    <td><span className={roleBadgeClass[u.role] || 'badge'}>{roleLabel[u.role] || u.role}</span></td>
                    <td>
                      {u.storeRating != null ? (
                        <StarDisplay rating={u.storeRating} />
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STORES TAB */}
      {activeTab === 'stores' && (
        <div className="tab-content">
          <div className="section-header">
            <h2 className="section-title">Stores ({stores.length})</h2>
            <button id="btn-add-store" className="btn btn-primary" onClick={openStoreModal}>
              <Plus size={16} /> Add Store
            </button>
          </div>

          <div className="glass-card table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => toggleStoreSort('name')} className="sortable-th">
                    Name <SortIcon active={storeSort.key === 'name'} order={storeSort.order} />
                  </th>
                  <th onClick={() => toggleStoreSort('email')} className="sortable-th">
                    Email <SortIcon active={storeSort.key === 'email'} order={storeSort.order} />
                  </th>
                  <th onClick={() => toggleStoreSort('address')} className="sortable-th">
                    Address <SortIcon active={storeSort.key === 'address'} order={storeSort.order} />
                  </th>
                  <th onClick={() => toggleStoreSort('rating')} className="sortable-th">
                    Avg Rating <SortIcon active={storeSort.key === 'rating'} order={storeSort.order} />
                  </th>
                  <th>Total Ratings</th>
                </tr>
              </thead>
              <tbody>
                {stores.length === 0 ? (
                  <tr><td colSpan={5} className="empty-row">No stores found</td></tr>
                ) : stores.map(s => (
                  <tr key={s.id}>
                    <td className="td-name">{s.name}</td>
                    <td className="td-email">{s.email}</td>
                    <td className="td-address">{s.address}</td>
                    <td>
                      {s.averageRating > 0 ? (
                        <StarDisplay rating={s.averageRating} />
                      ) : <span className="text-muted">No ratings</span>}
                    </td>
                    <td><span className="rating-count">{s.totalRatings}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USER MODAL */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}><X size={20} /></button>
            </div>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleCreateUser}>
              <div className="input-group">
                <label className="input-label">Full Name <span className="text-muted">(20–60 chars)</span></label>
                <input id="modal-user-name" type="text" className="input-field" required minLength={20} maxLength={60}
                  placeholder="Full name (minimum 20 characters)"
                  value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input id="modal-user-email" type="email" className="input-field" required
                  placeholder="email@example.com"
                  value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Password <span className="text-muted">(8–16 chars, uppercase + special)</span></label>
                <input id="modal-user-pass" type="password" className="input-field" required
                  placeholder="Secure password"
                  value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Address</label>
                <input id="modal-user-addr" type="text" className="input-field" required maxLength={400}
                  placeholder="Full address"
                  value={userForm.address} onChange={e => setUserForm({ ...userForm, address: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Role</label>
                <select id="modal-user-role" className="input-field" value={userForm.role}
                  onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                  <option value="NORMAL_USER">Normal User</option>
                  <option value="SYSTEM_ADMIN">System Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button id="modal-user-submit" type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STORE MODAL */}
      {showStoreModal && (
        <div className="modal-overlay" onClick={() => setShowStoreModal(false)}>
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Store</h3>
              <button className="modal-close" onClick={() => setShowStoreModal(false)}><X size={20} /></button>
            </div>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleCreateStore}>
              <div className="input-group">
                <label className="input-label">Store Name</label>
                <input id="modal-store-name" type="text" className="input-field" required
                  placeholder="Store name"
                  value={storeForm.name} onChange={e => setStoreForm({ ...storeForm, name: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Store Email</label>
                <input id="modal-store-email" type="email" className="input-field" required
                  placeholder="store@example.com"
                  value={storeForm.email} onChange={e => setStoreForm({ ...storeForm, email: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Address</label>
                <input id="modal-store-addr" type="text" className="input-field" required maxLength={400}
                  placeholder="Store address"
                  value={storeForm.address} onChange={e => setStoreForm({ ...storeForm, address: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Store Owner</label>
                <select id="modal-store-owner" className="input-field" required value={storeForm.ownerId}
                  onChange={e => setStoreForm({ ...storeForm, ownerId: e.target.value })}>
                  <option value="">— Select an owner —</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <small className="field-hint">The selected user's role will be changed to Store Owner.</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStoreModal(false)}>Cancel</button>
                <button id="modal-store-submit" type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
