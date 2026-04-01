import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function ProductQuickView({ open, product, onClose, onAddToCart, money, isLoggedIn }) {
  if (!product) return null;

  const imageUrl =
    product.imageUrl ||
    product.images?.[0] ||
    `https://picsum.photos/seed/shopyra-${product.id}/900/1200`;

  return (
    <Modal open={open} onClose={onClose} title={product.name}>
      <div className="quick-view-grid">
        <img src={imageUrl} alt={product.name} className="quick-view-image" loading="lazy" decoding="async" />
        <div>
          <p className="product-category">{product.category?.name || 'General'}</p>
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

