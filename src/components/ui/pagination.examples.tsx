/**
 * PAGINATION COMPONENT USAGE GUIDE
 * 
 * Modern, compact pagination for data-heavy dashboards
 * Fully responsive (mobile, tablet, desktop)
 * SaaS-style design with smooth interactions
 */

import { useState } from 'react'
import { Pagination } from '@/components/ui/pagination'

/**
 * BASIC USAGE
 */
export function BasicPaginationExample() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 173

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  )
}

/**
 * WITH DATA CONTEXT
 * Show total records and page size
 */
export function DataPaginationExample() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalRecords = 1728
  const pageSize = 10
  const totalPages = Math.ceil(totalRecords / pageSize)

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      totalRecords={totalRecords}
      pageSize={pageSize}
    />
  )
}

/**
 * IN A DATA TABLE CONTEXT
 * Real-world example with table and pagination
 */
export function TableWithPaginationExample() {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Mock data
  const allRecords = Array.from({ length: 1728 }, (_, i) => ({
    id: i + 1,
    name: `Record ${i + 1}`,
    status: Math.random() > 0.5 ? 'Active' : 'Inactive',
  }))

  const totalPages = Math.ceil(allRecords.length / pageSize)
  const startIdx = (currentPage - 1) * pageSize
  const paginatedRecords = allRecords.slice(startIdx, startIdx + pageSize)

  return (
    <div className="space-y-4">
      {/* Table */}
      <table className="w-full border-collapse border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left">ID</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRecords.map((record) => (
            <tr key={record.id}>
              <td className="border border-gray-200 px-4 py-2">{record.id}</td>
              <td className="border border-gray-200 px-4 py-2">{record.name}</td>
              <td className="border border-gray-200 px-4 py-2">{record.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalRecords={allRecords.length}
        pageSize={pageSize}
        className="border-t border-gray-200"
      />
    </div>
  )
}

/**
 * COMPONENT API
 * 
 * Props:
 * ------
 * currentPage (number, required)
 *   - The active page number (1-indexed)
 *   - Example: 5
 * 
 * totalPages (number, required)
 *   - Total number of pages
 *   - Example: 173
 * 
 * onPageChange (function, required)
 *   - Callback when user navigates to a different page
 *   - Signature: (page: number) => void
 *   - Example: (page) => setCurrentPage(page)
 * 
 * totalRecords (number, optional)
 *   - Total number of records in the dataset
 *   - Used to show "Showing X-Y of Z records"
 *   - Example: 1728
 * 
 * pageSize (number, optional)
 *   - Records per page, default: 10
 *   - Example: 25
 * 
 * className (string, optional)
 *   - Additional CSS classes
 *   - Example: "border-t border-gray-200"
 * 
 * FEATURES
 * --------
 * ✓ Smart page numbers (shows 1, current±2, last, with ellipsis)
 * ✓ Prev/Next buttons (disabled appropriately)
 * ✓ Go-to-page input field
 * ✓ Keyboard support (Enter to navigate)
 * ✓ Accessibility (ARIA labels, semantic HTML)
 * ✓ Responsive design:
 *   - Mobile (< 640px): Prev/Next + current page only
 *   - Tablet (640px-1024px): Compact layout
 *   - Desktop (> 1024px): Full featured
 * ✓ Record count display
 * ✓ Smooth hover effects
 * ✓ Memoized for performance
 * 
 * STYLING
 * -------
 * The component uses Tailwind CSS and existing UI components:
 * - Uses Button component (outline variant for pagination buttons)
 * - Uses Input component for go-to-page field
 * - Inherits colors from theme: primary, muted, accent
 * - Custom classes can be passed via className prop
 * 
 * EXAMPLES
 * --------
 */

/**
 * ADVANCED: Custom styling
 */
export function CustomStyledPaginationExample() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 173

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-2">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="!py-2 !px-2"
      />
    </div>
  )
}

/**
 * ADVANCED: With search filters
 * Pagination integrated with other filters
 */
export function PaginationWithFiltersExample() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('all')

  // Mock filtered data
  const allRecords = Array.from({ length: 1728 }, (_, i) => ({
    id: i + 1,
    name: `Record ${i + 1}`,
    status: Math.random() > 0.5 ? 'Active' : 'Inactive',
  }))

  // Apply filters
  const filteredRecords = allRecords.filter((record) => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = status === 'all' || record.status === status
    return matchesSearch && matchesStatus
  })

  const pageSize = 10
  const totalPages = Math.ceil(filteredRecords.length / pageSize)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, status])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalRecords={filteredRecords.length}
        pageSize={pageSize}
      />
    </div>
  )
}

/**
 * RESPONSIVE BEHAVIOR
 * 
 * Mobile (< 640px):
 * ┌──────────────────────┐
 * │ ◀    5 / 173    ▶   │
 * └──────────────────────┘
 * 
 * Tablet (640px - 1024px):
 * ┌───────────────────────────────────┐
 * │ 10–20 of 1728  ◀ 5/173 ▶  Go: __ │
 * └───────────────────────────────────┘
 * 
 * Desktop (> 1024px):
 * ┌──────────────────────────────────────────────────────────┐
 * │ Showing 10–20 of 1728      [Prev] 1 ... 5 6 [7] 8 ... 173 [Next]   Go to page: __ │
 * └──────────────────────────────────────────────────────────┘
 */
