'use client';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import umkmState from '../../../../_state/ekonomi/umkm/umkm';

export default function CreateKategoriProduk() {
  const router = useRouter();
  const state = useProxy(umkmState.kategoriProduk.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetForm = () => {
    state.form = {
      nama: "",
    };
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const success = await umkmState.kategoriProduk.create.submit();
      if (success) {
        handleResetForm();
        router.push('/admin/ekonomi/umkm/kategori-produk');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <Group mb="lg">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          leftSection={<IconArrowBack size={20} />}
        >
          Kembali
        </Button>
        <Title order={3}>Tambah Kategori Produk Baru</Title>
      </Group>

      <Paper withBorder p="xl" radius="md" shadow="sm" maw={600}>
        <Stack gap="lg">
          <TextInput
            label="Nama Kategori"
            placeholder="Contoh: Makanan, Minuman, Kerajinan"
            required
            value={state.form.nama}
            onChange={(e) => (state.form.nama = e.target.value)}
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" color="gray" onClick={handleResetForm}>
              Reset
            </Button>
            <Button 
              color="blue" 
              onClick={handleCreate}
              loading={isSubmitting}
            >
              Simpan Kategori
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
