import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Star, MapPin, ChevronUp, ChevronDown } from 'lucide-react';

type SortOrder = 'asc' | 'desc';

const SortIcon = ({ active, order }: { active: boolean; order: SortOrder }) => (
  <span className="sort-icon">
    {active ? (order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} className="sort-icon-inactive" />}
  </span>
);

export default function UserDashboard() {
  const [stores, setStores] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [ratingLoading, setRatingLoading] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    try {
      const res = await axios.get('/stores', { params: { search, sortBy, sortOrder } });
      setStores(res.data);
    } catch (error) {
      console.error(error);
    }
  }, [search, sortBy, sortOrder]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleRating = async (storeId: string, rating: number) => {
    setRatingLoading(storeId);
    try {
      await axios.post('/ratings', { storeId, rating });
      fetchStores();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingLoading(null);
    }
  };

  const toggleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const RatingStars = ({ storeId, currentRating }: { storeId: string; currentRating: number | null }) => {
    const [hover, setHover] = useState(0);
    const isLoading = ratingLoading === storeId;

    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            id={`rate-${storeId}-${star}`}
            onClick={() => !isLoading && handleRating(storeId, star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            disabled={isLoading}
            className="star-btn"
            title={currentRating ? 'Modify Rating' : 'Submit Rating'}
          >
            <Star
              size={26}
              fill={star <= (hover || currentRating || 0) ? '#f59e0b' : 'transparent'}
              color={star <= (hover || currentRating || 0) ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
            />
          </button>
        ))}
        {isLoading && <span className="spinner" style={{ marginLeft: 8 }} />}
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Directory</h1>
          <p className="page-subtitle">Discover and rate stores on our platform</p>
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className="filter-bar" style={{ marginBottom: '2rem' }}>
        <div className="input-wrapper" style={{ flex: 1, maxWidth: 400 }}>
          <Search size={16} className="input-icon" />
          <input
            id="store-search"
            type="text"
            className="input-field input-with-icon"
            placeholder="Search by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sort-buttons">
          <span className="sort-label">Sort by:</span>
          {[
            { key: 'name', label: 'Name' },
            { key: 'rating', label: 'Rating' },
          ].map(({ key, label }) => (
            <button
              key={key}
              id={`sort-${key}`}
              className={`sort-chip ${sortBy === key ? 'sort-chip-active' : ''}`}
              onClick={() => toggleSort(key)}
            >
              {label} <SortIcon active={sortBy === key} order={sortOrder} />
            </button>
          ))}
        </div>
      </div>

      {/* Stores Grid */}
      <div className="stores-grid">
        {stores.map(store => (
          <div key={store.id} className="store-card glass-card">
            <div className="store-card-header">
              <div className="store-icon">
                {store.name.charAt(0).toUpperCase()}
              </div>
              <div className="store-info">
                <h3 className="store-name">{store.name}</h3>
                <div className="store-address">
                  <MapPin size={13} />
                  <span>{store.address}</span>
                </div>
              </div>
            </div>

            <div className="store-rating-display">
              <div className="avg-rating">
                <div className="avg-stars">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      size={16}
                      fill={s <= Math.round(store.averageRating) ? '#f59e0b' : 'transparent'}
                      color="#f59e0b"
                    />
                  ))}
                </div>
                <span className="avg-value">
                  {store.averageRating > 0 ? store.averageRating.toFixed(1) : 'New'}
                </span>
                <span className="avg-count">({store.totalRatings} {store.totalRatings === 1 ? 'rating' : 'ratings'})</span>
              </div>
            </div>

            <div className="store-user-rating">
              <p className="user-rating-label">
                {store.userRating ? (
                  <><Star size={13} fill="#10b981" color="#10b981" /> Your rating — click to change</>
                ) : (
                  <><Star size={13} color="rgba(255,255,255,0.4)" /> Rate this store</>
                )}
              </p>
              <RatingStars storeId={store.id} currentRating={store.userRating} />
            </div>
          </div>
        ))}

        {stores.length === 0 && (
          <div className="empty-state">
            <Search size={48} className="empty-icon" />
            <h3>No stores found</h3>
            <p>Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
