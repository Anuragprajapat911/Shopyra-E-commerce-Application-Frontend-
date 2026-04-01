import React from 'react';
import Button from '../ui/Button';

function ProductCard({
  product,
  isLoggedIn,
  money,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
}) {
  const price = product.discountPrice || product.price;
  const imageUrl =
    product.imageUrl ||
    product.images?.[0] ||
    `https://picsum.photos/seed/shopyra-${product.id}/900/1200`;

  return (
    <article className="product-card modern-card">
      <div className="product-image-wrap">
        <img
          src={imageUrl}
          alt={product.name}
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
        <p className="product-category">{product.category?.name || 'General'}</p>
        <h4>{product.name}</h4>
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

