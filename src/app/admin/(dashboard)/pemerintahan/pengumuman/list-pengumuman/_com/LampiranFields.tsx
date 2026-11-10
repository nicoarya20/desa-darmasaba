'use client';
import { MAX_DOKUMEN_PENGUMUMAN, MAX_GALERI_PENGUMUMAN } from '@/lib/pengumuman-lampiran';
import { Stack } from '@mantine/core';
import type { LampiranPengumumanApi } from '../_lib/useLampiranPengumuman';
import { DokumenPdfUploader } from './DokumenPdfUploader';
import { GaleriGambarUploader } from './GaleriGambarUploader';
import { GambarUtamaDropzone } from './GambarUtamaDropzone';

/** Bagian lampiran form create/edit pengumuman: gambar utama, galeri, dan dokumen PDF. */
export function LampiranFields({ lampiran }: { lampiran: LampiranPengumumanApi }) {
  return (
    <Stack gap="md">
      <GambarUtamaDropzone preview={lampiran.gambar.preview} onSelect={lampiran.pilihGambar} onRemove={lampiran.hapusGambar} />
      <GaleriGambarUploader
        items={lampiran.galeri}
        max={MAX_GALERI_PENGUMUMAN}
        onAdd={lampiran.tambahGaleri}
        onRemove={lampiran.hapusGaleri}
      />
      <DokumenPdfUploader
        items={lampiran.dokumen}
        max={MAX_DOKUMEN_PENGUMUMAN}
        onAdd={lampiran.tambahDokumen}
        onRemove={lampiran.hapusDokumen}
      />
    </Stack>
  );
}
