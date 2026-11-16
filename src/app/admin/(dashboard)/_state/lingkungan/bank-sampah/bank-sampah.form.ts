import { bankSampahBodySchema } from "@/lib/bank-sampah/bank-sampah.validation";
import type { BankSampahDetail } from "@/lib/bank-sampah/bank-sampah.types";
import { linkRuteKoordinat, type Koordinat } from "@/lib/konten-bersama/lokasi.logic";
import type { MediaSosialItem } from "@/lib/konten-bersama/media-sosial.model";

/** Nilai form admin bank sampah (create & edit). */
export type BankSampahForm = {
  name: string;
  alamat: string;
  namaTempatMaps: string;
  koordinat: Koordinat | null;
  deskripsi: string;
  kontak: string;
  mediaSosial: MediaSosialItem[];
  /** Link Google Maps dari admin; kosong = rute otomatis ke koordinat. */
  linkMaps: string;
  programInovasiIds: string[];
  /** Foto bagan tersimpan (null = tidak ada / dikosongkan admin). */
  fotoBaganStrukturId: string | null;
  fotoBaganLink: string | null;
};

export const FORM_BANK_SAMPAH_KOSONG: BankSampahForm = {
  name: "",
  alamat: "",
  namaTempatMaps: "",
  koordinat: null,
  deskripsi: "",
  kontak: "",
  mediaSosial: [],
  linkMaps: "",
  programInovasiIds: [],
  fotoBaganStrukturId: null,
  fotoBaganLink: null,
};

/** Isi form edit dari detail API; link yang sama dengan rute otomatis ditampilkan kosong. */
export function formDariDetail(d: BankSampahDetail): BankSampahForm {
  const koordinat = { lat: d.lat, lng: d.lng };
  return {
    name: d.name,
    alamat: d.alamat,
    namaTempatMaps: d.namaTempatMaps,
    koordinat,
    deskripsi: d.deskripsi ?? "",
    kontak: d.kontak ?? "",
    mediaSosial: d.mediaSosial.map((m) => ({ ...m })),
    linkMaps: d.linkPetunjukArah === linkRuteKoordinat(koordinat) ? "" : d.linkPetunjukArah,
    programInovasiIds: d.programInovasi.map((p) => p.id),
    fotoBaganStrukturId: d.fotoBaganStrukturId,
    fotoBaganLink: d.fotoBaganStruktur?.link ?? null,
  };
}

/** Body API dari form; baris media sosial tanpa URL diabaikan. `baganId` = id bagan baru/tersimpan/null. */
export function payloadDariForm(form: BankSampahForm, baganId: string | null) {
  return {
    name: form.name,
    alamat: form.alamat,
    namaTempatMaps: form.namaTempatMaps,
    lat: form.koordinat?.lat as number,
    lng: form.koordinat?.lng as number,
    deskripsi: form.deskripsi,
    kontak: form.kontak,
    mediaSosial: form.mediaSosial.filter((m) => m.url.trim() !== "").map((m) => ({ ...m, url: m.url.trim() })),
    linkPetunjukArah: form.linkMaps.trim(),
    fotoBaganStrukturId: baganId,
    programInovasiIds: [...form.programInovasiIds],
  };
}

/** Pesan error pertama form (aturan sama dengan server), atau null bila valid. */
export function cekFormBankSampah(form: BankSampahForm): string | null {
  if (!form.koordinat) return "Silakan pilih lokasi di peta";
  const hasil = bankSampahBodySchema.safeParse(payloadDariForm(form, form.fotoBaganStrukturId));
  return hasil.success ? null : (hasil.error.issues[0]?.message ?? "Data bank sampah tidak valid");
}
