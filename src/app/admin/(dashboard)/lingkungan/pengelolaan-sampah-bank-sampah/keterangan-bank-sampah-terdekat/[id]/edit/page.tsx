/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import pengelolaanSampahState from '@/app/admin/(dashboard)/_state/lingkungan/pengelolaan-sampah';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

const LeafletMapEdit = dynamic(() => import('@/app/admin/(dashboard)/_com/leafletMapEdit'), { ssr: false });

function EditKeteranganBankSampahTerdekat() {
  const keteranganState = useProxy(pengelolaanSampahState.keteranganSampah)
  const router = useRouter();
  const params = useParams()
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    alamat: '',
    namaTempatMaps: '',
    lat: 0,
    lng: 0,
  })

  useEffect(() => {
    const loadKeteranganBankSampahTerdekat = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await keteranganState.edit.load(id);
        if (data) {
          keteranganState.edit.id = id;
          keteranganState.edit.form = {
            name: data.name,
            alamat: data.alamat,
            namaTempatMaps: data.namaTempatMaps,
            lat: data.lat,
            lng: data.lng,
          };

          setFormData({
            name: data.name,
            alamat: data.alamat,
            namaTempatMaps: data.namaTempatMaps,
            lat: data.lat,
            lng: data.lng,
          });

          setMarkerPosition({ lat: data.lat, lng: data.lng });
        }
      } catch (error) {
        console.error("Error loading pengelolaan sampah:", error);
        toast.error("Gagal memuat data pengelolaan sampah");
      }
    }

    loadKeteranganBankSampahTerdekat();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        return toast.error('Nama bank sampah harus diisi');
      }
      if (!formData.alamat.trim()) {
        return toast.error('Alamat harus diisi');
      }
      if (!formData.namaTempatMaps.trim()) {
        return toast.error('Nama tempat di Maps harus diisi');
      }
      if (!markerPosition) {
        return toast.error('Silakan pilih lokasi di peta');
      }

      keteranganState.edit.form = {
        ...keteranganState.edit.form,
        name: formData.name.trim(),
        alamat: formData.alamat.trim(),
        namaTempatMaps: formData.namaTempatMaps.trim(),
        lat: markerPosition.lat,
        lng: markerPosition.lng,
      };
      
      await keteranganState.edit.update();
      toast.success('Data bank sampah berhasil diperbarui');
      keteranganState.findUnique.data = null;
      router.push("/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat");
    } catch (error) {
      console.error("Error updating pengelolaan sampah:", error);
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui data bank sampah');
    }
  }
  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" color="blue" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Bank Sampah Terdekat
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
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <TextInput
            label="Alamat"
            placeholder="Masukkan alamat lengkap"
            value={formData.alamat}
            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
            required
          />

          <TextInput
            label="Nama Tempat di Maps"
            placeholder="Masukkan nama tempat yang terdaftar di Google Maps"
            value={formData.namaTempatMaps}
            onChange={(e) => setFormData({ ...formData, namaTempatMaps: e.target.value })}
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
              <LeafletMapEdit
                key={markerPosition?.lat ?? 'default'}
                initialPosition={markerPosition || { lat: -8.65, lng: 115.2 }}
                onChange={(pos) => {
                  setMarkerPosition(pos);
                  setFormData(prev => ({
                    ...prev,
                    lat: pos.lat,
                    lng: pos.lng,
                  }));
                }}
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
              onClick={handleSubmit}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKeteranganBankSampahTerdekat;
