'use client'

import pengelolaanSampahState from '@/app/admin/(dashboard)/_state/lingkungan/pengelolaan-sampah';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

const LeafletMap = dynamic(() => import('@/app/admin/(dashboard)/_com/leafletMapCreate'), { ssr: false });

function CreateKeteranganBankSampahTerdekat() {
  const keteranganState = useProxy(pengelolaanSampahState.keteranganSampah)
  const router = useRouter();

  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

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
    if (markerPosition) {
      keteranganState.create.form.lat = markerPosition.lat
      keteranganState.create.form.lng = markerPosition.lng
    }
    await keteranganState.create.create()
    resetForm()
    router.push("/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat")
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
          <Title order={4}>Create Keterangan Bank Sampah Terdekat</Title>
          <TextInput
            value={keteranganState.create.form.name}
            onChange={(val) => keteranganState.create.form.name = val.target.value}
            label={<Text fw="bold" fz="sm">Nama Bank Sampah Terdekat</Text>}
            placeholder='Masukkan nama Bank Sampah Terdekat'
          />

          <TextInput
            value={keteranganState.create.form.alamat}
            onChange={(val) => keteranganState.create.form.alamat = val.target.value}
            label={<Text fw="bold" fz="sm">Alamat</Text>}
            placeholder='Masukkan alamat Bank Sampah'
          />

          <TextInput
            value={keteranganState.create.form.namaTempatMaps}
            onChange={(val) => keteranganState.create.form.namaTempatMaps = val.target.value}
            label={<Text fw="bold" fz="sm">Nama Tempat Maps</Text>}
            placeholder='Masukkan nama tempat maps Bank Sampah'
          />

          <Box>
            <Text fw="bold" fz="sm">Pilih Lokasi di Peta</Text>
            <Box style={{ height: 300, width: '100%' }}>
              <LeafletMap
                onSelect={(pos) => setMarkerPosition(pos)}
                defaultCenter={{ lat: -8.65, lng: 115.2 }}
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

export default CreateKeteranganBankSampahTerdekat;

