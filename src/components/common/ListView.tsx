import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from './Button'

interface Props<T> {
  items: T[]
  getKey: (item: T) => string
  renderItem: (item: T) => ReactNode
  /** Singular unit name for the count line, e.g. "patient". */
  itemLabel: string
  /** Defaults to `${itemLabel}s`. */
  itemLabelPlural?: string
  /** Shown centered in place of the list when `items` is empty — the
   *  caller decides the wording (e.g. "no patients yet" vs "no patients
   *  match your search") since that distinction depends on context this
   *  component doesn't have. */
  emptyMessage: string
  /** Items per page. Defaults to 10. */
  pageSize?: number
}

/**
 * Generic paginated list container: a "N things" count at the top, the
 * items themselves (however the caller wants them rendered — a Card, a
 * table row, anything), and Previous/Next paging at the bottom once there
 * are more items than fit on one page. Resets to page 1 whenever the
 * `items` array itself changes (e.g. a search/filter narrows the result
 * set) so a stale page number can't end up pointing past the end.
 */
export function ListView<T>({
  items,
  getKey,
  renderItem,
  itemLabel,
  itemLabelPlural,
  emptyMessage,
  pageSize = 10,
}: Props<T>) {
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage(0)
  }, [items])

  const plural = itemLabelPlural ?? `${itemLabel}s`
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(page, totalPages - 1)
  const pageItems = items.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  return (
    <div className="flex flex-col gap-3">
      {items.length > 0 && (
        <p className="text-sm text-text">
          {items.length} {items.length === 1 ? itemLabel : plural}
        </p>
      )}

      {items.length === 0 ? (
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
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-[13px] text-text">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
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
