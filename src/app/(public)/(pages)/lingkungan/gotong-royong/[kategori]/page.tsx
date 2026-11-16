import { redirect } from 'next/navigation';
import { GOTONG_ROYONG_BASE_HREF } from '../_com/gotong-royong.meta';

/**
 * URL daftar lama (`/lingkungan/gotong-royong/semua`, `/lingkungan/gotong-royong/{kategori}`) dari masa pil kategori:
 * dialihkan (307) ke daftar tunggal supaya tautan/penanda lama tetap hidup.
 */
export default function Page() {
  redirect(GOTONG_ROYONG_BASE_HREF);
}
