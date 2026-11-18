'use client'
import { GaleriGambarUploader } from '@/app/admin/(dashboard)/pemerintahan/pengumuman/list-pengumuman/_com/GaleriGambarUploader';
import { GambarUtamaDropzone } from '@/app/admin/(dashboard)/pemerintahan/pengumuman/list-pengumuman/_com/GambarUtamaDropzone';
import { MAX_FOTO_PROGRES } from '@/lib/kegiatan-pembangunan-foto';
import { Alert, Divider, Loader, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { FotoPembangunanApi } from '../_lib/useFotoPembangunan';
import { peringatanFotoNonPembangunan } from '../_lib/foto-pembangunan.logic';

/** Foto sebelum, foto sesudah, dan galeri progres — hanya untuk kegiatan kategori Pembangunan (semua opsional). */
export default function DokumentasiPembangunanFields({ api }: { api: FotoPembangunanApi }) {
  const { foto, mengunggah, error } = api;
  return (
    <Stack gap="md" data-dokumentasi-pembangunan>
      <Divider label={<Text fz="sm" fw={600}>Dokumentasi Pembangunan (opsional)</Text>} labelPosition="left" />
      <Text fz="xs" c="dimmed">
        Opsional. JPG/PNG/WebP, maks 5 MB per foto.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <GambarUtamaDropzone
          label="Foto Sebelum"
          alt="Pratinjau foto sebelum pembangunan"
          preview={foto.sebelum.preview}
          onSelect={api.pilihSebelum}
          onRemove={api.hapusSebelum}
          disabled={mengunggah}
        />
        <GambarUtamaDropzone
          label="Foto Sesudah"
          alt="Pratinjau foto sesudah pembangunan"
          preview={foto.sesudah.preview}
          onSelect={api.pilihSesudah}
          onRemove={api.hapusSesudah}
          disabled={mengunggah}
        />
      </SimpleGrid>

      <GaleriGambarUploader
        label="Galeri Progres"
        items={foto.galeri}
        max={MAX_FOTO_PROGRES}
        onAdd={api.tambahGaleri}
        onRemove={api.hapusGaleri}
        disabled={mengunggah}
      />

      {mengunggah && (
        <Group gap="xs" data-foto-mengunggah>
          <Loader size="xs" />
          <Text fz="xs" c="dimmed">Mengunggah foto...</Text>
        </Group>
      )}
      {error && (
        <Text fz="xs" c="red" role="alert" data-foto-error>
          {error}
        </Text>
      )}
    </Stack>
  );
}

/** Peringatan saat kategori bukan Pembangunan tetapi ada foto di form / tersimpan. */
export function PeringatanFotoNonPembangunan({ api }: { api: FotoPembangunanApi }) {
  const pesan = peringatanFotoNonPembangunan(api.adaFotoTersimpan, api.adaFotoDiForm);
  if (!pesan) return null;
  return (
    <Alert color="yellow" icon={<IconAlertTriangle size={16} />} data-foto-peringatan>
      {pesan}
    </Alert>
  );
}
