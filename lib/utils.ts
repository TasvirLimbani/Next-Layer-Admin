import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const PRODUCT_IMAGE_BASE_URL = 'http://nextlayer.soon.it/images/';

type ProductImageGroup = {
  color?: string;
  images?: string[] | string;
};

type ProductVariant = {
  color?: string;
  images?: string[] | string;
  image_urls?: string[] | string;
};

function parseStringList(value: string): string[] {
  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Fall through to comma-separated parsing.
  }

  return trimmed
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toProductImageUrl(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();

  if (!text) {
    return null;
  }

  if (
    text.startsWith('http://') ||
    text.startsWith('https://') ||
    text.startsWith('blob:') ||
    text.startsWith('data:') ||
    text.startsWith('/')
  ) {
    return text;
  }

  return `${PRODUCT_IMAGE_BASE_URL}${text.replace(/^\/+/, '')}`;
}

function addImageValues(values: unknown, imageUrls: Set<string>) {
  if (Array.isArray(values)) {
    values.forEach((value) => {
      const imageUrl = toProductImageUrl(value);
      if (imageUrl) {
        imageUrls.add(imageUrl);
      }
    });
    return;
  }

  if (typeof values === 'string') {
    parseStringList(values).forEach((value) => {
      const imageUrl = toProductImageUrl(value);
      if (imageUrl) {
        imageUrls.add(imageUrl);
      }
    });
    return;
  }

  const imageUrl = toProductImageUrl(values);

  if (imageUrl) {
    imageUrls.add(imageUrl);
  }
}

export function normalizeProductImageUrls(product: any): string[] {
  const imageUrls = new Set<string>();

  if (!product || typeof product !== 'object') {
    return [];
  }

  addImageValues(product.image_urls, imageUrls);
  addImageValues(product.image, imageUrls);

  if (Array.isArray(product.images)) {
    product.images.forEach((group: ProductImageGroup) => {
      addImageValues(group?.images, imageUrls);
    });
  }

  if (Array.isArray(product.variants)) {
    product.variants.forEach((variant: ProductVariant) => {
      addImageValues(variant?.image_urls, imageUrls);
      addImageValues(variant?.images, imageUrls);
    });
  }

  return Array.from(imageUrls);
}

export function normalizeProductImages<T extends Record<string, any>>(product: T) {
  const imageUrls = normalizeProductImageUrls(product);

  return {
    ...product,
    image_urls: imageUrls,
    image: imageUrls.join(','),
  };
}
