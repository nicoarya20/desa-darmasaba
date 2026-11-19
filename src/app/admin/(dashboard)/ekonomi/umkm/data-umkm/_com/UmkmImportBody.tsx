import type { BarisUmkm } from '@/lib/umkm/umkm-impor-csv';
import { ImporBody, type ImporBodyProps, type KonfigImporBody } from '../../_com/import/ImporBody';

const KONFIG: KonfigImporBody<BarisUmkm> = {
  petunjuk: (
    <>
      Baris pertama adalah header. Kolom wajib: <b>nama</b>, <b>pemilik</b>, <b>kategori</b>. Kolom opsional: <b>deskripsi</b>,{' '}
      <b>alamat</b>, <b>kontak</b>. Kategori harus sama dengan nama di tab Kategori Produk. Gambar tidak diimpor (unggah lewat
      Ubah UMKM).
    </>
  ),
  labelMode: 'Jika UMKM sudah ada (nama dan pemilik sama)',
  deskripsiMode: {
    lewati: 'Data yang sudah ada tidak diubah; hanya UMKM baru yang ditambahkan.',
    perbarui: 'Kategori, deskripsi, alamat, dan kontak diperbarui; sel kosong di CSV tidak menimpa data lama.',
  },
  kolom: [
    { judul: 'Nama', sel: (r) => r.nama },
    { judul: 'Pemilik', sel: (r) => r.pemilik },
    { judul: 'Kategori', sel: (r) => r.kategori },
    { judul: 'Kontak', sel: (r) => r.kontak ?? '-' },
  ],
};

/** Isi modal impor CSV Data UMKM: konfigurasi UMKM di atas kerangka bersama `ImporBody`. */
export function UmkmImportBody(props: ImporBodyProps<BarisUmkm>) {
  return <ImporBody {...props} {...KONFIG} />;
}
