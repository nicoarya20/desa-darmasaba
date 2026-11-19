import type { BarisProduk } from '@/lib/umkm/produk-impor-csv';
import { Alert } from '@mantine/core';
import { ImporBody, type ImporBodyProps, type KonfigImporBody } from '../../_com/import/ImporBody';
import { formatRupiah, jumlahLink } from '../_lib/produk-impor.logic';

const KONFIG: KonfigImporBody<BarisProduk> = {
  petunjuk: (
    <>
      Baris pertama adalah header. Kolom wajib: <b>nama</b>, <b>umkm</b>, <b>kategori</b>, <b>harga</b>. Kolom opsional:{' '}
      <b>pemilik</b>, <b>stok</b>, <b>satuan</b>, <b>deskripsi</b>, <b>unggulan</b> (ya/tidak), dan link toko online (
      <b>link_shopee</b>, <b>link_tokopedia</b>, <b>link_tiktok_shop</b>, <b>link_blibli</b>, <b>link_lazada</b>,{' '}
      <b>link_lainnya</b>). Nama UMKM dan kategori harus sudah ada; kolom pemilik membedakan UMKM yang namanya sama. Harga dan
      stok berupa angka rupiah tanpa desimal (boleh &quot;15.000&quot; atau &quot;Rp 15.000&quot;). Excel: format kolom
      harga/stok sebagai Teks atau Angka tanpa desimal. Link toko online opsional, harus diawali https://, maksimal 5 per
      produk. Gambar tidak diimpor (unggah lewat Ubah Produk).
    </>
  ),
  labelMode: 'Jika produk sudah ada (UMKM dan nama sama)',
  deskripsiMode: {
    lewati: 'Data yang sudah ada tidak diubah; hanya produk baru yang ditambahkan.',
    perbarui:
      'Kategori, harga, stok, satuan, deskripsi, dan status unggulan diperbarui; sel kosong di CSV tidak menimpa data lama. Jika baris mengisi minimal satu link toko online, seluruh daftar link produk itu diganti dengan isi CSV.',
  },
  kolom: [
    { judul: 'Nama', sel: (r) => r.nama },
    { judul: 'UMKM', sel: (r) => r.umkm },
    { judul: 'Kategori', sel: (r) => r.kategori },
    { judul: 'Harga', sel: (r) => formatRupiah(r.harga) },
    { judul: 'Stok', sel: (r) => r.stok ?? 0 },
    { judul: 'Link', sel: (r) => (jumlahLink(r.link) > 0 ? `${jumlahLink(r.link)} link` : '-') },
  ],
  catatan: (p) =>
    p.linkDiganti ? (
      <Alert color="yellow" title="Link toko online diganti">
        {p.linkDiganti} produk akan diganti daftar link toko onlinenya.
      </Alert>
    ) : null,
};

/** Isi modal impor CSV Produk UMKM: konfigurasi Produk di atas kerangka bersama `ImporBody`. */
export function ProdukImportBody(props: ImporBodyProps<BarisProduk>) {
  return <ImporBody {...props} {...KONFIG} />;
}
