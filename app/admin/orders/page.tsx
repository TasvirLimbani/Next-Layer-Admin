'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import {
  ArrowUpRight,
  Filter,
  AlertCircle,
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

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // FETCH ORDERS
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // CHANGE USER ID
      const response = await fetch(
        '/api/orders?user_id=5'
      );

      const data = await response.json();

      console.log('ORDERS API:', data);

      if (data.status) {
        const rawOrders = Array.isArray(
          data.orders
        )
          ? data.orders
          : [];

        const mappedOrders =
          rawOrders.map((order: any) => ({
            id: String(
              order.id ||
                order.order_id ||
                ''
            ),

            customerName:
              order.shipping_name ||
              order.name ||
              'Unknown User',

            customerEmail:
              order.email ||
              order.customer_email ||
              'No Email',

            date:
              order.created_at ||
              order.date ||
              new Date().toISOString(),

            total:
              parseFloat(
                order.total ||
                  order.total_amount ||
                  0
              ) || 0,

            status:
              order.status ||
              'pending',
          }));

        setOrders(mappedOrders);

        setError(null);
      } else {
        setError(
          data.message ||
            'Failed to fetch orders'
        );
      }
    } catch (err) {
      console.error(err);

      setError('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  // STATS
  const completedCount =
    orders.filter(
      (o) => o.status === 'completed'
    ).length;

  const totalOrdersValue =
    orders.reduce(
      (sum, o) =>
        sum + Number(o.total || 0),
      0
    );

  const avgOrderValue =
    orders.length > 0
      ? totalOrdersValue / orders.length
      : 0;

  // LOADING
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>

          <p className="text-slate-600">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ERROR */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600" />

          <p className="text-red-600">
            {error}
          </p>

          <button
            onClick={() =>
              setError(null)
            }
            className="ml-auto font-medium text-red-600 hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Orders
        </h1>

        <p className="mt-2 text-slate-600">
          Manage and track all customer
          orders
        </p>
      </div>

      {/* SUMMARY CARDS */}
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
            {orders.length > 0
              ? (
                  (completedCount /
                    orders.length) *
                  100
                ).toFixed(0)
              : 0}
            % success rate
          </p>
        </div>

        {/* AVG ORDER VALUE */}
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Avg Order Value
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            $
            {avgOrderValue.toLocaleString(
              'en-US',
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

      {/* ORDERS TABLE */}
      <div className="rounded-lg border border-slate-100 bg-slate-50 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            All Orders
          </h2>

          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
            <Filter className="h-4 w-4" />

            Filter
          </button>
        </div>

        <div className="p-6">
          <DataTable
            columns={[
              {
                key: 'id',

                label: 'Order ID',

                render: (value) => (
                  <span className="font-mono text-sm font-medium text-slate-700">
                    #{value}
                  </span>
                ),
              },

              {
                key: 'customerName',

                label: 'Customer Name',
              },

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

              {
                key: 'date',

                label: 'Date',

                render: (value) => {
                  const date =
                    new Date(
                      value as string
                    );

                  return date.toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }
                  );
                },
              },

              {
                key: 'total',

                label: 'Total',

                render: (value) => (
                  <span className="font-semibold text-slate-900">
                    $
                    {Number(
                      value || 0
                    ).toLocaleString(
                      'en-US',
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>
                ),
              },

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
            renderActions={(order) => (
              <Link
                href={`/admin/orders/${order.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
              >
                View
              </Link>
            )}
          />
        </div>
      </div>
    </div>
  );
}