import { redirect } from 'next/navigation';
import { GOTONG_ROYONG_LIST_PATH } from './_com/gotong-royong.meta';

/** `/lingkungan/gotong-royong` → daftar Gotong Royong. */
export default function Page() {
  redirect(GOTONG_ROYONG_LIST_PATH);
}
