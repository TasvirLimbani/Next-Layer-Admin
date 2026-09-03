'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  CreditCard,
  MapPin,
  Phone,
  Truck,
  Hash,
  Tag,
  ShoppingBag,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/* =========================================================
   TYPES
========================================================= */

interface OrderItem {
  id: number;

  order_id?: number | null;

  product_id?: number | null;

  filament_id?: number | null;

  product_type?: string | null;

  type?: string | null;

  sku?: string | null;

  product_name?: string | null;

  quantity: number;

  price: string | number;

  total?: string | number | null;

  images?: string | string[] | null;

  image_urls?: string[] | null;

  extra?: {
    colour?: string;
    color?: string;
    diameter?: string;
    weight?: string;
    customization?: string | null;
    customer_image?: string | null;
  } | null;
}

interface OrderData {
  id: number;

  user_id: number;

  payment_id: string;

  total_amount: string | number;

  order_status: string;

  tracking_id: string | null;

  shipping_name: string;

  shipping_phone: string;

  shipping_address: string;

  shipping_city: string;

  shipping_state: string;

  shipping_pincode: string;

  created_at: string;

  items?: OrderItem[];

  items_count?: number;
}

/* =========================================================
   API RESPONSE TYPE
========================================================= */

interface OrderApiResponse {
  status: boolean;

  message?: string;

  order?: OrderData;

  items?: OrderItem[];

  data?: {
    order?: OrderData;

    items?: OrderItem[];
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function OrderDetailPage() {
  const params = useParams();

  const orderId = String(params.id || '');

  const [order, setOrder] =
    useState<OrderData | null>(null);

  const [items, setItems] =
    useState<OrderItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  /* =======================================================
     LIGHTBOX
  ======================================================= */

  const [showLightbox, setShowLightbox] =
    useState(false);

  const [lightboxImages, setLightboxImages] =
    useState<string[]>([]);

  const [lightboxIndex, setLightboxIndex] =
    useState(0);

  /* =======================================================
     FETCH ORDER
  ======================================================= */

  useEffect(() => {
    if (!orderId) {
      setError('Invalid order ID');
      setLoading(false);
      return;
    }

    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `/api/orders/${encodeURIComponent(orderId)}`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      );

      const data: OrderApiResponse =
        await response.json();

      console.log(
        '===================================='
      );

      console.log(
        'ORDER DETAILS API:',
        data
      );

      console.log(
        '===================================='
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
          'Failed to fetch order details'
        );
      }

      if (!data?.status) {
        throw new Error(
          data?.message ||
          'Order not found'
        );
      }

      /*
       * Support different response structures:
       *
       * {
       *   order: {...},
       *   items: [...]
       * }
       *
       * OR
       *
       * {
       *   data: {
       *     order: {...},
       *     items: [...]
       *   }
       * }
       *
       * OR
       *
       * {
       *   order: {
       *      ...
       *      items: [...]
       *   }
       * }
       */

      const orderData =
        data.order ||
        data.data?.order ||
        null;

      const orderItems =
        data.items ||
        data.data?.items ||
        orderData?.items ||
        [];

      if (!orderData) {
        throw new Error(
          'Order data not found in API response'
        );
      }

      setOrder(orderData);

      setItems(
        Array.isArray(orderItems)
          ? orderItems
          : []
      );

      console.log(
        'ORDER:',
        orderData
      );

      console.log(
        'ORDER ITEMS:',
        orderItems
      );
    } catch (err) {
      console.error(
        'FETCH ORDER DETAILS ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch order details'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LIGHTBOX
  ======================================================= */

  const openLightbox = (
    images: string[],
    index = 0
  ) => {
    if (!images.length) return;

    setLightboxImages(images);
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  const nextImage = () => {
    if (lightboxImages.length === 0) {
      return;
    }

    setLightboxIndex((prev) =>
      prev >= lightboxImages.length - 1
        ? 0
        : prev + 1
    );
  };

  const prevImage = () => {
    if (lightboxImages.length === 0) {
      return;
    }

    setLightboxIndex((prev) =>
      prev <= 0
        ? lightboxImages.length - 1
        : prev - 1
    );
  };

  /* =======================================================
     IMAGE NORMALIZER
  ======================================================= */

  const normalizeImageUrl = (
    value: string
  ): string => {
    const cleanUrl = value.trim();

    if (!cleanUrl) {
      return '';
    }

    /*
     * Already a complete URL
     */
    if (
      cleanUrl.startsWith('http://') ||
      cleanUrl.startsWith('https://')
    ) {
      return cleanUrl;
    }

    /*
     * Already local Next.js path
     */
    if (cleanUrl.startsWith('/')) {
      return cleanUrl;
    }

    /*
     * Filename from PHP API
     */
    return `http://nextlayer.soon.it/images/${cleanUrl}`;
  };

  /* =======================================================
     GET ITEM IMAGES
  ======================================================= */

  const getItemImages = (
    item: OrderItem
  ): string[] => {
    const images: string[] = [];

    try {
      /*
       * -----------------------------------------------
       * 1. image_urls
       * -----------------------------------------------
       */

      if (
        Array.isArray(item.image_urls)
      ) {
        for (const image of item.image_urls) {
          if (
            typeof image === 'string' &&
            image.trim()
          ) {
            images.push(
              normalizeImageUrl(image)
            );
          }
        }
      }

      /*
       * -----------------------------------------------
       * 2. images
       * -----------------------------------------------
       */

      if (
        images.length === 0 &&
        item.images
      ) {
        let parsed: unknown =
          item.images;

        /*
         * JSON string
         */
        if (
          typeof parsed === 'string'
        ) {
          try {
            parsed = JSON.parse(parsed);
          } catch {
            /*
             * Single filename / URL
             */
            parsed = [parsed];
          }
        }

        if (Array.isArray(parsed)) {
          for (const image of parsed) {
            if (
              typeof image === 'string' &&
              image.trim()
            ) {
              images.push(
                normalizeImageUrl(image)
              );
            }
          }
        }
      }

      /*
       * -----------------------------------------------
       * 3. CUSTOMER IMAGE
       * -----------------------------------------------
       */

      if (
        item.extra?.customer_image
      ) {
        images.push(
          normalizeImageUrl(
            item.extra.customer_image
          )
        );
      }

      /*
       * -----------------------------------------------
       * REMOVE DUPLICATES
       * -----------------------------------------------
       */

      return [
        ...new Set(
          images.filter(Boolean)
        ),
      ];
    } catch (err) {
      console.error(
        'IMAGE PARSE ERROR:',
        err
      );

      return [];
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />

          <p className="text-slate-600">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !order) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-5">
        <div className="rounded-full bg-red-100 p-4">
          <Package className="h-8 w-8 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900">
          Order not found
        </h2>

        <p className="max-w-md text-center text-slate-500">
          {error || 'Unable to load order details.'}
        </p>

        <div className="flex gap-3">
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          <button
            onClick={fetchOrderDetails}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     DATE
  ======================================================= */

  const orderDate = new Date(
    order.created_at
  );

  const formattedDate =
    Number.isNaN(orderDate.getTime())
      ? order.created_at
      : orderDate.toLocaleString(
        'en-IN',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      );

  /* =======================================================
     STATUS
  ======================================================= */

  const normalizedStatus =
    String(
      order.order_status || 'Pending'
    )
      .trim()
      .toLowerCase();

  let statusColor =
    'bg-blue-100 text-blue-700';

  if (
    normalizedStatus === 'pending'
  ) {
    statusColor =
      'bg-yellow-100 text-yellow-700';
  } else if (
    normalizedStatus === 'processing' ||
    normalizedStatus === 'processed'
  ) {
    statusColor =
      'bg-blue-100 text-blue-700';
  } else if (
    normalizedStatus === 'shipped'
  ) {
    statusColor =
      'bg-purple-100 text-purple-700';
  } else if (
    normalizedStatus === 'delivered' ||
    normalizedStatus === 'completed' ||
    normalizedStatus === 'complete'
  ) {
    statusColor =
      'bg-green-100 text-green-700';
  } else if (
    normalizedStatus === 'cancelled' ||
    normalizedStatus === 'canceled'
  ) {
    statusColor =
      'bg-red-100 text-red-700';
  }

  /* =======================================================
     TOTAL ITEMS
  ======================================================= */

  const totalQuantity =
    items.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <div className="space-y-8">

        {/* =================================================
            BACK
        ================================================= */}

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        {/* =================================================
            ORDER HEADER
        ================================================= */}

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="flex flex-col justify-between gap-6 md:flex-row">

            {/* LEFT */}

            <div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />

                <p className="text-sm font-medium text-slate-500">
                  Order Number
                </p>
              </div>

              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                #{order.id}
              </h1>

              <p className="mt-3 text-sm text-slate-500">
                {formattedDate}
              </p>
            </div>

            {/* RIGHT */}

            <div className="text-left md:text-right">

              <p className="text-sm font-medium text-slate-500">
                Order Status
              </p>

              <div className="mt-3">
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold capitalize ${statusColor}`}
                >
                  {order.order_status ||
                    'Pending'}
                </span>
              </div>

            </div>

          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-4">

            {/* TOTAL */}

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Total Amount
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                ₹
                {Number(
                  order.total_amount || 0
                ).toFixed(2)}
              </p>

            </div>

            {/* ITEMS */}

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Products
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {items.length}
              </p>

            </div>

            {/* QUANTITY */}

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Total Quantity
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalQuantity}
              </p>

            </div>

            {/* PAYMENT */}

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Payment ID
              </p>

              <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                {order.payment_id ||
                  'N/A'}
              </p>

            </div>

          </div>
        </div>

        {/* =================================================
            CUSTOMER INFORMATION
        ================================================= */}

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-blue-100 p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Customer Information
            </h2>

          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* NAME */}

            <div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />

                <p className="text-sm text-slate-500">
                  Full Name
                </p>
              </div>

              <p className="mt-2 font-semibold text-slate-900">
                {order.shipping_name ||
                  'N/A'}
              </p>
            </div>

            {/* PHONE */}

            <div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />

                <p className="text-sm text-slate-500">
                  Phone Number
                </p>
              </div>

              <p className="mt-2 font-semibold text-slate-900">
                {order.shipping_phone ||
                  'N/A'}
              </p>
            </div>

            {/* USER ID */}

            <div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-slate-400" />

                <p className="text-sm text-slate-500">
                  User ID
                </p>
              </div>

              <p className="mt-2 font-semibold text-slate-900">
                {order.user_id}
              </p>
            </div>

            {/* TRACKING */}

            <div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-slate-400" />

                <p className="text-sm text-slate-500">
                  Tracking ID
                </p>
              </div>

              <p className="mt-2 font-semibold text-slate-900">
                {order.tracking_id ||
                  'N/A'}
              </p>
            </div>

            {/* ADDRESS */}

            <div className="md:col-span-2">

              <div className="flex items-center gap-2">

                <MapPin className="h-4 w-4 text-slate-400" />

                <p className="text-sm text-slate-500">
                  Shipping Address
                </p>

              </div>

              <div className="mt-3 rounded-lg bg-slate-50 p-4">

                <p className="leading-7 text-slate-900">

                  {order.shipping_address ||
                    'N/A'}

                  {order.shipping_city && (
                    <>
                      , {order.shipping_city}
                    </>
                  )}

                  {order.shipping_state && (
                    <>
                      , {order.shipping_state}
                    </>
                  )}

                  {order.shipping_pincode && (
                    <>
                      - {order.shipping_pincode}
                    </>
                  )}

                </p>

              </div>

            </div>

          </div>
        </div>

        {/* =================================================
            ORDER ITEMS
        ================================================= */}

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* HEADER */}

          <div className="flex items-center gap-3 border-b border-slate-200 px-8 py-6">

            <div className="rounded-lg bg-blue-100 p-2">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Order Items
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {items.length} product
                {items.length !== 1
                  ? 's'
                  : ''}{' '}
                / {totalQuantity} item
                {totalQuantity !== 1
                  ? 's'
                  : ''}
              </p>

            </div>

          </div>

          {/* ITEMS */}

          <div className="space-y-5 p-8">

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">

                <Package className="mx-auto h-10 w-10 text-slate-400" />

                <p className="mt-4 font-semibold text-slate-900">
                  No order items
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  This order does not contain
                  any item records.
                </p>

              </div>
            ) : (
              items.map((item) => {

                const allImages =
                  getItemImages(item);

                const mainImage =
                  allImages[0] ||
                  '/placeholder.svg';

                const productType =
                  item.product_type ||
                  item.type ||
                  'product';

                const productName =
                  item.product_name ||
                  item.sku ||
                  (item.product_id
                    ? `Product #${item.product_id}`
                    : 'Product');

                const itemTotal =
                  Number(
                    item.total ??
                    Number(item.price || 0) *
                    Number(
                      item.quantity || 0
                    )
                  );

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                  >

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                      {/* =================================================
                          LEFT PRODUCT
                      ================================================= */}

                      <div className="flex min-w-0 items-start gap-5">

                        {/* IMAGE */}

                 

                        {/* =================================================
                            PRODUCT INFORMATION
                        ================================================= */}

                        <div className="min-w-0">

                          {/* PRODUCT NAME */}

                          <h3 className="text-xl font-bold text-slate-900">
                            {productName}
                          </h3>

                          {/* PRODUCT TYPE */}

                          <div className="mt-2 flex flex-wrap gap-2">

                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700">

                              <Tag className="h-3 w-3" />

                              {productType}

                            </span>

                          </div>

                          {/* PRODUCT ID */}

                          {item.product_id !=
                            null && (
                              <p className="mt-4 text-sm text-slate-600">

                                <span className="font-medium text-slate-500">
                                  Product ID:
                                </span>{' '}

                                <span className="font-semibold text-slate-900">
                                  {item.product_id}
                                </span>

                              </p>
                            )}

                          {/* FILAMENT ID */}

                          {item.filament_id !=
                            null && (
                              <p className="mt-1 text-sm text-slate-600">

                                <span className="font-medium text-slate-500">
                                  Filament ID:
                                </span>{' '}

                                <span className="font-semibold text-slate-900">
                                  {item.filament_id}
                                </span>

                              </p>
                            )}

                          {/* SKU */}

                          {item.sku && (
                            <p className="mt-1 text-sm text-slate-600">

                              <span className="font-medium text-slate-500">
                                SKU:
                              </span>{' '}

                              <span className="font-mono font-semibold text-slate-900">
                                {item.sku}
                              </span>

                            </p>
                          )}

                          {/* ORDER ITEM ID */}

                          <p className="mt-1 text-sm text-slate-600">

                            <span className="font-medium text-slate-500">
                              Order Item ID:
                            </span>{' '}

                            <span className="font-semibold text-slate-900">
                              {item.id}
                            </span>

                          </p>

                          {/* QUANTITY */}

                          <p className="mt-1 text-sm text-slate-600">

                            <span className="font-medium text-slate-500">
                              Quantity:
                            </span>{' '}

                            <span className="font-semibold text-slate-900">
                              {item.quantity}
                            </span>

                          </p>

                          {/* FILAMENT OPTIONS */}

                          {item.extra && (
                            <div className="mt-4 flex flex-wrap gap-2">

                              {(item.extra.colour ||
                                item.extra.color) && (
                                  <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">

                                    Colour:{' '}

                                    <strong>
                                      {item.extra.colour ||
                                        item.extra.color}
                                    </strong>

                                  </span>
                                )}

                              {item.extra
                                .diameter && (
                                  <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">

                                    Diameter:{' '}

                                    <strong>
                                      {
                                        item
                                          .extra
                                          .diameter
                                      }
                                    </strong>

                                  </span>
                                )}

                              {item.extra
                                .weight && (
                                  <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">

                                    Weight:{' '}

                                    <strong>
                                      {
                                        item
                                          .extra
                                          .weight
                                      }
                                    </strong>

                                  </span>
                                )}

                            </div>
                          )}

                        </div>

                      </div>

                      {/* =================================================
                          RIGHT PRICE
                      ================================================= */}

                      <div className="shrink-0 border-t border-slate-200 pt-5 text-left lg:border-t-0 lg:pt-0 lg:text-right">

                        <p className="text-sm text-slate-500">
                          Unit Price
                        </p>

                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          ₹
                          {Number(
                            item.price || 0
                          ).toFixed(2)}
                        </p>

                        <p className="mt-3 text-sm text-slate-500">
                          {item.quantity}{' '}
                          × ₹
                          {Number(
                            item.price || 0
                          ).toFixed(2)}
                        </p>

                        <p className="mt-1 text-2xl font-bold text-blue-600">
                          ₹
                          {itemTotal.toFixed(2)}
                        </p>

                      </div>

                    </div>

                  </div>
                );
              })
            )}

          </div>

          {/* =================================================
              TOTAL
          ================================================= */}

          <div className="border-t border-slate-200 p-8">

            <div className="ml-auto w-full max-w-sm space-y-4">

              {/* SUBTOTAL */}

              <div className="flex justify-between">

                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-semibold text-slate-900">
                  ₹
                  {Number(
                    order.total_amount || 0
                  ).toFixed(2)}
                </span>

              </div>

              {/* SHIPPING */}

              <div className="flex justify-between">

                <span className="text-slate-500">
                  Shipping
                </span>

                <span className="font-semibold text-slate-900">
                  Free
                </span>

              </div>

              {/* TAX */}

              <div className="flex justify-between">

                <span className="text-slate-500">
                  Tax
                </span>

                <span className="font-semibold text-slate-900">
                  ₹0.00
                </span>

              </div>

              {/* TOTAL */}

              <div className="flex justify-between border-t border-slate-200 pt-4">

                <span className="text-xl font-bold text-slate-900">
                  Total
                </span>

                <span className="text-2xl font-bold text-blue-600">
                  ₹
                  {Number(
                    order.total_amount || 0
                  ).toFixed(2)}
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            EXTRA ORDER INFORMATION
        ================================================= */}

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-purple-100 p-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Order Information
            </h2>

          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

            <div className="rounded-lg bg-slate-50 p-4">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Order ID
              </p>

              <p className="mt-1 font-mono font-semibold text-slate-900">
                #{order.id}
              </p>

            </div>

            <div className="rounded-lg bg-slate-50 p-4">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                User ID
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {order.user_id}
              </p>

            </div>

            <div className="rounded-lg bg-slate-50 p-4">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Payment ID
              </p>

              <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-900">
                {order.payment_id ||
                  'N/A'}
              </p>

            </div>

            <div className="rounded-lg bg-slate-50 p-4">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Tracking ID
              </p>

              <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-900">
                {order.tracking_id ||
                  'N/A'}
              </p>

            </div>

            <div className="rounded-lg bg-slate-50 p-4 md:col-span-2">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Created At
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formattedDate}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          LIGHTBOX
      ===================================================== */}

      {showLightbox &&
        lightboxImages.length > 0 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() =>
              setShowLightbox(false)
            }
          >

            <div
              className="relative flex w-full max-w-5xl flex-col items-center"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* CLOSE */}

              <button
                type="button"
                onClick={() =>
                  setShowLightbox(false)
                }
                className="absolute -top-14 right-0 rounded-lg p-2 text-white transition-colors hover:bg-white/20"
                title="Close"
              >
                <X className="h-7 w-7" />
              </button>

              {/* IMAGE */}

              <div className="relative flex max-h-[80vh] min-h-[300px] w-full items-center justify-center overflow-hidden rounded-xl bg-black">

                <img
                  src={
                    lightboxImages[
                    lightboxIndex
                    ]
                  }
                  alt={`Product image ${lightboxIndex + 1
                    }`}
                  className="max-h-[80vh] max-w-full object-contain"
                  onError={(event) => {
                    event.currentTarget.src =
                      '/placeholder.svg';
                  }}
                />

              </div>

              {/* NAVIGATION */}

              {lightboxImages.length >
                1 && (
                  <div className="mt-5 flex items-center justify-center gap-5">

                    <button
                      type="button"
                      onClick={prevImage}
                      className="rounded-lg p-3 text-white transition-colors hover:bg-white/20"
                      title="Previous image"
                    >
                      <ChevronLeft className="h-7 w-7" />
                    </button>

                    <div className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white">
                      {lightboxIndex + 1}{' '}
                      /{' '}
                      {
                        lightboxImages.length
                      }
                    </div>

                    <button
                      type="button"
                      onClick={nextImage}
                      className="rounded-lg p-3 text-white transition-colors hover:bg-white/20"
                      title="Next image"
                    >
                      <ChevronRight className="h-7 w-7" />
                    </button>

                  </div>
                )}

            </div>

          </div>
        )}
    </>
  );
}