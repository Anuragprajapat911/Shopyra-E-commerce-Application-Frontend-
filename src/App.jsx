
import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { createApiClient } from './api';

const AUTH_KEY = 'shopyra_auth_v1';

const readAuth = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
    return parsed && typeof parsed === 'object'
      ? { accessToken: parsed.accessToken || '', refreshToken: parsed.refreshToken || '', user: parsed.user || null }
      : { accessToken: '', refreshToken: '', user: null };
  } catch {
    return { accessToken: '', refreshToken: '', user: null };
  }
};

const money = (value) => {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

const roleName = (user) => user?.role || 'GUEST';

const parseImages = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const initialAuthForm = {
  login: { email: '', password: '' },
  register: { name: '', email: '', password: '', phone: '', address: '' },
};

const SHOPYRA_LOGO_URL =
  'https://dummyimage.com/240x240/111111/ffffff&text=SHOPYRA';

const promoSlides = [
  {
    title: 'Spring Streetwear Edit',
    subtitle: 'Fresh arrivals inspired by metro looks.',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Minimal Premium Essentials',
    subtitle: 'Everyday staples with elevated styling.',
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Footwear Focus',
    subtitle: 'Step into comfort with signature pairs.',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
  },
];

const trendSlides = [
  {
    title: 'City Luxe',
    subtitle: 'Elevated street style for everyday confidence.',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Monochrome Mood',
    subtitle: 'Clean silhouettes. Sharp contrast. Zero effort.',
    image:
      'https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Weekend Denim',
    subtitle: 'Relaxed textures built for all-day comfort.',
    image:
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Bold Workwear',
    subtitle: 'Office-ready edits with runway attitude.',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Sneaker Stories',
    subtitle: 'Top picks to complete every fit.',
    image:
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Resort Edit',
    subtitle: 'Light layers and vacation-ready palettes.',
    image:
      'https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'After-Hours Glam',
    subtitle: 'Statement looks for evening plans.',
    image:
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Athleisure Club',
    subtitle: 'Performance comfort meets street appeal.',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Soft Neutrals',
    subtitle: 'Minimal shades for timeless outfits.',
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Festival Heat',
    subtitle: 'Color-rich drops designed to stand out.',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80',
  },
];

const headerFeatures = ['New Arrivals', 'Top Picks', 'Express Delivery', 'Style Guide'];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function App() {
  const [auth, setAuthState] = useState(readAuth);
  const [activeView, setActiveView] = useState('shop');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ type: 'info', text: 'Welcome to Shopyra.' });

  const [categories, setCategories] = useState([]);
  const [productsPage, setProductsPage] = useState({ content: [], number: 0, totalPages: 0 });
  const [cart, setCart] = useState(null);
  const [myOrdersPage, setMyOrdersPage] = useState({ content: [] });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [adminUsersPage, setAdminUsersPage] = useState({ content: [] });
  const [adminProductsPage, setAdminProductsPage] = useState({ content: [] });
  const [adminOrdersPage, setAdminOrdersPage] = useState({ content: [] });

  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [productFilter, setProductFilter] = useState({ page: 0, size: 12, sortBy: 'createdAt', sortDir: 'desc', q: '', categoryId: '' });
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [cartAddForm, setCartAddForm] = useState({ productId: '', quantity: 1 });
  const [orderForm, setOrderForm] = useState({ shippingAddress: '' });
  const [paymentForm, setPaymentForm] = useState({
    orderNumber: '',
    razorpayOrderId: '',
    razorpayPaymentId: '',
    razorpaySignature: '',
    signature: '',
    orderId: '',
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTrendSlide, setCurrentTrendSlide] = useState(0);

  const [adminUserId, setAdminUserId] = useState('');
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', slug: '', description: '', parentId: '' });
  const [adminProductForm, setAdminProductForm] = useState({
    id: '', name: '', description: '', sku: '', price: '', discountPrice: '', stock: '', imageUrl: '', imagesCsv: '', categoryId: '', active: true,
  });
  const [adminOrderUpdate, setAdminOrderUpdate] = useState({ id: '', status: 'PENDING' });

  const setAuth = (next) => {
    setAuthState(next);
    localStorage.setItem(AUTH_KEY, JSON.stringify(next));
  };

  const clearAuth = () => {
    setAuthState({ accessToken: '', refreshToken: '', user: null });
    localStorage.removeItem(AUTH_KEY);
    setActiveView('shop');
  };

  const api = useMemo(() => createApiClient({ getAuth: () => auth, setAuth, clearAuth }), [auth]);

  const run = async (task, successMessage) => {
    setLoading(true);
    setNotice({ type: 'info', text: 'Please wait...' });
    try {
      const result = await task();
      setNotice({ type: 'success', text: successMessage || 'Done successfully.' });
      return result;
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Something went wrong.' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = String(roleName(auth.user)).toUpperCase().includes('ADMIN');
  const isLoggedIn = Boolean(auth.accessToken);

  const fetchCategories = async () => {
    const res = await api.categories.list();
    setCategories(res.data || []);
  };

  const fetchProducts = async (overrides = {}) => {
    const next = { ...productFilter, ...overrides };
    let res;
    if (next.q) {
      res = await api.products.search({ q: next.q, page: next.page, size: next.size });
    } else if (next.categoryId) {
      res = await api.products.getByCategory(next.categoryId, { page: next.page, size: next.size });
    } else {
      res = await api.products.list({ page: next.page, size: next.size, sortBy: next.sortBy, sortDir: next.sortDir });
    }
    setProductFilter(next);
    setProductsPage(res.data || { content: [] });
  };

  const fetchCart = async () => {
    if (!isLoggedIn) return;
    const res = await api.cart.get();
    setCart(res.data || null);
  };

  const fetchMyOrders = async () => {
    if (!isLoggedIn) return;
    const res = await api.orders.listMine({ page: 0, size: 20 });
    setMyOrdersPage(res.data || { content: [] });
  };

  const fetchAdminData = async () => {
    if (!isAdmin) return;
    const [usersRes, productsRes, ordersRes] = await Promise.allSettled([
      api.admin.getUsers({ page: 0, size: 20 }),
      api.products.listAdmin({ page: 0, size: 20 }),
      api.orders.listAll({ page: 0, size: 20 }),
    ]);

    if (usersRes.status === 'fulfilled') {
      setAdminUsersPage(usersRes.value.data || { content: [] });
    } else {
      setAdminUsersPage({ content: [] });
    }

    if (productsRes.status === 'fulfilled') {
      setAdminProductsPage(productsRes.value.data || { content: [] });
    } else {
      setAdminProductsPage({ content: [] });
    }

    if (ordersRes.status === 'fulfilled') {
      setAdminOrdersPage(ordersRes.value.data || { content: [] });
    } else {
      setAdminOrdersPage({ content: [] });
    }

    const errors = [];
    if (usersRes.status === 'rejected') errors.push(`Users: ${usersRes.reason?.message || 'failed'}`);
    if (productsRes.status === 'rejected') errors.push(`Products: ${productsRes.reason?.message || 'failed'}`);
    if (ordersRes.status === 'rejected') errors.push(`Orders: ${ordersRes.reason?.message || 'failed'}`);

    if (errors.length) {
      setNotice({ type: 'error', text: `Admin partial load. ${errors.join(' | ')}` });
    }
  };

  useEffect(() => {
    fetchCategories().catch(() => {});
    fetchProducts().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    api.user
      .me()
      .then((res) => {
        const next = { ...auth, user: res.data || auth.user };
        setAuth(next);
        setProfileForm({
          name: res.data?.name || '',
          phone: res.data?.phone || '',
          address: res.data?.address || '',
        });
        setOrderForm({ shippingAddress: res.data?.address || '' });
      })
      .catch(() => clearAuth());

    fetchCart().catch(() => {});
    fetchMyOrders().catch(() => {});
    if (isAdmin) fetchAdminData().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.accessToken]);

  useEffect(() => {
    if (activeView !== 'admin' || !isAdmin || !auth.accessToken) return;
    fetchAdminData().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, isAdmin, auth.accessToken]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTrendSlide((prev) => (prev + 1) % trendSlides.length);
    }, 3800);

    return () => window.clearInterval(timer);
  }, []);

  const onLogin = async (event) => {
    event.preventDefault();
    const res = await run(() => api.auth.login(authForm.login), 'Signed in successfully.');
    setAuth({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken, user: res.data.user });
    setAuthForm((prev) => ({ ...prev, login: { email: '', password: '' } }));
    setActiveView('shop');
  };

  const onRegister = async (event) => {
    event.preventDefault();
    const res = await run(() => api.auth.register(authForm.register), 'Account created successfully.');
    setAuth({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken, user: res.data.user });
    setAuthForm(initialAuthForm);
    setActiveView('shop');
  };

  const onLogout = () => {
    clearAuth();
    setNotice({ type: 'success', text: 'Logged out.' });
  };

  const onAddProductToCart = async (productId, quantity = 1) => {
    await run(() => api.cart.addItem({ productId: Number(productId), quantity: Number(quantity) }), 'Added to bag.');
    await fetchCart();
  };

  const onUpdateProfile = async (event) => {
    event.preventDefault();
    const res = await run(() => api.user.updateMe(profileForm), 'Profile updated.');
    setAuth({ ...auth, user: res.data });
  };

  const onChangePassword = async (event) => {
    event.preventDefault();
    await run(() => api.user.changePassword(passwordForm), 'Password updated.');
    setPasswordForm({ currentPassword: '', newPassword: '' });
  };

  const onAddToCart = async (event) => {
    event.preventDefault();
    await onAddProductToCart(cartAddForm.productId, cartAddForm.quantity);
  };

  const onUpdateCartItem = async (productId, quantity) => {
    await run(() => api.cart.updateItem(productId, { quantity: Number(quantity) }), 'Cart updated.');
    await fetchCart();
  };

  const onRemoveCartItem = async (productId) => {
    await run(() => api.cart.removeItem(productId), 'Item removed.');
    await fetchCart();
  };
  const onClearCart = async () => {
    await run(() => api.cart.clear(), 'Bag cleared.');
    await fetchCart();
  };

  const createOrderInternal = async () => {
    const res = await run(() => api.orders.create(orderForm), 'Order placed successfully.');
    setSelectedOrder(res.data);
    setPaymentForm((prev) => ({ ...prev, orderNumber: res.data?.orderNumber || '', orderId: String(res.data?.id || '') }));
    await Promise.all([fetchMyOrders(), fetchCart()]);
    return res.data;
  };

  const onCreateOrder = async (event) => {
    event.preventDefault();
    await createOrderInternal();
  };

  const onCreateOrderAndPay = async () => {
    const createdOrder = await createOrderInternal();
    if (createdOrder?.orderNumber) {
      await onOpenRazorpayCheckout(createdOrder.orderNumber);
    } else {
      setNotice({ type: 'error', text: 'Order created but order number missing for payment.' });
    }
  };

  const onGetOrder = async (orderId) => {
    const res = await run(() => api.orders.getById(orderId), 'Order loaded.');
    setSelectedOrder(res.data);
  };

  const onCancelOrder = async (orderId) => {
    await run(() => api.orders.cancel(orderId), 'Order cancelled.');
    await fetchMyOrders();
  };

  const onCreatePaymentOrder = async (event) => {
    event.preventDefault();
    const res = await run(() => api.payments.createOrder({ orderNumber: paymentForm.orderNumber }), 'Razorpay order created.');
    setSelectedPayment(res.data);
    setPaymentForm((prev) => ({ ...prev, razorpayOrderId: res.data?.razorpayOrderId || prev.razorpayOrderId }));
  };

  const onVerifyPayment = async (event) => {
    event.preventDefault();
    const signature = String(paymentForm.razorpaySignature || paymentForm.signature || '').trim();
    const payload = {
      razorpayOrderId: paymentForm.razorpayOrderId,
      razorpayPaymentId: paymentForm.razorpayPaymentId,
    };

    let res;
    try {
      res = await run(() => api.payments.verify({ ...payload, razorpaySignature: signature }), 'Payment verified.');
    } catch (error) {
      const message = String(error?.message || '').toLowerCase();
      const shouldRetryWithGenericSignatureKey =
        Boolean(signature) && (message.includes('signature') || message.includes('field') || message.includes('property') || message.includes('missing'));

      if (!shouldRetryWithGenericSignatureKey) throw error;
      res = await run(() => api.payments.verify({ ...payload, signature }), 'Payment verified.');
    }

    setSelectedPayment(res.data);
    setPaymentForm((prev) => ({ ...prev, razorpaySignature: signature, signature }));
    await fetchMyOrders();
  };

  const onGetPaymentByOrder = async (event) => {
    event.preventDefault();
    const res = await run(() => api.payments.getByOrder(paymentForm.orderId), 'Payment loaded.');
    setSelectedPayment(res.data);
  };

  const onOpenRazorpayCheckout = async (orderNumberInput) => {
    const orderNumber = String(orderNumberInput || paymentForm.orderNumber || '').trim();
    if (!orderNumber) {
      setNotice({ type: 'error', text: 'Please provide order number before checkout.' });
      return;
    }

    const createRes = await run(
      () => api.payments.createOrder({ orderNumber }),
      'Payment order created. Opening Razorpay...',
    );

    const paymentOrder = createRes.data || {};
    const razorpayOrderId =
      paymentOrder.razorpayOrderId || paymentOrder.orderId || paymentOrder.id || '';
    const razorpayKeyId =
      paymentOrder.keyId || paymentOrder.key || import.meta.env.VITE_RAZORPAY_KEY_ID || '';

    if (!razorpayOrderId || !razorpayKeyId) {
      setNotice({
        type: 'error',
        text: 'Razorpay order id/key missing from backend response.',
      });
      return;
    }

    setSelectedPayment(paymentOrder);
    setPaymentForm((prev) => ({
      ...prev,
      orderNumber,
      razorpayOrderId,
    }));

    const isSdkLoaded = await loadRazorpayScript();
    if (!isSdkLoaded) {
      setNotice({ type: 'error', text: 'Unable to load Razorpay SDK. Check internet and try again.' });
      return;
    }

    const options = {
      key: razorpayKeyId,
      currency: paymentOrder.currency || 'INR',
      name: 'Shopyra Store',
      description: `Order ${paymentOrder.orderNumber}`,
      order_id: razorpayOrderId,
      prefill: {
        name: auth.user?.name || '',
        email: auth.user?.email || '',
        contact: auth.user?.phone || '',
      },
      theme: { color: '#111111' },
      handler: async (response) => {
        try {
          const verifyRes = await api.payments.verify({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          setSelectedPayment(verifyRes.data);
          setPaymentForm((prev) => ({
            ...prev,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            signature: response.razorpay_signature,
          }));
          setNotice({ type: 'success', text: 'Payment successful and verified.' });
          await fetchMyOrders();
        } catch (error) {
          setNotice({ type: 'error', text: error.message || 'Payment verification failed.' });
        }
      },
      modal: {
        ondismiss: () => setNotice({ type: 'info', text: 'Payment popup closed.' }),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onAdminFetchUserById = async (event) => {
    event.preventDefault();
    const res = await run(() => api.admin.getUserById(adminUserId), 'User loaded.');
    setNotice({ type: 'success', text: `User found: ${res.data?.name || '-'} (${res.data?.email || '-'})` });
  };

  const onAdminPromoteUser = async () => {
    await run(() => api.admin.promoteUser(adminUserId), 'User promoted to admin.');
    await fetchAdminData();
  };

  const onAdminDeleteUser = async () => {
    await run(() => api.admin.deleteUser(adminUserId), 'User deleted.');
    await fetchAdminData();
  };

  const onCreateCategory = async (event) => {
    event.preventDefault();
    await run(
      () =>
        api.categories.create({
          name: categoryForm.name,
          slug: categoryForm.slug,
          description: categoryForm.description,
          parentId: categoryForm.parentId ? Number(categoryForm.parentId) : null,
        }),
      'Category created.',
    );
    await fetchCategories();
  };

  const onUpdateCategory = async (event) => {
    event.preventDefault();
    await run(
      () =>
        api.categories.update(Number(categoryForm.id), {
          name: categoryForm.name || null,
          slug: categoryForm.slug || null,
          description: categoryForm.description || null,
          parentId: categoryForm.parentId ? Number(categoryForm.parentId) : null,
        }),
      'Category updated.',
    );
    await fetchCategories();
  };

  const onDeleteCategory = async () => {
    await run(() => api.categories.remove(Number(categoryForm.id)), 'Category deleted.');
    await fetchCategories();
  };

  const productPayload = {
    name: adminProductForm.name,
    description: adminProductForm.description,
    sku: adminProductForm.sku,
    price: adminProductForm.price ? Number(adminProductForm.price) : null,
    discountPrice: adminProductForm.discountPrice ? Number(adminProductForm.discountPrice) : null,
    stock: adminProductForm.stock ? Number(adminProductForm.stock) : null,
    imageUrl: adminProductForm.imageUrl,
    images: parseImages(adminProductForm.imagesCsv),
    categoryId: adminProductForm.categoryId ? Number(adminProductForm.categoryId) : null,
    active: Boolean(adminProductForm.active),
  };

  const onCreateProduct = async (event) => {
    event.preventDefault();
    await run(() => api.products.create(productPayload), 'Product created.');
    await Promise.all([fetchProducts(), fetchAdminData()]);
  };

  const onUpdateProduct = async () => {
    await run(() => api.products.update(Number(adminProductForm.id), productPayload), 'Product updated.');
    await Promise.all([fetchProducts(), fetchAdminData()]);
  };

  const onSoftDeleteProduct = async () => {
    await run(() => api.products.softDelete(Number(adminProductForm.id)), 'Product deactivated.');
    await Promise.all([fetchProducts(), fetchAdminData()]);
  };

  const onHardDeleteProduct = async () => {
    await run(() => api.products.hardDelete(Number(adminProductForm.id)), 'Product permanently deleted.');
    await Promise.all([fetchProducts(), fetchAdminData()]);
  };

  const onRestoreProduct = async () => {
    await run(() => api.products.restore(Number(adminProductForm.id)), 'Product restored.');
    await Promise.all([fetchProducts(), fetchAdminData()]);
  };

  const onAdminUpdateOrderStatus = async (event) => {
    event.preventDefault();
    await run(() => api.orders.updateStatus(Number(adminOrderUpdate.id), { status: adminOrderUpdate.status }), 'Order status updated.');
    await fetchAdminData();
  };

  const changeFilter = (patch) => setProductFilter((prev) => ({ ...prev, ...patch }));
  const adminStats = {
    users: adminUsersPage?.content?.length || 0,
    products: adminProductsPage?.content?.length || 0,
    activeProducts: (adminProductsPage?.content || []).filter((item) => item.active).length,
    orders: adminOrdersPage?.content?.length || 0,
  };
  const firstName = auth.user?.name?.split(' ')?.[0] || 'Guest';
  const userStats = {
    bagItems: cart?.itemCount || 0,
    totalOrders: myOrdersPage?.content?.length || 0,
    paidOrders: (myOrdersPage?.content || []).filter((item) => item.paid).length,
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div className="brand-wrap">
            <img className="brand-logo-img" src={SHOPYRA_LOGO_URL} alt="Shopyra logo" />
            <div>
              <p className="brand-name">SHOPYRA</p>
              <p className="brand-sub">Fashion that moves with you</p>
            </div>
          </div>
          <p className="header-user-chip">{isLoggedIn ? `Hi, ${firstName}` : 'Guest Mode'}</p>
        </div>
        <div className="header-main">
          <div className="header-nav">
            <button type="button" className={activeView === 'shop' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('shop')}>Shop</button>
            <button type="button" className={activeView === 'user' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('user')} disabled={!isLoggedIn}>Profile</button>
            <button type="button" className={activeView === 'admin' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('admin')} disabled={!isAdmin}>Admin</button>
          </div>
          <div className="feature-nav">
            {headerFeatures.map((feature) => (
              <button type="button" className="feature-pill" key={feature} onClick={() => setActiveView('shop')}>{feature}</button>
            ))}
          </div>
          <div className="header-actions">
            {!isLoggedIn ? <button type="button" className="nav-btn action-btn" onClick={() => setActiveView('auth')}>Sign In</button> : <button type="button" className="nav-btn action-btn" onClick={onLogout}>Logout</button>}
          </div>
        </div>
      </header>

      <div className={`toast ${notice.type}`}>{loading ? 'Processing your request...' : notice.text}</div>

      {activeView === 'shop' && (
        <>
          <section className="promo-slider">
            <div
              className="promo-slide"
              style={{ backgroundImage: `url(${promoSlides[currentSlide].image})` }}
            >
              <div className="promo-overlay">
                <p>ONLINE BANNER</p>
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
            <div
              className="trend-slide"
              style={{ backgroundImage: `url(${trendSlides[currentTrendSlide].image})` }}
            >
              <div className="trend-overlay">
                <p>FASHION STORIES</p>
                <h3>{trendSlides[currentTrendSlide].title}</h3>
                <span>{trendSlides[currentTrendSlide].subtitle}</span>
                <button type="button" className="trend-cta">Shop This Look</button>
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
              <p className="hero-kicker">NEW DROP</p>
              <h2>Curated trends, live pricing, instant checkout flow</h2>
              <p>
                Browse products, filter by category, add to bag, place orders, and verify payments.
                Every action is connected to your Spring Boot API.
              </p>
              <div className="hero-actions">
                <button type="button" onClick={() => run(async () => Promise.all([fetchCategories(), fetchProducts()]), 'Store refreshed.').catch(() => {})}>Refresh Store</button>
                {!isLoggedIn && <button type="button" className="ghost" onClick={() => setActiveView('auth')}>Create account</button>}
              </div>
            </div>
            <div className="hero-metrics">
              <div><span>{productsPage?.content?.length || 0}</span><p>Visible products</p></div>
              <div><span>{categories.length}</span><p>Categories</p></div>
              <div><span>{cart?.itemCount || 0}</span><p>Bag items</p></div>
            </div>
          </section>

          <section className="shop-layout">
            <aside className="panel">
              <h3>Filters</h3>
              <div className="field">
                <label>Search</label>
                <input value={productFilter.q} onChange={(e) => changeFilter({ q: e.target.value, page: 0 })} placeholder="Sneakers, shirt, jacket..." />
              </div>
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
              <button type="button" onClick={() => run(() => fetchProducts({ page: 0 }), 'Products loaded.').catch(() => {})}>Apply Filters</button>
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

              <div className="products-grid">
                {(productsPage?.content || []).map((product) => {
                  const price = product.discountPrice || product.price;
                  const imageUrl =
                    product.imageUrl ||
                    product.images?.[0] ||
                    `https://picsum.photos/seed/shopyra-${product.id}/900/1200`;
                  return (
                    <article key={product.id} className="product-card">
                      <div className="product-image" style={{ backgroundImage: `url(${imageUrl})` }}>
                        {!product.imageUrl && !(product.images?.[0]) && <span>Online image</span>}
                      </div>
                      <div className="product-body">
                        <p className="product-category">{product.category?.name || 'General'}</p>
                        <h4>{product.name}</h4>
                        <p className="muted">{product.description || 'Premium quality product.'}</p>
                        <div className="price-line">
                          <strong>INR {money(price)}</strong>
                          {product.discountPrice && <span>INR {money(product.price)}</span>}
                        </div>
                        <div className="stock-line">Stock: {product.stock} | SKU: {product.sku}</div>
                        <button
                          type="button"
                          disabled={!isLoggedIn || product.stock <= 0}
                          onClick={() => onAddProductToCart(product.id, 1).catch(() => {})}
                        >
                          {isLoggedIn ? 'Add to Bag' : 'Login to Buy'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="pager">
                <button type="button" disabled={(productsPage?.number || 0) <= 0} onClick={() => run(() => fetchProducts({ page: (productsPage?.number || 0) - 1 }), 'Moved to previous page.').catch(() => {})}>Prev</button>
                <p>Page {(productsPage?.number || 0) + 1} / {productsPage?.totalPages || 1}</p>
                <button type="button" disabled={(productsPage?.number || 0) >= (productsPage?.totalPages || 1) - 1} onClick={() => run(() => fetchProducts({ page: (productsPage?.number || 0) + 1 }), 'Moved to next page.').catch(() => {})}>Next</button>
              </div>
            </div>
          </section>
        </>
      )}
      {activeView === 'auth' && (
        <section className="auth-grid">
          <form className="panel" onSubmit={onLogin}>
            <h3>Sign In</h3>
            <input type="email" placeholder="Email" value={authForm.login.email} onChange={(e) => setAuthForm((prev) => ({ ...prev, login: { ...prev.login, email: e.target.value } }))} required />
            <input type="password" placeholder="Password" value={authForm.login.password} onChange={(e) => setAuthForm((prev) => ({ ...prev, login: { ...prev.login, password: e.target.value } }))} required />
            <button type="submit">Login</button>
          </form>

          <form className="panel" onSubmit={onRegister}>
            <h3>Create Account</h3>
            <input placeholder="Full name" value={authForm.register.name} onChange={(e) => setAuthForm((prev) => ({ ...prev, register: { ...prev.register, name: e.target.value } }))} required />
            <input type="email" placeholder="Email" value={authForm.register.email} onChange={(e) => setAuthForm((prev) => ({ ...prev, register: { ...prev.register, email: e.target.value } }))} required />
            <input type="password" placeholder="Password" value={authForm.register.password} onChange={(e) => setAuthForm((prev) => ({ ...prev, register: { ...prev.register, password: e.target.value } }))} required />
            <input placeholder="Phone" value={authForm.register.phone} onChange={(e) => setAuthForm((prev) => ({ ...prev, register: { ...prev.register, phone: e.target.value } }))} />
            <input placeholder="Address" value={authForm.register.address} onChange={(e) => setAuthForm((prev) => ({ ...prev, register: { ...prev.register, address: e.target.value } }))} />
            <button type="submit">Register</button>
          </form>
        </section>
      )}

      {activeView === 'user' && isLoggedIn && (
        <section className="profile-layout">
          <article className="profile-hero">
            <div className="profile-identity">
              <div className="profile-avatar" aria-hidden="true">{firstName.slice(0, 1).toUpperCase()}</div>
              <div>
                <p className="profile-kicker">MY ACCOUNT</p>
                <h3>{auth.user?.name}</h3>
                <p>{auth.user?.email} | Role: {roleName(auth.user)}</p>
              </div>
            </div>
            <div className="profile-stats">
              <div><strong>{userStats.bagItems}</strong><span>Bag Items</span></div>
              <div><strong>{userStats.totalOrders}</strong><span>Total Orders</span></div>
              <div><strong>{userStats.paidOrders}</strong><span>Paid Orders</span></div>
            </div>
          </article>
          <div className="dashboard-grid">
            <article className="panel profile-panel">
              <h3>Profile Settings</h3>
              <div className="profile-forms">
                <form className="stack-form" onSubmit={onUpdateProfile}>
                  <h4>Personal Details</h4>
                  <input placeholder="Name" value={profileForm.name} onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))} required />
                  <input placeholder="Phone" value={profileForm.phone} onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))} />
                  <input placeholder="Address" value={profileForm.address} onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))} />
                  <button type="submit">Save profile</button>
                </form>
                <form className="stack-form" onSubmit={onChangePassword}>
                  <h4>Security</h4>
                  <input type="password" placeholder="Current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))} required />
                  <input type="password" placeholder="New password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))} required />
                  <button type="submit">Change password</button>
                </form>
              </div>
            </article>

          <article className="panel">
            <h3>My Bag</h3>
            <form className="inline-form" onSubmit={onAddToCart}>
              <input placeholder="Product ID" value={cartAddForm.productId} onChange={(e) => setCartAddForm((prev) => ({ ...prev, productId: e.target.value }))} required />
              <input type="number" min="1" placeholder="Qty" value={cartAddForm.quantity} onChange={(e) => setCartAddForm((prev) => ({ ...prev, quantity: e.target.value }))} required />
              <button type="submit">Add</button>
              <button type="button" className="ghost" onClick={onClearCart}>Clear</button>
            </form>

            <div className="mini-list">
              {(cart?.items || []).map((item) => (
                <div key={item.id} className="mini-item">
                  <div>
                    <strong>{item.product?.name}</strong>
                    <p>Subtotal: INR {money(item.subtotal)}</p>
                  </div>
                  <div className="mini-actions">
                    <input type="number" min="0" defaultValue={item.quantity} onBlur={(e) => onUpdateCartItem(item.product?.id, e.target.value).catch(() => {})} />
                    <button type="button" className="ghost" onClick={() => onRemoveCartItem(item.product?.id).catch(() => {})}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <p className="summary">Total: INR {money(cart?.total)} | Items: {cart?.itemCount || 0}</p>
          </article>

          <article className="panel">
            <h3>Orders</h3>
            <form className="inline-form" onSubmit={onCreateOrder}>
              <input placeholder="Shipping address" value={orderForm.shippingAddress} onChange={(e) => setOrderForm({ shippingAddress: e.target.value })} required />
              <button type="submit">Place order</button>
              <button type="button" onClick={() => onCreateOrderAndPay().catch(() => {})}>Place order & Pay</button>
            </form>
            <div className="mini-list">
              {(myOrdersPage?.content || []).map((order) => (
                <div key={order.id} className="mini-item">
                  <div>
                    <strong>{order.orderNumber}</strong>
                    <p>{order.status} | INR {money(order.totalAmount)} | {order.paid ? 'Paid' : 'Unpaid'}</p>
                  </div>
                  <div className="mini-actions">
                    <button type="button" onClick={() => onGetOrder(order.id).catch(() => {})}>View</button>
                    <button type="button" className="ghost" onClick={() => onCancelOrder(order.id).catch(() => {})}>Cancel</button>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => setPaymentForm((prev) => ({ ...prev, orderId: String(order.id), orderNumber: order.orderNumber || '', razorpayOrderId: order.razorpayOrderId || '' }))}
                    >
                      Pay
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenRazorpayCheckout(order.orderNumber).catch(() => {})}
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {selectedOrder && <p className="summary">Selected: {selectedOrder.orderNumber} | {selectedOrder.status}</p>}
          </article>

          <article className="panel">
            <h3>Payments</h3>
            <form className="stack-form" onSubmit={onCreatePaymentOrder}>
              <input placeholder="Order number" value={paymentForm.orderNumber} onChange={(e) => setPaymentForm((prev) => ({ ...prev, orderNumber: e.target.value }))} required />
              <button type="submit">Create Razorpay Order</button>
            </form>
            <form className="stack-form" onSubmit={onVerifyPayment}>
              <input placeholder="Razorpay Order ID" value={paymentForm.razorpayOrderId} onChange={(e) => setPaymentForm((prev) => ({ ...prev, razorpayOrderId: e.target.value }))} required />
              <input placeholder="Razorpay Payment ID" value={paymentForm.razorpayPaymentId} onChange={(e) => setPaymentForm((prev) => ({ ...prev, razorpayPaymentId: e.target.value }))} required />
              <input
                placeholder="Razorpay Signature"
                value={paymentForm.razorpaySignature || paymentForm.signature}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    razorpaySignature: e.target.value,
                    signature: e.target.value,
                  }))
                }
                required
              />
              <button type="submit">Verify payment</button>
            </form>
            <button
              type="button"
              onClick={() => onOpenRazorpayCheckout(paymentForm.orderNumber).catch(() => {})}
            >
              Pay with Razorpay Popup
            </button>
            <form className="inline-form" onSubmit={onGetPaymentByOrder}>
              <input placeholder="Order ID" value={paymentForm.orderId} onChange={(e) => setPaymentForm((prev) => ({ ...prev, orderId: e.target.value }))} required />
              <button type="submit" className="ghost">Fetch payment</button>
            </form>
            {selectedPayment && <p className="summary">Payment: {selectedPayment.status || '-'} | INR {money(selectedPayment.amount)}</p>}
          </article>
          </div>
        </section>
      )}

      {activeView === 'admin' && isAdmin && (
        <section className="kibana-admin">
          <aside className="kibana-sidebar">
            <h3>Observability</h3>
            <p>Shopyra Admin Space</p>
            <button type="button">Dashboard</button>
            <button type="button">Users</button>
            <button type="button">Catalog</button>
            <button type="button">Orders</button>
            <button type="button" onClick={() => run(fetchAdminData, 'Admin data refreshed.').catch(() => {})}>
              Refresh Index
            </button>
          </aside>

          <div className="kibana-main">
            <header className="kibana-topbar">
              <div>
                <p>Analytics Workspace</p>
                <h3>Admin Dashboard</h3>
              </div>
              <span>{new Date().toLocaleString()}</span>
            </header>

            <div className="kpi-grid">
              <article>
                <p>Total Users</p>
                <strong>{adminStats.users}</strong>
              </article>
              <article>
                <p>Total Products</p>
                <strong>{adminStats.products}</strong>
              </article>
              <article>
                <p>Active Products</p>
                <strong>{adminStats.activeProducts}</strong>
              </article>
              <article>
                <p>Tracked Orders</p>
                <strong>{adminStats.orders}</strong>
              </article>
            </div>

            <div className="kibana-panels">
              <article className="kpanel">
                <h4>User Management</h4>
                <form className="inline-form" onSubmit={onAdminFetchUserById}>
                  <input placeholder="User ID" value={adminUserId} onChange={(e) => setAdminUserId(e.target.value)} required />
                  <button type="submit">Get</button>
                  <button type="button" onClick={onAdminPromoteUser}>Promote</button>
                  <button type="button" className="ghost" onClick={onAdminDeleteUser}>Delete</button>
                </form>
                <div className="mini-list compact">
                  {(adminUsersPage?.content || []).map((user) => <p key={user.id}>#{user.id} {user.name} | {user.email} | {user.role}</p>)}
                </div>
              </article>

              <article className="kpanel">
                <h4>Category Operations</h4>
                <form className="stack-form" onSubmit={onCreateCategory}>
                  <input placeholder="Name" value={categoryForm.name} onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))} required />
                  <input placeholder="Slug" value={categoryForm.slug} onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))} required />
                  <input placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))} />
                  <input placeholder="Parent ID" value={categoryForm.parentId} onChange={(e) => setCategoryForm((prev) => ({ ...prev, parentId: e.target.value }))} />
                  <button type="submit">Create category</button>
                </form>
                <form className="inline-form" onSubmit={onUpdateCategory}>
                  <input placeholder="Category ID" value={categoryForm.id} onChange={(e) => setCategoryForm((prev) => ({ ...prev, id: e.target.value }))} required />
                  <button type="submit">Update</button>
                  <button type="button" className="ghost" onClick={onDeleteCategory}>Delete</button>
                </form>
              </article>

              <article className="kpanel kpanel-wide">
                <h4>Product Operations</h4>
                <form className="stack-form" onSubmit={onCreateProduct}>
                  <input placeholder="Product ID (for update/delete)" value={adminProductForm.id} onChange={(e) => setAdminProductForm((prev) => ({ ...prev, id: e.target.value }))} />
                  <input placeholder="Name" value={adminProductForm.name} onChange={(e) => setAdminProductForm((prev) => ({ ...prev, name: e.target.value }))} />
                  <input placeholder="Description" value={adminProductForm.description} onChange={(e) => setAdminProductForm((prev) => ({ ...prev, description: e.target.value }))} />
                  <input placeholder="SKU" value={adminProductForm.sku} onChange={(e) => setAdminProductForm((prev) => ({ ...prev, sku: e.target.value }))} />
                  <input type="number" step="0.01" placeholder="Price" value={adminProductForm.price} onChange={(e) => setAdminProductForm((prev) => ({ ...prev, price: e.target.value }))} />
                  <input type="number" step="0.01" placeholder="Discount Price" value={adminProductForm.discountPrice} onChange={(e) => setAdminProductForm((prev) => ({ ...prev, discountPrice: e.target.value }))} />
                  <input type="number" placeholder="Stock" value={adminProductForm.stock} onChange={(e) => setAdminProductForm((prev) => ({ ...prev, stock: e.target.value }))} />
                  <input placeholder="Image URL" value={adminProductForm.imageUrl} onChange={(e) => setAdminProductForm((prev) => ({ ...prev, imageUrl: e.target.value }))} />
                  <input placeholder="Images CSV" value={adminProductForm.imagesCsv} onChange={(e) => setAdminProductForm((prev) => ({ ...prev, imagesCsv: e.target.value }))} />
                  <input placeholder="Category ID" value={adminProductForm.categoryId} onChange={(e) => setAdminProductForm((prev) => ({ ...prev, categoryId: e.target.value }))} />
                  <label className="check"><input type="checkbox" checked={adminProductForm.active} onChange={(e) => setAdminProductForm((prev) => ({ ...prev, active: e.target.checked }))} />Active</label>
                  <button type="submit">Create product</button>
                  <div className="inline-form">
                    <button type="button" onClick={onUpdateProduct}>Update</button>
                    <button type="button" className="ghost" onClick={onSoftDeleteProduct}>Soft delete</button>
                    <button type="button" className="ghost" onClick={onHardDeleteProduct}>Hard delete</button>
                    <button type="button" className="ghost" onClick={onRestoreProduct}>Restore</button>
                  </div>
                </form>
                <div className="mini-list compact">
                  {(adminProductsPage?.content || []).map((product) => (
                    <p key={product.id}>#{product.id} {product.name} | {product.sku} | {product.active ? 'ACTIVE' : 'INACTIVE'}</p>
                  ))}
                </div>
              </article>

              <article className="kpanel">
                <h4>Order Status Pipeline</h4>
                <form className="inline-form" onSubmit={onAdminUpdateOrderStatus}>
                  <input placeholder="Order ID" value={adminOrderUpdate.id} onChange={(e) => setAdminOrderUpdate((prev) => ({ ...prev, id: e.target.value }))} required />
                  <select value={adminOrderUpdate.status} onChange={(e) => setAdminOrderUpdate((prev) => ({ ...prev, status: e.target.value }))}>
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  <button type="submit">Update</button>
                </form>
                <div className="mini-list compact">
                  {(adminOrdersPage?.content || []).map((order) => <p key={order.id}>#{order.id} {order.orderNumber} | {order.status} | INR {money(order.totalAmount)}</p>)}
                </div>
              </article>
            </div>
          </div>
        </section>
      )}

      {((activeView === 'user' && !isLoggedIn) || (activeView === 'admin' && !isAdmin)) && (
        <section className="panel">
          <h3>Access Required</h3>
          <p className="muted">Please login first, and use an admin account for admin console.</p>
          <button type="button" onClick={() => setActiveView('auth')}>Go to Sign In</button>
        </section>
      )}
    </div>
  );
}

export default App;
