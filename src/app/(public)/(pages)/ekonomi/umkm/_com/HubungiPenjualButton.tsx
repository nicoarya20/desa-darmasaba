'use client';

import { Button, Text } from '@mantine/core';
import { IconBrandWhatsapp } from '@tabler/icons-react';

import { WA_PENJUAL_TIDAK_VALID, buildHubungiPenjualUrl, type HubungiPenjualInput } from '../_lib/pesanan';

export const HUBUNGI_PENJUAL_LABEL = 'Hubungi Penjual (WhatsApp)';

/**
 * Tombol pengganti "Pesan Sekarang" selama pesanan website nonaktif (`UMKM_PESANAN_TERCATAT`):
 * langsung membuka WhatsApp penjual tanpa mencatat pesanan atau mengurangi stok.
 */
export function HubungiPenjualButton({ kontak, umkmNama, produkNama }: HubungiPenjualInput) {
  const waUrl = buildHubungiPenjualUrl({ kontak, umkmNama, produkNama });
  const icon = <IconBrandWhatsapp size={18} />;

  if (!waUrl) {
    return (
      <>
        <Button color="green" leftSection={icon} disabled mt="sm">
          {HUBUNGI_PENJUAL_LABEL}
        </Button>
        <Text fz="xs" c="dimmed">
          {WA_PENJUAL_TIDAK_VALID}.
        </Text>
      </>
    );
  }

  return (
    <Button
      component="a"
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      color="green"
      leftSection={icon}
      mt="sm"
    >
      {HUBUNGI_PENJUAL_LABEL}
    </Button>
  );
}
