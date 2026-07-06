import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from './Button'

interface ServerPagination {
  /** 0-indexed current page, owned by the caller (e.g. mirrors an API's `page` query param). */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

interface Props<T> {
  /**
   * The items to render. In client-paged mode (no `pagination` prop) this
   * is the *entire* filtered list and ListView slices it itself. In
   * server-paged mode (`pagination` provided) this is just the current
   * page's items — the caller already fetched only that page from the API.
   */
  items: T[]
  getKey: (item: T) => string
  renderItem: (item: T) => ReactNode
  /** Singular unit name for the count line, e.g. "patient". */
  itemLabel: string
  /** Defaults to `${itemLabel}s`. */
  itemLabelPlural?: string
  /** Shown centered in place of the list when there are no items — the
   *  caller decides the wording (e.g. "no patients yet" vs "no patients
   *  match your search") since that distinction depends on context this
   *  component doesn't have. */
  emptyMessage: string
  /** Total count across all pages, for the "N things" line. Defaults to
   *  `items.length`, which is only correct in client-paged mode — server-
   *  paged callers must pass the API's real total (`items.length` there is
   *  just the current page's size). */
  totalCount?: number
  /** Client-side page size. Ignored when `pagination` is provided — a
   *  server-paged caller controls page size on its own request. Defaults to 50. */
  pageSize?: number
  /**
   * Hand paging control to the caller — pass this once patients (or
   * whatever `items` are) come from a real paginated API instead of one
   * fully-loaded in-memory array. ListView then just renders `items`
   * as-is and drives Previous/Next off `page`/`totalPages`/`onPageChange`
   * rather than slicing anything itself. Omit for the current
   * local-storage behavior (an in-memory array ListView pages through
   * client-side).
   */
  pagination?: ServerPagination
}

/**
 * Generic paginated list container: a "N things" count at the top, the
 * items themselves (however the caller wants them rendered — a Card, a
 * table row, anything), and Previous/Next paging at the bottom once there
 * are more items than fit on one page.
 *
 * Supports two modes so swapping the local-storage hooks for a real API
 * later doesn't require touching this component:
 *  - Client-paged (default): give it the whole filtered array; it slices
 *    and owns its own page state, resetting to page 1 whenever `items`
 *    changes (e.g. a search/filter narrows the result set) so a stale page
 *    number can't end up pointing past the end.
 *  - Server-paged (pass `pagination`): give it just the current page's
 *    items plus `totalCount`; the caller owns the page number and re-fetches
 *    on `onPageChange` (e.g. `GET /patients?page=&limit=`).
 */
export function ListView<T>({
  items,
  getKey,
  renderItem,
  itemLabel,
  itemLabelPlural,
  emptyMessage,
  totalCount,
  pageSize = 50,
  pagination,
}: Props<T>) {
  const [internalPage, setInternalPage] = useState(0)

  // Only relevant in client-paged mode — server-paged callers own `page`.
  useEffect(() => {
    if (!pagination) setInternalPage(0)
  }, [items, pagination])

  const plural = itemLabelPlural ?? `${itemLabel}s`
  const count = totalCount ?? items.length

  let pageItems: T[]
  let currentPage: number
  let totalPages: number
  let goToPage: (page: number) => void

  if (pagination) {
    pageItems = items
    currentPage = pagination.page
    totalPages = pagination.totalPages
    goToPage = pagination.onPageChange
  } else {
    totalPages = Math.max(1, Math.ceil(items.length / pageSize))
    currentPage = Math.min(internalPage, totalPages - 1)
    pageItems = items.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    goToPage = setInternalPage
  }

  return (
    <div className="flex flex-col gap-3">
      {count > 0 && (
        <p className="text-sm text-text">
          {count} {count === 1 ? itemLabel : plural}
        </p>
      )}

      {count === 0 ? (
        <p className="py-8 text-center text-sm text-text">{emptyMessage}</p>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {pageItems.map((item) => (
              <li key={getKey(item)}>{renderItem(item)}</li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <Button
                variant="secondary"
                disabled={currentPage === 0}
                onClick={() => goToPage(Math.max(0, currentPage - 1))}
              >
                Previous
              </Button>
              <span className="text-[13px] text-text">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={currentPage >= totalPages - 1}
                onClick={() => goToPage(Math.min(totalPages - 1, currentPage + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
