'use client'
import { linkGoogleMaps, type Koordinat } from '@/lib/konten-bersama/lokasi.logic';
import { Anchor, Box, TextInput } from '@mantine/core';
import TitikPetaInput from './titik-peta.input';

type Props = {
  koordinat: Koordinat | null;
  onKoordinatChange: (koordinat: Koordinat) => void;
  linkMaps: string;
  onLinkMapsChange: (link: string) => void;
  /** Pesan error link (dari validasi form), bila ada. */
  linkError?: string | null;
  /** Bila diisi, titik bisa dikosongkan (lokasi opsional, mis. sekolah yang hanya punya link Google Maps). */
  onKoordinatHapus?: () => void;
  /** Alamat dari form, dipakai sebagai kata kunci awal "Cari di peta". */
  alamat?: string;
};

/**
 * Input lokasi (semua domain): titik peta (cari alamat / lintang-bujur / klik) + link Google Maps opsional
 * (mis. link pendek `maps.app.goo.gl/...` dari desa). Tanpa link, tombol publik memakai rute ke titik peta.
 */
export default function LokasiInput({ koordinat, onKoordinatChange, linkMaps, onLinkMapsChange, linkError, onKoordinatHapus, alamat }: Props) {
  const tujuan = linkGoogleMaps(linkMaps.trim() || null, koordinat);
  return (
    <Box data-testid="lokasi-input">
      <TitikPetaInput koordinat={koordinat} onKoordinatChange={onKoordinatChange} alamat={alamat} onKoordinatHapus={onKoordinatHapus} />
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
