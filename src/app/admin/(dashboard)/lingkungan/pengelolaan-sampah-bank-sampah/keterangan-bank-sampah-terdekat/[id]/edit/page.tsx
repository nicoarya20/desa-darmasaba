/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import pengelolaanSampahState from '@/app/admin/(dashboard)/_state/lingkungan/pengelolaan-sampah';
import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

const LeafletMapEdit = dynamic(() => import('@/app/admin/(dashboard)/_com/leafletMapEdit'), { ssr: false });

function EditKeteranganBankSampahTerdekat() {
  const keteranganState = useProxy(pengelolaanSampahState.keteranganSampah);
  const router = useRouter();
  const params = useParams();
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    alamat: '',
    namaTempatMaps: '',
    lat: 0,
    lng: 0,
  });

  const [originalData, setOriginalData] = useState({
    name: '',
    alamat: '',
    namaTempatMaps: '',
    lat: 0,
    lng: 0,
  });

  // Load data ketika component mount
  useEffect(() => {
    const loadKeterangan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await keteranganState.edit.load(id);
        if (data) {
          keteranganState.edit.id = id;

          // Update local formData dan markerPosition
          setFormData({
            name: data.name,
            alamat: data.alamat,
            namaTempatMaps: data.namaTempatMaps,
            lat: data.lat,
            lng: data.lng,
          });

          // simpan juga versi original
          setOriginalData({
            name: data.name,
            alamat: data.alamat,
            namaTempatMaps: data.namaTempatMaps,
            lat: data.lat,
            lng: data.lng,
          });
          setMarkerPosition({ lat: data.lat, lng: data.lng });
        }
      } catch (error) {
        console.error(error);
        toast.error('Gagal memuat data pengelolaan sampah');
      }
    };

    loadKeterangan();
  }, [params?.id]);

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      alamat: originalData.alamat,
      namaTempatMaps: originalData.namaTempatMaps,
      lat: originalData.lat,
      lng: originalData.lng,
    });
    setMarkerPosition({ lat: originalData.lat, lng: originalData.lng });
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!formData.name.trim()) return toast.error('Nama bank sampah harus diisi');
      if (!formData.alamat.trim()) return toast.error('Alamat harus diisi');
      if (!formData.namaTempatMaps.trim()) return toast.error('Nama tempat di Maps harus diisi');
      if (!markerPosition) return toast.error('Silakan pilih lokasi di peta');

      // Update global state hanya saat submit
      keteranganState.edit.form = {
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
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui data bank sampah');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
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
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
          <TextInput
            label="Alamat"
            placeholder="Masukkan alamat lengkap"
            value={formData.alamat}
            onChange={(e) => handleInputChange('alamat', e.target.value)}
            required
          />
          <TextInput
            label="Nama Tempat di Maps"
            placeholder="Masukkan nama tempat yang terdaftar di Google Maps"
            value={formData.namaTempatMaps}
            onChange={(e) => handleInputChange('namaTempatMaps', e.target.value)}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>Pilih Lokasi di Peta</Text>
            <Text fz="xs" c="dimmed" mb={4}>Klik pada peta untuk menandai lokasi</Text>
            <Box style={{ height: 300, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
              <LeafletMapEdit
                initialPosition={markerPosition || { lat: -8.65, lng: 115.2 }}
                onChange={(pos) => {
                  setMarkerPosition(pos);
                  handleInputChange('lat', pos.lat);
                  handleInputChange('lng', pos.lng);
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
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={handleResetForm}
            >
              Batal
            </Button>

            {/* Tombol Simpan */}
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
              {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan'}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKeteranganBankSampahTerdekat;
