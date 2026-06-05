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
  'Electronics',
  'Accessories',
  'Clothing',
  'Home',
  'Sports',
  'Toy',
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

    const apiFormData =
      new FormData();

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
    // IMAGE FIX
    // =========================

    if (imageFiles.length > 0) {

      imageFiles.forEach((file) => {

        // IMPORTANT
        apiFormData.append(
          'images[]',
          file
        );
      });
    }

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

  const handleRemoveImage = (
    index: number
  ) => {

    setImagePreviews((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );

    setImageFiles((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
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

          {/* IMAGE SECTION */}

          <div>

            <div className="mb-4 flex items-center gap-2">

              <Upload className="h-5 w-5 text-pink-600" />

              <h3 className="text-lg font-semibold">
                Product Images
              </h3>
            </div>

            {/* PREVIEW */}

            {imagePreviews.length >
              0 && (

                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">

                  {imagePreviews.map(
                    (
                      preview,
                      index
                    ) => (

                      <div
                        key={index}
                        className="group relative overflow-hidden rounded-xl border"
                      >

                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className="h-32 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveImage(
                              index
                            )
                          }
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-all group-hover:opacity-100"
                        >

                          <X className="h-6 w-6 text-white" />

                        </button>
                      </div>
                    )
                  )}

                </div>
              )}

            {/* FILE INPUT */}

            <label className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 hover:border-blue-500">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">

                <Upload className="h-8 w-8 text-blue-600" />

              </div>

              <div className="text-center">

                <p className="font-semibold">

                  Click to Upload Images

                </p>

                <p className="text-sm text-slate-500">

                  PNG, JPG, WEBP up to 5MB

                </p>
              </div>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={
                  handleImageChange
                }
                className="hidden"
              />
            </label>
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