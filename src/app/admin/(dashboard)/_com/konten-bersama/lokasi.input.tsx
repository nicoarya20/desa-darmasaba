'use client'
import { linkGoogleMaps, PUSAT_PETA_DEFAULT, type Koordinat } from '@/lib/konten-bersama/lokasi.logic';
import { Anchor, Box, Text, TextInput } from '@mantine/core';
import dynamic from 'next/dynamic';

const LeafletMapEdit = dynamic(() => import('@/app/admin/(dashboard)/_com/leafletMapEdit'), { ssr: false });

type Props = {
  koordinat: Koordinat | null;
  onKoordinatChange: (koordinat: Koordinat) => void;
  linkMaps: string;
  onLinkMapsChange: (link: string) => void;
  /** Pesan error link (dari validasi form), bila ada. */
  linkError?: string | null;
};

/**
 * Input lokasi (semua domain): pilih titik di peta + link Google Maps opsional (mis. link pendek
 * `maps.app.goo.gl/...` dari desa). Tanpa link, tombol publik memakai rute ke titik peta.
 */
export default function LokasiInput({ koordinat, onKoordinatChange, linkMaps, onLinkMapsChange, linkError }: Props) {
  const tujuan = linkGoogleMaps(linkMaps.trim() || null, koordinat);
  return (
    <Box data-testid="lokasi-input">
      <Text fw="bold" fz="sm" mb={6}>Pilih Lokasi di Peta</Text>
      <Text fz="xs" c="dimmed" mb={4}>Klik pada peta untuk menandai lokasi</Text>
      <Box style={{ height: 300, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
        <LeafletMapEdit initialPosition={koordinat ?? PUSAT_PETA_DEFAULT} onChange={onKoordinatChange} />
      </Box>
      {koordinat && (
        <Text fz="xs" mt={4} c="green">
          Lokasi dipilih: {koordinat.lat.toFixed(6)}, {koordinat.lng.toFixed(6)}
        </Text>
      )}
      <TextInput
        mt="sm"
        label="Link Google Maps"
        description="Opsional. Tempel link dari tombol Bagikan di Google Maps (mis. https://maps.app.goo.gl/...)."
        placeholder="https://maps.app.goo.gl/..."
        value={linkMaps}
        error={linkError ?? undefined}
        onChange={(e) => onLinkMapsChange(e.currentTarget.value)}
      />
      {tujuan && (
        <Anchor href={tujuan} target="_blank" rel="noopener noreferrer" fz="xs" mt={4} display="inline-block">
          Uji tombol &quot;Buka di Google Maps&quot;
        </Anchor>
      )}
    </Box>
  );
}
