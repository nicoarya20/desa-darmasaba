/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import gotongRoyongState from '../../../../_state/lingkungan/gotong-royong';

function CreateKategoriKegiatan() {
  const router = useRouter();
  const stateKategori = useProxy(gotongRoyongState.kategoriKegiatan)

  useEffect(() => {
    stateKategori.findMany.load();
  }, []);

  const resetForm = () => {
    stateKategori.create.form = {
      nama: "",
    };
  }

  const handleSubmit = async () => {
    await stateKategori.create.create();
    resetForm();
    router.push("/admin/lingkungan/gotong-royong/kategori-kegiatan")
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
            <Title order={4}>Create Kategori Kegiatan</Title>
            <TextInput
              value={stateKategori.create.form.nama}
              onChange={(val) => {
                stateKategori.create.form.nama = val.target.value;
              }}
              label={<Text fw={"bold"} fz={"sm"}>Nama Kategori Kegiatan</Text>}
              placeholder='Masukkan nama kategori kegiatan'
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

export default CreateKategoriKegiatan;
