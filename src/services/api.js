import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export const getProducts = (params) => api.get('/products', { params }).then(res => res.data);
export const getProduct = (id) => api.get(`/products/${id}`).then(res => res.data);
export const createProduct = (data) => api.post('/products', data).then(res => res.data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data).then(res => res.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then(res => res.data);
export const getLowStock = () => api.get('/products/low-stock').then(res => res.data);

export const getCustomers = (params) => api.get('/customers', { params }).then(res => res.data);
export const getCustomer = (id) => api.get(`/customers/${id}`).then(res => res.data);
export const createCustomer = (data) => api.post('/customers', data).then(res => res.data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data).then(res => res.data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`).then(res => res.data);

export const getOrders = (params) => api.get('/orders', { params }).then(res => res.data);
export const getOrder = (id) => api.get(`/orders/${id}`).then(res => res.data);
export const createOrder = (data) => api.post('/orders', data).then(res => res.data);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status }).then(res => res.data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`).then(res => res.data);

export const getStats = () => api.get('/dashboard/stats').then(res => res.data);
export const getRecentOrders = () => api.get('/dashboard/recent-orders').then(res => res.data);

export default api;
