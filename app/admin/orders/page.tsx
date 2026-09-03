'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Filter,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import { DataTable } from '@/components/admin/data-table';
import { StatusBadge } from '@/components/admin/status-badge';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  total: number;
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'cancelled';
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orders', {
        method: 'GET',
        cache: 'no-store',
      });

      const data = await response.json();

      console.log('ORDERS API:', data);

      if (!response.ok) {
        throw new Error(
          data?.message || 'Failed to fetch orders'
        );
      }

      if (!data?.status) {
        throw new Error(
          data?.message || 'Failed to fetch orders'
        );
      }

      const rawOrders = Array.isArray(data.orders)
        ? data.orders
        : [];

      const mappedOrders: Order[] = rawOrders
        .map((order: any) => {
          const rawStatus = String(
            order.status ??
              order.order_status ??
              'pending'
          )
            .trim()
            .toLowerCase();

          let status: Order['status'] = 'pending';

          switch (rawStatus) {
            case 'completed':
            case 'complete':
            case 'delivered':
              status = 'completed';
              break;

            case 'processing':
            case 'processed':
            case 'shipped':
              status = 'processing';
              break;

            case 'cancelled':
            case 'canceled':
              status = 'cancelled';
              break;

            case 'pending':
            default:
              status = 'pending';
              break;
          }

          return {
            id: String(
              order.id ??
                order.order_id ??
                ''
            ),

            customerName:
              order.shipping_name ??
              order.name ??
              order.customer_name ??
              'Unknown User',

            customerEmail:
              order.email ??
              order.customer_email ??
              'No Email',

            date:
              order.created_at ??
              order.date ??
              new Date().toISOString(),

            total:
              Number(
                order.total ??
                  order.total_amount ??
                  order.grand_total ??
                  0
              ) || 0,

            status,
          };
        })
        .filter((order: Order) => order.id !== '');

      setOrders(mappedOrders);
    } catch (err) {
      console.error('FETCH ORDERS ERROR:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Error fetching orders'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STATS
  // =========================

  const completedCount = orders.filter(
    (order) => order.status === 'completed'
  ).length;

  const totalOrdersValue = orders.reduce(
    (sum, order) =>
      sum + Number(order.total || 0),
    0
  );

  const avgOrderValue =
    orders.length > 0
      ? totalOrdersValue / orders.length
      : 0;

  const successRate =
    orders.length > 0
      ? (completedCount / orders.length) * 100
      : 0;

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />

          <p className="text-slate-600">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />

          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={fetchOrders}
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {/* =========================
          HEADER
      ========================= */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Orders
        </h1>

        <p className="mt-2 text-slate-600">
          Manage and track all customer orders
        </p>
      </div>

      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        {/* TOTAL ORDERS */}

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Total Orders
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {orders.length}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-green-600" />

            <span className="text-xs font-medium text-green-600">
              Live Orders
            </span>
          </div>
        </div>

        {/* COMPLETED */}

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Completed Orders
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {completedCount}
          </p>

          <p className="mt-4 text-xs text-slate-500">
            {successRate.toFixed(0)}% success rate
          </p>
        </div>

        {/* AVG ORDER VALUE */}

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Avg Order Value
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            ₹
            {avgOrderValue.toLocaleString(
              'en-IN',
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </p>

          <p className="mt-4 text-xs text-slate-500">
            Per transaction
          </p>
        </div>

      </div>

      {/* =========================
          ORDERS TABLE
      ========================= */}

      <div className="rounded-lg border border-slate-100 bg-slate-50 shadow-sm">

        {/* TABLE HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">

          <h2 className="text-lg font-semibold text-slate-900">
            All Orders
          </h2>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            <Filter className="h-4 w-4" />

            Filter
          </button>

        </div>

        {/* TABLE */}

        <div className="p-6">

          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-semibold text-slate-900">
                No orders found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                There are currently no customer orders.
              </p>
            </div>
          ) : (
            <DataTable
              columns={[
                // =========================
                // ORDER ID
                // =========================

                {
                  key: 'id',
                  label: 'Order ID',

                  render: (value) => (
                    <span className="font-mono text-sm font-medium text-slate-700">
                      #{value}
                    </span>
                  ),
                },

                // =========================
                // CUSTOMER
                // =========================

                {
                  key: 'customerName',
                  label: 'Customer Name',

                  render: (value) => (
                    <span className="font-medium text-slate-900">
                      {value}
                    </span>
                  ),
                },

                // =========================
                // EMAIL
                // =========================

                {
                  key: 'customerEmail',
                  label: 'Email',

                  render: (value) => (
                    <a
                      href={`mailto:${value}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {value}
                    </a>
                  ),
                },

                // =========================
                // DATE
                // =========================

                {
                  key: 'date',
                  label: 'Date',

                  render: (value) => {
                    const date = new Date(
                      value as string
                    );

                    if (
                      Number.isNaN(
                        date.getTime()
                      )
                    ) {
                      return '-';
                    }

                    return date.toLocaleDateString(
                      'en-IN',
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }
                    );
                  },
                },

                // =========================
                // TOTAL
                // =========================

                {
                  key: 'total',
                  label: 'Total',

                  render: (value) => (
                    <span className="font-semibold text-slate-900">
                      ₹
                      {Number(
                        value || 0
                      ).toLocaleString(
                        'en-IN',
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                  ),
                },

                // =========================
                // STATUS
                // =========================

                {
                  key: 'status',
                  label: 'Status',

                  render: (value) => (
                    <StatusBadge
                      status={value as any}
                    />
                  ),
                },
              ]}

              data={orders}

              // =========================
              // ACTION
              // =========================

              renderActions={(order) => (
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
                >
                  View
                </Link>
              )}
            />
          )}

        </div>
      </div>
    </div>
  );
}