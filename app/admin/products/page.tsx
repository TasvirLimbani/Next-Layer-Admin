'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DataTable } from '@/components/admin/data-table';
import { ProductForm } from '@/components/admin/product-form';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Product } from '@/components/admin/mock-data';
import { normalizeProductImageUrls, normalizeProductImages } from '@/lib/utils';

type ProductImageGroup = {
  color: string;
  images: string[];
};

function getPreviewSrc(url: string) {
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }

  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

function ProductImageCell({
  product,
  onOpenLightbox,
}: {
  product: any;
  onOpenLightbox: (imageUrls: string[], index?: number) => void;
}) {
  const imageGroups = normalizeProductImageGroups({
    ...product,
    variants: product.variants || product.images || [],
  });
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  const safeActiveGroupIndex = Math.min(
    activeGroupIndex,
    Math.max(imageGroups.length - 1, 0)
  );

  const activeGroup = imageGroups[safeActiveGroupIndex] || imageGroups[0];
  const activeImages = activeGroup?.images || [];
  const activeImage = activeImages[0] || '';
  const extraCount = Math.max(activeImages.length - 4, 0);

  useEffect(() => {
    setActiveGroupIndex(0);
  }, [product?.id]);

  if (imageGroups.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-xs font-medium text-slate-400">
        No image
      </div>
    );
  }
  const previewImage =
    activeImages?.length > 0
      ? getPreviewSrc(activeImages[0])
      : "/placeholder.svg";

  return (
    <div className="w-full max-w-60 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => onOpenLightbox(activeImages, 0)}
        className="block w-full p-2 text-left"
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <div className="aspect-square w-full bg-slate-100">
            <img
              src={previewImage}
              alt={`${activeGroup?.color || "Product"}-primary`}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>
        </div>
      </button>

      <div className="px-2 pb-2">
        <div className="grid grid-cols-3 gap-2">
          {activeImages.slice(1, 5).map((imageUrl, index) => (
            <button
              key={`${imageUrl}-${index}`}
              type="button"
              onClick={() => onOpenLightbox(activeImages, index + 1)}
              className="overflow-hidden rounded-md border border-slate-200 bg-slate-100"
            >
              <div className="aspect-square w-full">
                <img
                  src={getPreviewSrc(imageUrl)}
                  alt={`${activeGroup?.color || 'Product'}-${index + 2}`}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    (event.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            </button>
          ))}

          {extraCount > 0 && (
            <button
              type="button"
              onClick={() => onOpenLightbox(activeImages, 0)}
              className="flex aspect-square items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xs font-semibold text-slate-500"
            >
              +{extraCount}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function normalizeProductImageGroups(product: any): ProductImageGroup[] {
  const groups: ProductImageGroup[] = [];

  // Support API response: variants
  if (Array.isArray(product?.variants)) {
    product.variants.forEach((variant: any, index: number) => {
      const images =
        variant.image_urls?.length > 0
          ? variant.image_urls
          : variant.images || [];

      if (images.length > 0) {
        groups.push({
          color: variant.color || `Color ${index + 1}`,
          images,
        });
      }
    });
  }

  // Support old response: images
  if (groups.length === 0 && Array.isArray(product?.images)) {
    product.images.forEach((group: any, index: number) => {
      const images = group.image_urls?.length
        ? group.image_urls
        : group.images || [];

      if (images.length > 0) {
        groups.push({
          color: group.color || `Color ${index + 1}`,
          images,
        });
      }
    });
  }

  // Fallback
  if (groups.length === 0) {
    const fallbackImages = normalizeProductImageUrls(product);

    if (fallbackImages.length > 0) {
      groups.push({
        color: "Default",
        images: fallbackImages,
      });
    }
  }

  return groups;
}

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
  const [selectedColors, setSelectedColors] = useState<string[] | null>(null);

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
          const normalizedProduct = normalizeProductImages(product);
          const fullImageUrls = normalizeProductImageUrls(normalizedProduct);

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
            variants: product.variants || [],

            images:
              product.variants?.map((v: any) => ({
                color: v.color,
                image_urls: v.image_urls || [],
              })) || [],
            customizable: product.customizable !== undefined ? Number(product.customizable) : 0,
            image_customizable: product.image_customizable !== undefined ? Number(product.image_customizable) : 0,
            subcategory: product.subcategory || '',
            sku: product.sku || '',
            color: Array.isArray(product.variants)
              ? product.variants
                .map((v: any) => v.color)
                .filter(Boolean)
              : [],
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
const requestData =
    formData ?? createFormData(product); 
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

const handleUpdateProduct = async (
  product: Product,
  formData?: FormData
) => {
  try {
    const requestData = formData ?? createFormData(product);

    // Make sure required fields are always present
    if (!requestData.has('product_id')) {
      requestData.append('product_id', String(product.id));
    }

    if (!requestData.has('product_name')) {
      requestData.append('product_name', product.name || '');
    }

    if (!requestData.has('category')) {
      requestData.append('category', product.category || '');
    }

    if (!requestData.has('subcategory')) {
      requestData.append('subcategory', product.subcategory || '');
    }

    if (!requestData.has('sku')) {
      requestData.append('sku', product.sku || '');
    }

    if (!requestData.has('price')) {
      requestData.append('price', String(product.price ?? ''));
    }

    if (!requestData.has('stock')) {
      requestData.append('stock', String(product.stock ?? ''));
    }

    if (!requestData.has('description')) {
      requestData.append('description', product.description || '');
    }

    if (!requestData.has('status')) {
      requestData.append('status', product.status || 'active');
    }

    if (!requestData.has('customizable')) {
      requestData.append(
        'customizable',
        String(product.customizable ?? 0)
      );
    }

    if (!requestData.has('image_customizable')) {
      requestData.append(
        'image_customizable',
        String(product.image_customizable ?? 0)
      );
    }

    // Debug FormData
    console.log('UPDATE PRODUCT DATA:');

    for (const [key, value] of requestData.entries()) {
      console.log(key, value);
    }

    const response = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      body: requestData,
    });

    const data = await response.json();

    console.log('Update response:', data);

    if (data.status) {
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

const createFormData = (product:any)=>{

    const fd=new FormData();

    fd.append("product_name",product.name);
    fd.append("category",product.category);
    fd.append("subcategory",product.subcategory);
    fd.append("sku",product.sku);
    fd.append("price",String(product.price));
    fd.append("stock",String(product.stock));
    fd.append("description",product.description);
    fd.append("status",product.status);
    fd.append("customizable",String(product.customizable));
    fd.append("image_customizable",String(product.image_customizable));

    if(product.id){
        fd.append("product_id",String(product.id));
    }

    product.variants?.forEach((variant:any,index:number)=>{

        fd.append(
            `variants[${index}][color]`,
            variant.color
        );

        variant.files?.forEach((file:File)=>{

            fd.append(
                `variants[${index}][images][]`,
                file
            );

        });

    });

    return fd;
}

//   const createFormData = (product: any): FormData => {
//     const formData = new FormData();

//     formData.append("product_id", product.id);
//     formData.append("product_name", product.name);
//     formData.append("category", product.category);
//     formData.append("subcategory", product.subcategory);
//     formData.append("sku", product.sku);
//     formData.append("price", String(product.price));
//     formData.append("stock", String(product.stock));
//     formData.append("description", product.description);
//     formData.append("status", product.status);

//     // Variants
//     product.variants?.forEach((variant: any, index: number) => {
//       formData.append(`variants[${index}][color]`, variant.color);

//       // New uploaded files
//   variant.items?.forEach((item:any)=>{

//     if(item.kind==="new" && item.file){

//         formData.append(
//             `variants[${index}][images][]`,
//             item.file,
//             item.file.name
//         );

//     }

//     if(item.kind==="existing"){

//         formData.append(
//             `variants[${index}][existing_images][]`,
//             item.src.split('/').pop() || item.src
//         );

//     }

// });
//     });

//     return formData;
//   };

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
            className="flex items-center gap-2 rounded-lg bg-linear-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all"
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
                  render: (_value, item) => {
                    return (
                      <div className="max-w-65">
                        <ProductImageCell product={item} onOpenLightbox={openLightbox} />
                      </div>
                    );
                  },
                },
                {
                  key: "color",
                  label: "COLOR",
                  render: (_: any, item: any) => {
                    const colors =
                      item.variants?.map((v: any) => v.color).filter(Boolean) || [];

                    if (!colors.length) {
                      return <span className="text-slate-500">N/A</span>;
                    }

                    return (
                      <button
                        onClick={() => setSelectedColors(colors)}
                        className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                      >
                        <span>{colors[0]}</span>
                        {colors.length > 1 && (
                          <span>+{colors.length - 1}</span>
                        )}
                      </button>
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
  render: (value) => {
    // Handle string/number
    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value).trim();

      return text ? (
        text
      ) : (
        <span className="text-slate-500">N/A</span>
      );
    }

    // Handle object like { name: "Keychains" }
    if (value && typeof value === 'object') {
      const category = value as { name?: string; category?: string };

      const text = category.name || category.category || '';

      return text ? (
        text
      ) : (
        <span className="text-slate-500">N/A</span>
      );
    }

    return <span className="text-slate-500">N/A</span>;
  },
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
                  render: (value) => {
                    const text = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
                    return text || <span className="text-slate-500">N/A</span>;
                  },
                },
                {
                  key: 'sku',
                  label: 'SKU',
                  render: (value) => {
                    const text = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
                    return text || <span className="text-slate-500">N/A</span>;
                  },
                },
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

      {/* Color Modal */}
      {selectedColors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">All Colors</h3>
              <button
                onClick={() => setSelectedColors(null)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {selectedColors.map((color: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

