'use client'
import colors from '@/con/colors';
import { parseKoordinatTeks, PUSAT_PETA_DEFAULT, type Koordinat } from '@/lib/konten-bersama/lokasi.logic';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { cariTitikAlamat, cekSumbuTeks, kueriCariValid, type HasilGeocode } from './titik-peta.logic';

const LeafletMapEdit = dynamic(() => import('@/app/admin/(dashboard)/_com/leafletMapEdit'), { ssr: false });

type Props = {
  koordinat: Koordinat | null;
  onKoordinatChange: (koordinat: Koordinat) => void;
  /** Alamat dari form pemanggil; mengisi kolom cari selama admin belum mengetik sendiri. */
  alamat?: string;
  /** Bila diisi, titik bisa dikosongkan. */
  onKoordinatHapus?: () => void;
};

const formatSumbu = (n: number) => String(Number(n.toFixed(6)));
const kunciKoordinat = (k: Koordinat | null) => (k ? `${k.lat},${k.lng}` : '');

/** Titik lokasi (semua domain): cari dari alamat, isi/tempel lintang-bujur, atau klik peta. */
export default function TitikPetaInput({ koordinat, onKoordinatChange, alamat, onKoordinatHapus }: Props) {
  const [kueriManual, setKueriManual] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(false);
  const [pesanCari, setPesanCari] = useState<string | null>(null);
  const [pilihan, setPilihan] = useState<HasilGeocode[]>([]);
  const [terpilih, setTerpilih] = useState<HasilGeocode | null>(null);

  const [teksLat, setTeksLat] = useState(koordinat ? formatSumbu(koordinat.lat) : '');
  const [teksLng, setTeksLng] = useState(koordinat ? formatSumbu(koordinat.lng) : '');
  const [errorLat, setErrorLat] = useState<string | null>(null);
  const [errorLng, setErrorLng] = useState<string | null>(null);

  // Titik berubah dari luar (klik peta, hasil cari, reset) → samakan kolom, kecuali isian sudah bernilai sama
  // (agar ketikan seperti "-8." tidak ditimpa saat admin mengetik).
  const kunci = kunciKoordinat(koordinat);
  const [kunciTerakhir, setKunciTerakhir] = useState(kunci);
  if (kunci !== kunciTerakhir) {
    setKunciTerakhir(kunci);
    setErrorLat(null);
    setErrorLng(null);
    if (!koordinat) {
      setTeksLat('');
      setTeksLng('');
    } else {
      if (cekSumbuTeks(teksLat, 'lintang').nilai !== koordinat.lat) setTeksLat(formatSumbu(koordinat.lat));
      if (cekSumbuTeks(teksLng, 'bujur').nilai !== koordinat.lng) setTeksLng(formatSumbu(koordinat.lng));
    }
  }

  const kueri = kueriManual ?? alamat ?? '';
  const bisaCari = kueriCariValid(kueri) && !memuat;
  const hasilTerpakai = terpilih && koordinat && terpilih.lat === koordinat.lat && terpilih.lng === koordinat.lng ? terpilih : null;

  function pakaiHasil(hasil: HasilGeocode) {
    setPilihan([]);
    setTerpilih(hasil);
    onKoordinatChange({ lat: hasil.lat, lng: hasil.lng });
  }

  async function cari() {
    if (!bisaCari) return;
    setMemuat(true);
    setPesanCari(null);
    setPilihan([]);
    const hasil = await cariTitikAlamat(kueri);
    setMemuat(false);
    if (!hasil.ok) setPesanCari(hasil.pesan);
    else if (hasil.hasil.length === 1) pakaiHasil(hasil.hasil[0]);
    else setPilihan(hasil.hasil);
  }

  function ubahSumbu(sumbu: 'lintang' | 'bujur', teks: string) {
    const pasangan = parseKoordinatTeks(teks);
    if (pasangan) {
      setTeksLat(formatSumbu(pasangan.lat));
      setTeksLng(formatSumbu(pasangan.lng));
      setErrorLat(null);
      setErrorLng(null);
      onKoordinatChange(pasangan);
      return;
    }
    const lat = sumbu === 'lintang' ? teks : teksLat;
    const lng = sumbu === 'bujur' ? teks : teksLng;
    const cekLat = cekSumbuTeks(lat, 'lintang');
    const cekLng = cekSumbuTeks(lng, 'bujur');
    if (sumbu === 'lintang') {
      setTeksLat(teks);
      setErrorLat(cekLat.error);
    } else {
      setTeksLng(teks);
      setErrorLng(cekLng.error);
    }
    if (cekLat.nilai !== null && cekLng.nilai !== null) onKoordinatChange({ lat: cekLat.nilai, lng: cekLng.nilai });
  }

  return (
    <Box data-testid="titik-peta-input">
      <Text fw="bold" fz="sm" mb={2}>Titik Lokasi di Peta</Text>
      <Text fz="xs" c="dimmed" mb={6}>Cari dari alamat, isi lintang & bujur, atau klik pada peta untuk menandai lokasi.</Text>

      <Group gap="xs" align="flex-start" wrap="nowrap">
        <TextInput
          style={{ flex: 1 }}
          aria-label="Cari alamat/tempat"
          placeholder="Cari alamat/tempat, mis. Balai Desa Darmasaba"
          value={kueri}
          maxLength={200}
          onChange={(e) => setKueriManual(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            void cari();
          }}
        />
        <Button
          variant="light"
          color={colors['blue-button']}
          leftSection={<IconSearch size={16} />}
          loading={memuat}
          disabled={!kueriCariValid(kueri)}
          onClick={() => void cari()}
        >
          Cari di peta
        </Button>
      </Group>

      {pesanCari && <Text fz="xs" c="red" mt={4}>{pesanCari}</Text>}
      {pilihan.length > 0 && (
        <Paper withBorder radius="md" p={4} mt={6}>
          <Text fz="xs" c="dimmed" px={8} pt={4}>Pilih lokasi yang sesuai:</Text>
          <Stack gap={0}>
            {pilihan.map((h) => (
              <Button
                key={`${h.lat},${h.lng},${h.label}`}
                variant="subtle"
                color="dark"
                justify="flex-start"
                h="auto"
                py={6}
                styles={{ label: { whiteSpace: 'normal', textAlign: 'left', fontWeight: 400 } }}
                onClick={() => pakaiHasil(h)}
              >
                {h.label}
              </Button>
            ))}
          </Stack>
        </Paper>
      )}
      {hasilTerpakai && <Text fz="xs" c="dimmed" mt={4}>Titik dari pencarian: {hasilTerpakai.label}</Text>}
      {(pilihan.length > 0 || hasilTerpakai) && <Text fz={10} c="dimmed" mt={2}>Sumber: OpenStreetMap</Text>}

      <SimpleGrid cols={2} spacing="xs" mt="sm">
        <TextInput
          label="Lintang"
          placeholder="-8.571234"
          inputMode="decimal"
          value={teksLat}
          error={errorLat ?? undefined}
          onChange={(e) => ubahSumbu('lintang', e.currentTarget.value)}
        />
        <TextInput
          label="Bujur"
          placeholder="115.192345"
          inputMode="decimal"
          value={teksLng}
          error={errorLng ?? undefined}
          onChange={(e) => ubahSumbu('bujur', e.currentTarget.value)}
        />
      </SimpleGrid>
      <Text fz="xs" c="dimmed" mt={4}>
        Bisa tempel langsung dari Google Maps (klik kanan titik → salin, mis. -8.571234, 115.192345) atau link Google Maps yang memuat koordinat.
      </Text>

      <Box mt="sm" style={{ height: 300, width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <LeafletMapEdit initialPosition={koordinat ?? PUSAT_PETA_DEFAULT} onChange={onKoordinatChange} />
      </Box>
      {koordinat && (
        <Group gap="xs" mt={4}>
          <Text fz="xs" c="green">
            Lokasi dipilih: {koordinat.lat.toFixed(6)}, {koordinat.lng.toFixed(6)}
          </Text>
          {onKoordinatHapus && (
            <Button variant="subtle" color="red" size="compact-xs" onClick={onKoordinatHapus}>
              Hapus titik
            </Button>
          )}
        </Group>
      )}
    </Box>
  );
}
