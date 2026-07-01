'use client';

import { useState } from 'react';

import {
  X,
  Upload,
  Star,
  Trash2,
} from 'lucide-react';

interface Props {
  filament?: any;

  onClose: () => void;

  onSuccess: () => void;
}

export function FilamentForm({
  filament,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] =
    useState({
      title:
        filament?.title || '',

      description:
        filament?.description ||
        '',

      colour:
        filament?.colour?.[0] ||
        '',

      diameter:
        filament?.diameter?.[0] ||
        '',

      weight:
        filament?.weight?.[0] ||
        '',

      price:
        filament?.price || '',

      slug:
        filament?.slug || '',

      sku:
        filament?.sku || '',
    });

  const [images, setImages] =
    useState<FileList | null>(
      null
    );

  const [existingImages, setExistingImages] = useState<string[]>(filament?.images || []);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [primaryImage, setPrimaryImage] = useState<{ type: 'existing' | 'new'; index: number } | null>(
    null
  );

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    const formData = new FormData();

    if (filament?.id) {
      formData.append('id', filament.id);
    }

    formData.append(
      'title',
      form.title
    );

    formData.append(
      'description',
      form.description
    );

    formData.append(
      'colour[]',
      form.colour
    );

    formData.append(
      'diameter[]',
      form.diameter
    );

    formData.append(
      'weight[]',
      form.weight
    );

    formData.append(
      'price',
      form.price
    );

    formData.append(
      'slug',
      form.slug
    );

    formData.append(
      'sku',
      form.sku
    );

    formData.append(
      'delete_images',
      JSON.stringify(deletedImages)
    );
    // include kept existing image URLs (so backend can keep them)
    if (existingImages && existingImages.length > 0) {
      existingImages.forEach((url) => formData.append('existing_images[]', url));
    }

    // primary image hint (either existing URL or new file name)
    if (primaryImage) {
      let primaryVal = '';
      if (primaryImage.type === 'existing') {
        primaryVal = existingImages[primaryImage.index] || '';
      } else if (primaryImage.type === 'new') {
        primaryVal = newFiles[primaryImage.index]?.name || '';
      }
      if (primaryVal) formData.append('primary_image', primaryVal);
    }

    // append newly selected files
    if (newFiles && newFiles.length > 0) {
      newFiles.forEach((file) => formData.append('images[]', file, file.name));
    }

    const response =
      await fetch(
        '/api/filament',
        {
          method:
            filament?.id
              ? 'PUT'
              : 'POST',

          body: formData,
        }
      );

    const data =
      await response.json();

    alert(data.message);

    setLoading(false);

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[80vh] overflow-y-auto">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">

            {filament
              ? 'Edit Filament'
              : 'Add Filament'}

          </h2>

          <button
            onClick={onClose}
          >
            <X />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Upload + previews at top in a single row */}
          <div className="flex items-start gap-6">
            <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-4 w-44 cursor-pointer">
              <Upload className="h-8 w-8 text-blue-600" />
              <p className="text-sm">Upload Images</p>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  setImages(files);
                  setNewFiles(files ? Array.from(files) : []);
                }}
              />
            </label>

            <div className="flex-1">
              <div
                className="flex gap-3 items-start py-2 whitespace-nowrap"
                style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
              >
                {existingImages && existingImages.length > 0
                  ? existingImages.map((url, idx) => {
                    const isPrimary = (primaryImage?.type === 'existing' && primaryImage.index === idx) || (!primaryImage && idx === 0);
                    return (
                      <div key={url + idx} className="inline-block mr-2 relative">
                        <div className="h-20 w-20 rounded overflow-hidden border bg-white shadow-sm">
                          <img
                            src={`/api/image-proxy?url=${encodeURIComponent(url)}`}
                            alt={`existing-${idx}`}
                            className="h-full w-full object-cover"
                            onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=No+Image')}
                          />
                        </div>

                        {isPrimary && (
                          <div className="absolute -top-2 -left-2 bg-yellow-400 rounded-full p-1 shadow flex items-center justify-center">
                            <Star className="h-3 w-3 text-white" />
                          </div>
                        )}

                        <div className="mt-2 flex gap-2 justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setDeletedImages((prev) => [...prev, url]);
                              setExistingImages((prev) =>
                                prev.filter((_, i) => i !== idx)
                              );
                            }}
                            title="Remove image"
                            className="flex items-center gap-1 text-xs px-2 py-1 bg-red-50 text-red-600 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                  : null}

                {newFiles && newFiles.length > 0
                  ? newFiles.map((file, idx) => {
                    const isPrimary = primaryImage?.type === 'new' && primaryImage.index === idx;
                    return (
                      <div key={file.name + idx} className="inline-block mr-2 relative">
                        <div className="h-20 w-20 rounded overflow-hidden border bg-white shadow-sm">
                          <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
                        </div>

                        {isPrimary && (
                          <div className="absolute -top-2 -left-2 bg-yellow-400 rounded-full p-1 shadow flex items-center justify-center">
                            <Star className="h-3 w-3 text-white" />
                          </div>
                        )}

                        <div className="mt-2 flex gap-2 justify-center">
                          <button
                            type="button"
                            onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== idx))}
                            title="Remove image"
                            className="flex items-center gap-1 text-xs px-2 py-1 bg-red-50 text-red-600 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                  : null}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                id="title"
                placeholder="Enter title"
                className="w-full rounded-lg border p-3"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                id="description"
                placeholder="Enter description"
                className="w-full rounded-lg border p-3 min-h-[100px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="colour" className="block text-sm font-medium text-slate-700 mb-1">Colour</label>
                <input
                  id="colour"
                  placeholder="e.g. Red, Blue"
                  className="rounded-lg border p-3 w-full"
                  value={form.colour}
                  onChange={(e) => setForm({ ...form, colour: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="diameter" className="block text-sm font-medium text-slate-700 mb-1">Diameter</label>
                <input
                  id="diameter"
                  placeholder="e.g. 1.75mm"
                  className="rounded-lg border p-3 w-full"
                  value={form.diameter}
                  onChange={(e) => setForm({ ...form, diameter: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-slate-700 mb-1">Weight</label>
                <input
                  id="weight"
                  placeholder="e.g. 1kg"
                  className="rounded-lg border p-3 w-full"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                <input
                  id="price"
                  placeholder="e.g. 499"
                  className="rounded-lg border p-3 w-full"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                <input
                  id="slug"
                  placeholder="product-slug"
                  className="rounded-lg border p-3 w-full"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                <input
                  id="sku"
                  placeholder="SKU"
                  className="rounded-lg border p-3 w-full"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
              </div>
            </div>
          </div>



          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-3"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-3 text-white"
            >

              {loading
                ? 'Saving...'
                : filament
                  ? 'Update'
                  : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}