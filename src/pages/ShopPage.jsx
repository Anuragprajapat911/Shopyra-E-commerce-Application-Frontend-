import React, { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import SearchBar from '../components/search/SearchBar';
import ProductCard from '../components/product/ProductCard';
import ProductQuickView from '../components/product/ProductQuickView';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=1800&q=80',
    title: 'Minimal silhouettes for a modern wardrobe.',
    subtitle: 'Shop elevated essentials curated from your live catalog and ready for instant checkout.',
  },
  {
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1800&q=80',
    title: 'Classic tailoring with effortless edge.',
    subtitle: 'Premium edits designed for everyday luxury and seasonal layering.',
  },
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=80',
    title: 'Timeless pieces. Fresh styling.',
    subtitle: 'Discover statement-ready looks with clean forms and refined texture.',
  },
];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80';

export default function ShopPage({
  isLoggedIn,
  categories,
  productFilter,
  changeFilter,
  run,
  fetchCategories,
  fetchProducts,
  productsPage,
  money,
  onAddProductToCart,
  isProductsLoading,
  wishlist,
  onToggleWishlist,
  quickViewProduct,
  setQuickViewProduct,
  searchSuggestions,
  suggestionsLoading,
  onSearchChange,
  onSearchSubmit,
  onSearchSuggestionSelect,
  cart,
}) {
  const visibleProducts = productsPage?.content || [];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <section className="lux-hero panel">
        <div className="classic-slider">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.image}
              className={index === activeSlide ? 'classic-slide active' : 'classic-slide'}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="lux-hero-overlay">
                <p>SHOPYRA LUXE EDIT</p>
                <h2>{slide.title}</h2>
                <span>{slide.subtitle}</span>
                <div className="hero-actions">
                  <Button onClick={() => run(async () => Promise.all([fetchCategories(), fetchProducts({ page: 0 })]), 'Store refreshed.').catch(() => {})}>
                    Shop Collection
                  </Button>
                  <Button variant="ghost" onClick={() => run(() => fetchProducts({ sortBy: 'createdAt', sortDir: 'desc', page: 0 }), 'New arrivals loaded.').catch(() => {})}>
                    New Arrivals
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="classic-arrow left"
            onClick={() => setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            type="button"
            className="classic-arrow right"
            onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            aria-label="Next slide"
          >
            ›
          </button>

          <div className="classic-dots">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={`hero-dot-${index}`}
                type="button"
                className={index === activeSlide ? 'classic-dot active' : 'classic-dot'}
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="panel stats-band">
        <article><strong>{visibleProducts.length}</strong><span>Products</span></article>
        <article><strong>{categories.length}</strong><span>Categories</span></article>
        <article><strong>{cart?.itemCount || 0}</strong><span>Bag Items</span></article>
        <article><strong>{wishlist.length}</strong><span>Wishlist</span></article>
      </section>

      <section className="shop-layout">
        <aside className="panel filters-panel">
          <h3>Refine</h3>
          <SearchBar
            value={productFilter.q}
            suggestions={searchSuggestions}
            loading={suggestionsLoading}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            onSelectSuggestion={onSearchSuggestionSelect}
          />

          <div className="field">
            <label>Category</label>
            <select value={productFilter.categoryId} onChange={(e) => changeFilter({ categoryId: e.target.value, page: 0 })}>
              <option value="">All categories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Sort by</label>
            <select value={productFilter.sortBy} onChange={(e) => changeFilter({ sortBy: e.target.value })}>
              <option value="createdAt">Newest</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div className="field">
            <label>Direction</label>
            <select value={productFilter.sortDir} onChange={(e) => changeFilter({ sortDir: e.target.value })}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <Button onClick={() => run(() => fetchProducts({ page: 0 }), 'Products loaded.').catch(() => {})}>Apply Filters</Button>
        </aside>

        <div className="products-wrap">
          <div className="category-rail">
            <button type="button" onClick={() => { changeFilter({ categoryId: '', page: 0 }); run(() => fetchProducts({ categoryId: '', page: 0 }), 'Category reset.').catch(() => {}); }}>All</button>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                className={String(productFilter.categoryId) === String(cat.id) ? 'active-chip' : ''}
                onClick={() => {
                  changeFilter({ categoryId: String(cat.id), page: 0 });
                  run(() => fetchProducts({ categoryId: String(cat.id), page: 0 }), `${cat.name} loaded.`).catch(() => {});
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="products-grid modern-grid premium-grid">
            {isProductsLoading && (
              <>
                <Skeleton className="product-skeleton" />
                <Skeleton className="product-skeleton" />
                <Skeleton className="product-skeleton" />
                <Skeleton className="product-skeleton" />
              </>
            )}

            {!isProductsLoading && visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{ ...product, imageUrl: product.imageUrl || product.images?.[0] || FALLBACK_IMAGE }}
                isLoggedIn={isLoggedIn}
                money={money}
                isWishlisted={wishlist.includes(product.id)}
                onAddToCart={(id, qty) => onAddProductToCart(id, qty).catch(() => {})}
                onToggleWishlist={onToggleWishlist}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>

          <div className="pager">
            <Button variant="ghost" disabled={(productsPage?.number || 0) <= 0} onClick={() => run(() => fetchProducts({ page: (productsPage?.number || 0) - 1 }), 'Moved to previous page.').catch(() => {})}>Prev</Button>
            <p>Page {(productsPage?.number || 0) + 1} / {productsPage?.totalPages || 1}</p>
            <Button variant="ghost" disabled={(productsPage?.number || 0) >= (productsPage?.totalPages || 1) - 1} onClick={() => run(() => fetchProducts({ page: (productsPage?.number || 0) + 1 }), 'Moved to next page.').catch(() => {})}>Next</Button>
          </div>
        </div>
      </section>

      <ProductQuickView
        open={Boolean(quickViewProduct)}
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(id, qty) => onAddProductToCart(id, qty).catch(() => {})}
        money={money}
        isLoggedIn={isLoggedIn}
      />
    </>
  );
}

