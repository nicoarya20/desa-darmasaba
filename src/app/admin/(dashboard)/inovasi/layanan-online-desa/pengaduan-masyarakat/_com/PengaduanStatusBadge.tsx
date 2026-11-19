import { Badge } from '@mantine/core';
import { PENGADUAN_STATUS, PENGADUAN_STATUS_LABEL, resolvePengaduanStatus, type PengaduanStatus } from '@/lib/pengaduan-status';

const STATUS_COLOR: Record<PengaduanStatus, string> = {
  BARU: 'blue',
  DIPROSES: 'yellow',
  SELESAI: 'green',
  DITOLAK: 'red',
};

/** Opsi dropdown status (filter daftar & form tanggapan), urut sesuai alur penanganan. */
export const PENGADUAN_STATUS_OPTIONS = PENGADUAN_STATUS.map((value) => ({ value, label: PENGADUAN_STATUS_LABEL[value] }));

/** Lencana status pengaduan; `status` null dari database dibaca BARU lewat `resolvePengaduanStatus`. */
export function PengaduanStatusBadge({ status }: { status: string | null | undefined }) {
  const resolved = resolvePengaduanStatus(status);
  return <Badge color={STATUS_COLOR[resolved]} variant="light">{PENGADUAN_STATUS_LABEL[resolved]}</Badge>;
}
