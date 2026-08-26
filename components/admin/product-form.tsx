'use client';

import { useEffect, useState } from 'react';
import { Product } from './mock-data';
import { normalizeProductImageUrls } from '@/lib/utils';
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

type ImageItem = {
  id: string;
  kind: 'existing' | 'new';
  src: string;
  file?: File;
};

type ImageGroup = {
  id: string;
  color: string;
  items: ImageItem[];
};

function createImageItem(
  kind: 'existing' | 'new',
  src: string,
  file?: File
): ImageItem {
  return {
    id: `${kind}-${src}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    src,
    file,
  };
}

function toDisplayUrl(value: string) {
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:') ||
    value.startsWith('data:') ||
    value.startsWith('/')
  ) {
    return value;
  }

  return `http://nextlayer.soon.it/images/${value.replace(/^\/+/, '')}`;
}

function getPreviewSrc(value: string) {
  if (
    value.startsWith('blob:') ||
    value.startsWith('data:')
  ) {
    return value;
  }

  return `/api/image-proxy?url=${encodeURIComponent(value)}`;
}

function buildInitialImageGroups(product?: Product): ImageGroup[] {
  const productColors = Array.isArray(product?.color)
    ? product.color
      .map((item) => String(item).trim())
      .filter(Boolean)
    : product?.color && String(product.color).trim()
      ? [String(product.color).trim()]
      : [];

  const groups =
    Array.isArray(product?.variants) && product.variants.length
      ? product.variants
      : Array.isArray(product?.images)
        ? product.images
        : [];

  if (groups.length > 0) {
    return groups.map((group, index) => {
      const color = String(group?.color || productColors[index] || '').trim();
      const imageValues =
        Array.isArray(group?.image_urls)
          ? group.image_urls
          : Array.isArray(group?.images)
            ? group.images
            : Array.isArray(group?.image)
              ? group.image
              : typeof group?.images === "string"
                ? [group.images]
                : [];

      return {
        id: `group-${index}`,
        color,
        items: imageValues
          .map((value) => String(value).trim())
          .filter(Boolean)
          .map((value) =>
            createImageItem("existing", value)
          ),
      };
    });
  }

  const fallbackImages = normalizeProductImageUrls(product);

  return [
    {
      id: 'group-0',
      color: productColors[0] || '',
      items: fallbackImages.map((value) => createImageItem('existing', value)),
    },
  ];
}

function syncColorState(groups: ImageGroup[]) {
  return groups.map((group) => group.color.trim()).filter(Boolean);
}

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

              image_customizable:
              product.image_customizable
                ? 1
                : 0,

          status:
            product.status ||
            'active',

          color: Array.isArray(product.color)
            ? (product.color as any[]).filter((c: any) => c && String(c).trim()).map((c: any) => String(c).trim())
            : (product.color && String(product.color).trim() ? [String(product.color).trim()] : []),
        }
        : {
          id: '',

          name: '',

          color: [],

          category:
            '',

          subcategory: '',

          sku: `SKU-${Date.now()}`,

          price: 0,

          stock: 0,

          description: '',

          image: '',

          customizable: 0,

          image_customizable: 0,

          status: 'active',

          image_urls: [],
        }
    );

  // =========================
  // COLOR EDIT STATE
  // =========================
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [editingColorValue, setEditingColorValue] = useState<string>('');

  // =========================
  // IMAGE STATE
  // =========================

  useEffect(() => {
    if (!product) return;

    const groups = buildInitialImageGroups(product);

    setImageGroups(groups);

    setFormData((prev) => ({
      ...prev,
      color: groups.map((g) => g.color),
    }));
  }, [product]);

  const [imageGroups, setImageGroups] = useState<ImageGroup[]>(() => buildInitialImageGroups(product));


  const [deletedImages, setDeletedImages] = useState<string[]>([]);

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

    apiFormData.append("product_name", formData.name || "");
    apiFormData.append("category", formData.category || "");
    apiFormData.append("subcategory", formData.subcategory || "");
    apiFormData.append("sku", formData.sku || "");
    apiFormData.append("price", String(formData.price || 0));
    apiFormData.append("stock", String(formData.stock || 0));
    apiFormData.append("description", formData.description || "");
    apiFormData.append("status", formData.status || "active");
    apiFormData.append(
      "customizable",
      String(formData.customizable || 0)
    );
    apiFormData.append(
      "image_customizable",
      String(formData.image_customizable || 0)
    );

    // =========================
    // EDIT PRODUCT
    // =========================

    if (product?.id) {
      apiFormData.append("product_id", String(product.id));

      apiFormData.append(
        "delete_images",
        JSON.stringify(deletedImages || [])
      );

      imageGroups.forEach((group, index) => {
        // color
        apiFormData.append(
          `variants[${index}][color]`,
          group.color
        );

        group.items.forEach((item) => {
          // newly uploaded image
          if (item.kind === "new" && item.file) {
            apiFormData.append(
              `variants[${index}][images][]`,
              item.file,
              item.file.name
            );
          }

          // existing image
          if (item.kind === "existing") {
            apiFormData.append(
              `variants[${index}][existing_images][]`,
              item.src.split("/").pop() || item.src
            );
          }
        });
      });

    } else {

      // =========================
      // ADD PRODUCT
      // =========================

      imageGroups.forEach((group, index) => {
        // color
        apiFormData.append(
          "colors[]",
          group.color
        );

        // images of that color
        group.items.forEach((item) => {
          if (item.kind === "new" && item.file) {
            apiFormData.append(
              `images_${index}[]`,
              item.file,
              item.file.name
            );
          }
        });
      });

    }

    //     if (product?.id) { {
    //       apiFormData.append("product_id", String(product.id));
    //     }

    //     /* IMPORTANT */
    //     apiFormData.append(
    //       'delete_images',
    //       JSON.stringify(deletedImages || [])
    //     );

    //     apiFormData.append(
    //       'product_name',
    //       formData.name || ''
    //     );

    //     apiFormData.append(
    //       'category',
    //       formData.category || ''
    //     );

    //     apiFormData.append(
    //       'subcategory',
    //       formData.subcategory || ''
    //     );

    //     apiFormData.append(
    //       'sku',
    //       formData.sku || ''
    //     );

    //     apiFormData.append(
    //       'price',
    //       String(formData.price || 0)
    //     );

    //     apiFormData.append(
    //       'stock',
    //       String(formData.stock || 0)
    //     );

    //     apiFormData.append(
    //       'description',
    //       formData.description || ''
    //     );

    //     apiFormData.append(
    //       'status',
    //       formData.status || 'active'
    //     );

    //     apiFormData.append(
    //       'customizable',
    //       String(formData.customizable || 0)
    //     );

    //     // apiFormData.append(
    //     //   'color',
    //     //   Array.isArray(formData.color)
    //     //     ? JSON.stringify(formData.color.filter((c: any) => String(c).trim()))
    //     //     : formData.color || ''
    //     // );

    //     // imageGroups.forEach((group, index) => {
    //     //   // color
    //     //   apiFormData.append("colors[]", group.color);

    //     //   group.items.forEach((item) => {
    //     //     if (item.kind === "new" && item.file) {
    //     //       apiFormData.append(
    //     //         `images_${index}[]`,
    //     //         item.file,
    //     //         item.file.name
    //     //       );
    //     //     }
    //     //     if (item.kind === "existing") {
    //     //       apiFormData.append(
    //     //         `existing_images_${index}[]`,
    //     //         item.src.split("/").pop() || item.src
    //     //       );
    //     //     }
    //     //   });
    //     // });  

    //    imageGroups.forEach((group, index) => {
    //     apiFormData.append(
    //       `variants[${index}][color]`,
    //       group.color
    //     );

    //     group.items.forEach((item) => {
    //       if (item.kind === "new" && item.file) {
    //         apiFormData.append(
    //           `variants[${index}][images][]`,
    //           item.file
    //         );
    //       }

    //       if (item.kind === "existing") {
    //         apiFormData.append(
    //           `variants[${index}][existing_images][]`,
    //           item.src.split("/").pop() || item.src
    //         );
    //       }
    //     });
    //   });

    // } else {
    //    // ===========================
    //   // ADD API
    //   // ===========================

    //   imageGroups.forEach((group, index) => {

    //     apiFormData.append(
    //       "colors[]",
    //       group.color
    //     );

    //     group.items.forEach((item) => {
    //       if (item.kind === "new" && item.file) {
    //         apiFormData.append(
    //           `images_${index}[]`,
    //           item.file
    //         );
    //       }
    //     });

    //   });

    // }

    console.log(
      'Submitting grouped images: colors count:',
      apiFormData.getAll('colors[]').length,
      'existing images count:',
      apiFormData.getAll('existing_images[]').length,
      'new images count:',
      Array.from(apiFormData.keys()).filter((key) => key.startsWith('images_')).length
    );

    // DEBUG
    for (const pair of apiFormData.entries()) {
      console.log(pair[0], pair[1]);
    }

    onSubmit(
      formData,
      apiFormData

    );
    for (const pair of apiFormData.entries()) {
      console.log(pair[0], pair[1]);
    }
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
  // IMAGE GROUPS
  // =========================
  
  const handleImageCustomizableToggle = (
    value: boolean
  ) => {

    setFormData((prev) => ({
      ...prev,  
      image_customizable: value
        ? 1
        : 0,  
  }));
  };

  const handleColorGroupChange = (groupIndex: number, value: string) => {
    setImageGroups((prev) => {
      const next = prev.map((group, index) => (
        index === groupIndex ? { ...group, color: value } : group
      ));

      setFormData((current) => ({
        ...current,
        color: syncColorState(next),
      }));

      return next;
    });
  };

  const handleAddColorGroup = () => {
    setImageGroups((prev) => {
      const next = [
        ...prev,
        {
          id: `group-${prev.length}`,
          color: '',
          items: [],
        },
      ];

      setFormData((current) => ({
        ...current,
        color: syncColorState(next),
      }));

      return next;
    });
  };

  const handleRemoveColorGroup = (groupIndex: number) => {
    setImageGroups((prev) => {
      const next = prev.filter((_, index) => index !== groupIndex);
      const safeNext = next.length > 0 ? next : [{ id: 'group-0', color: '', items: [] }];

      setFormData((current) => ({
        ...current,
        color: syncColorState(safeNext),
      }));

      return safeNext;
    });
  };

  const handleImageChange = (
    groupIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;

    if (!files) return;

    const newFiles = Array.from(files);

    const validFiles = newFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    setImageGroups((prev) =>
      prev.map((group, index) => {
        if (index !== groupIndex) {
          return group;
        }

        return {
          ...group,
          items: [
            ...group.items,
            ...validFiles.map((file) => createImageItem('new', URL.createObjectURL(file), file)),
          ],
        };
      })
    );

    e.target.value = '';
  };

  const handleRemoveImage = (groupIndex: number, itemIndex: number) => {
    setImageGroups((prev) =>
      prev.map((group, index) => {
        if (index !== groupIndex) {
          return group;
        }

        const removed = group.items[itemIndex];

        if (removed?.kind === 'existing') {
          setDeletedImages((current) => [
            ...current,
            removed.src.split("/").pop() || removed.src,
          ]);
        }

        if (removed?.kind === 'new' && removed.src.startsWith('blob:')) {
          URL.revokeObjectURL(removed.src);
        }

        return {
          ...group,
          items: group.items.filter((_, index) => index !== itemIndex),
        };
      })
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

          {/* COLOR VARIANTS */}

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Tag className="h-4 w-4 text-blue-600" />
              Color Variants
            </label>

            <div className="space-y-4">
              {imageGroups.map((group, groupIndex) => (
                <div key={group.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Color {groupIndex + 1}
                      </label>
                      <input
                        type="text"
                        value={group.color}
                        onChange={(e) => handleColorGroupChange(groupIndex, e.target.value)}
                        placeholder="Enter color name"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2"
                      />
                    </div>

                    <div className="flex items-center gap-2 md:pt-6">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                        <Upload className="h-4 w-4" />
                        Add Images
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(groupIndex, e)}
                        />
                      </label>

                      {imageGroups.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColorGroup(groupIndex)}
                          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Remove Color
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {group.items.length > 0 ? (
                      group.items.map((item, itemIndex) => (
                        <div key={item.id} className="relative rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                          <div className="h-24 overflow-hidden rounded-lg bg-slate-100">
                            <img
                              src={getPreviewSrc(toDisplayUrl(item.src))}
                              alt={`${group.color || 'color'}-${itemIndex + 1}`}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                (event.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          </div>

                          {itemIndex === 0 && (
                            <div className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 shadow">
                              <Star className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(groupIndex, itemIndex)}
                            className="mt-2 flex w-full items-center justify-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                        No images added for this color yet.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-start">
              <button
                type="button"
                onClick={handleAddColorGroup}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                + Add Another Color
              </button>
            </div>
          </div>

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
             <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 p-4">

              <div>

                <p className="font-semibold">
                  Image Customizable
                </p>

                <p className="text-sm text-slate-500">

                  {formData.image_customizable
                    ? 'Enabled'
                    : 'Disabled'}

                </p>
              </div>

              <Switch
                checked={
                  formData.image_customizable ===
                  1
                }
                onCheckedChange={
                  handleImageCustomizableToggle
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