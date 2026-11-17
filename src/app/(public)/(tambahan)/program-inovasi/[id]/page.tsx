import { redirect } from "next/navigation";
import { programInovasiDetailHref } from "@/app/(public)/(pages)/inovasi/program-inovasi/_com/program-inovasi.logic";

/**
 * Rute lama detail Program Inovasi: dialihkan 307 ke halaman detail `/inovasi/program-inovasi/{id}`
 * (dulu ke overlay beranda `/?program={id}`, yang tidak bisa diindeks mesin pencari).
 * Folder tetap ada karena `_com/DokumentasiGaleri` dipakai admin, Pengumuman, dan halaman detail baru.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(programInovasiDetailHref(id));
}
