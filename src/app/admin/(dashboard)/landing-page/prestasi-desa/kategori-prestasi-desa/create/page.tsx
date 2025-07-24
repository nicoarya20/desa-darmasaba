/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import prestasiState from '@/app/admin/(dashboard)/_state/landing-page/prestasi-desa';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';


function CreateKategoriPrestasi() {
  const router = useRouter();
  const stateKategori = useProxy(prestasiState.kategoriPrestasi)

  useEffect(() => {
    stateKategori.findMany.load();
  }, []);

  const resetForm = () => {
    stateKategori.create.form = {
      name: "",
    };
  }

  const handleSubmit = async () => {
    await stateKategori.create.create();
    resetForm();
    router.push("/admin/landing-page/prestasi-desa/kategori-prestasi-desa")
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
            <Title order={4}>Create Kategori Prestasi Desa</Title>
            <TextInput
              value={stateKategori.create.form.name}
              onChange={(val) => {
                stateKategori.create.form.name = val.target.value;
              }}
              label={<Text fw={"bold"} fz={"sm"}>Nama Kategori Prestasi Desa</Text>}
              placeholder='Masukkan nama kategori prestasi desa'
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

export default CreateKategoriPrestasi;
