'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DataTable } from '@/components/admin/data-table';
import { ProductForm } from '@/components/admin/product-form';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Product } from '@/components/admin/mock-data';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();

      if (data.status && data.products) {
        const rawProducts = Array.isArray(data.products) ? data.products : [data.products];

        console.log('Raw API Response:', rawProducts);

        // Map API response to Product interface
        const mappedProducts = rawProducts.map((product: any) => {
          // Handle both single image and multiple images
          // Use image_urls directly from API
          const fullImageUrls =
            Array.isArray(product.image_urls)
              ? product.image_urls
              : typeof product.image_urls === 'string'
                ? product.image_urls.split(',').map((i: string) => i.trim())
                : [];

          console.log(
            `Product "${product.product_name}" - fullImageUrls:`,
            fullImageUrls
          );

          return {
            id: product.id || '',
            name: product.product_name || '',
            price: parseFloat(product.price) || 0,
            stock: parseInt(product.stock) || 0,
            category: product.category || '',
            description: product.description || '',
            // keep legacy comma-string for table cell rendering
            image: fullImageUrls.join(','),
            // include array form so edit forms can read product.image_urls
            image_urls: fullImageUrls,
            customizable: product.customizable !== undefined ? Number(product.customizable) : 0,
            subcategory: product.subcategory || '',
            sku: product.sku || '',
            status: product.status || 'active',
            created_at: product.created_at || '',
          };
        });

        console.log('Mapped Products:', mappedProducts);

        setProducts(mappedProducts);
        setError(null);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError('Error fetching products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (product: Product, formData?: FormData) => {
    try {
      const requestData = formData || createFormData(product);
      console.log('Adding product:', product);

      const response = await fetch('/api/products', {
        method: 'POST',
        body: requestData,
      });

      const data = await response.json();
      console.log('Add response:', data);

      if (data.status) {
        // Refresh products list to get the new product with correct ID from API
        await fetchProducts();
        setShowForm(false);
        setError(null);
      } else {
        setError(data.message || 'Failed to add product');
      }
    } catch (err) {
      setError('Error adding product');
      console.error(err);
    }
  };

  const handleUpdateProduct = async (product: Product, formData?: FormData) => {
    try {
      const requestData = formData || createFormData(product);
      console.log('Updating product:', product.id, requestData);

      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        body: requestData,
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (data.status) {
        // Refresh products list to get updated data
        await fetchProducts();
        setEditingProduct(undefined);
        setShowForm(false);
        setError(null);
      } else {
        setError(data.message || 'Failed to update product');
      }
    } catch (err) {
      setError('Error updating product');
      console.error(err);
    }
  };

  const handleDeleteProduct = async () => {
    if (deleteId) {
      try {
        console.log('Deleting product:', deleteId);

        const response = await fetch(`/api/products/${deleteId}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        console.log('Delete response:', data);

        if (data.status) {
          setProducts((prev) => prev.filter((p) => p.id !== deleteId));
          setDeleteId(null);
          setError(null);
        } else {
          setError(data.message || 'Failed to delete product');
        }
      } catch (err) {
        setError('Error deleting product');
        console.error(err);
      }
    }
  };

  const handleSubmitForm = (product: Product, formData?: FormData) => {
    if (editingProduct) {
      handleUpdateProduct(product, formData);
    } else {
      handleAddProduct(product, formData);
    }
  };

  const createFormData = (product: Product): FormData => {
    const formData = new FormData();

    // REQUIRED
    formData.append('id', String(product.id));

    formData.append('product_name', product.name || '');
    formData.append('category', product.category || '');
    formData.append('subcategory', product.subcategory || '');
    formData.append('sku', product.sku || '');

    formData.append('price', String(product.price || 0));
    formData.append('stock', String(product.stock || 0));

    formData.append('description', product.description || '');

    formData.append('status', product.status || 'active');
    formData.append('customizable', String(product.customizable || 0));

    return formData;
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const openLightbox = (imageUrls: string[], index: number = 0) => {
    setLightboxImages(imageUrls);
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  const nextImage = () => {
    setLightboxIndex((prev) =>
      prev === lightboxImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setLightboxIndex((prev) =>
      prev === 0 ? lightboxImages.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-700 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Products</h1>
            <p className="text-slate-600 mt-2">Manage your product inventory and details</p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(undefined);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            <Plus className="h-5 w-5" />
            Add New Product
          </button>
        </div>

        {/* Products Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Total Products</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{products.length}</p>
            <p className="mt-4 text-xs text-slate-500">Active in catalog</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Total Value</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              ₹
              {products
                .reduce((sum, p) => {
                  const price = parseFloat(String(p.price)) || 0;
                  const stock = parseInt(String(p.stock)) || 0;

                  return sum + price * stock;
                }, 0)
                .toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </p>
            <p className="mt-4 text-xs text-slate-500">Inventory value</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Low Stock Items</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {products.filter(p => Number(p.stock) < 20).length}
            </p>
            <p className="mt-4 text-xs text-slate-500">Need attention</p>
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Product List</h2>
          </div>
          <div className="p-6">
            <DataTable
              columns={[
                {
                  key: 'image',
                  label: 'Image',
                  render: (value) => {
                    // Parse multiple images from comma-separated string
                    const imageUrls = value && typeof value === 'string'
                      ? value
                        .split(',')
                        .map((img: string) => img.trim())
                        .filter((img: string) => img.length > 0)
                      : [];

                    return (
                      <div className="flex items-center gap-2">
                        {imageUrls.length > 0 ? (
                          <>
                            <button
                              onClick={() => openLightbox(imageUrls, 0)}
                              className="relative group overflow-hidden rounded hover:opacity-75 transition-opacity"
                            >
                              <img
                                src={`/api/image-proxy?url=${encodeURIComponent(imageUrls[0])}`}
                                alt="Product"
                                className="h-10 w-10 rounded object-cover border border-slate-200"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors rounded">
                                <svg className="w-3 h-3 text-white opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </button>
                            {imageUrls.length > 1 && (
                              <button
                                onClick={() => openLightbox(imageUrls, 0)}
                                className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded px-2 py-1 cursor-pointer transition-colors"
                              >
                                +{imageUrls.length - 1}
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                            No
                          </div>
                        )}
                      </div>
                    );
                  },
                },
                {
                  key: 'name',
                  label: 'Product Name',
                  className: 'max-w-xs',
                },
                {
                  key: 'category',
                  label: 'Category',
                },
                {
                  key: 'price',
                  label: 'Price',
                  render: (value) => (
                    <span className="font-semibold text-slate-900">₹{(Number(value) || 0).toFixed(2)}</span>
                  ),
                },
                {
                  key: 'subcategory',
                  label: 'Subcategory',
                  render: (value) => value || <span className="text-slate-500">N/A</span>,
                },
                { key: 'sku', label: 'SKU', render: (value) => value || <span className="text-slate-500">N/A</span> },
                {
                  key: 'stock',
                  label: 'Stock',
                  render: (value) => {
                    const stock = Number(value) || 0;
                    const bgColor = stock > 50 ? 'bg-green-50' : stock > 20 ? 'bg-yellow-50' : 'bg-red-50';
                    const textColor = stock > 50 ? 'text-green-700' : stock > 20 ? 'text-yellow-700' : 'text-red-700';
                    return (
                      <span className={`inline-block rounded-lg px-3 py-1 text-sm font-medium ${bgColor} ${textColor}`}>
                        {stock} items
                      </span>
                    );
                  },
                },
              ]}
              data={products}
              renderActions={(product) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit product"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(product.id)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmitForm}
          onClose={handleCloseForm}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <ConfirmDialog
          title="Delete Product"
          description="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={handleDeleteProduct}
          onCancel={() => setDeleteId(null)}
          isDestructive
        />
      )}

      {/* Image Lightbox Modal */}
      {showLightbox && lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-4xl flex flex-col items-center">
            {/* Close Button */}
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute -top-12 right-0 text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Image Container */}
            <div className="relative w-full bg-black rounded-lg overflow-hidden">
              <img
                src={lightboxImages[lightboxIndex]}
                alt={`Product image ${lightboxIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/800x600?text=Image+Not+Found';
                }}
              />
            </div>

            {/* Navigation Controls */}
            {lightboxImages.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={prevImage}
                  className="text-white hover:bg-white/20 rounded-lg p-3 transition-colors"
                  title="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <div className="text-white text-sm font-medium bg-white/10 rounded-lg px-4 py-2">
                  {lightboxIndex + 1} / {lightboxImages.length}
                </div>

                <button
                  onClick={nextImage}
                  className="text-white hover:bg-white/20 rounded-lg p-3 transition-colors"
                  title="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

