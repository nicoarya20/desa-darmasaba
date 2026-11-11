import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

dayjs.extend(relativeTime);

/**
 * Format tanggal jadi "x waktu lalu" dalam Bahasa Indonesia.
 * Locale di-scope per-pemanggilan agar tidak memutasi locale global dayjs
 * (halaman lain tetap pakai default en).
 */
export function timeAgoId(date: Date | string | null | undefined): string {
  if (!date) return '';
  return dayjs(date).locale('id').fromNow();
}
