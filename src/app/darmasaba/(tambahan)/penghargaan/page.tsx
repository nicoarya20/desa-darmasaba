import { redirect } from "next/navigation";
import { PRESTASI_LIST_HREF } from "../../_com/main-page/prestasi/prestasi.meta";

/** Daftar penghargaan kini digabung dengan prestasi → alihkan ke halaman gabungan (detail `[id]` tetap). */
export default function Page() {
  redirect(PRESTASI_LIST_HREF);
}
