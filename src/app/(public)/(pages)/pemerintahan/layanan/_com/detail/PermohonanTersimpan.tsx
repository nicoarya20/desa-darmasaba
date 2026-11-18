import colors from '@/con/colors';
import { Button, Stack, Text } from '@mantine/core';
import { LAYANAN_DETAIL_TEXT as T } from './layanan-detail.text';

type Props = { waHref: string | null; onClose: () => void };

/**
 * Isi modal setelah permohonan tersimpan: tautan biasa ke WhatsApp petugas (bukan window.open setelah await,
 * yang diblokir Safari iPhone) dan tombol tutup.
 */
export function PermohonanTersimpan({ waHref, onClose }: Props) {
  return (
    <Stack gap="md" role="status">
      <Text fw={700} fz={20}>
        {T.tersimpanTitle}
      </Text>
      <Text>{T.tersimpanText}</Text>
      {waHref ? (
        <Button
          component="a"
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          size="md"
          radius="xl"
          // Modal dirender di portal (di luar akar halaman), jadi variabel --brand tidak terwarisi.
          bg={colors['blue-button']}
        >
          {T.lanjutWa}
        </Button>
      ) : null}
      <Button variant="default" size="md" radius="xl" onClick={onClose}>
        {T.tutup}
      </Button>
    </Stack>
  );
}
