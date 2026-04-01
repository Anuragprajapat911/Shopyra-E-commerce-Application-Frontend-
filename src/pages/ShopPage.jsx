import React from 'react';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import SearchBar from '../components/search/SearchBar';
import ProductCard from '../components/product/ProductCard';
import ProductQuickView from '../components/product/ProductQuickView';

export default function ShopPage({
  isLoggedIn,
  promoSlides,
  trendSlides,
  currentSlide,
  setCurrentSlide,
  currentTrendSlide,
  setCurrentTrendSlide,
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
  const wishlistCount = wishlist.length;
  const wishlistProducts = (productsPage?.content || [])
    .filter((item) => wishlist.includes(item.id))
    .slice(0, 4);

  return (
    <>
      <section className="promo-slider">
        <div className="promo-slide" style={{ backgroundImage: `url(${promoSlides[currentSlide].image})` }}>
          <div className="promo-overlay">
            <p>SEASON EDIT</p>
            <h3>{promoSlides[currentSlide].title}</h3>
            <span>{promoSlides[currentSlide].subtitle}</span>
          </div>
        </div>
        <div className="promo-controls">
          {promoSlides.map((slide, index) => (
            <button
              type="button"
              key={slide.title}
              className={index === currentSlide ? 'dot active-dot' : 'dot'}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="trend-slider">
        <div className="trend-slide" style={{ backgroundImage: `url(${trendSlides[currentTrendSlide].image})` }}>
          <div className="trend-overlay">
            <p>CURATED STORIES</p>
            <h3>{trendSlides[currentTrendSlide].title}</h3>
            <span>{trendSlides[currentTrendSlide].subtitle}</span>
            <Button className="trend-cta" onClick={() => {}}>Explore Edit</Button>
          </div>
        </div>
        <div className="trend-controls">
          {trendSlides.map((slide, index) => (
            <button
              type="button"
              key={slide.title}
              className={index === currentTrendSlide ? 'trend-dot active-trend-dot' : 'trend-dot'}
              onClick={() => setCurrentTrendSlide(index)}
              aria-label={`Trend slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="hero">
        <div>
          <p className="hero-kicker">THE NEW WAVE</p>
          <h2>Own the now with timeless style and effortless discovery.</h2>
          <p>Browse trend-led edits, save favorites, and shop in a clean flow designed for high intent buying.</p>
          <div className="hero-actions">
            <Button onClick={() => run(async () => Promise.all([fetchCategories(), fetchProducts()]), 'Store refreshed.').catch(() => {})}>
              Refresh Store
            </Button>
            <Button variant="ghost" onClick={() => run(() => fetchProducts({ sortBy: 'price', sortDir: 'asc', page: 0 }), 'Budget picks loaded.').catch(() => {})}>
              Budget Finds
            </Button>
          </div>
        </div>
        <div className="hero-metrics">
          <div><span>{productsPage?.content?.length || 0}</span><p>Visible products</p></div>
          <div><span>{categories.length}</span><p>Categories</p></div>
          <div><span>{cart?.itemCount || 0}</span><p>Bag items</p></div>
          <div><span>{wishlistCount}</span><p>Wishlist picks</p></div>
        </div>
      </section>

      <section className="benefits-strip panel">
        <article><strong>Express Dispatch</strong><span>Fast handoff on top styles</span></article>
        <article><strong>14-Day Returns</strong><span>Easy return from profile section</span></article>
        <article><strong>Personalized Feed</strong><span>Suggestions from your saved picks</span></article>
      </section>

      {wishlistProducts.length > 0 && (
        <section className="wishlist-spotlight panel">
          <div className="wishlist-spotlight-head">
            <h3>Saved By You</h3>
            <p>Jump back into products you liked.</p>
          </div>
          <div className="wishlist-mini-grid">
            {wishlistProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                className="wishlist-mini-card"
                onClick={() => setQuickViewProduct(product)}
              >
                <img
                  src={product.imageUrl || product.images?.[0] || `https://picsum.photos/seed/shopyra-${product.id}/900/1200`}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <strong>{product.name}</strong>
                  <span>INR {money(product.discountPrice || product.price)}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="shop-layout">
        <aside className="panel">
          <h3>Filters</h3>
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
            {categories.length === 0 && (
              <p className="muted">No categories found yet. Create categories in Admin or add products with categories.</p>
            )}
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

          <div className="products-grid modern-grid">
            {isProductsLoading && (
              <>
                <Skeleton className="product-skeleton" />
                <Skeleton className="product-skeleton" />
                <Skeleton className="product-skeleton" />
                <Skeleton className="product-skeleton" />
              </>
            )}

            {!isProductsLoading && (productsPage?.content || []).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
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

