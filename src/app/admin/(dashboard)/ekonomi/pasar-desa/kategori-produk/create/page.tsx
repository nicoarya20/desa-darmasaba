/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import pasarDesaState from '../../../../_state/ekonomi/pasar-desa/pasar-desa';

function CreateKategoriProduk() {
  const router = useRouter();
  const statePasar = useProxy(pasarDesaState.kategoriProduk);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return statePasar.create.form.nama?.trim() !== '';
  };

  useEffect(() => {
    statePasar.findMany.load();
  }, []);

  const resetForm = () => {
    statePasar.create.form = {
      nama: '',
    };
  };

  const handleSubmit = async () => {
    try {
      if (!statePasar.create.form.nama) {
        return toast.warn('Nama kategori produk wajib diisi');
      }
      setIsSubmitting(true);
      await statePasar.create.create();
      resetForm();
      router.push('/admin/ekonomi/pasar-desa/kategori-produk');
    } catch (error) {
      console.error(error)
      toast.error('Gagal menambahkan kategori produk');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Header dengan tombol kembali */}
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Kategori Produk
        </Title>
      </Group>

      {/* Card form */}
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
            label="Nama Kategori Produk"
            placeholder="Masukkan nama kategori produk"
            value={statePasar.create.form.nama || ''}
            onChange={(e) => (statePasar.create.form.nama = e.target.value)}
            required
          />

          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
            </Button>

            {/* Tombol Simpan */}
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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

export default CreateKategoriProduk;
