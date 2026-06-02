import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, PackageX, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', sku: '', price: 0, stock: 0, category: '', description: '', low_stock_threshold: 10
  });

  const loadProducts = () => {
    setLoading(true);
    getProducts({ search, limit: 50 })
      .then(data => setProducts(data.items))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        toast.success('Product updated');
      } else {
        await createProduct(formData);
        toast.success('Product created');
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.detail || "An error occurred");
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted');
        loadProducts();
      } catch (err) {
        toast.error(err.response?.data?.detail || "Cannot delete product");
      }
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', sku: '', price: 0, stock: 0, category: '', description: '', low_stock_threshold: 10 });
    }
    setIsModalOpen(true);
  };

  const stockIndicator = (product) => {
    if (product.stock === 0) return { label: 'Out of stock', cls: 'text-red-400 bg-red-500/10' };
    if (product.stock <= product.low_stock_threshold) return { label: 'Low stock', cls: 'text-amber-400 bg-amber-500/10' };
    return { label: 'In stock', cls: 'text-emerald-400 bg-emerald-500/10' };
  };

  const exportCSV = () => {
    if (products.length === 0) return toast.error("No products to export");
    const headers = ['Product ID', 'Name', 'SKU', 'Category', 'Price', 'Stock'];
    const rows = products.map(p => [
      p.id,
      `"${p.name}"`,
      p.sku,
      p.category || '',
      p.price.toFixed(2),
      p.stock
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("CSV exported successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#ededef]">Products</h1>
          <p className="text-sm text-[#6e6e73] mt-0.5">Manage your inventory catalog</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-1.5" title="Export to CSV">
            <Download size={15} /> Export
          </button>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-1.5">
            <Plus size={15} /> Add Product
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a2a2d]">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4e4e51]" size={15} />
            <input
              type="text"
              placeholder="Search products..."
              className="input-field pl-8 py-1.5 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th">Name</th>
              <th className="table-th">SKU</th>
              <th className="table-th">Category</th>
              <th className="table-th">Price</th>
              <th className="table-th">Stock</th>
              <th className="table-th">Status</th>
              <th className="table-th w-20"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-[#1e1e20]">
                  <td className="p-4"><div className="h-4 bg-[#2a2a2d] rounded w-3/4"></div></td>
                  <td className="p-4"><div className="h-4 bg-[#2a2a2d] rounded w-16"></div></td>
                  <td className="p-4"><div className="h-4 bg-[#2a2a2d] rounded w-20"></div></td>
                  <td className="p-4"><div className="h-4 bg-[#2a2a2d] rounded w-12"></div></td>
                  <td className="p-4"><div className="h-4 bg-[#2a2a2d] rounded w-8"></div></td>
                  <td className="p-4"><div className="h-5 bg-[#2a2a2d] rounded w-16"></div></td>
                  <td className="p-4"><div className="h-6 bg-[#2a2a2d] rounded w-16 ml-auto"></div></td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-td text-center py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#1e1e20] flex items-center justify-center mb-3">
                      <PackageX size={20} className="text-[#6e6e73]" />
                    </div>
                    <p className="text-sm font-medium text-[#ededef]">No products found</p>
                    <p className="text-xs text-[#6e6e73] mt-1 mb-4">Add your first product to get started.</p>
                    <button onClick={() => openModal()} className="btn-secondary text-xs py-1.5">Add Product</button>
                  </div>
                </td>
              </tr>
            ) : products.map((product) => {
              const status = stockIndicator(product);
              return (
                <tr key={product.id} className="hover:bg-[#19191b] transition-colors duration-100">
                  <td className="table-td font-medium text-[#ededef]">{product.name}</td>
                  <td className="table-td font-mono text-xs text-[#6e6e73]">{product.sku}</td>
                  <td className="table-td">
                    {product.category ? (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[#1e1e20] text-[#a0a0a3]">{product.category}</span>
                    ) : <span className="text-[#4e4e51]">—</span>}
                  </td>
                  <td className="table-td font-medium text-[#ededef]">${product.price.toFixed(2)}</td>
                  <td className="table-td tabular-nums">{product.stock}</td>
                  <td className="table-td">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${status.cls}`}>{status.label}</span>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center justify-end gap-0.5">
                      <button onClick={() => openModal(product)} className="p-1.5 rounded hover:bg-[#2a2a2d] text-[#6e6e73] hover:text-[#ededef] transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded hover:bg-red-500/10 text-[#6e6e73] hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="card w-full max-w-md p-0" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2d]">
              <h2 className="text-sm font-semibold text-[#ededef]">
                {editingProduct ? 'Edit Product' : 'New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-[#2a2a2d] text-[#6e6e73] transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="label-text">Name</label>
                <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">SKU</label>
                  <input required type="text" className="input-field" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
                <div>
                  <label className="label-text">Category</label>
                  <input type="text" className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Price ($)</label>
                  <input required type="number" step="0.01" min="0" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="label-text">Stock</label>
                  <input required type="number" min="0" className="input-field" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#2a2a2d] mt-5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingProduct ? 'Save Changes' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
