'use client'
import ApiFetch from '@/lib/api-fetch';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { STRUKTUR_ADMIN_TEXT as T } from './struktur-admin.text';

/** Unggah satu foto ke FileStorage; kembalikan id-nya. Gagal → Error berkonteks (status HTTP). */
async function unggahFoto(file: File): Promise<string> {
  const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
  const id = res.data?.data?.id;
  if (res.status !== 200 || !id) throw new Error(`Unggah foto "${file.name}" gagal (status ${res.status})`);
  return id;
}

/**
 * Foto pegawai (opsional) di form tambah/edit: pilih file → pratinjau lokal; `simpan` mengunggah file baru (bila
 * ada) lalu menjalankan submit form. Setelah terunggah file dilepas, jadi bila simpan gagal dan diulang foto
 * tidak terunggah dua kali (id-nya sudah ada di form).
 */
export function useFotoPegawai(initialPreview: string | null = null) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialPreview);
  const [submitting, setSubmitting] = useState(false);

  const pick = useCallback((next: File) => {
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }, []);
  /** Kosongkan foto (form edit: imageId dikirim kosong → server menghapus foto lama). */
  const remove = useCallback(() => {
    setFile(null);
    setPreview(null);
  }, []);
  /** Pratinjau foto tersimpan (form edit setelah data dimuat). */
  const showExisting = useCallback((link: string | null) => {
    setFile(null);
    setPreview(link);
  }, []);

  /** Unggah foto baru (bila ada) → `setImageId` → `submit`; true bila submit berhasil. */
  const simpan = async (setImageId: (id: string) => void, submit: () => Promise<boolean>): Promise<boolean> => {
    setSubmitting(true);
    try {
      if (file) {
        setImageId(await unggahFoto(file));
        setFile(null);
      }
      return await submit();
    } catch (error) {
      console.error('[strukturOrganisasi.foto] Gagal menyimpan pegawai dengan foto baru:', error);
      toast.error(T.pegawai.uploadGagal);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { preview, pick, remove, showExisting, simpan, submitting };
}
