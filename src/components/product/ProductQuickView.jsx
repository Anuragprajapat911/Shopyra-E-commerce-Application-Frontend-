import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const FALLBACK_FASHION_IMAGE =
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80';

export default function ProductQuickView({ open, product, onClose, onAddToCart, money, isLoggedIn }) {
  if (!product) return null;

  const title = product.title || product.name;
  const imageUrl = product.imageUrl || product.images?.[0] || FALLBACK_FASHION_IMAGE;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="quick-view-grid">
        <img src={imageUrl} alt={title} className="quick-view-image" loading="lazy" decoding="async" />
        <div>
          <p className="product-category">{product.category?.name || 'Collection'}</p>
          <h3>{title}</h3>
          <p className="quick-view-price">INR {money(product.discountPrice || product.price)}</p>
          <p className="muted">{product.description || 'Premium quality product.'}</p>
          <p className="stock-line">Stock: {product.stock} | SKU: {product.sku}</p>
          <Button onClick={() => onAddToCart(product.id, 1)} disabled={!isLoggedIn || product.stock <= 0}>
            {isLoggedIn ? 'Add to Bag' : 'Login to Buy'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
