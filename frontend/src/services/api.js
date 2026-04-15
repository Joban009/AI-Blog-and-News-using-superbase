import axios from 'axios';
import supabase from './supabase.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Attach Supabase session token automatically
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token)
    config.headers.Authorization = `Bearer ${session.access_token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) supabase.auth.signOut();
    return Promise.reject(err);
  }
);

export default api;

export const postsApi = {
  list:    (params) => api.get('/posts', { params }),
  get:     (slug)   => api.get(`/posts/${slug}`),
  create:  (data)   => api.post('/posts', data),
  update:  (id, d)  => api.put(`/posts/${id}`, d),
  delete:  (id)     => api.delete(`/posts/${id}`),
  publish: (id)     => api.post(`/posts/${id}/publish`),
  reject:  (id, reason) => api.post(`/posts/${id}/reject`, { reason }),
};

export const commentsApi = {
  list:    (post_id) => api.get('/comments', { params: { post_id } }),
  create:  (data)    => api.post('/comments', data),
  delete:  (id)      => api.delete(`/comments/${id}`),
  approve: (id)      => api.patch(`/comments/${id}/approve`),
  reject:  (id)      => api.patch(`/comments/${id}/reject`),
};

export const adminApi = {
  dashboard:    ()       => api.get('/admin/dashboard'),
  listPosts:    (params) => api.get('/admin/posts', { params }),
  listComments: (params) => api.get('/admin/comments', { params }),
  listUsers:    ()       => api.get('/admin/users'),
  updateUser:   (id, d)  => api.patch(`/admin/users/${id}`, d),
};

export const aiApi = {
  generate: (data) => api.post('/ai/generate', data),
  improve:  (data) => api.post('/ai/improve', data),
};
