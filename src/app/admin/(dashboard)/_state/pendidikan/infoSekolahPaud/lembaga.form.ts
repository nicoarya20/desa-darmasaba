import type { Koordinat } from "@/lib/konten-bersama/lokasi.logic";
import type { MediaSosialItem } from "@/lib/konten-bersama/media-sosial.model";
import { mediaSosialDariInput } from "@/lib/konten-bersama/media-sosial.validation";
import type { LembagaDetail } from "@/lib/lembaga-pendidikan/lembaga.types";
import { lembagaCreateSchema } from "@/lib/lembaga-pendidikan/lembaga.validation";

/** Nilai form admin lembaga pendidikan (create & edit). */
export type LembagaForm = {
  nama: string;
  jenjangId: string;
  deskripsi: string;
  alamat: string;
  kontak: string;
  mediaSosial: MediaSosialItem[];
  /** Titik di peta; null = belum dipilih (opsional untuk sekolah). */
  koordinat: Koordinat | null;
  /** Link Google Maps dari admin (mis. maps.app.goo.gl); kosong = rute ke titik peta. */
  linkMaps: string;
  /** Foto tersimpan (null = tidak ada / dikosongkan admin) beserta link pratinjaunya. */
  fotoSekolahId: string | null;
  fotoSekolahLink: string | null;
  fotoBaganStrukturId: string | null;
  fotoBaganLink: string | null;
};

/** Foto baru yang dipilih admin dan belum diunggah. */
export type LembagaFotoBaru = { fotoSekolah: File | null; bagan: File | null };

export const FORM_LEMBAGA_KOSONG: LembagaForm = {
  nama: "",
  jenjangId: "",
  deskripsi: "",
  alamat: "",
  kontak: "",
  mediaSosial: [],
  koordinat: null,
  linkMaps: "",
  fotoSekolahId: null,
  fotoSekolahLink: null,
  fotoBaganStrukturId: null,
  fotoBaganLink: null,
};

export const FOTO_LEMBAGA_KOSONG: LembagaFotoBaru = { fotoSekolah: null, bagan: null };

/** Isi form edit dari detail API. */
export function formDariDetail(d: LembagaDetail): LembagaForm {
  return {
    nama: d.nama,
    jenjangId: d.jenjangId,
    deskripsi: d.deskripsi ?? "",
    alamat: d.alamat ?? "",
    kontak: d.kontak ?? "",
    mediaSosial: d.mediaSosial.map((m) => ({ ...m })),
    koordinat: d.lat !== null && d.lng !== null ? { lat: d.lat, lng: d.lng } : null,
    linkMaps: d.linkGoogleMaps ?? "",
    fotoSekolahId: d.fotoSekolahId,
    fotoSekolahLink: d.fotoSekolah?.link ?? null,
    fotoBaganStrukturId: d.fotoBaganStrukturId,
    fotoBaganLink: d.fotoBaganStruktur?.link ?? null,
  };
}

/** Body API dari form; `foto` = id foto sekolah & bagan (baru diunggah / tersimpan / null). */
export function payloadDariForm(form: LembagaForm, foto: { fotoSekolahId: string | null; fotoBaganStrukturId: string | null }) {
  return {
    nama: form.nama,
    jenjangId: form.jenjangId,
    deskripsi: form.deskripsi,
    alamat: form.alamat,
    kontak: form.kontak,
    mediaSosial: mediaSosialDariInput(form.mediaSosial),
    lat: form.koordinat?.lat ?? null,
    lng: form.koordinat?.lng ?? null,
    linkGoogleMaps: form.linkMaps.trim(),
    fotoSekolahId: foto.fotoSekolahId,
    fotoBaganStrukturId: foto.fotoBaganStrukturId,
  };
}

/** Pesan error pertama form (aturan sama dengan server), atau null bila valid. */
export function cekFormLembaga(form: LembagaForm): string | null {
  const hasil = lembagaCreateSchema.safeParse(payloadDariForm(form, form));
  return hasil.success ? null : (hasil.error.issues[0]?.message ?? "Data lembaga tidak valid");
}
