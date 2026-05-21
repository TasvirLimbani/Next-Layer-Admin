'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/data-table';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  // FETCH USERS
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        '/api/users',
        {
          cache: 'no-store',
        }
      );

      const data =
        await response.json();

      console.log(
        'USERS API:',
        data
      );

      if (data.status) {
        const usersData =
          Array.isArray(data.users)
            ? data.users
            : Array.isArray(data.data)
              ? data.data
              : [];

        setUsers(usersData);

        setError('');
      } else {
        setError(
          data.message ||
            'Failed to fetch users'
        );
      }
    } catch (error) {
      console.log(error);

      setError(
        'Error fetching users'
      );
    } finally {
      setLoading(false);
    }
  };

  // TOTAL USERS
  const activeUsers = users.length;

  // NEW USERS THIS MONTH
  const newUsersThisMonth =
    users.filter((u) => {
      if (!u.created_at)
        return false;

      const date = new Date(
        u.created_at
      );

      const now = new Date();

      return (
        now.getTime() -
          date.getTime() <
        30 *
          24 *
          60 *
          60 *
          1000
      );
    }).length;

  // LOADING
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>

          <p className="text-slate-600">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Users
        </h1>

        <p className="mt-2 text-slate-600">
          Manage and view all
          registered users
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* TOTAL */}
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Total Users
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {activeUsers}
          </p>

          <p className="mt-4 text-xs text-slate-500">
            Registered members
          </p>
        </div>

        {/* NEW */}
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            New This Month
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {newUsersThisMonth}
          </p>

          <p className="mt-4 text-xs text-slate-500">
            Recent signups
          </p>
        </div>

        {/* GROWTH */}
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Growth Rate
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            ↑ 8.3%
          </p>

          <p className="mt-4 text-xs text-slate-500">
            vs last month
          </p>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="rounded-lg border border-slate-100 bg-slate-50 shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            All Users
          </h2>
        </div>

        <div className="p-6">
          <DataTable
            columns={[
              {
                key: 'id',
                label: 'User ID',

                render: (value) => (
                  <span className="font-mono text-sm font-medium text-slate-600">
                    #{value}
                  </span>
                ),
              },

              {
                key: 'name',
                label: 'Full Name',

                render: (value) => (
                  <span className="font-medium text-slate-900">
                    {value ||
                      'No Name'}
                  </span>
                ),
              },

              {
                key: 'email',
                label:
                  'Email Address',

                render: (value) => (
                  <a
                    href={`mailto:${value}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {value ||
                      'No Email'}
                  </a>
                ),
              },

              {
                key: 'phone',
                label: 'Phone',

                render: (value) => (
                  <span className="text-slate-700">
                    {value ||
                      'N/A'}
                  </span>
                ),
              },

              {
                key: 'created_at',
                label:
                  'Member Since',

                render: (value) => {
                  if (!value)
                    return 'N/A';

                  const date =
                    new Date(
                      value as string
                    );

                  return date.toLocaleDateString(
                    'en-US',
                    {
                      year:
                        'numeric',
                      month: 'short',
                      day: 'numeric',
                    }
                  );
                },
              },
            ]}
            data={users}
            renderActions={(
              user
            ) => (
              <button className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200">
                View Profile
              </button>
            )}
          />
        </div>
      </div>
    </div>
  );
}