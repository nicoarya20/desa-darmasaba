/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import layananonlineDesa from '@/app/admin/(dashboard)/_state/inovasi/layanan-online-desa';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function CreateJenisLayanan() {
  const router = useRouter();
  const statePasar = useProxy(layananonlineDesa.jenisLayanan)

  useEffect(() => {
    statePasar.findMany.load();
  }, []);

  const resetForm = () => {
    statePasar.create.form = {
      nama: "",
      deskripsi: "",
    };
  }

  const handleSubmit = async () => {
    await statePasar.create.create();
    resetForm();
    router.push("/admin/inovasi/layanan-online-desa/jenis-layanan")
  }

  return (
    <Box>
      <Box>
        <Box mb={10}>
          <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
            <IconArrowBack color={colors['blue-button']} size={25} />
          </Button>
        </Box>

        <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
          <Stack gap={"xs"}>
            <Title order={4}>Create Jenis Layanan</Title>
            <TextInput
              value={statePasar.create.form.nama}
              onChange={(val) => {
                statePasar.create.form.nama = val.target.value;
              }}
              label={<Text fw={"bold"} fz={"sm"}>Nama Jenis Layanan</Text>}
              placeholder='Masukkan nama jenis layanan'
            />
            <TextInput
              value={statePasar.create.form.deskripsi}
              onChange={(val) => {
                statePasar.create.form.deskripsi = val.target.value;
              }}
              label={<Text fw={"bold"} fz={"sm"}>Deskripsi</Text>}
              placeholder='Masukkan deskripsi'
            />
            <Group>
              <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
            </Group>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default CreateJenisLayanan;
