'use client';

import { useState } from 'react';
import { Product } from './mock-data';
import { X, Upload } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Product, formData?: FormData) => void;
  onClose: () => void;
}

const categories = [
  'Electronics',
  'Accessories',
  'Clothing',
  'Home',
  'Sports',
];

export function ProductForm({
  product,
  onSubmit,
  onClose,
}: ProductFormProps) {
  const [formData, setFormData] =
    useState<Product>(
      product
        ? {
            ...product,
            price:
              Number(product.price) || 0,
            stock:
              Number(product.stock) || 0,
            subcategory:
              product.subcategory || '',
            sku: product.sku || '',
          }
        : {
            id: '',
            name: '',
            price: 0,
            stock: 0,
            category: 'Electronics',
            subcategory: '',
            sku: `SKU-${Date.now()}`,
            description: '',
            image: '',
          }
    );

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string>(
      product?.image
        ? (product.image as string)
        : ''
    );

  // SUBMIT
  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const apiFormData = new FormData();

    apiFormData.append(
      'id',
      String(formData.id || '')
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

    // IMPORTANT FIX
    apiFormData.append(
      'sku',
      formData.sku?.trim() ||
        `SKU-${Date.now()}`
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
      'active'
    );

    // IMAGE
    if (imageFile) {
      apiFormData.append(
        'images',
        imageFile
      );
    }

    // DEBUG
    for (const pair of apiFormData.entries()) {
      console.log(pair[0], pair[1]);
    }

    onSubmit(formData, apiFormData);
  };

  // CHANGE
  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'price' ||
        name === 'stock'
          ? Number(value)
          : value,
    }));
  };

  // IMAGE
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (file) {
      setImageFile(file);

      const reader =
        new FileReader();

      reader.onloadend = () => {
        setImagePreview(
          reader.result as string
        );
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {product
              ? 'Edit Product'
              : 'Add New Product'}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* NAME */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Product Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2"
              />
            </div>

            {/* PRICE */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Price *
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2"
              />
            </div>

            {/* STOCK */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Stock *
              </label>

              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Category *
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2"
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
              <label className="block text-sm font-medium text-slate-700">
                Subcategory
              </label>

              <input
                type="text"
                name="subcategory"
                value={
                  formData.subcategory || ''
                }
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                SKU *
              </label>

              <input
                type="text"
                name="sku"
                value={formData.sku || ''}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2"
              />
            </div>
          </div>

          {/* IMAGE */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Product Image
            </label>

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="h-32 w-32 rounded-lg object-cover border"
              />
            )}

            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 p-6 hover:border-blue-500">
              <Upload className="h-5 w-5" />

              <span>Upload Image</span>

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleImageChange
                }
                className="hidden"
              />
            </label>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={
                formData.description
              }
              onChange={handleChange}
              rows={4}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {product
                ? 'Update Product'
                : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}