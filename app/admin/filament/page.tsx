'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

import { FilamentForm } from '@/components/admin/filament-form';

interface Filament {
  id: string;
  title: string;
  description: string;
  sku: string;
  slug: string;
  colour: string[];
  diameter: string[];
  weight: string[];
  price: string;
  images: string[];
}

export default function FilamentPage() {
  const [filaments, setFilaments] =
    useState<Filament[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [open, setOpen] =
    useState(false);

  const [editData, setEditData] =
    useState<Filament | null>(null);

  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const fetchFilaments =
    async () => {
      try {
        const response =
          await fetch(
            '/api/filament'
          );

        const data =
          await response.json();

        setFilaments(
          data.data || []
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchFilaments();
  }, []);

  const handleDelete = async (
    id: string
  ) => {
    if (
      !confirm(
        'Delete filament?'
      )
    )
      return;

    const formData =
      new FormData();

    formData.append('id', id);

    await fetch(
      '/api/filament',
      {
        method: 'DELETE',
        body: formData,
      }
    );

    fetchFilaments();
  };

  const openLightbox = (images: string[], index = 0) => {
    setLightboxImages(images || []);
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

  return (
    <div className="space-y-6 p-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Filament
          </h1>

          <p className="text-slate-500">
            Manage all filament
            products
          </p>
        </div>

        <button
          onClick={() => {
            setEditData(null);

            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >

          <Plus className="h-5 w-5" />

          Add Filament
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>

              <th className="px-6 py-4 text-left">
                Image
              </th>

              <th className="px-6 py-4 text-left">
                Title
              </th>

              <th className="px-6 py-4 text-left">
                SKU
              </th>

              <th className="px-6 py-4 text-left">
                Price
              </th>

              <th className="px-6 py-4 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center"
                >
                  Loading...
                </td>
              </tr>
            ) : filaments.length ===
              0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center"
                >
                  No filament found
                </td>
              </tr>
            ) : (
              filaments.map((item) => {
                const imageUrls = Array.isArray(item.images)
                  ? item.images
                  : typeof item.images === 'string'
                    ? item.images
                      .split(',')
                      .map((s) => s.trim())
                      .filter((s) => s.length > 0)
                    : [];

                const firstImage = imageUrls[0] || '';

                return (
                  <tr key={item.id} className="border-t">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {imageUrls.length > 0 ? (
                          <>
                            <button
                              onClick={() => openLightbox(imageUrls, 0)}
                              className="relative overflow-hidden rounded-lg"
                            >
                              <img
                                src={firstImage || 'https://placehold.co/64x64?text=No+Image'}
                                alt={item.title || 'Filament image'}
                                loading="lazy"
                                className="h-16 w-16 rounded-lg object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=No+Image';
                                }}
                              />
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
                          <div className="h-16 w-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                            No
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold">{item.title}</td>

                    <td className="px-6 py-4">{item.sku}</td>

                    <td className="px-6 py-4">₹{item.price}</td>

                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditData(item);
                            setOpen(true);
                          }}
                          className="rounded-lg bg-blue-100 p-2 text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg bg-red-100 p-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <FilamentForm
          filament={editData}
          onClose={() =>
            setOpen(false)
          }
          onSuccess={() => {
            setOpen(false);

            fetchFilaments();
          }}
        />
      )}

      {showLightbox && lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-4xl flex flex-col items-center">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute -top-12 right-0 text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="relative w-full bg-black rounded-lg overflow-hidden">
              <img
                src={lightboxImages[lightboxIndex]}
                alt={`Filament image ${lightboxIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/800x600?text=Image+Not+Found';
                }}
              />
            </div>

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
    </div>
  );
}