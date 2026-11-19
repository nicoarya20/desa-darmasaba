'use client'
import { GaleriGambarUploader } from '@/app/admin/(dashboard)/pemerintahan/pengumuman/list-pengumuman/_com/GaleriGambarUploader';
import { MAX_FOTO_PER_JENIS } from '@/lib/kegiatan-pembangunan-foto';
import { Alert, Divider, Loader, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { FotoPembangunanApi } from '../_lib/useFotoPembangunan';
import { peringatanFotoNonPembangunan } from '../_lib/foto-pembangunan.logic';

/** Foto sebelum dan foto sesudah (multi-foto, maks 5 per jenis) — hanya untuk kegiatan kategori Pembangunan (semua opsional). */
export default function DokumentasiPembangunanFields({ api }: { api: FotoPembangunanApi }) {
  const { foto, mengunggah, error } = api;
  return (
    <Stack gap="md" data-dokumentasi-pembangunan>
      <Divider label={<Text fz="sm" fw={600}>Dokumentasi Pembangunan (opsional)</Text>} labelPosition="left" />
      <Text fz="xs" c="dimmed">
        Opsional. Maks {MAX_FOTO_PER_JENIS} foto, JPG/PNG/WebP, maks 5 MB per foto.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <GaleriGambarUploader
          label="Foto Sebelum"
          items={foto.sebelum}
          max={MAX_FOTO_PER_JENIS}
          onAdd={api.tambahSebelum}
          onRemove={api.hapusSebelum}
          disabled={mengunggah}
        />
        <GaleriGambarUploader
          label="Foto Sesudah"
          items={foto.sesudah}
          max={MAX_FOTO_PER_JENIS}
          onAdd={api.tambahSesudah}
          onRemove={api.hapusSesudah}
          disabled={mengunggah}
        />
      </SimpleGrid>

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
