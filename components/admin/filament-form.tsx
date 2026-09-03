'use client';

import { useEffect, useState } from 'react';
import {
  X,
  Upload,
  Star,
  Trash2,
  Tag,
  Plus,
} from 'lucide-react';

interface Props {
  filament?: any;
  onClose: () => void;
  onSuccess: () => void;
}

/* =========================================================
   COLOR API TYPE
========================================================= */

interface ApiColor {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

/* =========================================================
   COLOR IMAGE API TYPE

   API response:

   {
     color: "Red",
     images: ["abc.png"],
     image_urls: [
       "http://nextlayer.soon.it/images/abc.png"
     ]
   }
========================================================= */

interface ApiColorImageGroup {
  color: string;
  images: string[];
  image_urls: string[];
}

/* =========================================================
   COLOR VARIANT FORM TYPE
========================================================= */

interface ColorVariant {
  color: string;
  existingImages: string[];
  newImages: File[];
}

/* =========================================================
   FILE PREVIEW

   Important:
   Never render img with src=""
========================================================= */

function FilePreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!preview) {
    return null;
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-50">
      <img
        src={preview}
        alt={file.name}
        className="h-full w-full object-cover"
      />

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
      >
        ×
      </button>
    </div>
  );
}

/* =========================================================
   IMAGE BASE URL
========================================================= */

const IMAGE_BASE_URL =
  'http://nextlayer.soon.it/images/';

/* =========================================================
   GET IMAGE URL

   Accepts:
   - filename
   - http URL
   - https URL

   Returns proxy URL.
========================================================= */

const getImageUrl = (
  value: string | null | undefined
): string | null => {
  if (!value) {
    return null;
  }

  const cleaned = String(value).trim();

  if (!cleaned) {
    return null;
  }

  let fullUrl = cleaned;

  if (
    !cleaned.startsWith('http://') &&
    !cleaned.startsWith('https://')
  ) {
    fullUrl =
      IMAGE_BASE_URL +
      cleaned.replace(/^\/+/, '');
  }

  return (
    '/api/image-proxy?url=' +
    encodeURIComponent(fullUrl)
  );
};

/* =========================================================
   PARSE COLOR IMAGES

   Supports:

   [
     {
       color: "Red",
       images: ["abc.png"],
       image_urls: ["http://.../abc.png"]
     }
   ]

   Also supports JSON string.
========================================================= */

const parseColorImages = (
  value: any
): ApiColorImageGroup[] => {
  if (!value) {
    return [];
  }

  let parsed: any = value;

  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch (error) {
      console.error(
        'Failed to parse color_images:',
        error
      );

      return [];
    }
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item: any) => {
      const color =
        typeof item?.color === 'string'
          ? item.color
          : '';

      const images = Array.isArray(item?.images)
        ? item.images.filter(
            (img: any) =>
              typeof img === 'string' &&
              img.trim() !== ''
          )
        : [];

      const imageUrls = Array.isArray(
        item?.image_urls
      )
        ? item.image_urls.filter(
            (img: any) =>
              typeof img === 'string' &&
              img.trim() !== ''
          )
        : [];

      return {
        color,
        images,
        image_urls: imageUrls,
      };
    })
    .filter(
      (item) =>
        item.color ||
        item.images.length > 0 ||
        item.image_urls.length > 0
    );
};

/* =========================================================
   NORMALIZE GENERAL IMAGES
========================================================= */

const parseGeneralImages = (
  value: any
): string[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(
      (item) =>
        typeof item === 'string' &&
        item.trim() !== ''
    );
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item) =>
            typeof item === 'string' &&
            item.trim() !== ''
        );
      }
    } catch {
      // Not JSON, continue
    }

    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

/* =========================================================
   COMPONENT
========================================================= */

export function FilamentForm({
  filament,
  onClose,
  onSuccess,
}: Props) {
  /* =======================================================
     EXISTING COLOUR
  ======================================================= */

  const existingColours: string[] =
    Array.isArray(filament?.colour)
      ? filament.colour
      : [];

  /* =======================================================
     FORM
  ======================================================= */

  const [form, setForm] = useState({
    title: filament?.title || '',
    category: filament?.category || '',
    description: filament?.description || '',
    colour: existingColours[0] || '',
    diameter:
      filament?.diameter?.[0] || '',
    weight:
      filament?.weight?.[0] || '',
    price: filament?.price || '',
    slug: filament?.slug || '',
    sku: filament?.sku || '',
  });

  /* =======================================================
     COLOR API STATE
  ======================================================= */

  const [colorOptions, setColorOptions] =
    useState<ApiColor[]>([]);

  const [loadingColors, setLoadingColors] =
    useState(false);

  /* =======================================================
     COLOR VARIANTS
  ======================================================= */

  const [colorVariants, setColorVariants] =
    useState<ColorVariant[]>([]);

  /* =======================================================
     GENERAL IMAGES
  ======================================================= */

  const [existingImages, setExistingImages] =
    useState<string[]>(
      parseGeneralImages(
        filament?.images
      )
    );

  const [deletedImages, setDeletedImages] =
    useState<string[]>([]);

  const [newFiles, setNewFiles] =
    useState<File[]>([]);

  const [primaryImage, setPrimaryImage] =
    useState<{
      type: 'existing' | 'new';
      index: number;
    } | null>(null);

  const [loading, setLoading] =
    useState(false);

  /* =======================================================
     INITIALIZE FORM WHEN FILAMENT CHANGES
  ======================================================= */

  useEffect(() => {
    const colours: string[] =
      Array.isArray(filament?.colour)
        ? filament.colour
        : [];

    setForm({
      title: filament?.title || '',
      category: filament?.category || '',
      description:
        filament?.description || '',
      colour: colours[0] || '',
      diameter:
        filament?.diameter?.[0] || '',
      weight:
        filament?.weight?.[0] || '',
      price: filament?.price || '',
      slug: filament?.slug || '',
      sku: filament?.sku || '',
    });

    /* -----------------------------------------------
       GENERAL IMAGES
    ------------------------------------------------ */

    setExistingImages(
      parseGeneralImages(
        filament?.images
      )
    );

    setDeletedImages([]);
    setNewFiles([]);
    setPrimaryImage(null);

    /* -----------------------------------------------
       COLOR IMAGES
    ------------------------------------------------ */

    const parsed =
      parseColorImages(
        filament?.color_images
      );

    if (parsed.length > 0) {
      setColorVariants(
        parsed.map((item) => {
          /*
            IMPORTANT:

            API now returns:

            images:
              ["abc.png"]

            image_urls:
              ["http://.../abc.png"]

            For displaying existing images,
            prefer image_urls.
          */

          const displayImages =
            item.image_urls.length > 0
              ? item.image_urls
              : item.images;

          return {
            color: item.color || '',
            existingImages:
              displayImages,
            newImages: [],
          };
        })
      );
    } else if (colours.length > 0) {
      /*
        Old products may have colour[]
        but no color_images.
      */

      setColorVariants(
        colours.map((color) => ({
          color,
          existingImages: [],
          newImages: [],
        }))
      );
    } else {
      setColorVariants([
        {
          color: '',
          existingImages: [],
          newImages: [],
        },
      ]);
    }
  }, [filament]);

  /* =======================================================
     FETCH COLORS
  ======================================================= */

  useEffect(() => {
    const fetchColors = async () => {
      try {
        setLoadingColors(true);

        const response = await fetch(
          '/api/color',
          {
            method: 'GET',
            cache: 'no-store',
          }
        );

        const data =
          await response.json();

        console.log(
          'Color API response:',
          data
        );

        if (
          data?.status &&
          Array.isArray(data?.colors)
        ) {
          const activeColors =
            data.colors.filter(
              (color: ApiColor) =>
                color.status === 'active'
            );

          setColorOptions(
            activeColors
          );
        } else {
          setColorOptions([]);

          console.error(
            'Failed to load colors:',
            data?.message
          );
        }
      } catch (error) {
        console.error(
          'Color API error:',
          error
        );

        setColorOptions([]);
      } finally {
        setLoadingColors(false);
      }
    };

    fetchColors();
  }, []);

  /* =======================================================
     ADD COLOR
  ======================================================= */

  const addColorVariant = () => {
    setColorVariants((prev) => [
      ...prev,
      {
        color: '',
        existingImages: [],
        newImages: [],
      },
    ]);
  };

  /* =======================================================
     REMOVE COLOR
  ======================================================= */

  const removeColorVariant = (
    index: number
  ) => {
    setColorVariants((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  /* =======================================================
     UPDATE COLOR
  ======================================================= */

  const updateColor = (
    index: number,
    value: string
  ) => {
    setColorVariants((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              color: value,
            }
          : item
      )
    );
  };

  /* =======================================================
     ADD COLOR IMAGES
  ======================================================= */

  const addColorImages = (
    index: number,
    files: FileList | null
  ) => {
    if (!files) {
      return;
    }

    const selectedFiles =
      Array.from(files).filter(
        (file) =>
          file.type.startsWith('image/')
      );

    if (selectedFiles.length === 0) {
      return;
    }

    setColorVariants((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              newImages: [
                ...item.newImages,
                ...selectedFiles,
              ],
            }
          : item
      )
    );
  };

  /* =======================================================
     REMOVE EXISTING COLOR IMAGE
  ======================================================= */

  const removeColorExistingImage = (
    colorIndex: number,
    imageIndex: number
  ) => {
    setColorVariants((prev) =>
      prev.map((item, i) =>
        i === colorIndex
          ? {
              ...item,
              existingImages:
                item.existingImages.filter(
                  (_, imgIndex) =>
                    imgIndex !== imageIndex
                ),
            }
          : item
      )
    );
  };

  /* =======================================================
     REMOVE NEW COLOR IMAGE
  ======================================================= */

  const removeColorNewImage = (
    colorIndex: number,
    imageIndex: number
  ) => {
    setColorVariants((prev) =>
      prev.map((item, i) =>
        i === colorIndex
          ? {
              ...item,
              newImages:
                item.newImages.filter(
                  (_, imgIndex) =>
                    imgIndex !== imageIndex
                ),
            }
          : item
      )
    );
  };

  /* =======================================================
     REMOVE GENERAL EXISTING IMAGE
  ======================================================= */

  const removeGeneralImage = (
    index: number
  ) => {
    const image =
      existingImages[index];

    if (image) {
      setDeletedImages((prev) =>
        prev.includes(image)
          ? prev
          : [...prev, image]
      );
    }

    setExistingImages((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );

    if (
      primaryImage?.type ===
        'existing' &&
      primaryImage.index === index
    ) {
      setPrimaryImage(null);
    }
  };

  /* =======================================================
     REMOVE NEW GENERAL IMAGE
  ======================================================= */

  const removeNewGeneralImage = (
    index: number
  ) => {
    setNewFiles((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );

    if (
      primaryImage?.type === 'new' &&
      primaryImage.index === index
    ) {
      setPrimaryImage(null);
    }
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      /* =================================================
         DETERMINE CREATE / EDIT
      ================================================= */

      const isEdit =
        Boolean(filament?.id);

      /*
        VERY IMPORTANT:

        CREATE:
          POST /api/filament
          -> add.php

        EDIT:
          PUT /api/filament
          -> edit.php

        Previously edit was using POST,
        which caused:

        Duplicate entry 'cdc'
        for key 'Filament.slug'
      */

      if (isEdit) {
        formData.append(
          'id',
          String(filament.id)
        );
      }

      /* =================================================
         BASIC FIELDS
      ================================================= */

      formData.append(
        'title',
        form.title.trim()
      );

      formData.append(
        'category',
        form.category.trim()
      );

      formData.append(
        'description',
        form.description
      );

      /* =================================================
         OLD COLOUR FIELD
      ================================================= */

      /*
        Keep this because your existing
        Filament table has colour JSON.
      */

      if (form.colour.trim()) {
        formData.append(
          'colour[]',
          form.colour.trim()
        );
      }

      /* =================================================
         DIAMETER
      ================================================= */

      if (form.diameter.trim()) {
        formData.append(
          'diameter[]',
          form.diameter.trim()
        );
      }

      /* =================================================
         WEIGHT
      ================================================= */

      if (form.weight.trim()) {
        formData.append(
          'weight[]',
          form.weight.trim()
        );
      }

      /* =================================================
         PRICE
      ================================================= */

      formData.append(
        'price',
        String(form.price)
      );

      /* =================================================
         SLUG
      ================================================= */

      formData.append(
        'slug',
        form.slug.trim()
      );

      /* =================================================
         SKU
      ================================================= */

      formData.append(
        'sku',
        form.sku.trim()
      );

      /* =================================================
         DELETED GENERAL IMAGES
      ================================================= */

      if (deletedImages.length > 0) {
        formData.append(
          'delete_images',
          JSON.stringify(
            deletedImages
          )
        );
      }

      /* =================================================
         EXISTING GENERAL IMAGES
      ================================================= */

      existingImages.forEach(
        (image) => {
          if (!image?.trim()) {
            return;
          }

          formData.append(
            'existing_images[]',
            image
          );
        }
      );

      /* =================================================
         PRIMARY IMAGE
      ================================================= */

      if (primaryImage) {
        let primaryValue = '';

        if (
          primaryImage.type ===
          'existing'
        ) {
          primaryValue =
            existingImages[
              primaryImage.index
            ] || '';
        } else {
          primaryValue =
            newFiles[
              primaryImage.index
            ]?.name || '';
        }

        if (primaryValue) {
          formData.append(
            'primary_image',
            primaryValue
          );
        }
      }

      /* =================================================
         COLOR-WISE IMAGES
      ================================================= */

      colorVariants.forEach(
        (variant, index) => {
          const color =
            variant.color.trim();

          /*
            Skip empty color rows.
          */

          if (!color) {
            return;
          }

          /* ---------------------------------------------
             COLOR NAME
          --------------------------------------------- */

          formData.append(
            'color_names[]',
            color
          );

          /* ---------------------------------------------
             EXISTING COLOR IMAGES
          --------------------------------------------- */

          variant.existingImages.forEach(
            (image) => {
              if (!image?.trim()) {
                return;
              }

              formData.append(
                `color_existing_images[${index}][]`,
                image
              );
            }
          );

          /* ---------------------------------------------
             NEW COLOR IMAGES
          --------------------------------------------- */

          variant.newImages.forEach(
            (file) => {
              formData.append(
                `color_images[${index}][]`,
                file,
                file.name
              );
            }
          );
        }
      );

      /* =================================================
         NEW GENERAL IMAGES
      ================================================= */

      newFiles.forEach(
        (file) => {
          formData.append(
            'images[]',
            file,
            file.name
          );
        }
      );

      /* =================================================
         DEBUG FORMDATA
      ================================================= */

      console.log(
        '================================'
      );

      console.log(
        isEdit
          ? 'EDIT FILAMENT'
          : 'ADD FILAMENT'
      );

      console.log(
        'Request method:',
        isEdit ? 'PUT' : 'POST'
      );

      console.log(
        '================================'
      );

      for (const [
        key,
        value,
      ] of formData.entries()) {
        if (
          value instanceof File
        ) {
          console.log(
            key,
            'FILE:',
            value.name,
            value.type,
            value.size
          );
        } else {
          console.log(
            key,
            ':',
            value
          );
        }
      }

      /* =================================================
         API REQUEST

         THIS IS THE IMPORTANT FIX
      ================================================= */

      const response =
        await fetch(
          '/api/filament',
          {
            method: isEdit
              ? 'PUT'
              : 'POST',
            body: formData,
          }
        );

      const responseText =
        await response.text();

      console.log(
        'Filament API status:',
        response.status
      );

      console.log(
        'Filament API response:',
        responseText
      );

      let data: any = {};

      try {
        data =
          JSON.parse(
            responseText
          );
      } catch {
        throw new Error(
          responseText ||
            'Invalid API response'
        );
      }

      /* =================================================
         API ERROR
      ================================================= */

      if (
        !response.ok ||
        data?.status === false
      ) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Request failed with status ${response.status}`
        );
      }

      /* =================================================
         SUCCESS
      ================================================= */

      alert(
        data?.message ||
          (
            isEdit
              ? 'Filament updated successfully'
              : 'Filament created successfully'
          )
      );

      onSuccess();
    } catch (error) {
      console.error(
        'Filament save error:',
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to save filament'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="text-2xl font-bold">
            {filament
              ? 'Edit Filament'
              : 'Add Filament'}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X />
          </button>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          {/* =================================================
              COLOR VARIANTS
          ================================================= */}

          <section>
            <div className="mb-3 flex items-start gap-2">
              <Tag className="mt-0.5 h-5 w-5 text-blue-600" />

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    Color Variants
                  </h3>

                  <span className="text-sm text-gray-400">
                    (Optional)
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Add color-specific images
                  for each color.
                </p>
              </div>
            </div>

            <div className="space-y-4">

              {colorVariants.map(
                (
                  variant,
                  colorIndex
                ) => (
                  <div
                    key={colorIndex}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5"
                  >

                    {/* COLOR TITLE */}

                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Color{' '}
                        {colorIndex + 1}
                      </span>

                      {colorVariants.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeColorVariant(
                              colorIndex
                            )
                          }
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      )}
                    </div>

                    {/* SELECT + ADD IMAGE */}

                    <div className="flex flex-col gap-3 sm:flex-row">

                      <select
                        value={
                          variant.color
                        }
                        onChange={(e) =>
                          updateColor(
                            colorIndex,
                            e.target.value
                          )
                        }
                        className="h-11 flex-1 rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">
                          {loadingColors
                            ? 'Loading Colors...'
                            : 'Select Color'}
                        </option>

                        {colorOptions.map(
                          (color) => (
                            <option
                              key={
                                color.id
                              }
                              value={
                                color.name
                              }
                            >
                              {
                                color.name
                              }
                            </option>
                          )
                        )}
                      </select>

                      {/* ADD COLOR IMAGES */}

                      <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 sm:min-w-[136px]">
                        <Upload className="h-4 w-4" />

                        Add Images

                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            addColorImages(
                              colorIndex,
                              e.target
                                .files
                            );

                            e.target.value =
                              '';
                          }}
                        />
                      </label>
                    </div>

                    {/* =================================================
                        COLOR IMAGE PREVIEW
                    ================================================= */}

                    {variant
                        .existingImages
                        .length ===
                        0 &&
                    variant.newImages
                      .length ===
                      0 ? (
                      <div className="mt-4 flex min-h-[70px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-4 text-center text-sm text-gray-500">
                        No images added
                        for this color
                        yet.
                      </div>
                    ) : (
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">

                        {/* EXISTING COLOR IMAGES */}

                        {variant.existingImages.map(
                          (
                            image,
                            imageIndex
                          ) => {
                            const imageUrl =
                              getImageUrl(
                                image
                              );

                            if (
                              !imageUrl
                            ) {
                              return null;
                            }

                            return (
                              <div
                                key={`${image}-${imageIndex}`}
                                className="relative h-24 w-24 overflow-hidden rounded-xl border bg-white"
                              >
                                <img
                                  src={
                                    imageUrl
                                  }
                                  alt={`${variant.color} ${imageIndex + 1}`}
                                  className="h-full w-full object-cover"
                                  onError={(
                                    e
                                  ) => {
                                    e.currentTarget.style.display =
                                      'none';
                                  }}
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeColorExistingImage(
                                      colorIndex,
                                      imageIndex
                                    )
                                  }
                                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          }
                        )}

                        {/* NEW COLOR IMAGES */}

                        {variant.newImages.map(
                          (
                            file,
                            imageIndex
                          ) => (
                            <div
                              key={`new-${file.name}-${imageIndex}`}
                              className="relative h-24 w-24 overflow-hidden rounded-xl border border-blue-200 bg-white"
                            >
                              <FilePreview
                                file={
                                  file
                                }
                                onRemove={() =>
                                  removeColorNewImage(
                                    colorIndex,
                                    imageIndex
                                  )
                                }
                              />

                              <div className="absolute left-1 top-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                NEW
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>

            {/* ADD ANOTHER COLOR */}

            <button
              type="button"
              onClick={
                addColorVariant
              }
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />

              Add Another Color
            </button>
          </section>

          {/* =================================================
              GENERAL PRODUCT IMAGES
          ================================================= */}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                Product Images
              </label>

              <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
                <Upload className="h-4 w-4" />

                Add Images

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (
                      !e.target.files
                    ) {
                      return;
                    }

                    const files =
                      Array.from(
                        e.target.files
                      ).filter(
                        (file) =>
                          file.type.startsWith(
                            'image/'
                          )
                      );

                    setNewFiles(
                      (prev) => [
                        ...prev,
                        ...files,
                      ]
                    );

                    e.target.value =
                      '';
                  }}
                />
              </label>
            </div>

            {/* GENERAL IMAGE PREVIEWS */}

            <div
              className="flex items-start gap-3 overflow-x-auto py-2"
              style={{
                WebkitOverflowScrolling:
                  'touch',
              }}
            >

              {/* EXISTING GENERAL IMAGES */}

              {existingImages.map(
                (image, idx) => {
                  const imageUrl =
                    getImageUrl(
                      image
                    );

                  if (!imageUrl) {
                    return null;
                  }

                  const isPrimary =
                    (
                      primaryImage?.type ===
                        'existing' &&
                      primaryImage.index ===
                        idx
                    ) ||
                    (
                      !primaryImage &&
                      idx === 0
                    );

                  return (
                    <div
                      key={`${image}-${idx}`}
                      className="relative mr-2 inline-block shrink-0"
                    >
                      <div className="h-20 w-20 overflow-hidden rounded border bg-white shadow-sm">
                        <img
                          src={
                            imageUrl
                          }
                          alt={`existing-${idx}`}
                          className="h-full w-full object-cover"
                          onError={(
                            e
                          ) => {
                            e.currentTarget.style.display =
                              'none';
                          }}
                        />
                      </div>

                      {/* PRIMARY */}

                      {isPrimary && (
                        <div className="absolute -left-2 -top-2 rounded-full bg-yellow-400 p-1 shadow">
                          <Star className="h-3 w-3 text-white" />
                        </div>
                      )}

                      {/* REMOVE */}

                      <div className="mt-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            removeGeneralImage(
                              idx
                            )
                          }
                          title="Remove image"
                          className="flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />

                          <span>
                            Remove
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                }
              )}

              {/* NEW GENERAL IMAGES */}

              {newFiles.map(
                (
                  file,
                  idx
                ) => {
                  const isPrimary =
                    primaryImage?.type ===
                      'new' &&
                    primaryImage.index ===
                      idx;

                  return (
                    <div
                      key={`${file.name}-${idx}`}
                      className="relative mr-2 inline-block shrink-0"
                    >
                      <div className="h-20 w-20 overflow-hidden rounded border bg-white shadow-sm">
                        <FilePreview
                          file={
                            file
                          }
                          onRemove={() =>
                            removeNewGeneralImage(
                              idx
                            )
                          }
                        />
                      </div>

                      {/* NEW */}

                      <div className="absolute left-1 top-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        NEW
                      </div>

                      {/* PRIMARY */}

                      {isPrimary && (
                        <div className="absolute -left-2 -top-2 rounded-full bg-yellow-400 p-1 shadow">
                          <Star className="h-3 w-3 text-white" />
                        </div>
                      )}

                      {/* REMOVE */}

                      <div className="mt-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            removeNewGeneralImage(
                              idx
                            )
                          }
                          title="Remove image"
                          className="flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />

                          <span>
                            Remove
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                }
              )}

              {/* NO GENERAL IMAGES */}

              {existingImages.length ===
                0 &&
                newFiles.length ===
                  0 && (
                  <div className="flex min-h-[70px] w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-slate-50 text-sm text-gray-500">
                    No product images
                    added.
                  </div>
                )}
            </div>
          </div>

          {/* =================================================
              TITLE
          ================================================= */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Title
            </label>

            <input
              placeholder="Enter filament title"
              className="w-full rounded-lg border p-3"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title:
                    e.target.value,
                })
              }
              required
            />
          </div>

          {/* =================================================
              CATEGORY
          ================================================= */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category
            </label>

            <input
              placeholder="Enter category"
              className="w-full rounded-lg border p-3"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target.value,
                })
              }
              required
            />
          </div>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              placeholder="Enter description"
              className="min-h-[100px] w-full rounded-lg border p-3"
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
          </div>

          {/* =================================================
              COLOUR
          ================================================= */}

          <div>
            {/* <label
              htmlFor="colour"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Colour
            </label> */}

            {/* <select
              id="colour"
              className="w-full rounded-lg border bg-white p-3"
              value={form.colour}
              onChange={(e) =>
                setForm({
                  ...form,
                  colour:
                    e.target.value,
                })
              }
              disabled={
                loadingColors
              }
            >
              <option value="">
                {loadingColors
                  ? 'Loading Colours...'
                  : 'Select Colour'}
              </option>

              {colorOptions.map(
                (color) => (
                  <option
                    key={color.id}
                    value={
                      color.name
                    }
                  >
                    {color.name}
                  </option>
                )
              )}
            </select> */}

            {!loadingColors &&
              colorOptions.length ===
                0 && (
                <p className="mt-1 text-xs text-red-500">
                  No active colours
                  found.
                </p>
              )}
          </div>

          {/* =================================================
              DIAMETER + WEIGHT
          ================================================= */}

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Diameter
              </label>

              <input
                placeholder="e.g. 1.75mm"
                className="w-full rounded-lg border p-3"
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

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Weight
              </label>

              <input
                placeholder="e.g. 1kg"
                className="w-full rounded-lg border p-3"
                value={
                  form.weight
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    weight:
                      e.target.value,
                  })
                }
              />
            </div>

          </div>

          {/* =================================================
              PRICE + SKU
          ================================================= */}

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Price
              </label>

              <input
                type="number"
                step="0.01"
                placeholder="e.g. 499"
                className="w-full rounded-lg border p-3"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price:
                      e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                SKU
              </label>

              <input
                placeholder="SKU"
                className="w-full rounded-lg border p-3"
                value={form.sku}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sku:
                      e.target.value,
                  })
                }
                required
              />
            </div>

          </div>

          {/* =================================================
              SLUG
          ================================================= */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Slug
            </label>

            <input
              placeholder="product-slug"
              className="w-full rounded-lg border p-3"
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug:
                    e.target.value,
                })
              }
            />

            {filament && (
              <p className="mt-1 text-xs text-gray-500">
                Keep the existing slug
                unless you intentionally
                want to change it.
              </p>
            )}
          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border px-5 py-3 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
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







// "use client";

// import React, {
//   ChangeEvent,
//   FormEvent,
//   useEffect,
//   useRef,
//   useState,
// } from "react";

// import {
//   X,
//   Upload,
//   Star,
//   Trash2,
//   Image as ImageIcon,
//   Loader2,
//   Tag,
//   Plus,
//   Minus,
// } from "lucide-react";

// /* =========================================================
//    TYPES
// ========================================================= */

// interface ApiColor {
//   id: number;
//   name: string;
//   status: "active" | "inactive";
//   created_at?: string;
//   updated_at?: string;
// }

// interface ColorVariant {
//   color: string;
//   existingImages: string[];
//   newImages: File[];
// }

// interface Filament {
//   id?: number;

//   title?: string;
//   category?: string;
//   description?: string;
//   price?: number | string;
//   slug?: string;
//   sku?: string;

//   colour?: string[];
//   diameter?: string[];
//   weight?: string[];

//   images?: string[];

//   color_images?:
//     | {
//         color: string;
//         images: string[];
//       }[]
//     | string
//     | null;
// }

// interface FilamentFormProps {
//   filament?: Filament | null;
//   onClose: () => void;
//   onSuccess?: () => void;
// }

// /* =========================================================
//    FILE PREVIEW
// ========================================================= */

// function FilePreview({
//   file,
//   className = "",
// }: {
//   file: File;
//   className?: string;
// }) {
//   const [preview, setPreview] = useState("");

//   useEffect(() => {
//     const url = URL.createObjectURL(file);
//     setPreview(url);

//     return () => {
//       URL.revokeObjectURL(url);
//     };
//   }, [file]);

//   if (!preview) {
//     return (
//       <div
//         className={`flex items-center justify-center bg-gray-100 ${className}`}
//       >
//         <ImageIcon className="h-6 w-6 text-gray-400" />
//       </div>
//     );
//   }

//   return (
//     <img
//       src={preview}
//       alt={file.name}
//       className={`object-cover ${className}`}
//     />
//   );
// }

// /* =========================================================
//    HELPERS
// ========================================================= */

// function parseColorImages(
//   value: Filament["color_images"]
// ): {
//   color: string;
//   images: string[];
// }[] {
//   if (!value) return [];

//   if (Array.isArray(value)) {
//     return value.map((item) => ({
//       color: item.color || "",
//       images: Array.isArray(item.images) ? item.images : [],
//     }));
//   }

//   if (typeof value === "string") {
//     try {
//       const parsed = JSON.parse(value);

//       if (Array.isArray(parsed)) {
//         return parsed.map((item) => ({
//           color: item.color || "",
//           images: Array.isArray(item.images) ? item.images : [],
//         }));
//       }
//     } catch {
//       return [];
//     }
//   }

//   return [];
// }

// /* =========================================================
//    COMPONENT
// ========================================================= */

// export default function FilamentForm({
//   filament,
//   onClose,
//   onSuccess,
// }: FilamentFormProps) {
//   const isEdit = Boolean(filament?.id);

//   /* =========================================================
//      BASIC FORM
//   ========================================================= */

//   const [title, setTitle] = useState(filament?.title || "");
//   const [category, setCategory] = useState(filament?.category || "");
//   const [description, setDescription] = useState(
//     filament?.description || ""
//   );
//   const [price, setPrice] = useState(
//     filament?.price !== undefined ? String(filament.price) : ""
//   );
//   const [slug, setSlug] = useState(filament?.slug || "");
//   const [sku, setSku] = useState(filament?.sku || "");

//   /* =========================================================
//      DIAMETER / WEIGHT
//   ========================================================= */

//   const [diameters, setDiameters] = useState<string[]>(
//     Array.isArray(filament?.diameter) && filament.diameter.length
//       ? filament.diameter
//       : [""]
//   );

//   const [weights, setWeights] = useState<string[]>(
//     Array.isArray(filament?.weight) && filament.weight.length
//       ? filament.weight
//       : [""]
//   );

//   /* =========================================================
//      GENERAL IMAGES
//   ========================================================= */

//   const [existingImages, setExistingImages] = useState<string[]>(
//     Array.isArray(filament?.images) ? filament.images : []
//   );

//   const [newImages, setNewImages] = useState<File[]>([]);

//   const [deletedImages, setDeletedImages] = useState<string[]>([]);

//   const [primaryImage, setPrimaryImage] = useState<string>(
//     Array.isArray(filament?.images) && filament.images.length
//       ? filament.images[0]
//       : ""
//   );

//   const generalImageInputRef = useRef<HTMLInputElement>(null);

//   /* =========================================================
//      COLORS
//   ========================================================= */

//   const [colors, setColors] = useState<ApiColor[]>([]);
//   const [loadingColors, setLoadingColors] = useState(true);

//   const [colorVariants, setColorVariants] = useState<ColorVariant[]>([
//     {
//       color: "",
//       existingImages: [],
//       newImages: [],
//     },
//   ]);

//   /* =========================================================
//      SUBMIT
//   ========================================================= */

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   /* =========================================================
//      LOAD COLORS
//   ========================================================= */

//   useEffect(() => {
//     const loadColors = async () => {
//       try {
//         setLoadingColors(true);

//         const response = await fetch("/api/color", {
//           method: "GET",
//           cache: "no-store",
//         });

//         if (!response.ok) {
//           throw new Error("Failed to load colors");
//         }

//         const data = await response.json();

//         const activeColors = Array.isArray(data?.colors)
//           ? data.colors.filter(
//               (color: ApiColor) => color.status === "active"
//             )
//           : [];

//         setColors(activeColors);
//       } catch (err) {
//         console.error("Color loading error:", err);
//       } finally {
//         setLoadingColors(false);
//       }
//     };

//     loadColors();
//   }, []);

//   /* =========================================================
//      INITIALIZE COLOR VARIANTS FOR EDIT
//   ========================================================= */

//   useEffect(() => {
//     if (!filament) return;

//     const parsed = parseColorImages(filament.color_images);

//     if (parsed.length > 0) {
//       setColorVariants(
//         parsed.map((item) => ({
//           color: item.color,
//           existingImages: item.images || [],
//           newImages: [],
//         }))
//       );
//     } else {
//       setColorVariants([
//         {
//           color: "",
//           existingImages: [],
//           newImages: [],
//         },
//       ]);
//     }
//   }, [filament]);

//   /* =========================================================
//      GENERAL IMAGE HANDLERS
//   ========================================================= */

//   const handleGeneralImages = (
//     event: ChangeEvent<HTMLInputElement>
//   ) => {
//     const files = event.target.files;

//     if (!files) return;

//     const selectedFiles = Array.from(files);

//     setNewImages((prev) => [
//       ...prev,
//       ...selectedFiles,
//     ]);

//     event.target.value = "";
//   };

//   const removeExistingGeneralImage = (index: number) => {
//     const image = existingImages[index];

//     setExistingImages((prev) =>
//       prev.filter((_, i) => i !== index)
//     );

//     if (image) {
//       setDeletedImages((prev) => {
//         if (prev.includes(image)) return prev;

//         return [...prev, image];
//       });
//     }

//     if (primaryImage === image) {
//       const remaining = existingImages.filter(
//         (_, i) => i !== index
//       );

//       setPrimaryImage(remaining[0] || "");
//     }
//   };

//   const removeNewGeneralImage = (index: number) => {
//     setNewImages((prev) =>
//       prev.filter((_, i) => i !== index)
//     );
//   };

//   const makeExistingPrimary = (image: string) => {
//     setPrimaryImage(image);
//   };

//   /* =========================================================
//      COLOR VARIANT HANDLERS
//   ========================================================= */

//   const addColorVariant = () => {
//     setColorVariants((prev) => [
//       ...prev,
//       {
//         color: "",
//         existingImages: [],
//         newImages: [],
//       },
//     ]);
//   };

//   const removeColorVariant = (index: number) => {
//     setColorVariants((prev) =>
//       prev.filter((_, i) => i !== index)
//     );
//   };

//   const updateColor = (
//     index: number,
//     value: string
//   ) => {
//     setColorVariants((prev) =>
//       prev.map((item, i) =>
//         i === index
//           ? {
//               ...item,
//               color: value,
//             }
//           : item
//       )
//     );
//   };

//   const addColorImages = (
//     index: number,
//     files: FileList | null
//   ) => {
//     if (!files) return;

//     const selectedFiles = Array.from(files);

//     setColorVariants((prev) =>
//       prev.map((item, i) =>
//         i === index
//           ? {
//               ...item,
//               newImages: [
//                 ...item.newImages,
//                 ...selectedFiles,
//               ],
//             }
//           : item
//       )
//     );
//   };

//   const removeColorExistingImage = (
//     colorIndex: number,
//     imageIndex: number
//   ) => {
//     setColorVariants((prev) =>
//       prev.map((item, i) =>
//         i === colorIndex
//           ? {
//               ...item,
//               existingImages:
//                 item.existingImages.filter(
//                   (_, imgIndex) =>
//                     imgIndex !== imageIndex
//                 ),
//             }
//           : item
//       )
//     );
//   };

//   const removeColorNewImage = (
//     colorIndex: number,
//     imageIndex: number
//   ) => {
//     setColorVariants((prev) =>
//       prev.map((item, i) =>
//         i === colorIndex
//           ? {
//               ...item,
//               newImages: item.newImages.filter(
//                 (_, imgIndex) =>
//                   imgIndex !== imageIndex
//               ),
//             }
//           : item
//       )
//     );
//   };

//   /* =========================================================
//      DIAMETER
//   ========================================================= */

//   const updateDiameter = (
//     index: number,
//     value: string
//   ) => {
//     setDiameters((prev) =>
//       prev.map((item, i) =>
//         i === index ? value : item
//       )
//     );
//   };

//   const addDiameter = () => {
//     setDiameters((prev) => [...prev, ""]);
//   };

//   const removeDiameter = (index: number) => {
//     setDiameters((prev) => {
//       if (prev.length === 1) return [""];

//       return prev.filter((_, i) => i !== index);
//     });
//   };

//   /* =========================================================
//      WEIGHT
//   ========================================================= */

//   const updateWeight = (
//     index: number,
//     value: string
//   ) => {
//     setWeights((prev) =>
//       prev.map((item, i) =>
//         i === index ? value : item
//       )
//     );
//   };

//   const addWeight = () => {
//     setWeights((prev) => [...prev, ""]);
//   };

//   const removeWeight = (index: number) => {
//     setWeights((prev) => {
//       if (prev.length === 1) return [""];

//       return prev.filter((_, i) => i !== index);
//     });
//   };

//   /* =========================================================
//      AUTO SLUG
//   ========================================================= */

//   const handleTitleChange = (
//     event: ChangeEvent<HTMLInputElement>
//   ) => {
//     const value = event.target.value;

//     setTitle(value);

//     if (!isEdit) {
//       const generatedSlug = value
//         .toLowerCase()
//         .trim()
//         .replace(/[^a-z0-9]+/g, "-")
//         .replace(/^-+|-+$/g, "");

//       setSlug(generatedSlug);
//     }
//   };

//   /* =========================================================
//      SUBMIT
//   ========================================================= */

//   const handleSubmit = async (
//     event: FormEvent<HTMLFormElement>
//   ) => {
//     event.preventDefault();

//     setError("");

//     if (!title.trim()) {
//       setError("Please enter filament title.");
//       return;
//     }

//     if (!price.trim()) {
//       setError("Please enter price.");
//       return;
//     }

//     /* Validate color variants */
//     const validColorVariants = colorVariants.filter(
//       (item) =>
//         item.color.trim() !== "" &&
//         (
//           item.existingImages.length > 0 ||
//           item.newImages.length > 0
//         )
//     );

//     /* Check duplicate colors */
//     const selectedColors = colorVariants
//       .filter((item) => item.color.trim())
//       .map((item) => item.color.trim().toLowerCase());

//     const duplicateColors = selectedColors.filter(
//       (color, index) =>
//         selectedColors.indexOf(color) !== index
//     );

//     if (duplicateColors.length > 0) {
//       setError(
//         "The same color cannot be selected more than once."
//       );
//       return;
//     }

//     try {
//       setSaving(true);

//       const formData = new FormData();

//       /* =====================================================
//          BASIC
//       ===================================================== */

//       formData.append("title", title.trim());
//       formData.append("category", category.trim());
//       formData.append(
//         "description",
//         description.trim()
//       );
//       formData.append("price", price.trim());
//       formData.append("slug", slug.trim());
//       formData.append("sku", sku.trim());

//       /* =====================================================
//          COLOUR
//       ===================================================== */

//       const basicColours = colorVariants
//         .filter((item) => item.color.trim())
//         .map((item) => item.color.trim());

//       basicColours.forEach((color) => {
//         formData.append("colour[]", color);
//       });

//       /* =====================================================
//          DIAMETER
//       ===================================================== */

//       diameters
//         .filter((value) => value.trim())
//         .forEach((value) => {
//           formData.append(
//             "diameter[]",
//             value.trim()
//           );
//         });

//       /* =====================================================
//          WEIGHT
//       ===================================================== */

//       weights
//         .filter((value) => value.trim())
//         .forEach((value) => {
//           formData.append(
//             "weight[]",
//             value.trim()
//           );
//         });

//       /* =====================================================
//          GENERAL EXISTING IMAGES
//       ===================================================== */

//       existingImages.forEach((image) => {
//         formData.append(
//           "existing_images[]",
//           image
//         );
//       });

//       /* =====================================================
//          GENERAL NEW IMAGES
//       ===================================================== */

//       newImages.forEach((file) => {
//         formData.append("images[]", file);
//       });

//       /* =====================================================
//          DELETED GENERAL IMAGES
//       ===================================================== */

//       if (deletedImages.length > 0) {
//         formData.append(
//           "delete_images",
//           JSON.stringify(deletedImages)
//         );
//       }

//       /* =====================================================
//          PRIMARY IMAGE
//       ===================================================== */

//       if (primaryImage) {
//         formData.append(
//           "primary_image",
//           primaryImage
//         );
//       }

//       /* =====================================================
//          COLOR-WISE IMAGES
         
//          color_names[]
//          color_existing_images[0][]
//          color_images[0][]
         
//          color_names[]
//          color_existing_images[1][]
//          color_images[1][]
//       ===================================================== */

//       validColorVariants.forEach(
//         (variant, index) => {
//           formData.append(
//             "color_names[]",
//             variant.color.trim()
//           );

//           variant.existingImages.forEach(
//             (image) => {
//               formData.append(
//                 `color_existing_images[${index}][]`,
//                 image
//               );
//             }
//           );

//           variant.newImages.forEach((file) => {
//             formData.append(
//               `color_images[${index}][]`,
//               file
//             );
//           });
//         }
//       );

//       /* =====================================================
//          EDIT ID
//       ===================================================== */

//       if (isEdit && filament?.id) {
//         formData.append(
//           "id",
//           String(filament.id)
//         );
//       }

//       const response = await fetch(
//         "/api/filament",
//         {
//           method: isEdit ? "PUT" : "POST",
//           body: formData,
//         }
//       );

//       const data = await response.json();

//       if (!response.ok || data?.success === false) {
//         throw new Error(
//           data?.message ||
//             data?.error ||
//             "Failed to save filament."
//         );
//       }

//       onSuccess?.();
//       onClose();
//     } catch (err) {
//       console.error("Filament save error:", err);

//       setError(
//         err instanceof Error
//           ? err.message
//           : "Something went wrong."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* =========================================================
//      UI
//   ========================================================= */

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6">
//       <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
//         {/* ===================================================
//             HEADER
//         =================================================== */}

//         <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
//           <div>
//             <h2 className="text-xl font-semibold text-gray-900">
//               {isEdit
//                 ? "Edit Filament"
//                 : "Add Filament"}
//             </h2>

//             <p className="mt-1 text-sm text-gray-500">
//               {isEdit
//                 ? "Update filament details and color variants."
//                 : "Add a new filament product."}
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={onClose}
//             className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         {/* ===================================================
//             FORM
//         =================================================== */}

//         <form
//           onSubmit={handleSubmit}
//           className="min-h-0 flex-1 overflow-y-auto"
//         >
//           <div className="space-y-6 p-5 sm:p-6">

//             {/* =================================================
//                 ERROR
//             ================================================= */}

//             {error && (
//               <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//                 {error}
//               </div>
//             )}

//             {/* =================================================
//                 COLOR VARIANTS - TOP SIDE
//             ================================================= */}

//             <section className="order-first">
//               <div className="mb-3 flex items-start gap-2">
//                 <Tag className="mt-0.5 h-5 w-5 text-blue-600" />

//                 <div>
//                   <div className="flex items-center gap-2">
//                     <h3 className="text-base font-semibold text-gray-900">
//                       Color Variants
//                     </h3>

//                     <span className="text-sm text-gray-400">
//                       (Optional)
//                     </span>
//                   </div>

//                   <p className="mt-1 text-sm text-gray-500">
//                     Add color-specific images only if
//                     this product has color variants.
//                   </p>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 {colorVariants.map(
//                   (variant, colorIndex) => (
//                     <div
//                       key={colorIndex}
//                       className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5"
//                     >
//                       {/* Color header */}

//                       <div className="mb-3 flex items-center justify-between">
//                         <span className="text-sm font-medium text-gray-700">
//                           Color {colorIndex + 1}
//                         </span>

//                         {colorVariants.length > 1 && (
//                           <button
//                             type="button"
//                             onClick={() =>
//                               removeColorVariant(
//                                 colorIndex
//                               )
//                             }
//                             className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-500 hover:bg-red-50"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                             Remove
//                           </button>
//                         )}
//                       </div>

//                       {/* Select + Add Images */}

//                       <div className="flex flex-col gap-3 sm:flex-row">
//                         <div className="flex-1">
//                           <select
//                             value={variant.color}
//                             onChange={(e) =>
//                               updateColor(
//                                 colorIndex,
//                                 e.target.value
//                               )
//                             }
//                             className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                           >
//                             <option value="">
//                               Select Color
//                             </option>

//                             {loadingColors ? (
//                               <option disabled>
//                                 Loading colors...
//                               </option>
//                             ) : (
//                               colors.map((color) => (
//                                 <option
//                                   key={color.id}
//                                   value={color.name}
//                                 >
//                                   {color.name}
//                                 </option>
//                               ))
//                             )}
//                           </select>
//                         </div>

//                         <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:min-w-[136px]">
//                           <Upload className="h-4 w-4" />

//                           <span>
//                             Add Images
//                           </span>

//                           <input
//                             type="file"
//                             accept="image/*"
//                             multiple
//                             className="hidden"
//                             onChange={(e) =>
//                               addColorImages(
//                                 colorIndex,
//                                 e.target.files
//                               )
//                             }
//                           />
//                         </label>
//                       </div>

//                       {/* =================================================
//                           COLOR IMAGES
//                       ================================================= */}

//                       {variant.existingImages.length ===
//                         0 &&
//                         variant.newImages.length ===
//                           0 ? (
//                         <div className="mt-4 flex min-h-[70px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-4 text-center text-sm text-gray-500">
//                           No images added for this
//                           color yet.
//                         </div>
//                       ) : (
//                         <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
//                           {/* Existing images */}

//                           {variant.existingImages.map(
//                             (image, imageIndex) => (
//                               <div
//                                 key={`existing-${imageIndex}`}
//                                 className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white"
//                               >
//                                 <img
//                                   src={image}
//                                   alt={`${variant.color} ${imageIndex + 1}`}
//                                   className="h-full w-full object-cover"
//                                 />

//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     removeColorExistingImage(
//                                       colorIndex,
//                                       imageIndex
//                                     )
//                                   }
//                                   className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow transition group-hover:opacity-100"
//                                 >
//                                   <X className="h-4 w-4" />
//                                 </button>
//                               </div>
//                             )
//                           )}

//                           {/* New images */}

//                           {variant.newImages.map(
//                             (file, imageIndex) => (
//                               <div
//                                 key={`new-${imageIndex}`}
//                                 className="group relative aspect-square overflow-hidden rounded-xl border border-blue-200 bg-white"
//                               >
//                                 <FilePreview
//                                   file={file}
//                                   className="h-full w-full"
//                                 />

//                                 <div className="absolute left-2 top-2 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
//                                   NEW
//                                 </div>

//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     removeColorNewImage(
//                                       colorIndex,
//                                       imageIndex
//                                     )
//                                   }
//                                   className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow transition group-hover:opacity-100"
//                                 >
//                                   <X className="h-4 w-4" />
//                                 </button>
//                               </div>
//                             )
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   )
//                 )}
//               </div>

//               {/* Add another color */}

//               <button
//                 type="button"
//                 onClick={addColorVariant}
//                 className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
//               >
//                 <Plus className="h-4 w-4" />

//                 Add Another Color
//               </button>
//             </section>

//             {/* =================================================
//                 BASIC INFORMATION
//             ================================================= */}

//             <section className="rounded-2xl border border-gray-200 bg-white">
//               <div className="border-b border-gray-200 px-5 py-4">
//                 <h3 className="font-semibold text-gray-900">
//                   Basic Information
//                 </h3>
//               </div>

//               <div className="grid gap-5 p-5 md:grid-cols-2">
//                 {/* Title */}

//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Title
//                   </label>

//                   <input
//                     type="text"
//                     value={title}
//                     onChange={handleTitleChange}
//                     placeholder="Enter filament title"
//                     className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                   />
//                 </div>

//                 {/* Category */}

//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Category
//                   </label>

//                   <input
//                     type="text"
//                     value={category}
//                     onChange={(e) =>
//                       setCategory(e.target.value)
//                     }
//                     placeholder="Enter category"
//                     className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                   />
//                 </div>

//                 {/* Price */}

//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Price
//                   </label>

//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     value={price}
//                     onChange={(e) =>
//                       setPrice(e.target.value)
//                     }
//                     placeholder="0.00"
//                     className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                   />
//                 </div>

//                 {/* SKU */}

//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     SKU
//                   </label>

//                   <input
//                     type="text"
//                     value={sku}
//                     onChange={(e) =>
//                       setSku(e.target.value)
//                     }
//                     placeholder="Enter SKU"
//                     className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                   />
//                 </div>

//                 {/* Slug */}

//                 <div className="md:col-span-2">
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Slug
//                   </label>

//                   <input
//                     type="text"
//                     value={slug}
//                     onChange={(e) =>
//                       setSlug(e.target.value)
//                     }
//                     placeholder="filament-product-slug"
//                     className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                   />
//                 </div>

//                 {/* Description */}

//                 <div className="md:col-span-2">
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Description
//                   </label>

//                   <textarea
//                     value={description}
//                     onChange={(e) =>
//                       setDescription(e.target.value)
//                     }
//                     placeholder="Enter filament description"
//                     rows={5}
//                     className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                   />
//                 </div>
//               </div>
//             </section>

//             {/* =================================================
//                 DIAMETER
//             ================================================= */}

//             <section className="rounded-2xl border border-gray-200 bg-white p-5">
//               <div className="mb-4 flex items-center justify-between">
//                 <div>
//                   <h3 className="font-semibold text-gray-900">
//                     Diameter
//                   </h3>

//                   <p className="mt-1 text-xs text-gray-500">
//                     Add one or more diameter values.
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={addDiameter}
//                   className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
//                 >
//                   <Plus className="h-4 w-4" />
//                   Add
//                 </button>
//               </div>

//               <div className="space-y-3">
//                 {diameters.map(
//                   (diameter, index) => (
//                     <div
//                       key={index}
//                       className="flex gap-2"
//                     >
//                       <input
//                         type="text"
//                         value={diameter}
//                         onChange={(e) =>
//                           updateDiameter(
//                             index,
//                             e.target.value
//                           )
//                         }
//                         placeholder="e.g. 1.75mm"
//                         className="h-11 flex-1 rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                       />

//                       <button
//                         type="button"
//                         onClick={() =>
//                           removeDiameter(index)
//                         }
//                         className="rounded-xl border border-gray-200 px-3 text-gray-500 hover:bg-red-50 hover:text-red-500"
//                       >
//                         <Minus className="h-4 w-4" />
//                       </button>
//                     </div>
//                   )
//                 )}
//               </div>
//             </section>

//             {/* =================================================
//                 WEIGHT
//             ================================================= */}

//             <section className="rounded-2xl border border-gray-200 bg-white p-5">
//               <div className="mb-4 flex items-center justify-between">
//                 <div>
//                   <h3 className="font-semibold text-gray-900">
//                     Weight
//                   </h3>

//                   <p className="mt-1 text-xs text-gray-500">
//                     Add one or more weight values.
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={addWeight}
//                   className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
//                 >
//                   <Plus className="h-4 w-4" />
//                   Add
//                 </button>
//               </div>

//               <div className="space-y-3">
//                 {weights.map(
//                   (weight, index) => (
//                     <div
//                       key={index}
//                       className="flex gap-2"
//                     >
//                       <input
//                         type="text"
//                         value={weight}
//                         onChange={(e) =>
//                           updateWeight(
//                             index,
//                             e.target.value
//                           )
//                         }
//                         placeholder="e.g. 1kg"
//                         className="h-11 flex-1 rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                       />

//                       <button
//                         type="button"
//                         onClick={() =>
//                           removeWeight(index)
//                         }
//                         className="rounded-xl border border-gray-200 px-3 text-gray-500 hover:bg-red-50 hover:text-red-500"
//                       >
//                         <Minus className="h-4 w-4" />
//                       </button>
//                     </div>
//                   )
//                 )}
//               </div>
//             </section>

//             {/* =================================================
//                 GENERAL PRODUCT IMAGES
//             ================================================= */}

//             <section className="rounded-2xl border border-gray-200 bg-white p-5">
//               <div className="mb-4 flex items-center justify-between">
//                 <div>
//                   <h3 className="font-semibold text-gray-900">
//                     Product Images
//                   </h3>

//                   <p className="mt-1 text-xs text-gray-500">
//                     General product images.
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     generalImageInputRef.current?.click()
//                   }
//                   className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
//                 >
//                   <Upload className="h-4 w-4" />
//                   Add Images
//                 </button>

//                 <input
//                   ref={generalImageInputRef}
//                   type="file"
//                   accept="image/*"
//                   multiple
//                   className="hidden"
//                   onChange={handleGeneralImages}
//                 />
//               </div>

//               {existingImages.length === 0 &&
//               newImages.length === 0 ? (
//                 <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
//                   <div className="text-center">
//                     <ImageIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />

//                     <p className="text-sm text-gray-500">
//                       No product images added yet.
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5">
//                   {/* Existing */}

//                   {existingImages.map(
//                     (image, index) => (
//                       <div
//                         key={`existing-${index}`}
//                         className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200"
//                       >
//                         <img
//                           src={image}
//                           alt={`Product ${index + 1}`}
//                           className="h-full w-full object-cover"
//                         />

//                         {primaryImage === image && (
//                           <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
//                             <Star className="h-3 w-3 fill-current" />
//                             Primary
//                           </div>
//                         )}

//                         <div className="absolute inset-x-2 bottom-2 flex gap-2 opacity-0 transition group-hover:opacity-100">
//                           {primaryImage !== image && (
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 makeExistingPrimary(
//                                   image
//                                 )
//                               }
//                               className="flex-1 rounded-lg bg-white px-2 py-1.5 text-xs font-medium shadow"
//                             >
//                               Make Primary
//                             </button>
//                           )}

//                           <button
//                             type="button"
//                             onClick={() =>
//                               removeExistingGeneralImage(
//                                 index
//                               )
//                             }
//                             className="rounded-lg bg-red-500 p-1.5 text-white shadow"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </div>
//                     )
//                   )}

//                   {/* New */}

//                   {newImages.map(
//                     (file, index) => (
//                       <div
//                         key={`new-${index}`}
//                         className="group relative aspect-square overflow-hidden rounded-xl border border-blue-200"
//                       >
//                         <FilePreview
//                           file={file}
//                           className="h-full w-full"
//                         />

//                         <div className="absolute left-2 top-2 rounded-md bg-blue-600 px-2 py-1 text-[10px] font-medium text-white">
//                           NEW
//                         </div>

//                         <button
//                           type="button"
//                           onClick={() =>
//                             removeNewGeneralImage(
//                               index
//                             )
//                           }
//                           className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow transition group-hover:opacity-100"
//                         >
//                           <X className="h-4 w-4" />
//                         </button>
//                       </div>
//                     )
//                   )}
//                 </div>
//               )}
//             </section>
//           </div>

//           {/* =================================================
//               FOOTER
//           ================================================= */}

//           <div className="sticky bottom-0 flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:px-6">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={saving}
//               className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={saving}
//               className="flex min-w-[130px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {saving ? (
//                 <>
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   {isEdit
//                     ? "Update Filament"
//                     : "Save Filament"}
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }