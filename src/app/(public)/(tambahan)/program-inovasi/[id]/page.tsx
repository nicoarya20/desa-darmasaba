import { redirect } from "next/navigation";
import { programOverlayHref } from "@/app/(public)/_com/main-page/landing-page/program-param.logic";

/**
 * Rute lama detail Program Inovasi: dialihkan 307 ke overlay di beranda (`/?program={id}`).
 * Folder tetap ada karena `_com/DokumentasiGaleri` dipakai admin dan Pengumuman.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(programOverlayHref(id));
}
