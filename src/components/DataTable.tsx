import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/utils/cn"

export interface Column<T> {
  header: ReactNode
  accessor: keyof T | ((row: T) => ReactNode)
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyState?: ReactNode
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
}

export default function DataTable<T extends { id: string | number }>({
  columns,
  data,
  loading,
  emptyState,
  pagination,
}: DataTableProps<T>) {
  return (
    <div className="w-full border border-border bg-card rounded-xl shadow-premium overflow-hidden flex flex-col text-left">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr className="border-b border-border/80 bg-muted/30 select-none">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "h-11 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground align-middle",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              // Loading Shimmer rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="h-14">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-3">
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr className="h-48">
                <td colSpan={columns.length} className="px-4 py-8">
                  {emptyState || (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                      <p className="text-sm font-medium">No results found</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="h-14 hover:bg-muted/30 transition-colors duration-150 ease-in-out align-middle"
                >
                  {columns.map((column, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn(
                        "px-4 py-3 text-sm text-foreground",
                        column.className
                      )}
                    >
                      {typeof column.accessor === "function"
                        ? column.accessor(row)
                        : (row[column.accessor] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="h-12 border-t border-border flex items-center justify-between px-6 bg-muted/10 select-none">
          <span className="text-xs text-muted-foreground">
            Page <strong className="font-semibold text-foreground">{pagination.currentPage}</strong> of{" "}
            <strong className="font-semibold text-foreground">{pagination.totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="flex items-center justify-center p-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="flex items-center justify-center p-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
