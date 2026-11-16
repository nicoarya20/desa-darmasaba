import { permanentRedirect } from 'next/navigation';
import { GOTONG_ROYONG_LIST_PATH } from '../_com/gotong-royong.meta';

/** URL lama tab kategori (`/lingkungan/gotong-royong/{kategori}`) → daftar Gotong Royong (tab kategori sudah tidak ada). */
export default function Page() {
  permanentRedirect(GOTONG_ROYONG_LIST_PATH);
}
