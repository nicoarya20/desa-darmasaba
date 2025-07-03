/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import pasarDesaState from '../../../../_state/ekonomi/pasar-desa/pasar-desa';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Title, TextInput, Group, Text } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';

function CreateKategoriProduk() {
  const router = useRouter();
  const statePasar = useProxy(pasarDesaState.kategoriProduk)

  useEffect(() => {
    statePasar.findMany.load();
  }, []);

  const resetForm = () => {
    statePasar.create.form = {
      nama: "",
    };
  }

  const handleSubmit = async () => {
    await statePasar.create.create();
    resetForm();
    router.push("/admin/ekonomi/pasar-desa/kategori-produk")
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
            <Title order={4}>Create Kategori Produk</Title>
            <TextInput
              value={statePasar.create.form.nama}
              onChange={(val) => {
                statePasar.create.form.nama = val.target.value;
              }}
              label={<Text fw={"bold"} fz={"sm"}>Nama Kategori Produk</Text>}
              placeholder='Masukkan nama kategori produk'
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

export default CreateKategoriProduk;
