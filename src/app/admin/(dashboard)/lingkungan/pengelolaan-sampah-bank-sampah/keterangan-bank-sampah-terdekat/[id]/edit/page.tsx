/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import pengelolaanSampahState from '@/app/admin/(dashboard)/_state/lingkungan/pengelolaan-sampah';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
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
      keteranganState.edit.form = {
        ...keteranganState.edit.form,
        name: formData.name.trim(),
        alamat: formData.alamat.trim(),
        namaTempatMaps: formData.namaTempatMaps.trim(),
        lat: formData.lat,
        lng: formData.lng,
      }
      await keteranganState.edit.update();
      keteranganState.findUnique.data = null;
      router.push("/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat");
    } catch (error) {
      console.error("Error updating pengelolaan sampah:", error);
      toast.error("Gagal memuat data pengelolaan sampah");
    }
  }
  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Edit Keterangan Bank Sampah Terdekat</Title>
          <TextInput
            value={formData.name}
            onChange={(val) => setFormData({ ...formData, name: val.target.value })}
            label={<Text fw="bold" fz="sm">Nama Bank Sampah Terdekat</Text>}
            placeholder='Masukkan nama Bank Sampah Terdekat'
          />

          <TextInput
            value={formData.alamat}
            onChange={(val) => setFormData({ ...formData, alamat: val.target.value })}
            label={<Text fw="bold" fz="sm">Alamat</Text>}
            placeholder='Masukkan alamat Bank Sampah'
          />

          <TextInput
            value={formData.namaTempatMaps}
            onChange={(val) => setFormData({ ...formData, namaTempatMaps: val.target.value })}
            label={<Text fw="bold" fz="sm">Nama Tempat Maps</Text>}
            placeholder='Masukkan nama tempat maps Bank Sampah'
          />

          <Box>
            <Text fw="bold" fz="sm">Pilih Lokasi di Peta</Text>
            <Box style={{ height: 300, width: '100%' }}>
              <LeafletMapEdit
                key={markerPosition?.lat ?? 'default'}
                initialPosition={markerPosition || { lat: -8.65, lng: 115.2 }}
                onChange={(pos) => {
                  setMarkerPosition(pos);
                  setFormData((prev) => ({
                    ...prev,
                    lat: pos.lat,
                    lng: pos.lng,
                  }));
                }}
              />
            </Box>
          </Box>
          <Group>
            <Button onClick={handleSubmit} bg={colors['blue-button']}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKeteranganBankSampahTerdekat;
