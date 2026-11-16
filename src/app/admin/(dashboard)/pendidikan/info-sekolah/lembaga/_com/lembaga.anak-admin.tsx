'use client'
import DaftarAnakAdminSection from '@/app/admin/(dashboard)/_com/konten-bersama/daftar-anak.admin-section';
import { fotoKegiatanLembaga, pengurusLembaga } from '@/app/admin/(dashboard)/_state/pendidikan/infoSekolahPaud/lembaga.anak.state';
import { MAX_FOTO_KEGIATAN_LEMBAGA, MAX_PENGURUS_LEMBAGA } from '@/lib/lembaga-pendidikan/lembaga.validation';

/** Section admin struktur organisasi (opsional) + foto kegiatan satu lembaga (disimpan langsung per aksi). */
export default function LembagaAnakAdmin({ lembagaId }: { lembagaId: string }) {
  return (
    <DaftarAnakAdminSection
      parentId={lembagaId}
      pengurus={{ state: pengurusLembaga, max: MAX_PENGURUS_LEMBAGA, judul: 'Struktur Organisasi (opsional)' }}
      galeri={{
        state: fotoKegiatanLembaga,
        max: MAX_FOTO_KEGIATAN_LEMBAGA,
        deskripsi: 'Foto kegiatan sekolah, tampil di halaman detail sekolah publik. Foto yang dihapus tidak bisa dipulihkan.',
      }}
    />
  );
}
