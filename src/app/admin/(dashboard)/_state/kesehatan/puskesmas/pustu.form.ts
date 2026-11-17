import type { MediaSosialItem } from "@/lib/konten-bersama/media-sosial.model";
import type { JadwalPustuItem, PustuDetail } from "@/lib/pustu/pustu.types";
import { pustuBodySchema } from "@/lib/pustu/pustu.validation";

/** Satu baris layanan unggulan di form (deskripsi "" = kosong). */
export type LayananForm = { judul: string; deskripsi: string };

/** Nilai form admin PUSTU (create & edit). */
export type PustuForm = {
  name: string;
  alamat: string;
  /** Foto lokasi tersimpan (null = tidak ada / dikosongkan admin). */
  imageId: string | null;
  imageLink: string | null;
  jadwal: JadwalPustuItem[];
  kontakPuskesmas: string;
  email: string;
  kontakUGD: string;
  mediaSosial: MediaSosialItem[];
  /** Link Google Maps dari admin; kosong = tanpa tombol peta. */
  linkMaps: string;
  layananUnggulan: LayananForm[];
  prosedurPendaftaran: string;
  tarifBpjs: string;
  tarifUmum: string;
  fotoBaganStrukturId: string | null;
  fotoBaganLink: string | null;
};

export const FORM_PUSTU_KOSONG: PustuForm = {
  name: "",
  alamat: "",
  imageId: null,
  imageLink: null,
  jadwal: [],
  kontakPuskesmas: "",
  email: "",
  kontakUGD: "",
  mediaSosial: [],
  linkMaps: "",
  layananUnggulan: [],
  prosedurPendaftaran: "",
  tarifBpjs: "",
  tarifUmum: "",
  fotoBaganStrukturId: null,
  fotoBaganLink: null,
};

/** Isi form edit dari detail API. */
export function formDariDetail(d: PustuDetail): PustuForm {
  return {
    name: d.name,
    alamat: d.alamat,
    imageId: d.imageId,
    imageLink: d.image?.link ?? null,
    jadwal: d.jadwal.map((j) => ({ ...j })),
    kontakPuskesmas: d.kontak?.kontakPuskesmas ?? "",
    email: d.kontak?.email ?? "",
    kontakUGD: d.kontak?.kontakUGD ?? "",
    mediaSosial: d.mediaSosial.map((m) => ({ ...m })),
    linkMaps: d.linkPetunjukArah ?? "",
    layananUnggulan: d.layananUnggulan.map((l) => ({ judul: l.judul, deskripsi: l.deskripsi ?? "" })),
    prosedurPendaftaran: d.prosedurPendaftaran ?? "",
    tarifBpjs: d.tarifBpjs ?? "",
    tarifUmum: d.tarifUmum ?? "",
    fotoBaganStrukturId: d.fotoBaganStrukturId,
    fotoBaganLink: d.fotoBaganStruktur?.link ?? null,
  };
}

const terisi = (...teks: string[]) => teks.some((t) => t.trim() !== "");

/**
 * Body API dari form. Baris kosong (jam tanpa hari & jam, layanan tanpa judul & deskripsi, medsos tanpa URL)
 * diabaikan. `foto` = id foto lokasi & bagan baru/tersimpan/null.
 */
export function payloadDariForm(form: PustuForm, foto: { imageId: string | null; baganId: string | null }) {
  return {
    name: form.name,
    alamat: form.alamat,
    imageId: foto.imageId,
    jadwal: form.jadwal.filter((j) => terisi(j.hari, j.jam)).map((j) => ({ hari: j.hari.trim(), jam: j.jam.trim() })),
    kontak: { kontakPuskesmas: form.kontakPuskesmas, email: form.email, kontakUGD: form.kontakUGD },
    mediaSosial: form.mediaSosial.filter((m) => m.url.trim() !== "").map((m) => ({ ...m, url: m.url.trim() })),
    layananUnggulan: form.layananUnggulan.filter((l) => terisi(l.judul, l.deskripsi)).map((l) => ({ ...l })),
    linkPetunjukArah: form.linkMaps.trim(),
    prosedurPendaftaran: form.prosedurPendaftaran,
    tarifBpjs: form.tarifBpjs,
    tarifUmum: form.tarifUmum,
    fotoBaganStrukturId: foto.baganId,
  };
}

/** Pesan error pertama form (aturan sama dengan server), atau null bila valid. */
export function cekFormPustu(form: PustuForm): string | null {
  const hasil = pustuBodySchema.safeParse(payloadDariForm(form, { imageId: form.imageId, baganId: form.fotoBaganStrukturId }));
  return hasil.success ? null : (hasil.error.issues[0]?.message ?? "Data PUSTU tidak valid");
}
