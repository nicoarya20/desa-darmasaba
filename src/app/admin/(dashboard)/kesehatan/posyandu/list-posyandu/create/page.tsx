'use client';
import posyandustate from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu';
import { FORM_POSYANDU_KOSONG, type PosyanduForm } from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu.form';
import { hapusUnggahanYatim, unggahGambar } from '@/app/admin/(dashboard)/_state/konten-bersama/unggah-gambar';
import { toast } from 'react-toastify';
import { PosyanduGaleriInfo } from '../../_com/posyandu.galeri-admin';
import PosyanduFormPage from '../../_com/posyandu.form-page';

/** Unggah gambar utama lalu tambah posyandu; gambar dibersihkan bila penyimpanan gagal. */
async function tambahPosyandu(form: PosyanduForm, gambarBaru: File | null): Promise<boolean> {
  if (!gambarBaru) {
    toast.error('Gambar wajib dipilih');
    return false;
  }
  let imageId: string | null = null;
  try {
    imageId = await unggahGambar(gambarBaru);
    posyandustate.create.form = { ...form, imageId };
    const berhasil = await posyandustate.create.create();
    if (berhasil) return true;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Gagal menambahkan posyandu');
  }
  if (imageId) await hapusUnggahanYatim([imageId], 'tambah posyandu');
  return false;
}

/** Halaman admin tambah posyandu banjar. */
function CreatePosyandu() {
  return (
    <PosyanduFormPage judul="Tambah Posyandu" awal={FORM_POSYANDU_KOSONG} gambarUrl={null} onSimpan={tambahPosyandu}>
      <PosyanduGaleriInfo />
    </PosyanduFormPage>
  );
}

export default CreatePosyandu;
