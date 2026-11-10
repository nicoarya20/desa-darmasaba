'use client';
import ApiFetch from '@/lib/api-fetch';
import { MAX_GAMBAR_DOKUMENTASI } from '@/lib/program-inovasi';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  hapusDokumentasi,
  itemsDariImages,
  kumpulkanImageIds,
  resolveLogoId,
  tambahDokumentasi,
  type DokumentasiItem,
} from './dokumentasi.logic';

/** Data media tersimpan yang dimuat ke form edit (atau kosong untuk create). */
export type MediaAwal = {
  imageId: string | null;
  imageUrl: string | null;
  images: { id: string; link: string }[];
};

const MEDIA_KOSONG: MediaAwal = { imageId: null, imageUrl: null, images: [] };

/** Unggah satu gambar ke FileStorage dan kembalikan id-nya. */
async function uploadGambar(file: File): Promise<string | null> {
  const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
  return res.data?.data?.id ?? null;
}

/** State logo opsional + galeri dokumentasi form Program Inovasi; upload terjadi saat `unggah()`. */
export function useProgramInovasiMedia() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoId, setLogoId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [dokumentasi, setDokumentasi] = useState<DokumentasiItem[]>([]);
  // Object URL preview file lokal; dilepas saat dihapus / unmount agar memori tidak bocor.
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

  const pilihLogo = (file: File) => {
    lepasPreview(logoPreview);
    setLogoFile(file);
    setLogoPreview(buatPreview(file));
  };

  const hapusLogo = () => {
    lepasPreview(logoPreview);
    setLogoFile(null);
    setLogoId(null);
    setLogoPreview(null);
  };

  const tambahGambar = (files: File[]) => {
    const baru = files.map((file, i) => ({
      key: `baru-${Date.now()}-${i}-${file.name}`,
      file,
      preview: buatPreview(file),
    }));
    const hasil = tambahDokumentasi(dokumentasi, baru, MAX_GAMBAR_DOKUMENTASI);
    hasil.ditolak.forEach((item) => lepasPreview(item.preview));
    if (hasil.ditolak.length > 0) {
      toast.warn(`Maksimal ${MAX_GAMBAR_DOKUMENTASI} gambar dokumentasi, ${hasil.ditolak.length} gambar diabaikan`);
    }
    setDokumentasi(hasil.items);
  };

  const hapusGambar = (key: string) => {
    lepasPreview(dokumentasi.find((item) => item.key === key)?.preview);
    setDokumentasi(hapusDokumentasi(dokumentasi, key));
  };

  /** Isi ulang media dari data tersimpan (load edit / tombol Batal / Reset). */
  const muat = useCallback((awal: MediaAwal = MEDIA_KOSONG) => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current.clear();
    setLogoFile(null);
    setLogoId(awal.imageId);
    setLogoPreview(awal.imageUrl);
    setDokumentasi(itemsDariImages(awal.images));
  }, []);

  /** Unggah file baru lalu kembalikan id logo & galeri untuk dikirim ke API. */
  const unggah = async () => {
    const imageId = await resolveLogoId({ file: logoFile, existingId: logoId }, uploadGambar);
    const imageIds = await kumpulkanImageIds(dokumentasi, uploadGambar);
    return { imageId, imageIds };
  };

  return { logoPreview, pilihLogo, hapusLogo, dokumentasi, tambahGambar, hapusGambar, muat, unggah };
}
