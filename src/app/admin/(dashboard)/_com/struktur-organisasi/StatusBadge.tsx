import { Badge } from '@mantine/core';
import { STRUKTUR_ADMIN_TEXT as T } from './struktur-admin.text';

/** Lencana status aktif / tidak aktif. */
export function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge color={isActive ? 'green' : 'red'} variant="light">
      {isActive ? T.aktif : T.tidakAktif}
    </Badge>
  );
}
