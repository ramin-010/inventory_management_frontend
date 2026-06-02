import React, { useState, useEffect } from 'react';
import { Plus, X, AlertCircle, ShoppingCart, ChevronDown, ChevronRight, Package, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrders, getProducts, getCustomers, createOrder, updateOrderStatus } from '../services/api';

const statusStyles = {
  delivered: 'bg-emerald-500/10 text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-400',
  processing: 'bg-blue-500/10 text-blue-400',
  shipped: 'bg-indigo-500/10 text-indigo-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const loadOrders = () => {
    setLoading(true);
    getOrders({ limit: 50 })
      .then(data => setOrders(data.items))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
    getCustomers({ limit: 100 }).then(data => setCustomers(data.items));
    getProducts({ limit: 100 }).then(data => setProducts(data.items));
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError(null);
    const validItems = orderItems.filter(item => item.product_id && item.quantity > 0);
    if (validItems.length === 0) {
      setError("Add at least one product to the order");
      return;
    }
    try {
      await createOrder({
        customer_id: parseInt(selectedCustomer),
        items: validItems.map(item => ({ product_id: parseInt(item.product_id), quantity: parseInt(item.quantity) }))
      });
      setIsCreating(false);
      setSelectedCustomer('');
      setOrderItems([{ product_id: '', quantity: 1 }]);
      toast.success("Order placed successfully");
      loadOrders();
      getProducts({ limit: 100 }).then(data => setProducts(data.items));
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create order");
      toast.error("Failed to place order");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      toast.success("Order status updated");
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update status");
    }
  };

  const addItem = () => setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  const removeItem = (index) => setOrderItems(orderItems.filter((_, i) => i !== index));
  const updateItem = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const orderTotal = orderItems.reduce((sum, item) => {
    const product = products.find(p => p.id === parseInt(item.product_id));
    return sum + (product ? product.price * (parseInt(item.quantity) || 0) : 0);
  }, 0);

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const exportCSV = () => {
    if (orders.length === 0) return toast.error("No orders to export");
    const headers = ['Order ID', 'Date', 'Customer', 'Total Amount', 'Status'];
    const rows = orders.map(order => [
      order.id,
      new Date(order.created_at).toLocaleDateString(),
      `"${order.customer?.name || order.customer_id}"`,
      order.total_amount.toFixed(2),
      order.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("CSV exported successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#ededef]">Orders</h1>
          <p className="text-sm text-[#6e6e73] mt-0.5">Manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-1.5" title="Export to CSV">
            <Download size={15} /> Export
          </button>
          <button onClick={() => { setIsCreating(true); setError(null); }} className="btn-primary flex items-center gap-1.5">
            <Plus size={15} /> New Order
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="card p-0 border-[#3e3e42]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2d]">
            <h2 className="text-sm font-semibold text-[#ededef]">Create Order</h2>
            <button onClick={() => setIsCreating(false)} className="p-1 rounded hover:bg-[#2a2a2d] text-[#6e6e73] transition-colors">
              <X size={16} />
            </button>
          </div>

          {error && (
            <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2.5 rounded-md bg-red-500/5 border border-red-500/10">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateOrder} className="p-5 space-y-5">
            <div>
              <label className="label-text">Customer</label>
              <select required className="input-field" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
                <option value="">Select a customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-text mb-0">Items</label>
                <button type="button" onClick={addItem} className="text-xs text-[#6e6e73] hover:text-[#a0a0a3] transition-colors">+ Add item</button>
              </div>

              <div className="space-y-2">
                {orderItems.map((item, index) => {
                  const selectedProduct = products.find(p => p.id === parseInt(item.product_id));
                  return (
                    <div key={index} className="flex gap-2 items-center">
                      <select required className="input-field flex-1" value={item.product_id} onChange={e => updateItem(index, 'product_id', e.target.value)}>
                        <option value="">Select product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id} disabled={p.stock === 0}>
                            {p.name} — ${p.price.toFixed(2)} ({p.stock} available)
                          </option>
                        ))}
                      </select>
                      <input
                        required type="number" min="1" max={selectedProduct?.stock || 999}
                        className="input-field w-20 text-center" value={item.quantity}
                        onChange={e => updateItem(index, 'quantity', e.target.value)}
                      />
                      {orderItems.length > 1 && (
                        <button type="button" onClick={() => removeItem(index)} className="p-1.5 text-[#4e4e51] hover:text-red-400 transition-colors">
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2a2a2d]">
              <div className="text-sm text-[#6e6e73]">
                Total: <span className="font-semibold text-[#ededef]">${orderTotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsCreating(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Place Order</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th w-8"></th>
              <th className="table-th">Order</th>
              <th className="table-th">Date</th>
              <th className="table-th">Customer</th>
              <th className="table-th">Total</th>
              <th className="table-th">Status</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-[#1e1e20]">
                  <td className="p-4"><div className="w-4 h-4 bg-[#2a2a2d] rounded"></div></td>
                  <td className="p-4"><div className="h-4 bg-[#2a2a2d] rounded w-16"></div></td>
                  <td className="p-4"><div className="h-4 bg-[#2a2a2d] rounded w-24"></div></td>
                  <td className="p-4"><div className="h-4 bg-[#2a2a2d] rounded w-32"></div></td>
                  <td className="p-4"><div className="h-4 bg-[#2a2a2d] rounded w-20"></div></td>
                  <td className="p-4"><div className="h-5 bg-[#2a2a2d] rounded w-16"></div></td>
                  <td className="p-4"><div className="h-6 bg-[#2a2a2d] rounded w-20 ml-auto"></div></td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-td text-center py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#1e1e20] flex items-center justify-center mb-3">
                      <ShoppingCart size={20} className="text-[#6e6e73]" />
                    </div>
                    <p className="text-sm font-medium text-[#ededef]">No orders yet</p>
                    <p className="text-xs text-[#6e6e73] mt-1 mb-4">When customers place orders, they will appear here.</p>
                    <button onClick={() => { setIsCreating(true); setError(null); }} className="btn-secondary text-xs py-1.5">Create Order</button>
                  </div>
                </td>
              </tr>
            ) : orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr className="hover:bg-[#19191b] transition-colors duration-100 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                  <td className="table-td pl-4 pr-1">
                    <button className="text-[#6e6e73] hover:text-[#ededef]">
                      {expandedOrderId === order.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </td>
                  <td className="table-td font-medium text-[#ededef]">#{String(order.id).padStart(4, '0')}</td>
                  <td className="table-td text-[#6e6e73]">
                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="table-td">{order.customer?.name || `#${order.customer_id}`}</td>
                  <td className="table-td font-medium text-[#ededef]">${order.total_amount.toFixed(2)}</td>
                  <td className="table-td">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium capitalize ${statusStyles[order.status] || ''}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="table-td text-right" onClick={(e) => e.stopPropagation()}>
                    {order.status !== 'cancelled' && order.status !== 'delivered' ? (
                      <select
                        className="bg-transparent border border-[#2a2a2d] rounded px-2 py-1 text-xs text-[#a0a0a3] outline-none focus:border-[#3e3e42] transition-colors cursor-pointer"
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    ) : (
                      <span className="text-[11px] text-[#4e4e51]">{order.status === 'delivered' ? 'Completed' : 'Cancelled'}</span>
                    )}
                  </td>
                </tr>
                
                {expandedOrderId === order.id && (
                  <tr className="bg-[#151517]">
                    <td colSpan="7" className="px-10 py-5 border-b border-[#1e1e20]">
                      <div className="space-y-4">
                        <div className="mb-8 mt-2 px-4">
                          {order.status === 'cancelled' ? (
                            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-md">
                              <AlertCircle size={16} />
                              <span className="text-sm font-medium">This order was cancelled and stock was returned.</span>
                            </div>
                          ) : (
                            <div className="flex items-center w-full">
                              {['pending', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                                const currentIndex = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status);
                                const isActive = idx <= currentIndex;
                                const isCurrent = idx === currentIndex;
                                return (
                                  <React.Fragment key={step}>
                                    <div className="flex flex-col items-center relative z-10">
                                      <div className={`w-5 h-5 rounded-full border-[3px] flex items-center justify-center bg-[#151517] transition-colors duration-300 ${
                                        isActive ? 'border-[#0070f3]' : 'border-[#2a2a2d]'
                                      }`}>
                                        {isActive && <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-[#0070f3] animate-pulse' : 'bg-[#0070f3]'}`}></div>}
                                      </div>
                                      <span className={`absolute top-7 text-[9px] uppercase tracking-wider font-semibold text-center w-20 ${
                                        isActive ? 'text-[#ededef]' : 'text-[#6e6e73]'
                                      }`}>{step}</span>
                                    </div>
                                    {idx < 3 && (
                                      <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                                        idx < currentIndex ? 'bg-[#0070f3]' : 'bg-[#2a2a2d]'
                                      }`}></div>
                                    )}
                                  </React.Fragment>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6e6e73]">Order Items</h4>
                        <div className="grid gap-3">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-md border border-[#2a2a2d] bg-[#111113]">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-[#1e1e20] flex items-center justify-center">
                                  <Package size={14} className="text-[#6e6e73]" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-[#ededef]">{item.product?.name || `Product #${item.product_id}`}</div>
                                  <div className="text-xs text-[#6e6e73]">SKU: {item.product?.sku || '-'}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-[#ededef]">{item.quantity} × ${(item.unit_price || 0).toFixed(2)}</div>
                                <div className="text-xs font-medium text-[#a0a0a3] mt-0.5">Subtotal: ${((item.unit_price || 0) * item.quantity).toFixed(2)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end pt-2">
                          <div className="text-sm">
                            <span className="text-[#6e6e73] mr-3">Total Amount:</span>
                            <span className="font-semibold text-[#ededef]">${order.total_amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
