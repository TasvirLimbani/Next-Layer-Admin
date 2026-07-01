'use client';

import { useState } from 'react';
import { Product } from './mock-data';
import {
  X,
  Upload,
  AlertCircle,
  Package,
  DollarSign,
  Boxes,
  Tag,
  FileText,
  Star,
  Trash2,
} from 'lucide-react';

import { Switch } from '@/components/ui/switch';

interface ProductFormProps {
  product?: Product;
  onSubmit: (
    data: Product,
    formData?: FormData
  ) => void;

  onClose: () => void;
}

const categories = [
'Keychains',
];

export function ProductForm({
  product,
  onSubmit,
  onClose,
}: ProductFormProps) {

  // =========================
  // FORM STATE
  // =========================

  const [formData, setFormData] =
    useState<Product>(
      product
        ? {
          ...product,

          // FIX API FIELD
          name:
            product.name || '',

          price:
            Number(product.price) || 0,

          stock:
            Number(product.stock) || 0,

          subcategory:
            product.subcategory || '',

          sku:
            product.sku || '',

          customizable:
            product.customizable
              ? 1
              : 0,

          status:
            product.status ||
            'active',
        }
        : {
          id: '',

          name: '',

          product_name: '',

          category:
            'Electronics',

          subcategory: '',

          sku: `SKU-${Date.now()}`,

          price: 0,

          stock: 0,

          description: '',

          customizable: 0,

          status: 'active',

          images: [],

          image_urls: [],
        }
    );

  // =========================
  // IMAGE STATE
  // =========================

  const [imageFiles, setImageFiles] =
    useState<File[]>([]);

  const [imagePreviews, setImagePreviews] =
    useState<string[]>(() => {

      // Existing images from API
      if (
        product &&
        Array.isArray(
          product.image_urls
        ) &&
        product.image_urls.length > 0
      ) {
        return product.image_urls;
      }

      return [];
    });

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (
      !formData.name ||
      !formData.price ||
      !formData.stock
    ) {
      alert(
        'Please fill all required fields'
      );

      return;
    }

const apiFormData = new FormData();

/* IMPORTANT */
apiFormData.append(
  'delete_images',
  JSON.stringify(deletedImages || [])
);

    apiFormData.append(
      'product_name',
      formData.name || ''
    );

    apiFormData.append(
      'category',
      formData.category || ''
    );

    apiFormData.append(
      'subcategory',
      formData.subcategory || ''
    );

    apiFormData.append(
      'sku',
      formData.sku || ''
    );

    apiFormData.append(
      'price',
      String(formData.price || 0)
    );

    apiFormData.append(
      'stock',
      String(formData.stock || 0)
    );

    apiFormData.append(
      'description',
      formData.description || ''
    );

    apiFormData.append(
      'status',
      formData.status || 'active'
    );

    apiFormData.append(
      'customizable',
      String(
        formData.customizable || 0
      )
    );

    // =========================
    // IMAGE FIX: include existing image URLs and new files
    // =========================

    // Build images submission by inspecting previews: blob: => new file, otherwise existing URL
    if (imagePreviews && imagePreviews.length > 0) {
      let newFileIdx = 0;
      for (let i = 0; i < imagePreviews.length; i++) {
        const preview = String(imagePreviews[i] || '');
        if (preview.startsWith('blob:')) {
          const file = imageFiles[newFileIdx];
          if (file) apiFormData.append('images[]', file);
          newFileIdx++;
        } else if (preview.length > 0) {
          apiFormData.append('existing_images[]', preview);
        }
      }
    } else {
      // no previews but possibly new files
      imageFiles.forEach((file) => apiFormData.append('images[]', file));
    }

    console.log('Submitting images: existing_images count:', apiFormData.getAll('existing_images[]').length, 'new images count:', apiFormData.getAll('images[]').length);

    // DEBUG
    for (const pair of apiFormData.entries()) {
      console.log(pair[0], pair[1]);
    }

    onSubmit(
      formData,
      apiFormData
    );
  };

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ) => {

    const { name, value } =
      e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        name === 'price' ||
          name === 'stock'
          ? Number(value)
          : value,
    }));
  };

  // =========================
  // STATUS TOGGLE
  // =========================

  const handleStatusToggle = (
    value: boolean
  ) => {

    setFormData((prev) => ({
      ...prev,

      status: value
        ? 'active'
        : 'inactive',
    }));
  };

  // =========================
  // CUSTOMIZABLE TOGGLE
  // =========================

  const handleCustomizableToggle = (
    value: boolean
  ) => {

    setFormData((prev) => ({
      ...prev,

      customizable: value
        ? 1
        : 0,
    }));
  };

  // =========================
  // IMAGE CHANGE
  // =========================

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const files = e.target.files;

    if (!files) return;

    const newFiles =
      Array.from(files);

    // VALIDATION
    const validFiles =
      newFiles.filter((file) => {

        if (
          file.size >
          5 * 1024 * 1024
        ) {

          alert(
            `${file.name} exceeds 5MB`
          );

          return false;
        }

        return true;
      });

    if (validFiles.length === 0)
      return;

    // SAVE FILES
    setImageFiles((prev) => [
      ...prev,
      ...validFiles,
    ]);

    // PREVIEW
    validFiles.forEach((file) => {

      const previewUrl =
        URL.createObjectURL(file);

      setImagePreviews((prev) => [
        ...prev,
        previewUrl,
      ]);
    });

    e.target.value = '';
  };

  // =========================
  // REMOVE IMAGE
  // =========================
const [deletedImages, setDeletedImages] = useState<string[]>([]);

const handleRemoveImage = (index: number) => {
  const removed = imagePreviews[index];

  setImagePreviews((prev) => prev.filter((_, i) => i !== index));

  // OLD IMAGE → mark for backend delete
  if (removed && !removed.startsWith('blob:')) {
    setDeletedImages((prev) => [...prev, removed]);
  }

  // NEW IMAGE → remove correct file safely
  if (removed && removed.startsWith('blob:')) {
    const blobIndexes = imagePreviews
      .slice(0, index)
      .filter((p) => p.startsWith('blob:')).length;

    setImageFiles((prev) =>
      prev.filter((_, i) => i !== blobIndexes)
    );
  }
};

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm">

      <div className="w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-8 py-6">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Package className="h-6 w-6 text-blue-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">

                {product
                  ? 'Edit Product'
                  : 'Add Product'}

              </h2>

              <p className="text-sm text-slate-500">

                {product
                  ? 'Update existing product'
                  : 'Create new product'}

              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100"
          >
            <X className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 p-8"
        >

          {/* Upload + previews at top */}
          <div className="flex items-start gap-6">
            <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-4 w-44 cursor-pointer">
              <Upload className="h-8 w-8 text-blue-600" />
              <p className="text-sm">Upload Images</p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>

            <div className="flex-1">
              <div
                className="flex gap-3 items-start py-2 whitespace-nowrap"
                style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
              >
                {imagePreviews && imagePreviews.length > 0
                  ? imagePreviews.map((url, idx) => (
                    <div key={url + idx} className="inline-block mr-2 relative">
                      <div className="h-24 w-28 rounded overflow-hidden border bg-white shadow-sm">
                        <img src={`/api/image-proxy?url=${encodeURIComponent(url)}`} alt={`preview-${idx}`} className="h-full w-full object-cover" />
                      </div>

                      <div className="absolute -top-2 -left-2 bg-yellow-400 rounded-full p-1 shadow flex items-center justify-center">
                        {idx === 0 ? <Star className="h-3 w-3 text-white" /> : null}
                      </div>

                      <div className="mt-2 flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Remove image"
                          className="flex items-center gap-1 text-xs px-2 py-1 bg-red-50 text-red-600 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))
                  : null}
              </div>
            </div>
          </div>

          {/* PRODUCT NAME */}

          <div>

            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">

              <Tag className="h-4 w-4 text-blue-600" />

              Product Name

            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Product name"
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
              required
            />
          </div>

          {/* CATEGORY */}

          <div>

            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">

              <Package className="h-4 w-4 text-blue-600" />

              Category

            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            >

              {categories.map((cat) => (

                <option
                  key={cat}
                  value={cat}
                >
                  {cat}
                </option>

              ))}

            </select>
          </div>

          {/* SUBCATEGORY */}

          <div>

            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">

              <Tag className="h-4 w-4 text-blue-600" />

              Subcategory

            </label>

            <input
              type="text"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              placeholder="Enter subcategory"
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />

          </div>

          {/* PRICE + STOCK */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            <div>

              <label className="mb-2 flex items-center gap-2 text-sm font-semibold">

                <DollarSign className="h-4 w-4 text-amber-600" />

                Price

              </label>

              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
                required
              />
            </div>

            <div>

              <label className="mb-2 flex items-center gap-2 text-sm font-semibold">

                <Boxes className="h-4 w-4 text-amber-600" />

                Stock

              </label>

              <input
                type="text"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Enter stock"
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
                required
              />
            </div>
          </div>

          {/* DESCRIPTION */}

          <div>

            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">

              <FileText className="h-4 w-4 text-blue-600" />

              Description

            </label>

            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          {/* STATUS */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">

              <div>

                <p className="font-semibold">
                  Product Status
                </p>

                <p className="text-sm text-slate-500">

                  {formData.status ===
                    'active'
                    ? 'Active'
                    : 'Inactive'}

                </p>
              </div>

              <Switch
                checked={
                  formData.status ===
                  'active'
                }
                onCheckedChange={
                  handleStatusToggle
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 p-4">

              <div>

                <p className="font-semibold">
                  Customizable
                </p>

                <p className="text-sm text-slate-500">

                  {formData.customizable
                    ? 'Enabled'
                    : 'Disabled'}

                </p>
              </div>

              <Switch
                checked={
                  formData.customizable ===
                  1
                }
                onCheckedChange={
                  handleCustomizableToggle
                }
              />
            </div>
          </div>



          {/* BUTTONS */}

          <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-6 py-3 font-semibold"
            >

              Cancel

            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >

              {product
                ? 'Update Product'
                : 'Create Product'}

            </button>
          </div>
        </form>
      </div>
    </div>
  );
}