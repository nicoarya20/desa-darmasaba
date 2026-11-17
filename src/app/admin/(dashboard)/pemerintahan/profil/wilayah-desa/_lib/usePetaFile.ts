'use client';
import { unggahGambar } from '@/app/admin/(dashboard)/_state/konten-bersama/unggah-gambar';
import { jenisFilePeta, type WilayahPetaFile } from '@/lib/wilayah-desa';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { periksaFilePilihan, petaFileDariApi, resolvePetaFileId, type PetaFileForm } from './peta-file.logic';

type HasilUnggah = { ok: true; petaFileId: string | null | undefined } | { ok: false };

/** State field "File Peta Wilayah"; unggah terjadi saat `unggah()` (dipanggil tombol Simpan). */
export function usePetaFile() {
  const [awal, setAwal] = useState<WilayahPetaFile | null>(null);
  const [peta, setPeta] = useState<PetaFileForm | null>(null);
  const [mengunggah, setMengunggah] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Object URL file lokal; dilepas saat diganti / dimuat ulang / unmount agar memori tidak bocor.
  const objectUrl = useRef<string | null>(null);

  const lepasPreview = () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
  };

  useEffect(() => lepasPreview, []);

  const tolak = (pesan: string) => {
    setError(pesan);
    toast.error(pesan);
  };

  const pilih = (file: File) => {
    const pesan = periksaFilePilihan(file);
    if (pesan) return tolak(pesan);
    lepasPreview();
    objectUrl.current = URL.createObjectURL(file);
    setError(null);
    setPeta({ id: null, file, link: objectUrl.current, nama: file.name, size: file.size, jenis: jenisFilePeta(file.type) });
  };

  const hapus = () => {
    lepasPreview();
    setError(null);
    setPeta(null);
  };

  /** Isi dari data tersimpan (load awal / setelah Simpan sukses). */
  const muat = useCallback((file: WilayahPetaFile | null) => {
    lepasPreview();
    setAwal(file);
    setPeta(petaFileDariApi(file));
    setError(null);
  }, []);

  /** Batal: kembali ke file tersimpan terakhir. */
  const reset = () => muat(awal);

  /** Unggah file baru (bila ada) lalu kembalikan `petaFileId` untuk body API. */
  const unggah = async (): Promise<HasilUnggah> => {
    setMengunggah(true);
    setError(null);
    try {
      const petaFileId = await resolvePetaFileId(awal?.id ?? null, peta, unggahGambar);
      // Simpan gagal setelah unggah → percobaan berikutnya memakai id ini, tidak mengunggah ulang.
      if (peta?.file && petaFileId) setPeta({ ...peta, id: petaFileId, file: null });
      return { ok: true, petaFileId };
    } catch (e) {
      tolak((e as Error).message);
      return { ok: false };
    } finally {
      setMengunggah(false);
    }
  };

  /** File peta berbeda dari yang tersimpan (belum disimpan). */
  const baru = peta !== null && (peta.file !== null || peta.id !== (awal?.id ?? null));

  return { peta, baru, error, mengunggah, pilih, tolak, hapus, muat, reset, unggah };
}

export type PetaFileApi = ReturnType<typeof usePetaFile>;
