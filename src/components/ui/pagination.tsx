'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Input } from './input'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalRecords?: number
  pageSize?: number
  className?: string
}

/**
 * Generates smart pagination numbers
 * Shows: first page, last page, current page ±1, with ellipsis for gaps
 * Maximum 7 page numbers shown (1, ±1 around current, last + ellipsis)
 */
const getPageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
  const pages: (number | string)[] = []
  const maxVisible = 7 // Maximum page numbers to show
  
  // If total pages fit in maxVisible, show all
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  
  // Always show first page
  pages.push(1)
  
  // Calculate range around current page (±1)
  const delta = 1 // pages to show before/after current
  let rangeStart = Math.max(2, currentPage - delta)
  let rangeEnd = Math.min(totalPages - 1, currentPage + delta)
  
  // Add left ellipsis if needed
  if (rangeStart > 2) {
    pages.push('...')
  }
  
  // Add range around current page
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i)
  }
  
  // Add right ellipsis if needed
  if (rangeEnd < totalPages - 1) {
    pages.push('...')
  }
  
  // Always show last page
  pages.push(totalPages)
  
  return pages
}

/**
 * Modern, compact pagination component
 * Single-line layout with smart page numbers, responsive design
 */
const Pagination = React.memo(
  React.forwardRef<
    HTMLDivElement,
    PaginationProps
  >(
    (
      {
        currentPage,
        totalPages,
        onPageChange,
        totalRecords,
        pageSize = 10,
        className,
      },
      ref
    ) => {
      const [goToPage, setGoToPage] = React.useState<string>('')
      const [isMobile, setIsMobile] = React.useState(false)
      const [isTablet, setIsTablet] = React.useState(false)

      // Handle responsive breakpoints
      React.useEffect(() => {
        const handleResize = () => {
          setIsMobile(window.innerWidth < 640)
          setIsTablet(window.innerWidth < 1024)
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
      }, [])

      const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
          onPageChange(page)
          setGoToPage('')
        }
      }

      const handleGoToPage = (e: React.FormEvent) => {
        e.preventDefault()
        const page = parseInt(goToPage, 10)
        if (!isNaN(page)) {
          handlePageChange(page)
        }
      }

      const pageNumbers = getPageNumbers(currentPage, totalPages)
      const isPrevDisabled = currentPage === 1
      const isNextDisabled = currentPage === totalPages
      const startRecord = (currentPage - 1) * pageSize + 1
      const endRecord = Math.min(currentPage * pageSize, totalRecords || 0)

      // Mobile: only show prev/next + current page
      if (isMobile) {
        return (
          <div
            ref={ref}
            className={cn(
              'flex items-center justify-between gap-2 px-2 py-3',
              className
            )}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={isPrevDisabled}
              aria-label="Previous page"
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={isNextDisabled}
              aria-label="Next page"
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )
      }

      // Tablet: prev/next + current page + go to
      if (isTablet) {
        return (
          <div
            ref={ref}
            className={cn(
              'flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-sm',
              className
            )}
          >
            <div className="text-xs text-muted-foreground">
              {totalRecords && (
                <>
                  {startRecord}–{endRecord} of {totalRecords}
                </>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={isPrevDisabled}
                aria-label="Previous page"
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="px-2 py-1 text-xs font-medium">
                {currentPage} / {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={isNextDisabled}
                aria-label="Next page"
                className="h-8 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleGoToPage} className="flex items-center gap-1">
              <label htmlFor="go-to-page" className="text-xs text-muted-foreground">
                Go:
              </label>
              <Input
                id="go-to-page"
                type="number"
                min="1"
                max={totalPages}
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value)}
                placeholder={currentPage.toString()}
                className="h-8 w-12 text-xs"
              />
            </form>
          </div>
        )
      }

      // Desktop: full featured pagination
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center justify-between gap-4 px-4 py-3',
            className
          )}
        >
          {/* Info section */}
          <div className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            {totalRecords ? (
              <span>
                <span className="text-foreground font-semibold">{startRecord}–{endRecord}</span> of{' '}
                <span className="text-foreground font-semibold">{totalRecords}</span>
              </span>
            ) : (
              <span>
                Page <span className="text-foreground font-semibold">{currentPage}/{totalPages}</span>
              </span>
            )}
          </div>

          {/* Controls section */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {/* Pagination buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={isPrevDisabled}
              aria-label="Previous page"
              className="h-8 px-2.5 rounded-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-0.5">
              {pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-1.5 text-muted-foreground text-xs font-medium"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  )
                }

                const pageNum = page as number
                const isActive = pageNum === currentPage

                return (
                  <Button
                    key={pageNum}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'h-8 w-8 p-0 text-xs font-semibold rounded-md transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent'
                    )}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={isNextDisabled}
              aria-label="Next page"
              className="h-8 px-2.5 rounded-md"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Go to page input */}
          <form onSubmit={handleGoToPage} className="flex items-center gap-1.5">
            <Input
              id="go-to-page"
              type="number"
              min="1"
              max={totalPages}
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              placeholder={currentPage.toString()}
              aria-label="Go to specific page"
              className="h-8 w-14 text-center text-xs rounded-md"
            />
          </form>
        </div>
      )
    }
  )
)

Pagination.displayName = 'Pagination'

export { Pagination }
export type { PaginationProps }
