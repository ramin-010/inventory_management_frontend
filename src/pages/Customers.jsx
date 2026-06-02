import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  const loadCustomers = () => {
    setLoading(true);
    getCustomers({ search, limit: 50 })
      .then(data => setCustomers(data.items))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(loadCustomers, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
        toast.success('Customer updated');
      } else {
        await createCustomer(formData);
        toast.success('Customer created');
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.detail || "An error occurred");
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this customer?')) {
      try {
        await deleteCustomer(id);
        toast.success('Customer deleted');
        loadCustomers();
      } catch (err) {
        toast.error(err.response?.data?.detail || "Cannot delete customer");
      }
    }
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({ ...customer });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#ededef]">Customers</h1>
          <p className="text-sm text-[#6e6e73] mt-0.5">Manage your customer database</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Customer
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a2a2d]">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4e4e51]" size={15} />
            <input
              type="text"
              placeholder="Search customers..."
              className="input-field pl-8 py-1.5 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th">Customer</th>
              <th className="table-th">Email</th>
              <th className="table-th">Phone</th>
              <th className="table-th">Address</th>
              <th className="table-th w-20"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-[#1e1e20]">
                  <td className="p-4"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-[#2a2a2d]"></div><div className="h-4 bg-[#2a2a2d] rounded w-24"></div></div></td>
                  <td className="p-4"><div className="h-4 bg-[#2a2a2d] rounded w-32"></div></td>
                  <td className="p-4"><div className="h-4 bg-[#2a2a2d] rounded w-20"></div></td>
                  <td className="p-4"><div className="h-4 bg-[#2a2a2d] rounded w-40"></div></td>
                  <td className="p-4"><div className="h-6 bg-[#2a2a2d] rounded w-16 ml-auto"></div></td>
                </tr>
              ))
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="table-td text-center py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#1e1e20] flex items-center justify-center mb-3">
                      <UserX size={20} className="text-[#6e6e73]" />
                    </div>
                    <p className="text-sm font-medium text-[#ededef]">No customers found</p>
                    <p className="text-xs text-[#6e6e73] mt-1 mb-4">Add your first customer to get started.</p>
                    <button onClick={() => openModal()} className="btn-secondary text-xs py-1.5">Add Customer</button>
                  </div>
                </td>
              </tr>
            ) : customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-[#19191b] transition-colors duration-100">
                <td className="table-td">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#2a2a2d] flex items-center justify-center text-[11px] font-medium text-[#a0a0a3] shrink-0">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-[#ededef]">{customer.name}</span>
                  </div>
                </td>
                <td className="table-td text-[#6e6e73]">{customer.email}</td>
                <td className="table-td">{customer.phone || <span className="text-[#4e4e51]">—</span>}</td>
                <td className="table-td max-w-[200px] truncate">{customer.address || <span className="text-[#4e4e51]">—</span>}</td>
                <td className="table-td">
                  <div className="flex items-center justify-end gap-0.5">
                    <button onClick={() => openModal(customer)} className="p-1.5 rounded hover:bg-[#2a2a2d] text-[#6e6e73] hover:text-[#ededef] transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(customer.id)} className="p-1.5 rounded hover:bg-red-500/10 text-[#6e6e73] hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="card w-full max-w-md p-0" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2d]">
              <h2 className="text-sm font-semibold text-[#ededef]">
                {editingCustomer ? 'Edit Customer' : 'New Customer'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-[#2a2a2d] text-[#6e6e73] transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="label-text">Full Name</label>
                <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="label-text">Email</label>
                <input required type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="label-text">Phone</label>
                <input type="text" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="label-text">Address</label>
                <textarea className="input-field min-h-[72px] resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#2a2a2d] mt-5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingCustomer ? 'Save Changes' : 'Create Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
