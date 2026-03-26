const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const toQueryString = (params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
};

const buildError = (payload, fallback) => {
  if (!payload) return fallback;
  if (typeof payload === 'string') return payload;
  if (payload.message) return payload.message;
  if (payload.error) return payload.error;
  return fallback;
};

export function createApiClient({ getAuth, setAuth, clearAuth }) {
  const refreshAccessToken = async () => {
    const { refreshToken } = getAuth();
    if (!refreshToken) throw new Error('Session expired. Please login again.');

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.data?.accessToken) {
      clearAuth();
      throw new Error(buildError(payload, 'Unable to refresh session. Please login again.'));
    }

    const current = getAuth();
    const updated = {
      ...current,
      accessToken: payload.data.accessToken,
      refreshToken: payload.data.refreshToken || current.refreshToken,
      user: payload.data.user || current.user,
    };
    setAuth(updated);
    return updated.accessToken;
  };

  const request = async (path, { method = 'GET', body, query, retry = true } = {}) => {
    const { accessToken } = getAuth();
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const response = await fetch(`${API_BASE_URL}${path}${toQueryString(query)}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = await response.json().catch(() => null);

    if (response.status === 401 && retry && getAuth().refreshToken) {
      await refreshAccessToken();
      return request(path, { method, body, query, retry: false });
    }

    if (!response.ok) {
      throw new Error(buildError(payload, `Request failed with status ${response.status}`));
    }

    return payload;
  };

  return {
    baseUrl: API_BASE_URL,
    auth: {
      register: (body) => request('/api/auth/register', { method: 'POST', body }),
      login: (body) => request('/api/auth/login', { method: 'POST', body }),
      refresh: (body) => request('/api/auth/refresh', { method: 'POST', body }),
    },
    user: {
      me: () => request('/api/users/me'),
      updateMe: (body) => request('/api/users/me', { method: 'PUT', body }),
      changePassword: (body) => request('/api/users/me/password', { method: 'PUT', body }),
    },
    admin: {
      getUsers: (query) => request('/api/admin/users', { query }),
      getUserById: (id) => request(`/api/admin/users/${id}`),
      promoteUser: (id) => request(`/api/admin/users/${id}/promote`, { method: 'PATCH' }),
      deleteUser: (id) => request(`/api/admin/users/${id}`, { method: 'DELETE' }),
    },
    categories: {
      list: () => request('/api/categories'),
      getById: (id) => request(`/api/categories/${id}`),
      create: (body) => request('/api/categories', { method: 'POST', body }),
      update: (id, body) => request(`/api/categories/${id}`, { method: 'PUT', body }),
      remove: (id) => request(`/api/categories/${id}`, { method: 'DELETE' }),
    },
    products: {
      list: (query) => request('/api/products', { query }),
      getById: (id) => request(`/api/products/${id}`),
      search: (query) => request('/api/products/search', { query }),
      getByCategory: (categoryId, query) => request(`/api/products/category/${categoryId}`, { query }),
      create: (body) => request('/api/products', { method: 'POST', body }),
      update: (id, body) => request(`/api/products/${id}`, { method: 'PUT', body }),
      softDelete: (id) => request(`/api/products/${id}`, { method: 'DELETE' }),
      hardDelete: (id) => request(`/api/products/${id}/hard`, { method: 'DELETE' }),
      restore: (id) => request(`/api/products/${id}/restore`, { method: 'PATCH' }),
      listAdmin: (query) => request('/api/products/admin/all', { query }),
    },
    cart: {
      get: () => request('/api/cart'),
      addItem: (body) => request('/api/cart/items', { method: 'POST', body }),
      updateItem: (productId, body) => request(`/api/cart/items/${productId}`, { method: 'PUT', body }),
      removeItem: (productId) => request(`/api/cart/items/${productId}`, { method: 'DELETE' }),
      clear: () => request('/api/cart', { method: 'DELETE' }),
    },
    orders: {
      create: (body) => request('/api/orders', { method: 'POST', body }),
      listMine: (query) => request('/api/orders', { query }),
      getById: (id) => request(`/api/orders/${id}`),
      cancel: (id) => request(`/api/orders/${id}/cancel`, { method: 'PATCH' }),
      listAll: (query) => request('/api/orders/admin/all', { query }),
      updateStatus: (id, body) => request(`/api/orders/admin/${id}/status`, { method: 'PUT', body }),
    },
    payments: {
      createOrder: (body) => request('/api/payments/create-order', { method: 'POST', body }),
      verify: (body) => request('/api/payments/verify', { method: 'POST', body }),
      getByOrder: (orderId) => request(`/api/payments/order/${orderId}`),
    },
  };
}
