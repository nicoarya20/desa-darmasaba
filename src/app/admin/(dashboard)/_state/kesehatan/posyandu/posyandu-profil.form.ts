import {
  LABEL_SASARAN_KLASTER,
  SASARAN_KLASTER,
  profilPosyanduBodySchema,
  type SasaranKlaster,
} from "@/lib/posyandu/posyandu-konten.validation";
import type { ProfilPosyanduData } from "@/lib/posyandu/posyandu-konten.types";

/** Nilai form satu klaster di admin. */
export type KlasterForm = {
  sasaran: SasaranKlaster;
  judul: string;
  deskripsi: string;
  jamPelayanan: string;
  /** Gambar tersimpan (null = tidak ada / dilepas admin). */
  imageId: string | null;
  imageLink: string | null;
};

/** Nilai form admin "Profil & Klaster". */
export type ProfilPosyanduForm = {
  deskripsi: string;
  fungsiKegiatan: string;
  klaster: KlasterForm[];
};

/** Isi form dari respons API; klaster yang belum ada barisnya diisi kosong agar ketiganya selalu tampil. */
export function formDariProfil(data: ProfilPosyanduData | null): ProfilPosyanduForm {
  return {
    deskripsi: data?.profil?.deskripsi ?? "",
    fungsiKegiatan: data?.profil?.fungsiKegiatan ?? "",
    klaster: SASARAN_KLASTER.map((sasaran) => {
      const k = data?.klaster.find((item) => item.sasaran === sasaran);
      return {
        sasaran,
        judul: k?.judul ?? `Posyandu ${LABEL_SASARAN_KLASTER[sasaran]}`,
        deskripsi: k?.deskripsi ?? "",
        jamPelayanan: k?.jamPelayanan ?? "",
        imageId: k?.imageId ?? null,
        imageLink: k?.image?.link ?? null,
      };
    }),
  };
}

/** Body PUT `/profil` dari form; `imageIds` = id gambar baru per sasaran (menimpa gambar tersimpan). */
export function payloadDariProfil(form: ProfilPosyanduForm, imageIds: Partial<Record<SasaranKlaster, string>> = {}) {
  return {
    deskripsi: form.deskripsi,
    fungsiKegiatan: form.fungsiKegiatan,
    klaster: form.klaster.map((k) => ({
      sasaran: k.sasaran,
      judul: k.judul,
      deskripsi: k.deskripsi,
      jamPelayanan: k.jamPelayanan,
      imageId: imageIds[k.sasaran] ?? k.imageId,
    })),
  };
}

/** Pesan error pertama form (aturan sama dengan server), atau null bila valid. */
export function cekFormProfil(form: ProfilPosyanduForm): string | null {
  const hasil = profilPosyanduBodySchema.safeParse(payloadDariProfil(form));
  return hasil.success ? null : (hasil.error.issues[0]?.message ?? "Data profil posyandu tidak valid");
}
