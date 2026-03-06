'use client';

import pengelolaanSampahState from '@/app/admin/(dashboard)/_state/lingkungan/pengelolaan-sampah';
import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

const LeafletMap = dynamic(() => import('@/app/admin/(dashboard)/_com/leafletMapCreate'), { ssr: false });

function CreateKeteranganBankSampahTerdekat() {
  const keteranganState = useProxy(pengelolaanSampahState.keteranganSampah)
  const router = useRouter();

  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      keteranganState.create.form.name?.trim() !== '' &&
      keteranganState.create.form.alamat?.trim() !== '' &&
      keteranganState.create.form.namaTempatMaps?.trim() !== '' &&
      markerPosition !== null
    );
  };

  const resetForm = () => {
    keteranganState.create.form = {
      name: "",
      alamat: "",
      namaTempatMaps: "",
      lat: 0,
      lng: 0,
    }
    setMarkerPosition(null)
  }
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!keteranganState.create.form.name) {
        return toast.error('Nama bank sampah harus diisi');
      }

      if (markerPosition) {
        keteranganState.create.form.lat = markerPosition.lat;
        keteranganState.create.form.lng = markerPosition.lng;
      } else {
        return toast.error('Silakan pilih lokasi di peta');
      }

      await keteranganState.create.create();
      toast.success('Data bank sampah berhasil ditambahkan');
      resetForm();
      router.push("/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat");
    } catch (error) {
      console.error('Error creating bank sampah:', error);
      toast.error('Gagal menambahkan data bank sampah');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
   <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Bank Sampah Terdekat
        </Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <TextInput
            label="Nama Bank Sampah"
            placeholder="Masukkan nama bank sampah"
            value={keteranganState.create.form.name}
            onChange={(e) => (keteranganState.create.form.name = e.target.value)}
            required
          />

          <TextInput
            label="Alamat"
            placeholder="Masukkan alamat lengkap"
            value={keteranganState.create.form.alamat}
            onChange={(e) => (keteranganState.create.form.alamat = e.target.value)}
            required
          />

          <TextInput
            label="Nama Tempat di Maps"
            placeholder="Masukkan nama tempat yang terdaftar di Google Maps"
            value={keteranganState.create.form.namaTempatMaps}
            onChange={(e) => (keteranganState.create.form.namaTempatMaps = e.target.value)}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Pilih Lokasi di Peta
            </Text>
            <Text fz="xs" c="dimmed" mb={4}>
              Klik pada peta untuk menandai lokasi
            </Text>
            <Box style={{ height: 300, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
              <LeafletMap
                onSelect={(pos) => setMarkerPosition(pos)}
                defaultCenter={{ lat: -8.65, lng: 115.2 }}
              />
            </Box>
            {markerPosition && (
              <Text fz="xs" mt={4} c="green">
                Lokasi dipilih: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
              </Text>
            )}
          </Box>

          <Group justify="right" mt="md">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
            </Button>

            {/* Tombol Simpan */}
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan'}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateKeteranganBankSampahTerdekat;

