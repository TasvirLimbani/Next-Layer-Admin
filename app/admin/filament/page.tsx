'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { FilamentForm } from '@/components/admin/filament-form';

/* =========================================================
   TYPES
========================================================= */

interface ColorImageGroup {
  color: string;
  images: string[];
  image_urls: string[];
}

interface Filament {
  id: string;
  title: string;
  category: string;
  description: string;
  sku: string;
  slug: string;
  colour: string[];
  diameter: string[];
  weight: string[];
  price: string;

  // General product images
  images: string[];

  // Color-wise images
  color_images: ColorImageGroup[];
}

/* =========================================================
   PAGE
========================================================= */

export default function FilamentPage() {
  const [filaments, setFilaments] =
    useState<Filament[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [open, setOpen] =
    useState(false);

  const [editData, setEditData] =
    useState<Filament | null>(null);

  /* =====================================================
     LIGHTBOX
  ===================================================== */

  const [lightboxImages, setLightboxImages] =
    useState<string[]>([]);

  const [lightboxIndex, setLightboxIndex] =
    useState(0);

  const [showLightbox, setShowLightbox] =
    useState(false);

  /* =====================================================
     FETCH FILAMENTS
  ===================================================== */

  const fetchFilaments = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        '/api/filament',
        {
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        'Filament API:',
        data
      );

      if (
        data?.status === true &&
        Array.isArray(data.data)
      ) {
        setFilaments(data.data);
      } else {
        setFilaments([]);
      }

    } catch (error) {

      console.error(
        'Failed to fetch filaments:',
        error
      );

      setFilaments([]);

    } finally {

      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchFilaments();
  }, []);

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = async (
    id: string
  ) => {

    if (
      !confirm(
        'Delete filament?'
      )
    ) {
      return;
    }

    try {

      const formData =
        new FormData();

      formData.append(
        'id',
        id
      );

      const response =
        await fetch(
          '/api/filament',
          {
            method: 'DELETE',
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok || data?.status === false) {

        alert(
          data?.message ||
          'Failed to delete filament'
        );

        return;
      }

      await fetchFilaments();

    } catch (error) {

      console.error(
        'Delete error:',
        error
      );

      alert(
        'Failed to delete filament'
      );
    }
  };

  /* =====================================================
     OPEN LIGHTBOX
  ===================================================== */

  const openLightbox = (
    images: string[],
    index = 0
  ) => {

    if (
      !Array.isArray(images) ||
      images.length === 0
    ) {
      return;
    }

    setLightboxImages(
      images
    );

    setLightboxIndex(
      index
    );

    setShowLightbox(
      true
    );
  };

  /* =====================================================
     NEXT IMAGE
  ===================================================== */

  const nextImage = () => {

    setLightboxIndex(
      (prev) =>
        prev ===
        lightboxImages.length - 1
          ? 0
          : prev + 1
    );
  };

  /* =====================================================
     PREVIOUS IMAGE
  ===================================================== */

  const prevImage = () => {

    setLightboxIndex(
      (prev) =>
        prev === 0
          ? lightboxImages.length - 1
          : prev - 1
    );
  };

  /* =====================================================
     CLOSE LIGHTBOX
  ===================================================== */

  const closeLightbox = () => {

    setShowLightbox(
      false
    );

    setLightboxImages([]);

    setLightboxIndex(0);
  };

  /* =====================================================
     IMAGE PROXY URL
  ===================================================== */

  const getProxyImageUrl = (
    imageUrl: string
  ) => {

    if (!imageUrl) {
      return '';
    }

    return `/api/image-proxy?url=${encodeURIComponent(
      imageUrl
    )}`;
  };

  /* =====================================================
     GET GENERAL IMAGES
  ===================================================== */

  const getGeneralImages = (
    item: Filament
  ): string[] => {

    if (
      Array.isArray(item.images)
    ) {

      return item.images
        .filter(
          (image) =>
            typeof image === 'string' &&
            image.trim() !== ''
        )
        .map(
          (image) =>
            image.trim()
        );
    }

    return [];
  };

  /* =====================================================
     GET COLOR IMAGE URLS
  ===================================================== */

  const getColorImageUrls = (
    item: Filament
  ): string[] => {

    if (
      !Array.isArray(
        item.color_images
      )
    ) {
      return [];
    }

    return item.color_images.flatMap(
      (group) => {

        if (
          !group ||
          !Array.isArray(
            group.image_urls
          )
        ) {
          return [];
        }

        return group.image_urls.filter(
          (image) =>
            typeof image === 'string' &&
            image.trim() !== ''
        );
      }
    );
  };

  /* =====================================================
     GET ALL DISPLAY IMAGES
  ===================================================== */

  const getDisplayImages = (
    item: Filament
  ): string[] => {

    const generalImages =
      getGeneralImages(item);

    const colorImages =
      getColorImageUrls(item);

    /*
     * If general images exist,
     * use them.
     *
     * Otherwise use color images.
     */

    if (
      generalImages.length > 0
    ) {
      return generalImages;
    }

    return colorImages;
  };

  /* =====================================================
     GET COLORS
  ===================================================== */

  const getColors = (
    item: Filament
  ): string[] => {

    /*
     * Prefer colors from
     * color_images.
     */

    if (
      Array.isArray(
        item.color_images
      ) &&
      item.color_images.length > 0
    ) {

      return item.color_images
        .map(
          (group) =>
            group?.color?.trim()
        )
        .filter(
          (
            color
          ): color is string =>
            Boolean(color)
        );
    }

    /*
     * Fallback to old
     * colour field.
     */

    if (
      Array.isArray(
        item.colour
      )
    ) {

      return item.colour
        .filter(
          (color) =>
            typeof color === 'string' &&
            color.trim() !== ''
        )
        .map(
          (color) =>
            color.trim()
        );
    }

    return [];
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-6 p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Filament
          </h1>

          <p className="text-slate-500">
            Manage all filament products
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

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">

        <table className="w-full min-w-[1000px]">

          {/* =================================================
              TABLE HEADER
          ================================================= */}

          <thead className="bg-slate-50">

            <tr>

              <th className="px-6 py-4 text-left">
                Image
              </th>

              <th className="px-6 py-4 text-left">
                Color
              </th>

              <th className="px-6 py-4 text-left">
                Category
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

          {/* =================================================
              TABLE BODY
          ================================================= */}

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan={7}
                  className="p-10 text-center"
                >
                  Loading...
                </td>

              </tr>

            ) : filaments.length === 0 ? (

              <tr>

                <td
                  colSpan={7}
                  className="p-10 text-center"
                >
                  No filament found
                </td>

              </tr>

            ) : (

              filaments.map(
                (item) => {

                  /* =========================
                     IMAGES
                  ========================= */

                  const imageUrls =
                    getDisplayImages(
                      item
                    );

                  const firstImage =
                    imageUrls[0] || '';

                  /* =========================
                     COLORS
                  ========================= */

                  const colors =
                    getColors(
                      item
                    );

                  return (

                    <tr
                      key={item.id}
                      className="border-t"
                    >

                      {/* =================================
                          IMAGE
                      ================================= */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2">

                          {imageUrls.length > 0 ? (

                            <>

                              <button
                                type="button"
                                onClick={() =>
                                  openLightbox(
                                    imageUrls,
                                    0
                                  )
                                }
                                className="relative overflow-hidden rounded-lg"
                              >

                                <img
                                  src={getProxyImageUrl(
                                    firstImage
                                  )}
                                  alt={
                                    item.title ||
                                    'Filament image'
                                  }
                                  loading="lazy"
                                  className="h-16 w-16 rounded-lg object-cover"
                                  onError={(e) => {

                                    (
                                      e.target as HTMLImageElement
                                    ).src =
                                      'https://placehold.co/64x64?text=No+Image';
                                  }}
                                />

                              </button>

                              {imageUrls.length > 1 && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    openLightbox(
                                      imageUrls,
                                      0
                                    )
                                  }
                                  className="cursor-pointer rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
                                >
                                  +{imageUrls.length - 1}
                                </button>

                              )}

                            </>

                          ) : (

                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                              No
                            </div>

                          )}

                        </div>

                      </td>

                      {/* =================================
                          COLOR
                      ================================= */}

                      <td className="px-6 py-4">

                        {colors.length > 0 ? (

                          <div className="flex max-w-[250px] flex-wrap gap-2">

                            {colors.map(
                              (
                                color,
                                index
                              ) => (

                                <span
                                  key={`${color}-${index}`}
                                  className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                                >
                                  {color}
                                </span>

                              )
                            )}

                          </div>

                        ) : (

                          <span className="text-sm text-slate-400">
                            No color
                          </span>

                        )}

                      </td>

                      {/* =================================
                          CATEGORY
                      ================================= */}

                      <td className="px-6 py-4">
                        {item.category || '-'}
                      </td>

                      {/* =================================
                          TITLE
                      ================================= */}

                      <td className="px-6 py-4 font-semibold">
                        {item.title || '-'}
                      </td>

                      {/* =================================
                          SKU
                      ================================= */}

                      <td className="px-6 py-4">
                        {item.sku || '-'}
                      </td>

                      {/* =================================
                          PRICE
                      ================================= */}

                      <td className="px-6 py-4">
                        ₹{item.price || '0.00'}
                      </td>

                      {/* =================================
                          ACTIONS
                      ================================= */}

                      <td className="px-6 py-4">

                        <div className="flex gap-3">

                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() => {

                              setEditData(
                                item
                              );

                              setOpen(
                                true
                              );
                            }}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                            title="Edit"
                          >

                            <Pencil className="h-4 w-4" />

                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                item.id
                              )
                            }
                            className="rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200"
                            title="Delete"
                          >

                            <Trash2 className="h-4 w-4" />

                          </button>

                        </div>

                      </td>

                    </tr>

                  );
                }
              )

            )}

          </tbody>

        </table>

      </div>

      {/* =================================================
          FILAMENT FORM
      ================================================= */}

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

      {/* =================================================
          LIGHTBOX
      ================================================= */}

      {showLightbox &&
        lightboxImages.length > 0 && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={closeLightbox}
          >

            <div
              className="relative flex w-full max-w-4xl flex-col items-center"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* ===============================
                  CLOSE
              =============================== */}

              <button
                type="button"
                onClick={closeLightbox}
                className="absolute -top-12 right-0 rounded-lg p-2 text-white transition-colors hover:bg-white/20"
                title="Close"
              >

                <X className="h-6 w-6" />

              </button>

              {/* ===============================
                  IMAGE
              =============================== */}

              <div className="relative w-full overflow-hidden rounded-lg bg-black">

                <img
                  src={getProxyImageUrl(
                    lightboxImages[
                      lightboxIndex
                    ]
                  )}
                  alt={`Filament image ${
                    lightboxIndex + 1
                  }`}
                  className="h-auto max-h-[80vh] w-full object-contain"
                  onError={(e) => {

                    (
                      e.target as HTMLImageElement
                    ).src =
                      'https://placehold.co/800x600?text=Image+Not+Found';
                  }}
                />

              </div>

              {/* ===============================
                  CONTROLS
              =============================== */}

              {lightboxImages.length > 1 && (

                <div className="mt-6 flex items-center justify-center gap-4">

                  {/* PREVIOUS */}

                  <button
                    type="button"
                    onClick={prevImage}
                    className="rounded-lg p-3 text-white transition-colors hover:bg-white/20"
                    title="Previous image"
                  >

                    <ChevronLeft className="h-6 w-6" />

                  </button>

                  {/* COUNTER */}

                  <div className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white">

                    {lightboxIndex + 1}
                    {' / '}
                    {lightboxImages.length}

                  </div>

                  {/* NEXT */}

                  <button
                    type="button"
                    onClick={nextImage}
                    className="rounded-lg p-3 text-white transition-colors hover:bg-white/20"
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