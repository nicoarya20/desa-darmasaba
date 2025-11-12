/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import pasarDesaState from '../../../../_state/ekonomi/pasar-desa/pasar-desa';

function EditKategoriProduk() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const statePasar = useProxy(pasarDesaState.kategoriProduk);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ nama: '' });
  const [originalData, setOriginalData] = useState({ nama: '' });

  useEffect(() => {
    const loadKategoriProduk = async () => {
      if (!id) return;

      try {
        const data = await statePasar.edit.load(id);

        if (data) {
          // simpan id ke state global hanya untuk referensi
          statePasar.edit.id = id;

          // simpan data ke state lokal
          setFormData({ nama: data.nama || '' });
          setOriginalData({ nama: data.nama || '' });
        }
      } catch (error) {
        console.error('Error loading kategori produk:', error);
        toast.error('Gagal memuat data kategori produk');
      }
    };

    loadKategoriProduk();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
    });
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!formData.nama.trim()) {
        toast.error('Nama kategori produk tidak boleh kosong');
        return;
      }

      // update global state hanya saat submit
      statePasar.edit.form = { nama: formData.nama.trim() };
      if (!statePasar.edit.id) {
        statePasar.edit.id = id; // fallback
      }

      const success = await statePasar.edit.update();

      if (success) {
        toast.success('Kategori produk berhasil diperbarui!');
        router.push('/admin/ekonomi/pasar-desa/kategori-produk');
      }
    } catch (error) {
      console.error('Error updating kategori produk:', error);
      toast.error('Terjadi kesalahan saat memperbarui kategori produk');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header dengan tombol back */}
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
          Edit Kategori Produk
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
            name="nama"
            label={<Text fw="bold" fz="sm">Nama Kategori Produk</Text>}
            placeholder="Masukkan nama kategori produk"
            value={formData.nama}
            onChange={handleChange}
            required
          />

          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={handleResetForm}
            >
              Batal
            </Button>

            {/* Tombol Simpan */}
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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

export default EditKategoriProduk;
