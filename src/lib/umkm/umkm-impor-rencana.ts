// Rencana impor UMKM — fungsi murni: dari baris impor + kategori aktif + UMKM yang sudah ada menjadi daftar
// yang akan ditambah/diperbarui/dilewati beserta galat & peringatan per baris. Tanpa akses DB, jadi dipakai
// sama oleh dry-run dan impor sungguhan di server. Nomor baris = urutan di `rows` + 1.
import { cariKategori, petaKategori, type KategoriAktif } from "./impor-kategori";
import {
  deskripsiKeHtml,
  kunciUmkm,
  peringatanKontak,
  validasiBarisUmkm,
  type ModeImporUmkm,
} from "./umkm-impor.rules";

export type UmkmAda = { id: string; nama: string; pemilik: string };
export type BarisPesan = { baris: number; alasan: string };

export type UmkmBaru = {
  nama: string;
  pemilik: string;
  kategoriId: string;
  deskripsi?: string;
  alamat?: string;
  kontak?: string;
};
/** Perubahan UMKM yang sudah ada: hanya field yang terisi di CSV (sel kosong tidak menimpa). */
export type UmkmPerubahan = { id: string; data: Omit<UmkmBaru, "nama" | "pemilik"> };

export type RencanaImpor = {
  tambah: UmkmBaru[];
  perbarui: UmkmPerubahan[];
  dilewati: number;
  galat: BarisPesan[];
  peringatan: BarisPesan[];
};

/** Susun rencana impor. `ada` = UMKM aktif (belum dihapus); bila kunci kembar, entri pertama yang dipakai. */
export function susunRencanaImpor(opts: {
  rows: unknown[];
  mode: ModeImporUmkm;
  kategori: readonly KategoriAktif[];
  ada: readonly UmkmAda[];
}): RencanaImpor {
  const kategoriPerNama = petaKategori(opts.kategori);
  const adaPerKunci = new Map<string, string>();
  for (const u of opts.ada) {
    const kunci = kunciUmkm(u.nama, u.pemilik);
    if (!adaPerKunci.has(kunci)) adaPerKunci.set(kunci, u.id);
  }

  const rencana: RencanaImpor = { tambah: [], perbarui: [], dilewati: 0, galat: [], peringatan: [] };
  const terlihat = new Map<string, number>();
  const tolak = (baris: number, alasan: string) => rencana.galat.push({ baris, alasan });

  opts.rows.forEach((mentah, i) => {
    const baris = i + 1;
    const v = validasiBarisUmkm((mentah ?? {}) as Record<string, unknown>);
    if (!v.ok) return tolak(baris, v.alasan);
    const r = v.value;

    const kunci = kunciUmkm(r.nama, r.pemilik);
    const pertama = terlihat.get(kunci);
    if (pertama !== undefined) return tolak(baris, `Nama + pemilik sama dengan baris ${pertama} di berkas ini`);
    terlihat.set(kunci, baris);

    const idAda = adaPerKunci.get(kunci);
    if (idAda !== undefined && opts.mode === "lewati") {
      rencana.dilewati++;
      return;
    }

    const kategori = cariKategori(kategoriPerNama, r.kategori);
    if (!kategori.ok) return tolak(baris, kategori.alasan);

    const opsional = {
      ...(r.deskripsi && { deskripsi: deskripsiKeHtml(r.deskripsi) }),
      ...(r.alamat && { alamat: r.alamat }),
      ...(r.kontak && { kontak: r.kontak }),
    };
    if (idAda !== undefined) rencana.perbarui.push({ id: idAda, data: { kategoriId: kategori.value, ...opsional } });
    else rencana.tambah.push({ nama: r.nama, pemilik: r.pemilik, kategoriId: kategori.value, ...opsional });

    const peringatan = peringatanKontak(r.kontak);
    if (peringatan) rencana.peringatan.push({ baris, alasan: peringatan });
  });

  return rencana;
}
