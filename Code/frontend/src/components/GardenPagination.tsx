import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GardenPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  idPrefix?: string;
}

/** Membangun daftar nomor halaman ringkas, mis. [1, '…', 4, 5, 6, '…', 10] */
const buildPageList = (current: number, total: number): (number | '…')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
};

export const GardenPagination: React.FC<GardenPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  idPrefix = 'garden',
}) => {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav className="garden-pagination" aria-label="Navigasi halaman kebun">
      <span className="garden-pagination-info">
        Menampilkan <strong>{from}–{to}</strong> dari <strong>{totalItems}</strong> tanaman
      </span>
      <div className="garden-pagination-controls">
        <button
          type="button"
          id={`${idPrefix}-page-prev`}
          className="garden-page-btn garden-page-nav"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>
        {buildPageList(currentPage, totalPages).map((p, idx) =>
          p === '…' ? (
            <span key={`ellipsis-${idx}`} className="garden-page-ellipsis">
              …
            </span>
          ) : (
            <button
              type="button"
              key={p}
              id={`${idPrefix}-page-${p}`}
              className={`garden-page-btn ${p === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          id={`${idPrefix}-page-next`}
          className="garden-page-btn garden-page-nav"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
};
