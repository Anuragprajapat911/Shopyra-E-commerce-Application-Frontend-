import React from 'react';

export default function SearchBar({
  value,
  suggestions = [],
  loading,
  onChange,
  onSubmit,
  onSelectSuggestion,
}) {
  return (
    <div className="search-wrap">
      <form className="search-form" onSubmit={onSubmit}>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search for sneakers, jackets, shirts..."
          aria-label="Search products"
        />
        <button type="submit">Search</button>
      </form>
      {(loading || suggestions.length > 0) && (
        <div className="search-suggestions">
          {loading && <p>Looking up suggestions...</p>}
          {!loading && suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              className="search-suggestion-item"
              onClick={() => onSelectSuggestion(item)}
            >
              <strong>{item.name}</strong>
              <span>{item.category?.name || 'General'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

