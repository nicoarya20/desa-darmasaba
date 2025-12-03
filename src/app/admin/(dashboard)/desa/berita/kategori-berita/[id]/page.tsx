/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  TextInput,
  Title,
  Loader
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditKategoriBerita() {
  const editState = useProxy(stateDashboardBerita.kategoriBerita);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [originalData, setOriginalData] = useState({
    name: '',
  });

  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    const loadKategori = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.update.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
          });
          setOriginalData({
            name: data.name || '',
          });
        }
      } catch (error) {
        console.error('Error loading kategori Berita:', error);
        toast.error('Gagal memuat data kategori Berita');
      }
    };

    loadKategori();
  }, [params?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
    });
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // update global state hanya saat submit
      editState.update.form = {
        ...editState.update.form,
        name: formData.name,
      };

      await editState.update.update();
      toast.success('Kategori Berita berhasil diperbarui!');
      router.push('/admin/desa/berita/kategori-berita');
    } catch (error) {
      console.error('Error updating kategori Berita:', error);
      toast.error('Terjadi kesalahan saat memperbarui kategori Berita');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Back Button + Title */}
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
          Edit Kategori Berita
        </Title>
      </Group>

      {/* Form Wrapper */}
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
            name="name"
            label="Nama Kategori Berita"
            placeholder="Masukkan nama kategori berita"
            value={formData.name}
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

export default EditKategoriBerita;
