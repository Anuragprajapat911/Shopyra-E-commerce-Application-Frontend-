import React from 'react';
import Button from '../ui/Button';

const FALLBACK_FASHION_IMAGE =
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80';

function ProductCard({
  product,
  isLoggedIn,
  money,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
}) {
  const title = product.title || product.name;
  const price = product.discountPrice || product.price;
  const imageUrl = product.imageUrl || product.images?.[0] || FALLBACK_FASHION_IMAGE;

  return (
    <article className="product-card modern-card">
      <div className="product-image-wrap">
        <img
          src={imageUrl}
          alt={title}
          className="product-image-el"
          loading="lazy"
          decoding="async"
        />
        <button
          type="button"
          className={isWishlisted ? 'wishlist-btn active' : 'wishlist-btn'}
          onClick={() => onToggleWishlist(product.id)}
          aria-label="Toggle wishlist"
        >
          {isWishlisted ? '?' : '?'}
        </button>
      </div>
      <div className="product-body">
        <p className="product-category">{product.category?.name || 'Collection'}</p>
        <h4>{title}</h4>
        <div className="price-line">
          <strong>INR {money(price)}</strong>
          {product.discountPrice && <span>INR {money(product.price)}</span>}
        </div>
        <div className="card-actions">
          <Button variant="ghost" onClick={() => onQuickView(product)}>Quick View</Button>
          <Button
            onClick={() => onAddToCart(product.id, 1)}
            disabled={!isLoggedIn || product.stock <= 0}
          >
            {isLoggedIn ? 'Add to Bag' : 'Login to Buy'}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default React.memo(ProductCard);
