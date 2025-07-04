/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import pasarDesaState from '../../../../_state/ekonomi/pasar-desa/pasar-desa';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Title, TextInput, Group, Text } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { toast } from 'react-toastify';

function EditKategoriProduk() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const statePasar = useProxy(pasarDesaState.kategoriProduk);

  const [formData, setFormData] = useState({
    nama: "",
  });

  useEffect(() => {
    const loadKategoriProduk = async () => {
      if (!id) return;

      try {
        const data = await statePasar.edit.load(id);

        if (data) {
          // pastikan id-nya masuk ke state edit
          statePasar.edit.id = id;
          setFormData({
            nama: data.nama || '',
          });
        }
      } catch (error) {
        console.error("Error loading kategori produk:", error);
        toast.error("Gagal memuat data kategori produk");
      }
    };

    loadKategoriProduk();
  }, [id]);

  const handleSubmit = async () => {
    try {
      if (!formData.nama.trim()) {
        toast.error('Nama kategori produk tidak boleh kosong');
        return;
      }

      statePasar.edit.form = {
        nama: formData.nama.trim(),
      };

      // Safety check tambahan: pastikan ID tidak kosong
      if (!statePasar.edit.id) {
        statePasar.edit.id = id; // fallback
      }

      const success = await statePasar.edit.update();

      if (success) {
        router.push("/admin/ekonomi/pasar-desa/kategori-produk");
      }
    } catch (error) {
      console.error("Error updating kategori produk:", error);
      // toast akan ditampilkan dari fungsi update
    }
  };

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Edit Kategori Produk</Title>
          <TextInput
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Nama Kategori Produk</Text>}
            placeholder='Masukkan nama kategori produk'
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKategoriProduk;
