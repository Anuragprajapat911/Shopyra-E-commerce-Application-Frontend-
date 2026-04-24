
import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import './App.css';
import { createApiClient } from './api';
import Skeleton from './components/ui/Skeleton';
import Navbar from './components/layout/Navbar';
import useConfirm from './hooks/useConfirm';

const AUTH_KEY = 'shopyra_auth_v1';
const WISHLIST_KEY = 'shopyra_wishlist_v1';
const ShopPage = lazy(() => import('./pages/ShopPage'));

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

const readWishlist = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const money = (value) => {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const getRoleTokens = (user) => {
  if (!user || typeof user !== 'object') return [];

  const values = [
    user.role,
    user.userRole,
    user.roleName,
    user.type,
    ...(Array.isArray(user.roles) ? user.roles : []),
    ...(Array.isArray(user.authorities) ? user.authorities : []),
  ];

  const tokens = values
    .flatMap((value) => {
      if (!value) return [];
      if (typeof value === 'string') return [value];
      if (typeof value === 'object') return [value.authority, value.role, value.name].filter(Boolean);
      return [];
    })
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean);

  return Array.from(new Set(tokens));
};

const roleName = (user) => getRoleTokens(user)[0] || 'GUEST';

const parseImages = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const extractResetToken = (payload) => {
  if (!payload || typeof payload !== 'object') return '';

  const directToken =
    payload?.data?.token ||
    payload?.data?.resetToken ||
    payload?.token ||
    payload?.resetToken ||
    '';
  if (typeof directToken === 'string' && directToken.trim()) return directToken.trim();

  const message = String(payload?.message || payload?.data?.message || '');
  const tokenMatch =
    message.match(/reset token[:\s]+([A-Za-z0-9._-]+)/i) ||
    message.match(/token[:\s]+([A-Za-z0-9._-]+)/i);
  return tokenMatch?.[1] || '';
};

const initialAuthForm = {
  login: { email: '', password: '' },
  register: { name: '', email: '', password: '', phone: '', address: '' },
  forgotPassword: { email: '' },
  resetPassword: { token: '', newPassword: '' },
};

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

const headerFeatures = ['Men', 'Women', 'Kids', 'Beauty', 'Home'];

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
  const { confirm, ConfirmDialog } = useConfirm();
  const [auth, setAuthState] = useState(readAuth);
  const [activeView, setActiveView] = useState('shop');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ type: 'info', text: 'Welcome to Shopyra.' });

  const [categories, setCategories] = useState([]);
  const [productsPage, setProductsPage] = useState({ content: [], number: 0, totalPages: 0 });
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [wishlist, setWishlist] = useState(readWishlist);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
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

  const isAdmin = getRoleTokens(auth.user).some((role) => role.toUpperCase().includes('ADMIN'));
  const isLoggedIn = Boolean(auth.accessToken);

  const fetchCategories = async () => {
    const res = await api.categories.list();
    const list = asArray(res?.data);
    if (list.length > 0) {
      setCategories(list);
      return list;
    }
    return [];
  };

  const fetchProducts = async (overrides = {}) => {
    const next = { ...productFilter, ...overrides };
    setIsProductsLoading(true);
    try {
      let res;
      if (next.q) {
        res = await api.products.search({ q: next.q, page: next.page, size: next.size });
      } else if (next.categoryId) {
        res = await api.products.getByCategory(next.categoryId, { page: next.page, size: next.size });
      } else {
        res = await api.products.list({ page: next.page, size: next.size, sortBy: next.sortBy, sortDir: next.sortDir });
      }
      setProductFilter(next);
      const nextPage = res.data || { content: [] };
      setProductsPage(nextPage);
      setCategories((prev) => {
        if (Array.isArray(prev) && prev.length > 0) return prev;
        const fromProducts = (nextPage?.content || [])
          .map((product) => product?.category)
          .filter((category) => category?.id && category?.name);
        if (fromProducts.length === 0) return prev;
        const unique = [];
        const seen = new Set();
        fromProducts.forEach((category) => {
          const key = String(category.id);
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(category);
          }
        });
        return unique;
      });
    } finally {
      setIsProductsLoading(false);
    }
  };

  const normalizeCartPayload = async (payload) => {
    if (!payload) return null;
    const items = Array.isArray(payload?.items) ? payload.items : [];

    const normalizedItems = await Promise.all(
      items.map(async (item) => {
        const productId =
          item?.product?.id ||
          item?.productId ||
          item?.product?.productId ||
          null;

        if (item?.product || !productId) return item;

        const fromVisibleProducts = (productsPage?.content || []).find(
          (product) => String(product.id) === String(productId),
        );
        if (fromVisibleProducts) return { ...item, product: fromVisibleProducts };

        try {
          const productRes = await api.products.getById(productId);
          return { ...item, product: productRes?.data || null };
        } catch {
          return item;
        }
      }),
    );

    return { ...payload, items: normalizedItems };
  };

  const fetchCart = async () => {
    if (!isLoggedIn) return;
    const res = await api.cart.get();
    const normalized = await normalizeCartPayload(res.data || null);
    setCart(normalized);
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
    fetchCategories().catch((error) => {
      setNotice({ type: 'error', text: error?.message || 'Unable to load categories.' });
    });
    fetchProducts().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

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

  useEffect(() => {
    const query = String(productFilter.q || '').trim();
    if (query.length < 2) {
      setSearchSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setSuggestionsLoading(true);
        const res = await api.products.search({ q: query, page: 0, size: 5 });
        setSearchSuggestions(res.data?.content || []);
      } catch {
        setSearchSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [api.products, productFilter.q]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(String(window.location.hash || '').replace(/^#/, ''));
    const tokenFromUrl =
      params.get('token') ||
      params.get('resetToken') ||
      hashParams.get('token') ||
      hashParams.get('resetToken') ||
      '';

    const isResetPath = String(window.location.pathname || '').toLowerCase().includes('reset-password');
    if (!tokenFromUrl && !isResetPath) return;

    setActiveView('auth');

    if (tokenFromUrl) {
      setAuthForm((prev) => ({
        ...prev,
        resetPassword: {
          ...prev.resetPassword,
          token: tokenFromUrl,
        },
      }));
    }
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

  const onForgotPassword = async (event) => {
    event.preventDefault();
    const res = await run(() => api.auth.forgotPassword(authForm.forgotPassword), 'If this email exists, a reset token was sent.');
    const token = extractResetToken(res);
    if (token) {
      setAuthForm((prev) => ({
        ...prev,
        resetPassword: {
          ...prev.resetPassword,
          token,
        },
      }));
      setNotice({ type: 'success', text: `Reset token received: ${token}` });
    } else {
      setNotice({ type: 'info', text: 'No token in API response. Check your email or backend mail config.' });
    }
    setAuthForm((prev) => ({ ...prev, forgotPassword: { email: '' } }));
  };

  const onResetPassword = async (event) => {
    event.preventDefault();
    await run(() => api.auth.resetPassword(authForm.resetPassword), 'Password reset successful. Please sign in.');
    setAuthForm((prev) => ({
      ...prev,
      resetPassword: { token: '', newPassword: '' },
      login: { ...prev.login, password: '' },
    }));
  };

  const onLogout = () => {
    clearAuth();
    setNotice({ type: 'success', text: 'Logged out.' });
  };

  const onAddProductToCart = async (productId, quantity = 1) => {
    const res = await run(() => api.cart.addItem({ productId: Number(productId), quantity: Number(quantity) }), 'Added to bag.');
    const normalized = await normalizeCartPayload(res.data || null);
    if (normalized) setCart(normalized);
    else await fetchCart();
  };

  const onToggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((item) => item !== productId)
        : [...prev, productId],
    );
  };

  const onSearchSubmit = (event) => {
    event.preventDefault();
    run(() => fetchProducts({ page: 0 }), 'Products loaded.').catch(() => {});
  };

  const onSearchSuggestionSelect = (item) => {
    changeFilter({ q: item.name, page: 0 });
    run(() => fetchProducts({ q: item.name, page: 0 }), `${item.name} loaded.`).catch(() => {});
    setSearchSuggestions([]);
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
    const res = await run(() => api.cart.updateItem(productId, { quantity: Number(quantity) }), 'Cart updated.');
    const normalized = await normalizeCartPayload(res.data || null);
    if (normalized) setCart(normalized);
    else await fetchCart();
  };

  const onRemoveCartItem = async (productId) => {
    const ok = await confirm({
      title: 'Remove Item?',
      message: 'This item will be removed from your bag.',
      confirmText: 'Remove',
    });
    if (!ok) return;
    const res = await run(() => api.cart.removeItem(productId), 'Item removed.');
    const normalized = await normalizeCartPayload(res.data || null);
    if (normalized) setCart(normalized);
    else await fetchCart();
  };
  const onClearCart = async () => {
    const ok = await confirm({
      title: 'Clear Bag?',
      message: 'All items in your bag will be removed.',
      confirmText: 'Clear Bag',
    });
    if (!ok) return;
    await run(() => api.cart.clear(), 'Bag cleared.');
    setCart((prev) => (prev ? { ...prev, items: [], total: 0, itemCount: 0 } : null));
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
    const ok = await confirm({
      title: 'Cancel Order?',
      message: `Order #${orderId} will be cancelled.`,
      confirmText: 'Cancel Order',
    });
    if (!ok) return;
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
    const ok = await confirm({
      title: 'Delete User?',
      message: 'This will permanently remove the user account.',
      confirmText: 'Delete',
    });
    if (!ok) return;
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
    const ok = await confirm({
      title: 'Delete Category?',
      message: 'This will delete the category. Make sure products are reassigned first.',
      confirmText: 'Delete',
    });
    if (!ok) return;
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
    const productId = Number(adminProductForm.id);
    if (!productId || Number.isNaN(productId)) {
      setNotice({ type: 'error', text: 'Enter a valid Product ID first.' });
      return;
    }
    await run(() => api.products.update(productId, productPayload), 'Product updated.');
    await Promise.all([fetchProducts(), fetchAdminData()]);
  };

  const onSoftDeleteProduct = async () => {
    const ok = await confirm({
      title: 'Deactivate Product?',
      message: 'Product will be hidden from shoppers but can be restored later.',
      confirmText: 'Deactivate',
    });
    if (!ok) return;
    const productId = Number(adminProductForm.id);
    if (!productId || Number.isNaN(productId)) {
      setNotice({ type: 'error', text: 'Enter a valid Product ID first.' });
      return;
    }
    await run(() => api.products.softDelete(productId), 'Product deactivated.');
    await Promise.all([fetchProducts(), fetchAdminData()]);
  };

  const onHardDeleteProduct = async () => {
    const ok = await confirm({
      title: 'Hard Delete Product?',
      message: 'This permanently removes product data and cannot be undone.',
      confirmText: 'Delete Permanently',
    });
    if (!ok) return;
    const productId = Number(adminProductForm.id);
    if (!productId || Number.isNaN(productId)) {
      setNotice({ type: 'error', text: 'Enter a valid Product ID first.' });
      return;
    }
    await run(() => api.products.hardDelete(productId), 'Product permanently deleted.');
    await Promise.all([fetchProducts(), fetchAdminData()]);
  };

  const onRestoreProduct = async () => {
    const productId = Number(adminProductForm.id);
    if (!productId || Number.isNaN(productId)) {
      setNotice({ type: 'error', text: 'Enter a valid Product ID first.' });
      return;
    }
    await run(() => api.products.restore(productId), 'Product restored.');
    await Promise.all([fetchProducts(), fetchAdminData()]);
  };

  const onSoftDeleteProductById = async (productId) => {
    const ok = await confirm({
      title: 'Deactivate Product?',
      message: `Deactivate product #${productId}?`,
      confirmText: 'Deactivate',
    });
    if (!ok) return;
    await run(() => api.products.softDelete(Number(productId)), 'Product deactivated.');
    await Promise.all([fetchProducts(), fetchAdminData()]);
  };

  const onHardDeleteProductById = async (productId) => {
    const ok = await confirm({
      title: 'Hard Delete Product?',
      message: `Permanently delete product #${productId}?`,
      confirmText: 'Delete Permanently',
    });
    if (!ok) return;
    await run(() => api.products.hardDelete(Number(productId)), 'Product permanently deleted.');
    await Promise.all([fetchProducts(), fetchAdminData()]);
  };

  const onPickAdminProduct = (product) => {
    setAdminProductForm({
      id: String(product.id || ''),
      name: product.name || '',
      description: product.description || '',
      sku: product.sku || '',
      price: product.price ?? '',
      discountPrice: product.discountPrice ?? '',
      stock: product.stock ?? '',
      imageUrl: product.imageUrl || '',
      imagesCsv: Array.isArray(product.images) ? product.images.join(', ') : '',
      categoryId: product.category?.id ? String(product.category.id) : '',
      active: Boolean(product.active),
    });
    setNotice({ type: 'info', text: `Selected product #${product.id} for actions.` });
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
  const categoryTree = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    const byParent = new Map();
    list.forEach((category) => {
      const key = category.parentId == null ? 'root' : String(category.parentId);
      const bucket = byParent.get(key) || [];
      bucket.push(category);
      byParent.set(key, bucket);
    });
    return {
      root: byParent.get('root') || [],
      byParent,
    };
  }, [categories]);

  const userStats = {
    bagItems: cart?.itemCount || 0,
    totalOrders: myOrdersPage?.content?.length || 0,
    paidOrders: (myOrdersPage?.content || []).filter((item) => item.paid).length,
  };

  const onSelectCategoryForEdit = (category) => {
    setCategoryForm({
      id: String(category.id || ''),
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      parentId: category.parentId ? String(category.parentId) : '',
    });
    setNotice({ type: 'info', text: `Selected category #${category.id} for update.` });
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div className="brand-wrap">
            <div>
              <p className="brand-name">S H O P Y R A</p>
              <p className="brand-sub">STYLE . QUALITY . INDIA</p>
            </div>
          </div>
          <div className="header-top-right">
            <p className="ui-version-badge">UI V2</p>
            <p className="header-user-chip">{isLoggedIn ? `Hi, ${firstName}` : 'Guest Mode'}</p>
          </div>
        </div>
        <div className="header-main">
          <Navbar activeView={activeView} setActiveView={setActiveView} isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
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
        <Suspense fallback={<section className="panel"><Skeleton className="page-skeleton" /></section>}>
          <ShopPage
            isLoggedIn={isLoggedIn}
            promoSlides={promoSlides}
            trendSlides={trendSlides}
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
            currentTrendSlide={currentTrendSlide}
            setCurrentTrendSlide={setCurrentTrendSlide}
            categories={categories}
            productFilter={productFilter}
            changeFilter={changeFilter}
            run={run}
            fetchCategories={fetchCategories}
            fetchProducts={fetchProducts}
            productsPage={productsPage}
            money={money}
            onAddProductToCart={onAddProductToCart}
            isProductsLoading={isProductsLoading}
            wishlist={wishlist}
            onToggleWishlist={onToggleWishlist}
            quickViewProduct={quickViewProduct}
            setQuickViewProduct={setQuickViewProduct}
            searchSuggestions={searchSuggestions}
            suggestionsLoading={suggestionsLoading}
            onSearchChange={(value) => changeFilter({ q: value, page: 0 })}
            onSearchSubmit={onSearchSubmit}
            onSearchSuggestionSelect={onSearchSuggestionSelect}
            cart={cart}
          />
        </Suspense>
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

          <form className="panel" onSubmit={onForgotPassword}>
            <h3>Forgot Password</h3>
            <p className="muted auth-help">Enter your email to receive a reset token.</p>
            <input
              type="email"
              placeholder="Email"
              value={authForm.forgotPassword.email}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, forgotPassword: { email: e.target.value } }))}
              required
            />
            <button type="submit">Send reset token</button>
          </form>

          <form className="panel" onSubmit={onResetPassword}>
            <h3>Reset Password</h3>
            <p className="muted auth-help">Paste reset token from email and set a new password.</p>
            <input
              placeholder="Reset token"
              value={authForm.resetPassword.token}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, resetPassword: { ...prev.resetPassword, token: e.target.value } }))}
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={authForm.resetPassword.newPassword}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, resetPassword: { ...prev.resetPassword, newPassword: e.target.value } }))}
              required
            />
            <button type="submit">Reset password</button>
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
              {(cart?.items || []).length === 0 && (
                <p className="muted">No products in your bag yet. Add from Shop and they will appear here.</p>
              )}
              {(cart?.items || []).map((item) => {
                const fallbackProductId =
                  item?.product?.id ||
                  item?.productId ||
                  item?.product?.productId ||
                  null;
                const productFromGrid = (productsPage?.content || []).find(
                  (p) => String(p.id) === String(fallbackProductId),
                );
                const displayProduct =
                  item.product ||
                  productFromGrid ||
                  {
                    id: fallbackProductId,
                    name: item.productName || item.name || `Product #${fallbackProductId || ''}`.trim(),
                    imageUrl: item.imageUrl || '',
                    images: item.images || [],
                  };

                const bagImage =
                  displayProduct?.imageUrl ||
                  displayProduct?.images?.[0] ||
                  `https://picsum.photos/seed/shopyra-bag-${displayProduct?.id || item.id}/400/500`;
                return (
                  <div key={item.id} className="mini-item">
                    <div className="bag-item-main">
                      <img src={bagImage} alt={displayProduct?.name || 'Bag product'} className="bag-item-thumb" loading="lazy" decoding="async" />
                      <div>
                        <strong>{displayProduct?.name}</strong>
                        <p>Qty: {item.quantity} | Subtotal: INR {money(item.subtotal)}</p>
                      </div>
                    </div>
                    <div className="mini-actions">
                      <input type="number" min="0" defaultValue={item.quantity} onBlur={(e) => onUpdateCartItem(displayProduct?.id, e.target.value).catch(() => {})} />
                      <button type="button" className="ghost" onClick={() => onRemoveCartItem(displayProduct?.id).catch(() => {})}>Remove</button>
                    </div>
                  </div>
                );
              })}
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
                  <select value={categoryForm.parentId} onChange={(e) => setCategoryForm((prev) => ({ ...prev, parentId: e.target.value }))}>
                    <option value="">No Parent (Root Category)</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        #{category.id} {category.name}
                      </option>
                    ))}
                  </select>
                  <button type="submit">Create category</button>
                </form>
                <form className="inline-form" onSubmit={onUpdateCategory}>
                  <input placeholder="Category ID" value={categoryForm.id} onChange={(e) => setCategoryForm((prev) => ({ ...prev, id: e.target.value }))} required />
                  <select value={categoryForm.parentId} onChange={(e) => setCategoryForm((prev) => ({ ...prev, parentId: e.target.value }))}>
                    <option value="">No Parent</option>
                    {categories
                      .filter((category) => String(category.id) !== String(categoryForm.id))
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          #{category.id} {category.name}
                        </option>
                      ))}
                  </select>
                  <button type="submit">Update</button>
                  <button type="button" className="ghost" onClick={onDeleteCategory}>Delete</button>
                </form>
                <div className="category-tree">
                  <p className="muted">Parent / Child Category Tree</p>
                  {categoryTree.root.length === 0 && <p className="muted">No categories created yet.</p>}
                  {categoryTree.root.map((parent) => (
                    <div key={parent.id} className="category-node">
                      <button type="button" className="category-node-btn" onClick={() => onSelectCategoryForEdit(parent)}>
                        Parent: #{parent.id} {parent.name}
                      </button>
                      <div className="category-children">
                        {(categoryTree.byParent.get(String(parent.id)) || []).length === 0 && (
                          <p className="muted">No child categories</p>
                        )}
                        {(categoryTree.byParent.get(String(parent.id)) || []).map((child) => (
                          <button key={child.id} type="button" className="category-child-btn" onClick={() => onSelectCategoryForEdit(child)}>
                            Child: #{child.id} {child.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                    <div key={product.id} className="mini-item">
                      <div>
                        <strong>#{product.id} {product.name}</strong>
                        <p>{product.sku} | {product.active ? 'ACTIVE' : 'INACTIVE'}</p>
                      </div>
                      <div className="mini-actions">
                        <button type="button" onClick={() => onPickAdminProduct(product)}>Select</button>
                        <button type="button" className="ghost" onClick={() => onSoftDeleteProductById(product.id).catch(() => {})}>
                          Soft Delete
                        </button>
                        <button type="button" className="ghost" onClick={() => onHardDeleteProductById(product.id).catch(() => {})}>
                          Hard Delete
                        </button>
                      </div>
                    </div>
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
      <ConfirmDialog />
    </div>
  );
}

export default App;
