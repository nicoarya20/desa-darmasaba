import { labelKategoriEvent, warnaKategoriEvent } from '@/lib/agenda-desa';
import { Badge, type BadgeProps } from '@mantine/core';

/** Badge berwarna untuk kategori agenda (admin & halaman publik). */
export function KategoriEventBadge({
  kategori,
  ...props
}: { kategori: string | null | undefined } & Omit<BadgeProps, 'color' | 'children'>) {
  return (
    <Badge variant="light" color={warnaKategoriEvent(kategori)} {...props}>
      {labelKategoriEvent(kategori)}
    </Badge>
  );
}
