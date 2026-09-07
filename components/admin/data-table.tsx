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
    <div className="rounded-lg">
      <div className="hidden overflow-x-auto rounded-lg md:block">
        <table className="w-full">
          <thead>
            <tr className="min-w-max border-b border-slate-200 bg-linear-to-r from-slate-50 to-slate-100">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 sm:px-6 sm:py-4 ${column.className || ''}`}
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
                  className="px-3 py-10 text-center text-sm text-slate-500 sm:px-6 sm:py-12"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-3 text-slate-300">📭</div>
                    <p className="font-medium">No data available</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="min-w-max border-b border-slate-100 transition-colors duration-150 hover:bg-blue-50">
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`px-3 py-3 text-sm text-slate-700 sm:px-6 sm:py-4 ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : item[column.key]}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="px-3 py-3 text-sm sm:px-6 sm:py-4">
                      {renderActions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {data.length === 0 ? (
          <div className="rounded-lg border border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
            <div className="mb-3 text-slate-300">📭</div>
            <p className="font-medium">No data available</p>
          </div>
        ) : (
          data.map((item, index) => (
            <article
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="space-y-3">
                {columns.map((column) => (
                  <div
                    key={String(column.key)}
                    className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {column.label}
                    </span>
                    <span className="min-w-0 text-right text-sm text-slate-800">
                      {column.render
                        ? column.render(item[column.key], item)
                        : item[column.key]}
                    </span>
                  </div>
                ))}
                {renderActions && (
                  <div className="flex items-center justify-end border-t border-slate-100 pt-3">
                    {renderActions(item)}
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
