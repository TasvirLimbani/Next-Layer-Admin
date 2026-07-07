'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: string;
  product_name: string | null;
  images?: string;
  image_urls?: string[];
}

interface OrderData {
  id: number;
  user_id: number;
  payment_id: string;
  total_amount: string;
  order_status: string;
  tracking_id: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  created_at: string;
}

export default function OrderDetailPage() {
  const params = useParams();

  const orderId = params.id as string;

  const [order, setOrder] =
    useState<OrderData | null>(null);

  const [items, setItems] =
    useState<OrderItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // FETCH ORDER DETAILS
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails =
    async () => {
      try {
        setLoading(true);

        // NEXT API ROUTE
        const response = await fetch(
          `/api/orders/${orderId}`,
          {
            cache: 'no-store',
          }
        );

        const data =
          await response.json();

        console.log(
          'ORDER DETAILS:',
          data
        );

        if (data.status) {
          setOrder(data.order);

          setItems(data.items || []);

          setError('');
        } else {
          setError(
            data.message ||
            'Order not found'
          );
        }
      } catch (error) {
        console.log(error);

        setError(
          'Failed to fetch order details'
        );
      } finally {
        setLoading(false);
      }
    };

  const openLightbox = (images: string[]) => {
    setLightboxImages(images);
    setLightboxIndex(0);
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

  // LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ERROR
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20">
        <h2 className="text-2xl font-bold text-slate-900">
          Order not found
        </h2>

        <p className="text-slate-500">
          {error}
        </p>

        <Link
          href="/admin/orders"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </div>
    );
  }

  // FORMAT DATE
  const formattedDate = new Date(
    order.created_at
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // STATUS COLOR
  const statusColor =
    order.order_status ===
      'Delivered'
      ? 'bg-green-100 text-green-700'
      : order.order_status ===
        'Pending'
        ? 'bg-yellow-100 text-yellow-700'
        : order.order_status ===
          'Cancelled'
          ? 'bg-red-100 text-red-700'
          : 'bg-blue-100 text-blue-700';

  return (
    <>
      <div className="space-y-8">
        {/* BACK BUTTON */}
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        {/* ORDER HEADER */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-6 md:flex-row">
            {/* LEFT */}
            <div>
              <p className="text-sm font-medium text-slate-500">
                Order Number
              </p>

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
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${statusColor}`}
                >
                  {order.order_status}
                </span>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* TOTAL */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Total Amount
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                ₹
                {Number(
                  order.total_amount
                ).toFixed(2)}
              </p>
            </div>

            {/* ITEMS */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Total Items
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {items.length}
              </p>
            </div>

            {/* PAYMENT */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Payment ID
              </p>

              <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                {order.payment_id}
              </p>
            </div>
          </div>
        </div>

        {/* CUSTOMER INFO */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Customer Information
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">
                Full Name
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {order.shipping_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Phone Number
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {order.shipping_phone}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-slate-500">
                Shipping Address
              </p>

              <p className="mt-2 text-slate-900">
                {order.shipping_address},{' '}
                {order.shipping_city},{' '}
                {order.shipping_state} -{' '}
                {order.shipping_pincode}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Tracking ID
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {order.tracking_id ||
                  'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* ORDER ITEMS */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-8 py-6">
            <h2 className="text-xl font-bold text-slate-900">
              Order Items
            </h2>
          </div>

          <div className="space-y-5 p-8">
            {items.map((item) => {
              // Parse all images from JSON string or use image_urls
              let allImages: string[] = [];
              let mainImage = '/placeholder.svg';

              try {
                // Try to parse the images JSON string
                if (item.images && typeof item.images === 'string') {
                  const parsedImages = JSON.parse(item.images);
                  if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                    allImages = parsedImages.map((filename: string) =>
                      `http://nextlayer.soon.it/images/${filename}`
                    );
                    mainImage = allImages[0];
                  }
                }
                // Fall back to image_urls if available and valid
                else if (item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
                  const validUrls = item.image_urls.filter((url: string) =>
                    url && url.startsWith('http') && !url.includes('[') && !url.includes('"')
                  );
                  if (validUrls.length > 0) {
                    allImages = validUrls;
                    mainImage = allImages[0];
                  }
                }
              } catch (err) {
                console.error('Error parsing images:', err);
              }

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-5 rounded-xl border border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-5">
                    {/* IMAGE */}
                    <div className="flex flex-col gap-3">
                      {/* Main Image */}
                      <button
                        onClick={() => openLightbox(allImages)}
                        className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-white hover:opacity-75 transition-opacity cursor-pointer group"
                      >
                        <Image
                          src={mainImage}
                          alt="Product"
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        {allImages.length > 1 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors rounded-xl">
                            <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>

                      {/* Thumbnail Gallery */}
                      {allImages.length > 1 && (
                        <div className="flex gap-2">
                          {allImages.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setLightboxIndex(idx);
                                setLightboxImages(allImages);
                                setShowLightbox(true);
                              }}
                              className={`relative h-12 w-12 overflow-hidden rounded border-2 transition-all ${idx === 0
                                  ? 'border-blue-500'
                                  : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                              <Image
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* INFO */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {item.product_name ||
                          `Product #${item.product_id}`}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Product ID:{' '}
                        {item.product_id}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Quantity:{' '}
                        {item.quantity}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-left md:text-right">
                    <p className="text-sm text-slate-500">
                      Unit Price
                    </p>

                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      ₹
                      {Number(
                        item.price
                      ).toFixed(2)}
                    </p>

                    <p className="mt-3 text-2xl font-bold text-blue-600">
                      ₹
                      {(
                        Number(item.price) *
                        Number(
                          item.quantity
                        )
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TOTAL */}
          <div className="flex justify-end border-t border-slate-200 p-8">
            <div className="w-full max-w-sm space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-semibold text-slate-900">
                  ₹
                  {Number(
                    order.total_amount
                  ).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Shipping
                </span>

                <span className="font-semibold text-slate-900">
                  Free
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Tax
                </span>

                <span className="font-semibold text-slate-900">
                  ₹0.00
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-4">
                <span className="text-xl font-bold text-slate-900">
                  Total
                </span>

                <span className="text-2xl font-bold text-blue-600">
                  ₹
                  {Number(
                    order.total_amount
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Lightbox Modal */}
      </div>
      {showLightbox && lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-4xl flex flex-col items-center">
            {/* Close Button */}
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute -top-12 right-0 text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Image Container */}
            <div className="relative w-full bg-black rounded-lg overflow-hidden">
              <img
                src={lightboxImages[lightboxIndex]}
                alt={`Product image ${lightboxIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/800x600?text=Image+Not+Found';
                }}
              />
            </div>

            {/* Navigation Controls */}
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
    </>
  );
}
