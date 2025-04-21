"use client";

import { useState } from "react";

interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: keyof T;
  cell?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pageSize?: number;
}

export function DataTable<T>({ columns, data, pageSize = 10 }: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  // Pagination logic
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Sorting logic
  const sortedData = [...data];
  if (sortConfig) {
    sortedData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Filtering logic
  const filteredData = sortedData.filter(row => {
    return Object.entries(filterValues).every(([key, value]) => {
      if (!value) return true;
      const rowValue = row[key as keyof T];
      return String(rowValue).toLowerCase().includes(value.toLowerCase());
    });
  });

  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  return (
    <div className="w-full">
      {/* Filter inputs */}
      <div className="flex gap-2 mb-4">
        {columns.map(column => (
          <input
            key={`filter-${column.id}`}
            type="text"
            placeholder={`Filter ${column.header}`}
            className="px-3 py-1 border rounded text-sm"
            value={filterValues[column.id] || ''}
            onChange={(e) => handleFilterChange(column.id, e.target.value)}
          />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column.accessor)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {sortConfig?.key === column.accessor && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map(column => (
                    <td key={`${rowIndex}-${column.id}`} className="px-6 py-4 text-black whitespace-nowrap">
                      {column.cell 
                        ? column.cell(row[column.accessor], row)
                        : String(row[column.accessor])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-gray-500 py-4">
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div>
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredData.length)} de {filteredData.length} registros
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className="px-3 py-1">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}