'use client';
import { Pagination } from '@mantine/core';
import s from './kabar-list.module.css';

type Props = {
  total: number;
  value: number;
  label: string;
  onChange: (page: number) => void;
};

/** Paginasi bulat gaya Kabar (aktif = latar brand); tidak dirender bila hanya 1 halaman. */
export function KabarListPagination({ total, value, label, onChange }: Props) {
  if (total <= 1) return null;
  return (
    <nav className={s.pagination} aria-label={label}>
      <Pagination
        total={total}
        value={Math.min(value, total)}
        onChange={onChange}
        siblings={1}
        boundaries={1}
        classNames={{ control: s.pageControl, dots: s.pageDots }}
      />
    </nav>
  );
}
