'use client';

import { ReactNode } from 'react';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  renderActions?: (item: T) => ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  renderActions,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-linear-to-r from-slate-50 to-slate-100">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.label}
              </th>
            ))}
            {renderActions && (
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (renderActions ? 1 : 0)}
                className="px-6 py-12 text-center text-sm text-slate-500"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="mb-3 text-slate-300">📭</div>
                  <p className="font-medium">No data available</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index} className="hover:bg-blue-50 transition-colors duration-150 border-b border-slate-100">
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`px-6 py-4 text-sm text-slate-700 ${column.className || ''}`}
                  >
                    {column.render
                      ? column.render(item[column.key], item)
                      : item[column.key]}
                  </td>
                ))}
                {renderActions && (
                  <td className="px-6 py-4 text-sm">
                    {renderActions(item)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
