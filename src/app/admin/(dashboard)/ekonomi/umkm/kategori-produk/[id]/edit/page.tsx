'use client';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  TextInput,
  Title,
  Center,
  Loader
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import umkmState from '../../../../../_state/ekonomi/umkm/umkm';

export default function EditKategoriProduk() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const state = useProxy(umkmState.kategoriProduk.findMany);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nama, setNama] = useState("");
  const [originalNama, setOriginalNama] = useState("");

  useEffect(() => {
    const init = async () => {
      // Find the item from the existing list or load it if not available
      if (state.data.length === 0) {
        await state.load();
      }
      
      const item = state.data.find((v: any) => v.id === id);
      if (item) {
        setNama(item.nama);
        setOriginalNama(item.nama);
      }
      setIsLoading(false);
    };
    init();
  }, [id, state]);

  const handleResetForm = () => {
    setNama(originalNama);
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      umkmState.kategoriProduk.update.form.nama = nama;
      const success = await umkmState.kategoriProduk.update.submit(id);
      if (success) {
        router.push('/admin/ekonomi/umkm/kategori-produk');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

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
        <Title order={3}>Edit Kategori Produk</Title>
      </Group>

      <Paper withBorder p="xl" radius="md" shadow="sm" maw={600}>
        <Stack gap="lg">
          <TextInput
            label="Nama Kategori"
            placeholder="Contoh: Makanan, Minuman, Kerajinan"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" color="gray" onClick={handleResetForm}>
              Reset
            </Button>
            <Button 
              color="blue" 
              onClick={handleUpdate}
              loading={isSubmitting}
              disabled={!nama.trim()}
            >
              Simpan Perubahan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
