const API_BASE = "http://localhost:5000/api";

function getToken() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('cg_token');
}

function setToken(token) {
  if (typeof localStorage === 'undefined') return;
  if (token) localStorage.setItem('cg_token', token);
  else localStorage.removeItem('cg_token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    setToken(null);
    throw new Error('Unauthorized');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const auth = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),
  logout: () => {
    setToken(null);
  },
};

export const users = {
  stats: () => request('/dashboard/stats'),
};

export const food = {
  list: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/surplus-listings${qs ? '?' + qs : ''}`);
  },
  create: (data) => request('/surplus-listings', { method: 'POST', body: JSON.stringify(data) }),
  reserve: (id, note) => request(`/surplus-listings/${id}/reserve`, { method: 'POST', body: JSON.stringify({ note }) }),
  release: (id) => request(`/surplus-listings/${id}/release`, { method: 'POST' }),
  collect: (id) => request(`/surplus-listings/${id}/collect`, { method: 'POST' }),
  remove: (id) => request(`/surplus-listings/${id}`, { method: 'DELETE' }),
};

export const medicines = {
  list: () => request('/medicines'),
  create: (data) => request('/medicines', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/medicines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/medicines/${id}`, { method: 'DELETE' }),
};

export const doseLogs = {
  list: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/dose-logs${qs ? '?' + qs : ''}`);
  },
  create: (data) => request('/dose-logs', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id) => request(`/dose-logs/${id}`, { method: 'DELETE' }),
};

export const appointments = {
  list: () => request('/appointments'),
  create: (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/appointments/${id}`, { method: 'DELETE' }),
};

export const issues = {
  list: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/neighborhood-issues${qs ? '?' + qs : ''}`);
  },
  create: (data) => request('/neighborhood-issues', { method: 'POST', body: JSON.stringify(data) }),
  upvote: (id) => request(`/neighborhood-issues/${id}/upvote`, { method: 'POST' }),
  update: (id, data) => request(`/neighborhood-issues/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/neighborhood-issues/${id}`, { method: 'DELETE' }),
};

export const blood = {
  requests: {
    list: (params) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/blood-requests${qs ? '?' + qs : ''}`);
    },
    create: (data) => request('/blood-requests', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/blood-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/blood-requests/${id}`, { method: 'DELETE' }),
  },
  donors: {
    list: (params) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/blood-donors${qs ? '?' + qs : ''}`);
    },
    create: (data) => request('/blood-donors', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/blood-donors/me'),
    toggle: (available) => request('/blood-donors/toggle', { method: 'PUT', body: JSON.stringify({ available }) }),
  },
};

export const water = {
  list: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/water-updates${qs ? '?' + qs : ''}`);
  },
  create: (data) => request('/water-updates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/water-updates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/water-updates/${id}`, { method: 'DELETE' }),
};

export const tuition = {
  list: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/tuition-posts${qs ? '?' + qs : ''}`);
  },
  create: (data) => request('/tuition-posts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/tuition-posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/tuition-posts/${id}`, { method: 'DELETE' }),
};

export { setToken, getToken };
