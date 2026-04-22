import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { useToast } from '../components/Toast';
import {
  Button, Card, Input, Textarea, Modal, ConfirmModal,
  PageHeader, SearchBar, StockBadge, ProductCardSkeleton, EmptyState, Badge
} from '../components/UI';
import { Plus, Upload, Link as LinkIcon, Trash2, Pencil, ChevronLeft, ChevronRight, Image as ImageIcon, Clock } from 'lucide-react';
import StockHistoryDrawer from '../components/Product/StockHistoryDrawer';

// ── Image Carousel ───────────────────────────────────────────────────────────
const ImageCarousel = ({ images, className = '' }) => {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-stone-100 text-stone-300 ${className}`}>
        <ImageIcon size={40} />
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        key={images[idx].id}
        src={images[idx].imageUrl}
        alt={`img-${idx}`}
        crossOrigin="anonymous"
        onError={(e) => {
          console.error('Image load failed:', e.target.src);
          e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
        }}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); setIdx((idx - 1 + images.length) % images.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow transition-all">
            <ChevronLeft size={14} />
          </button>
          <button onClick={e => { e.stopPropagation(); setIdx((idx + 1) % images.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow transition-all">
            <ChevronRight size={14} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-3' : 'bg-white/60'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── Product Form ─────────────────────────────────────────────────────────────
const ProductForm = ({ product, onClose }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef();
  
  const [form, setForm] = useState({
    name: product?.name || '',
    price: product?.price || '',
    description: product?.description || '',
    quantity: product?.quantity || '',
  });
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [pendingUrls, setPendingUrls] = useState([]);
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (product) return api.put(`/products/${product.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      return api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast('success', `Product ${product ? 'updated' : 'created'}!`);
      onClose();
    },
    onError: () => toast('error', 'Failed to save product')
  });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.price || form.price <= 0) e.price = 'Valid price required';
    if (form.quantity === '' || form.quantity < 0) e.quantity = 'Valid quantity required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(p => [...p, ...selected]);
    setFilePreviews(p => [...p, ...selected.map(f => URL.createObjectURL(f))]);
  };

  const addUrl = () => {
    if (urlInput.trim()) { setPendingUrls(p => [...p, urlInput.trim()]); setUrlInput(''); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    files.forEach(f => data.append('images', f));
    pendingUrls.forEach(u => data.append('imageUrls', u));
    
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} error={errors.name} placeholder="e.g. Premium Dog Food" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Price (₹)" type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} error={errors.price} />
        <Input label="Quantity" type="number" min="0" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} error={errors.quantity} />
      </div>
      <Textarea label="Description" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the product..." />

      {/* Existing images */}
      {product?.ProductImages?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-stone-700 mb-2">Current Images</p>
          <div className="flex flex-wrap gap-2">
            {product.ProductImages.map(img => (
              <div key={img.id} className="w-14 h-14 rounded-lg overflow-hidden border border-stone-200 relative group/img">
                <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={async () => { 
                  try {
                    await api.delete(`/products/images/${img.id}`); 
                    queryClient.invalidateQueries({ queryKey: ['products'] });
                    toast('success', 'Image removed');
                  } catch (err) {
                    toast('error', 'Failed to remove image');
                  }
                }}
                  className="absolute inset-0 bg-red-500/70 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File upload */}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-2">Upload Images</p>
        <div onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-stone-200 rounded-xl p-4 text-center cursor-pointer hover:border-lime-500 hover:bg-lime-50/50 transition-colors">
          <Upload size={22} className="mx-auto text-stone-400 mb-1" />
          <p className="text-xs text-stone-500">Click to select files (multiple)</p>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
        </div>
        {filePreviews.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filePreviews.map((src, i) => (
              <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-stone-200">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { URL.revokeObjectURL(src); setFiles(p => p.filter((_, j) => j !== i)); setFilePreviews(p => p.filter((_, j) => j !== i)); }}
                  className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"><svg width="8" height="8" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" fill="none"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* URL input */}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-2">Add via URL</p>
        <div className="flex gap-2">
          <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
            placeholder="https://example.com/pet.jpg"
            className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100" />
          <Button type="button" variant="outline" size="sm" onClick={addUrl}><LinkIcon size={14} /> Add</Button>
        </div>
        {pendingUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {pendingUrls.map((url, i) => (
              <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-stone-200">
                <img src={url} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                <button type="button" onClick={() => setPendingUrls(p => p.filter((_, j) => j !== i))}
                  className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"><svg width="8" height="8" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" fill="none"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : (product ? 'Update' : 'Create Product')}</Button>
      </div>
    </form>
  );
};

// ── Product Detail Modal ──────────────────────────────────────────────────────
const ProductDetail = ({ product, onClose, onEdit, canEdit }) => (
  <Modal isOpen={!!product} onClose={onClose} title={product?.name || ''} maxWidth="max-w-2xl">
    {product && (
      <div className="space-y-5">
        <ImageCarousel images={product.ProductImages} className="w-full h-64 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-stone-50 rounded-xl p-4">
            <p className="text-xs text-stone-400 font-medium mb-1">Price</p>
            <p className="text-2xl font-bold text-lime-700">₹{(parseFloat(product.price) || 0).toFixed(2)}</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-4">
            <p className="text-xs text-stone-400 font-medium mb-1">Stock</p>
            <div className="flex items-center gap-2 mt-1">
              <StockBadge quantity={product.quantity} />
              <span className="text-sm text-stone-600">({product.quantity} units)</span>
            </div>
          </div>
        </div>
        {product.description && (
          <div>
            <p className="text-xs text-stone-400 font-medium mb-1">Description</p>
            <p className="text-sm text-stone-700 leading-relaxed">{product.description}</p>
          </div>
        )}
        {product.ProductImages?.length > 1 && (
          <div>
            <p className="text-xs text-stone-400 font-medium mb-2">All Images ({product.ProductImages.length})</p>
            <div className="flex flex-wrap gap-2">
              {product.ProductImages.map(img => (
                <img key={img.id} src={img.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-stone-200" />
              ))}
            </div>
          </div>
        )}
        {canEdit && (
          <Button className="w-full" onClick={() => { onClose(); onEdit(product); }}>
            <Pencil size={16} /> Edit Product
          </Button>
        )}
      </div>
    )}
  </Modal>
);

// ── Main Products Page ────────────────────────────────────────────────────────
const Products = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [detailProduct, setDetailProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [historyProduct, setHistoryProduct] = useState(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      const res = await api.get('/products', { params: { search } });
      return res.data?.products || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast('success', 'Product deleted');
      setDeleteTarget(null);
    },
    onError: () => toast('error', 'Delete failed')
  });

  const handleDelete = () => deleteMutation.mutate(deleteTarget.id);

  const openEdit = (p) => { setEditProduct(p); setFormOpen(true); };
  const openCreate = () => { setEditProduct(null); setFormOpen(true); };

  const filtered = (Array.isArray(products) ? products : []).filter(p => {
    const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchStock = stockFilter === 'all'
      || (stockFilter === 'in' && p.quantity > 10)
      || (stockFilter === 'low' && p.quantity > 0 && p.quantity <= 10)
      || (stockFilter === 'out' && (p.quantity === 0 || p.quantity === '0'));
    return matchSearch && matchStock;
  });

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${Array.isArray(products) ? products.length : 0} products in inventory`}
        action={isAdmin && <Button onClick={openCreate}><Plus size={16} /> Add Product</Button>}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search products..." />
        <div className="flex gap-2">
          {['all', 'in', 'low', 'out'].map(f => (
            <button key={f} onClick={() => setStockFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${stockFilter === f ? 'bg-lime-700 text-white border-lime-700' : 'bg-white border-stone-200 text-stone-500 hover:border-lime-400'}`}>
              {f === 'all' ? 'All' : f === 'in' ? 'In Stock' : f === 'low' ? 'Low' : 'Out'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🛍️" title="No products found" description="Try adjusting your search or add a new product."
          action={isAdmin && <Button onClick={openCreate}><Plus size={16} /> Add Product</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(p => (
            <Card key={p.id} hover className="overflow-hidden group" onClick={() => setDetailProduct(p)}>
              <div className="relative h-52">
                <ImageCarousel images={p.ProductImages} className="h-52 w-full" />
                <div className="absolute top-3 left-3"><StockBadge quantity={p.quantity} /></div>
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); setHistoryProduct(p); }}
                      className="bg-white rounded-lg p-1.5 shadow-md hover:bg-amber-50 text-stone-600 hover:text-amber-600 transition-colors" title="Stock History">
                      <Clock size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); openEdit(p); }}
                      className="bg-white rounded-lg p-1.5 shadow-md hover:bg-blue-50 text-stone-600 hover:text-blue-600 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setDeleteTarget(p); }}
                      className="bg-white rounded-lg p-1.5 shadow-md hover:bg-red-50 text-stone-600 hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-stone-800 mb-1 line-clamp-1">{p.name}</h3>
                <p className="text-xs text-stone-400 line-clamp-2 mb-3">{p.description || 'No description'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-lime-700">₹{(parseFloat(p.price) || 0).toFixed(2)}</span>
                  <span className="text-xs text-stone-400">{p.quantity} units</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <ProductDetail product={detailProduct} onClose={() => setDetailProduct(null)} onEdit={openEdit} canEdit={isAdmin} />

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editProduct ? 'Edit Product' : 'New Product'}>
        <ProductForm
          product={editProduct}
          onClose={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />

      {historyProduct && (
        <StockHistoryDrawer
          productId={historyProduct.id}
          productName={historyProduct.name}
          onClose={() => setHistoryProduct(null)}
        />
      )}
    </div>
  );
};

export default Products;
