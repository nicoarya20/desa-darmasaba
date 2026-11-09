/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import stateDesaPengumuman from '@/app/admin/(dashboard)/_state/desa/pengumuman';
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

function EditKategoriPengumuman() {
  const editState = useProxy(stateDesaPengumuman.category);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [originalData, setOriginalData] = useState({ name: '' });

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name?.trim() !== ''
    );
  };

  // Load data awal sekali aja
  useEffect(() => {
    const loadKategori = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.update.load(id);
        if (data) {
          setFormData({ name: data.name || '' });
          setOriginalData({ name: data.name || '' });
        }
      } catch (error) {
        console.error('Error loading kategori Pengumuman:', error);
        toast.error('Gagal memuat data kategori Pengumuman');
      }
    };

    loadKategori();
  }, [params?.id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      toast.error('Nama kategori pengumuman wajib diisi');
      return;
    }
    
    try {
      setIsSubmitting(true);
      // Update global state hanya di sini
      editState.update.form = {
        ...editState.update.form,
        name: formData.name,
      };

      await editState.update.update();
      toast.success('Kategori Pengumuman berhasil diperbarui!');
      router.push('/admin/pemerintahan/pengumuman/kategori-pengumuman');
    } catch (error) {
      console.error('Error updating kategori Pengumuman:', error);
      toast.error('Terjadi kesalahan saat memperbarui kategori Pengumuman');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
      setFormData({
        name: originalData.name,
      });
      toast.info("Form dikembalikan ke data awal");
    };
  

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
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
          Edit Kategori Pengumuman
        </Title>
      </Group>

      {/* Form */}
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
            label="Nama Kategori Pengumuman"
            placeholder="Masukkan nama kategori Pengumuman"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
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

export default EditKategoriPengumuman;
