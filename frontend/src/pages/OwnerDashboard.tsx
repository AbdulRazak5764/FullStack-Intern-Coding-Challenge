import { useState, useEffect } from 'react';
import axios from 'axios';
import { Store, Star, Users, ChevronUp, ChevronDown } from 'lucide-react';

type SortOrder = 'asc' | 'desc';

const SortIcon = ({ active, order }: { active: boolean; order: SortOrder }) => (
  <span className="sort-icon">
    {active ? (order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} className="sort-icon-inactive" />}
  </span>
);

export default function OwnerDashboard() {
  const [data, setData] = useState<any>(null);
  const [raterSort, setRaterSort] = useState<{ key: string; order: SortOrder }>({ key: 'submittedAt', order: 'desc' });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('/dashboard/owner');
        setData(res.data);
      } catch (error) {
        console.error('Error fetching dashboard', error);
      }
    };
    fetchDashboard();
  }, []);

  const toggleRaterSort = (key: string) => {
    setRaterSort(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortRaters = (raters: any[]) => {
    return [...raters].sort((a, b) => {
      let aVal = a[raterSort.key];
      let bVal = b[raterSort.key];
      if (raterSort.key === 'submittedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return raterSort.order === 'asc' ? -1 : 1;
      if (aVal > bVal) return raterSort.order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  if (!data) return (
    <div className="loading-screen">
      <div className="spinner-large"></div>
      <p>Loading your dashboard...</p>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Owner Dashboard</h1>
          <p className="page-subtitle">Monitor your store performance and customer ratings</p>
        </div>
      </div>

      {data.stores.length === 0 ? (
        <div className="glass-card empty-state" style={{ padding: '4rem', textAlign: 'center' }}>
          <Store size={56} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h2>No Stores Assigned</h2>
          <p className="text-muted">You don't own any stores yet. Please contact the system administrator.</p>
        </div>
      ) : (
        data.stores.map((store: any) => (
          <div key={store.id} style={{ marginBottom: '3rem' }}>
            {/* Store Stats Header */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="stat-card glass-card" style={{ gridColumn: 'span 1' }}>
                <div className="stat-icon stat-icon-primary"><Store size={22} /></div>
                <div className="stat-info">
                  <span className="stat-label">Store Name</span>
                  <span className="stat-value" style={{ fontSize: '1.1rem' }}>{store.name}</span>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>{store.address}</span>
                </div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-icon stat-icon-warning"><Star size={22} /></div>
                <div className="stat-info">
                  <span className="stat-label">Average Rating</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="stat-value" style={{ color: '#f59e0b' }}>
                      {store.averageRating > 0 ? store.averageRating.toFixed(1) : 'N/A'}
                    </span>
                    {store.averageRating > 0 && (
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={14}
                            fill={s <= Math.round(store.averageRating) ? '#f59e0b' : 'transparent'}
                            color="#f59e0b" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-icon stat-icon-success"><Users size={22} /></div>
                <div className="stat-info">
                  <span className="stat-label">Total Ratings</span>
                  <span className="stat-value">{store.totalRatings}</span>
                </div>
              </div>
            </div>

            {/* Ratings Table */}
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Customer Ratings
            </h3>
            <div className="glass-card table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleRaterSort('name')} className="sortable-th">
                      User Name <SortIcon active={raterSort.key === 'name'} order={raterSort.order} />
                    </th>
                    <th onClick={() => toggleRaterSort('email')} className="sortable-th">
                      Email <SortIcon active={raterSort.key === 'email'} order={raterSort.order} />
                    </th>
                    <th onClick={() => toggleRaterSort('rating')} className="sortable-th">
                      Rating <SortIcon active={raterSort.key === 'rating'} order={raterSort.order} />
                    </th>
                    <th onClick={() => toggleRaterSort('submittedAt')} className="sortable-th">
                      Date <SortIcon active={raterSort.key === 'submittedAt'} order={raterSort.order} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {store.raters.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty-row">No ratings yet for this store.</td>
                    </tr>
                  ) : (
                    sortRaters(store.raters).map((rater: any, idx: number) => (
                      <tr key={idx}>
                        <td className="td-name">{rater.name}</td>
                        <td className="td-email">{rater.email}</td>
                        <td>
                          <div className="star-display">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={15}
                                fill={s <= rater.rating ? '#f59e0b' : 'transparent'}
                                color="#f59e0b" />
                            ))}
                            <span className="star-value">{rater.rating}</span>
                          </div>
                        </td>
                        <td className="text-muted">{new Date(rater.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
