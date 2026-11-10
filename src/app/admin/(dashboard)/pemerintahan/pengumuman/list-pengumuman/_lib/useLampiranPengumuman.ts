'use client';
import ApiFetch from '@/lib/api-fetch';
import {
  MAX_DOKUMEN_PENGUMUMAN,
  MAX_GALERI_PENGUMUMAN,
  type PengumumanFile,
} from '@/lib/pengumuman-lampiran';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  dokumenDariApi,
  galeriDariApi,
  kumpulkanLampiran,
  tambahTerbatas,
  type DokumenItem,
  type GaleriItem,
  type GambarUtama,
} from './lampiran.logic';

/** Lampiran tersimpan yang dimuat ke form edit (kosong untuk create). */
export type LampiranAwal = {
  image: PengumumanFile | null;
  images: PengumumanFile[];
  dokumen: PengumumanFile[];
};

const LAMPIRAN_KOSONG: LampiranAwal = { image: null, images: [], dokumen: [] };
const GAMBAR_KOSONG: GambarUtama = { id: null, file: null, preview: null };

/** Unggah satu berkas ke FileStorage (MinIO) lewat endpoint upload admin yang sudah ada. */
async function uploadBerkas(file: File): Promise<string | null> {
  const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
  return res.data?.data?.id ?? null;
}

/** State gambar utama + galeri + dokumen PDF form Pengumuman; unggah terjadi saat `unggah()`. */
export function useLampiranPengumuman() {
  const [gambar, setGambar] = useState<GambarUtama>(GAMBAR_KOSONG);
  const [galeri, setGaleri] = useState<GaleriItem[]>([]);
  const [dokumen, setDokumen] = useState<DokumenItem[]>([]);
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

  const pilihGambar = (file: File) => {
    lepasPreview(gambar.preview);
    setGambar({ id: null, file, preview: buatPreview(file) });
  };

  const hapusGambar = () => {
    lepasPreview(gambar.preview);
    setGambar(GAMBAR_KOSONG);
  };

  const tambahGaleri = (files: File[]) => {
    const baru = files.map((file, i) => ({ key: `baru-${Date.now()}-${i}-${file.name}`, file, preview: buatPreview(file) }));
    const hasil = tambahTerbatas(galeri, baru, MAX_GALERI_PENGUMUMAN);
    hasil.ditolak.forEach((item) => lepasPreview(item.preview));
    if (hasil.ditolak.length > 0) {
      toast.warn(`Maksimal ${MAX_GALERI_PENGUMUMAN} gambar galeri, ${hasil.ditolak.length} gambar diabaikan`);
    }
    setGaleri(hasil.items);
  };

  const hapusGaleri = (key: string) => {
    lepasPreview(galeri.find((item) => item.key === key)?.preview);
    setGaleri(galeri.filter((item) => item.key !== key));
  };

  const tambahDokumen = (files: File[]) => {
    const baru: DokumenItem[] = files.map((file, i) => ({
      key: `baru-${Date.now()}-${i}-${file.name}`,
      nama: file.name,
      size: file.size,
      file,
      preview: buatPreview(file),
    }));
    const hasil = tambahTerbatas(dokumen, baru, MAX_DOKUMEN_PENGUMUMAN);
    hasil.ditolak.forEach((item) => lepasPreview(item.preview));
    if (hasil.ditolak.length > 0) {
      toast.warn(`Maksimal ${MAX_DOKUMEN_PENGUMUMAN} dokumen, ${hasil.ditolak.length} dokumen diabaikan`);
    }
    setDokumen(hasil.items);
  };

  const hapusDokumen = (key: string) => {
    lepasPreview(dokumen.find((item) => item.key === key)?.preview);
    setDokumen(dokumen.filter((item) => item.key !== key));
  };

  /** Isi ulang dari data tersimpan (load edit / Batal / Reset). */
  const muat = useCallback((awal: LampiranAwal = LAMPIRAN_KOSONG) => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current.clear();
    setGambar(awal.image ? { id: awal.image.id, file: null, preview: awal.image.link } : GAMBAR_KOSONG);
    setGaleri(galeriDariApi(awal.images));
    setDokumen(dokumenDariApi(awal.dokumen));
  }, []);

  /** Unggah berkas baru lalu kembalikan `imageId`, `imageIds`, `dokumenIds` untuk body API. */
  const unggah = () => kumpulkanLampiran({ gambar, galeri, dokumen }, uploadBerkas);

  return {
    gambar,
    pilihGambar,
    hapusGambar,
    galeri,
    tambahGaleri,
    hapusGaleri,
    dokumen,
    tambahDokumen,
    hapusDokumen,
    muat,
    unggah,
  };
}

/** Nilai kembalian hook, untuk props komponen form lampiran. */
export type LampiranPengumumanApi = ReturnType<typeof useLampiranPengumuman>;
