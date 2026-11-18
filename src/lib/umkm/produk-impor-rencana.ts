// Rencana impor Produk — fungsi murni: baris impor + kategori aktif + UMKM + produk yang sudah ada menjadi daftar
// yang akan ditambah/diperbarui/dilewati beserta galat & peringatan per baris. Tanpa akses DB, jadi dipakai sama
// oleh dry-run dan impor sungguhan di server. Nomor baris = urutan di `rows` + 1.
import type { LinkTokoOnlineNormal } from "@/lib/link-toko-online";
import { cariKategori, petaKategori, type KategoriAktif } from "./impor-kategori";
import { kunciProduk, peringatanHarga, validasiBarisProduk, validasiLinkImpor } from "./produk-impor.rules";
import { deskripsiKeHtml, normalNama, type ModeImporUmkm } from "./umkm-impor.rules";
import type { BarisPesan } from "./umkm-impor-rencana";

export type UmkmProdukAda = { id: string; nama: string; pemilik: string; isActive: boolean };
export type ProdukAda = { id: string; umkmId: string; nama: string };

export type ProdukBaru = {
  nama: string;
  harga: number;
  umkmId: string;
  kategoriProdukId: string;
  stok?: number;
  satuan?: string;
  deskripsi?: string;
  isUnggulan?: boolean;
  /** Link toko online (kosong = tidak ada); ditulis atomik bersama produk. */
  link: LinkTokoOnlineNormal[];
};
/** Perubahan produk yang sudah ada: sel kosong tidak menimpa. `gantiLink` null = link tidak disentuh. */
export type ProdukPerubahan = {
  id: string;
  data: Omit<ProdukBaru, "nama" | "umkmId" | "link">;
  gantiLink: LinkTokoOnlineNormal[] | null;
};

export type RencanaProduk = {
  tambah: ProdukBaru[];
  perbarui: ProdukPerubahan[];
  dilewati: number;
  /** Jumlah produk (mode perbarui) yang daftar link tokonya akan diganti seluruhnya. */
  linkDiganti: number;
  galat: BarisPesan[];
  peringatan: BarisPesan[];
};

type HasilUmkm = { ok: true; umkm: UmkmProdukAda } | { ok: false; alasan: string };

function cariUmkm(peta: Map<string, UmkmProdukAda[]>, nama: string, pemilik: string | undefined): HasilUmkm {
  let kandidat = peta.get(normalNama(nama)) ?? [];
  if (kandidat.length === 0) return { ok: false, alasan: `UMKM "${nama}" tidak dikenal. Buat dulu di tab Data UMKM atau perbaiki penulisannya` };
  if (kandidat.length > 1 && pemilik) {
    kandidat = kandidat.filter((u) => normalNama(u.pemilik) === normalNama(pemilik));
    if (kandidat.length === 0) return { ok: false, alasan: `UMKM "${nama}" tidak ditemukan dengan pemilik yang diisi di kolom 'pemilik'` };
  }
  if (kandidat.length > 1) {
    const sebab = pemilik ? "nama dan pemilik yang sama" : "nama yang sama, isi kolom 'pemilik' untuk membedakan";
    return { ok: false, alasan: `UMKM "${nama}" ambigu: ada ${kandidat.length} UMKM dengan ${sebab}` };
  }
  if (!kandidat[0].isActive) return { ok: false, alasan: `UMKM "${nama}" nonaktif. Aktifkan dulu di tab Data UMKM` };
  return { ok: true, umkm: kandidat[0] };
}

/** Susun rencana impor. `umkm` & `ada` hanya yang belum dihapus; `ada` terlama dulu (kunci kembar → entri pertama). */
export function susunRencanaProduk(opts: {
  rows: unknown[];
  mode: ModeImporUmkm;
  kategori: readonly KategoriAktif[];
  umkm: readonly UmkmProdukAda[];
  ada: readonly ProdukAda[];
}): RencanaProduk {
  const kategoriPerNama = petaKategori(opts.kategori);
  const umkmPerNama = new Map<string, UmkmProdukAda[]>();
  for (const u of opts.umkm) umkmPerNama.set(normalNama(u.nama), [...(umkmPerNama.get(normalNama(u.nama)) ?? []), u]);
  const adaPerKunci = new Map<string, string>();
  for (const p of opts.ada) {
    const kunci = kunciProduk(p.umkmId, p.nama);
    if (!adaPerKunci.has(kunci)) adaPerKunci.set(kunci, p.id);
  }

  const rencana: RencanaProduk = { tambah: [], perbarui: [], dilewati: 0, linkDiganti: 0, galat: [], peringatan: [] };
  const terlihat = new Map<string, number>();
  const tolak = (baris: number, alasan: string) => rencana.galat.push({ baris, alasan });

  opts.rows.forEach((mentah, i) => {
    const baris = i + 1;
    const v = validasiBarisProduk((mentah ?? {}) as Record<string, unknown>);
    if (!v.ok) return tolak(baris, v.alasan);
    const r = v.value;

    const umkm = cariUmkm(umkmPerNama, r.umkm, r.pemilik);
    if (!umkm.ok) return tolak(baris, umkm.alasan);

    const kunci = kunciProduk(umkm.umkm.id, r.nama);
    const pertama = terlihat.get(kunci);
    if (pertama !== undefined) return tolak(baris, `Produk (UMKM + nama) sama dengan baris ${pertama} di berkas ini`);
    terlihat.set(kunci, baris);

    const idAda = adaPerKunci.get(kunci);
    if (idAda !== undefined && opts.mode === "lewati") {
      rencana.dilewati++;
      return;
    }

    const kategori = cariKategori(kategoriPerNama, r.kategori);
    if (!kategori.ok) return tolak(baris, kategori.alasan);

    // Sudah lolos validasi baris, jadi validasi link di sini selalu sukses; hasilnya dipakai untuk urutan & href normal.
    const link = validasiLinkImpor(r.link);
    const daftarLink = link.ok ? link.value.daftar : [];
    const opsional = {
      ...(r.stok !== undefined && { stok: r.stok }),
      ...(r.satuan && { satuan: r.satuan }),
      ...(r.deskripsi && { deskripsi: deskripsiKeHtml(r.deskripsi) }),
      ...(r.unggulan !== undefined && { isUnggulan: r.unggulan }),
    };
    if (idAda !== undefined) {
      const ganti = daftarLink.length > 0;
      if (ganti) rencana.linkDiganti++;
      rencana.perbarui.push({
        id: idAda,
        data: { harga: r.harga, kategoriProdukId: kategori.value, ...opsional },
        gantiLink: ganti ? daftarLink : null,
      });
    } else {
      rencana.tambah.push({ nama: r.nama, harga: r.harga, umkmId: umkm.umkm.id, kategoriProdukId: kategori.value, ...opsional, link: daftarLink });
    }

    const peringatan = peringatanHarga(r.harga);
    if (peringatan) rencana.peringatan.push({ baris, alasan: peringatan });
  });

  return rencana;
}
