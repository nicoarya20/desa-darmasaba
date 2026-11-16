'use client'
import DaftarAnakAdminSection from '@/app/admin/(dashboard)/_com/konten-bersama/daftar-anak.admin-section';
import { fotoKegiatanBankSampah, pengurusBankSampah } from '@/app/admin/(dashboard)/_state/lingkungan/bank-sampah/bank-sampah.anak.state';
import { MAX_FOTO_KEGIATAN_BANK_SAMPAH, MAX_PENGURUS_BANK_SAMPAH } from '@/lib/bank-sampah/bank-sampah.validation';

/** Section admin pengurus + dokumentasi kegiatan satu bank sampah (disimpan langsung per aksi). */
export default function BankSampahAnakAdmin({ bankSampahId }: { bankSampahId: string }) {
  return (
    <DaftarAnakAdminSection
      parentId={bankSampahId}
      pengurus={{ state: pengurusBankSampah, max: MAX_PENGURUS_BANK_SAMPAH, judul: 'Struktur Pengurus' }}
      galeri={{
        state: fotoKegiatanBankSampah,
        max: MAX_FOTO_KEGIATAN_BANK_SAMPAH,
        deskripsi: 'Foto kegiatan bank sampah, tampil di tab Dokumentasi pada halaman publik. Foto yang dihapus tidak bisa dipulihkan.',
      }}
    />
  );
}
