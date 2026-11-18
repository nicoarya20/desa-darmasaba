'use client';
import { unggahGambar } from '@/app/admin/(dashboard)/_state/konten-bersama/unggah-gambar';
import { MAX_FOTO_PROGRES } from '@/lib/kegiatan-pembangunan-foto';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  adaFotoDiForm,
  adaFotoTersimpan,
  FOTO_KOSONG,
  fotoDariApi,
  GAMBAR_KOSONG,
  tambahTerbatas,
  unggahFotoPembangunan,
  type FotoPembangunanAwal,
  type FotoPembangunanBody,
  type FotoPembangunanState,
} from './foto-pembangunan.logic';

type HasilUnggah = { ok: true; body: FotoPembangunanBody } | { ok: false };

/** State foto Dokumentasi Pembangunan form Kegiatan Desa; unggah terjadi saat `unggah()` (tombol Simpan). */
export function useFotoPembangunan() {
  const [foto, setFoto] = useState<FotoPembangunanState>(FOTO_KOSONG);
  const [awal, setAwal] = useState<FotoPembangunanAwal | null>(null);
  const [mengunggah, setMengunggah] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Object URL berkas lokal; dilepas saat dihapus / dimuat ulang / unmount agar memori tidak bocor.
  const objectUrls = useRef(new Set<string>());

  const buatPreview = (file: File) => {
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    return url;
  };
  const lepasPreview = (url: string | null | undefined) => {
    if (url && objectUrls.current.delete(url)) URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const pilih = (kunci: 'sebelum' | 'sesudah', file: File) => {
    lepasPreview(foto[kunci].preview);
    setError(null);
    setFoto({ ...foto, [kunci]: { id: null, file, preview: buatPreview(file) } });
  };

  const hapus = (kunci: 'sebelum' | 'sesudah') => {
    lepasPreview(foto[kunci].preview);
    setFoto({ ...foto, [kunci]: GAMBAR_KOSONG });
  };

  const tambahGaleri = (files: File[]) => {
    const baru = files.map((file, i) => ({ key: `baru-${Date.now()}-${i}-${file.name}`, file, preview: buatPreview(file) }));
    const hasil = tambahTerbatas(foto.galeri, baru, MAX_FOTO_PROGRES);
    hasil.ditolak.forEach((item) => lepasPreview(item.preview));
    if (hasil.ditolak.length > 0) {
      toast.warn(`Maksimal ${MAX_FOTO_PROGRES} foto progres, ${hasil.ditolak.length} foto diabaikan`);
    }
    setError(null);
    setFoto({ ...foto, galeri: hasil.items });
  };

  const hapusGaleri = (key: string) => {
    lepasPreview(foto.galeri.find((item) => item.key === key)?.preview);
    setFoto({ ...foto, galeri: foto.galeri.filter((item) => item.key !== key) });
  };

  /** Isi dari data tersimpan (load edit / Batal / Reset). */
  const muat = useCallback((data: FotoPembangunanAwal | null = null) => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current.clear();
    setAwal(data);
    setFoto(fotoDariApi(data));
    setError(null);
  }, []);

  /** Batal/Reset: kembali ke foto tersimpan terakhir (create: kosong). */
  const reset = () => muat(awal);

  /** Unggah foto baru (bila ada) lalu kembalikan body API foto. */
  const unggah = async (): Promise<HasilUnggah> => {
    setMengunggah(true);
    setError(null);
    try {
      const hasil = await unggahFotoPembangunan(foto, unggahGambar);
      setFoto(hasil.state);
      return { ok: true, body: hasil.body };
    } catch (e) {
      const pesan = (e as Error).message;
      setError(pesan);
      toast.error(pesan);
      return { ok: false };
    } finally {
      setMengunggah(false);
    }
  };

  return {
    foto,
    error,
    mengunggah,
    pilihSebelum: (file: File) => pilih('sebelum', file),
    hapusSebelum: () => hapus('sebelum'),
    pilihSesudah: (file: File) => pilih('sesudah', file),
    hapusSesudah: () => hapus('sesudah'),
    tambahGaleri,
    hapusGaleri,
    muat,
    reset,
    unggah,
    adaFotoTersimpan: adaFotoTersimpan(awal),
    adaFotoDiForm: adaFotoDiForm(foto),
  };
}

export type FotoPembangunanApi = ReturnType<typeof useFotoPembangunan>;
