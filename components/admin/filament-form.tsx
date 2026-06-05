'use client';

import { useState } from 'react';

import {
  X,
  Upload,
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

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    const formData =
      new FormData();

    if (filament?.id) {
      formData.append(
        'id',
        filament.id
      );
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

    if (images) {
      Array.from(images).forEach(
        (file) => {
          formData.append(
            'images[]',
            file
          );
        }
      );
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

      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">

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

          <input
            placeholder="Title"
            className="w-full rounded-lg border p-3"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title:
                  e.target.value,
              })
            }
          />

          <textarea
            placeholder="Description"
            className="w-full rounded-lg border p-3"
            value={
              form.description
            }
            onChange={(e) =>
              setForm({
                ...form,
                description:
                  e.target.value,
              })
            }
          />

          <div className="grid grid-cols-2 gap-4">

            <input
              placeholder="Colour"
              className="rounded-lg border p-3"
              value={form.colour}
              onChange={(e) =>
                setForm({
                  ...form,
                  colour:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="Diameter"
              className="rounded-lg border p-3"
              value={
                form.diameter
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  diameter:
                    e.target.value,
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">

            <input
              placeholder="Weight"
              className="rounded-lg border p-3"
              value={form.weight}
              onChange={(e) =>
                setForm({
                  ...form,
                  weight:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="Price"
              className="rounded-lg border p-3"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price:
                    e.target.value,
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">

            <input
              placeholder="Slug"
              className="rounded-lg border p-3"
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="SKU"
              className="rounded-lg border p-3"
              value={form.sku}
              onChange={(e) =>
                setForm({
                  ...form,
                  sku:
                    e.target.value,
                })
              }
            />
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8">

            <Upload className="h-10 w-10 text-blue-600" />

            <p>
              Upload Images
            </p>

            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) =>
                setImages(
                  e.target.files
                )
              }
            />
          </label>

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