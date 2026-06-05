'use client';

import { DollarSign, Package, ShoppingCart, Users, TrendingUp, Eye, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/admin/stat-card';
import { DataTable } from '@/components/admin/data-table';
import { StatusBadge } from '@/components/admin/status-badge';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Order {
  id: string;
  user_id: string;
  payment_id: string;
  total_amount: string;
  order_status: string;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface DashboardData {
  total_users: number;
  total_products: number;
  total_categories: number;
  total_orders: number;
  total_revenue: number;
  latest_orders: Order[];
  latest_users: User[];
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const result = await response.json();

        if (result.status && result.dashboard) {
          setDashboardData(result.dashboard);
          setError(null);
        } else {
          setError('Failed to fetch dashboard data');
        }
      } catch (err) {
        setError('Error fetching dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">{error || 'Failed to load dashboard'}</p>
        </div>
      </div>
    );
  }

  const totalRevenue = dashboardData.total_revenue;
  const totalOrders = dashboardData.total_orders;
  const totalProducts = dashboardData.total_products;
  const totalUsers = dashboardData.total_users;
  const revenueGrowth = 12.5;

  const recentOrders = dashboardData.latest_orders.map((order) => ({
    id: order.id,
    customerName: `Order ${order.id}`,
    date: order.created_at,
    total: parseFloat(order.total_amount),
    status: order.order_status.toLowerCase(),
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white shadow-md">
        <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-blue-100">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={revenueGrowth}
          trendLabel="12.5% from last month"
          color="blue"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          completed={totalOrders}
          icon={ShoppingCart}
          color="green"
        />
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          color="orange"
        />
        
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-lg border border-slate-100 bg-slate-50 shadow-sm hover:shadow-md transition-shadow">
        <div className="border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
            <p className="text-sm text-slate-500 mt-1">Latest transactions from your customers</p>
          </div>
        </div>
        <div className="p-6">
          <DataTable
            columns={[
              {
                key: 'id',
                label: 'Order ID',
                render: (value) => (
                  <span className="font-mono text-sm font-medium">{value}</span>
                ),
              },
              {
                key: 'customerName',
                label: 'Customer',
              },
              {
                key: 'date',
                label: 'Date',
                render: (value) => {
                  const date = new Date(value as string);
                  return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                },
              },
              {
                key: 'total',
                label: 'Total',
                render: (value) => (
                  <span className="font-semibold text-slate-900">${(value as number).toFixed(2)}</span>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (value) => {
                  // Map order status to badge format
                  const statusMap: Record<string, 'completed' | 'pending' | 'cancelled'> = {
                    'pending': 'pending',
                    'completed': 'completed',
                    'cancelled': 'cancelled',
                  };
                  return (
                    <StatusBadge status={statusMap[value as string] || 'pending'} />
                  );
                },
              },
            ]}
            data={recentOrders}
            renderActions={(item) => (
              <Link
                href={`/admin/orders/${item.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors"
              >
                View
              </Link>
            )}
          />
        </div>
        <div className="border-t border-slate-200 px-6 py-4 flex justify-end">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-sm transition-colors"
          >
            <Eye className="h-4 w-4" />
            View All Orders
          </Link>
        </div>
      </div>

      {/* Recent Users */}
      <div className="rounded-lg border border-slate-100 bg-slate-50 shadow-sm hover:shadow-md transition-shadow">
        <div className="border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Recent Users</h3>
            <p className="text-sm text-slate-500 mt-1">Latest registered users</p>
          </div>
        </div>

        <div className="p-6">
          <DataTable
            columns={[
              {
                key: 'name',
                label: 'Name',
              },
              {
                key: 'email',
                label: 'Email',
              },
              {
                key: 'created_at',
                label: 'Joined',
                render: (value) => {
                  const date = new Date(value as string);
                  return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                },
              },
            ]}
            data={dashboardData.latest_users}
            renderActions={(item) => (
              <Link
                href={`/admin/users?view=${item.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors"
              >
                View
              </Link>
            )}
          />
        </div>
        <div className="border-t border-slate-200 px-6 py-4 flex justify-end">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-sm transition-colors"
          >
            <Eye className="h-4 w-4" />
            View All Users
          </Link>
        </div>
      </div>
    </div>
  );
}
