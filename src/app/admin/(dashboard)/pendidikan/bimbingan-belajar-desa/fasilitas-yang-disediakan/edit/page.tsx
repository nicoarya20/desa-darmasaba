'use client'

import stateBimbinganBelajarDesa from '@/app/admin/(dashboard)/_state/pendidikan/bimbingan-belajar-desa';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

const BimbinganBelajarDesaTextEditor = dynamic(
  () =>
    import('../../_lib/bimbinganBelajarDesaTextEditor').then(
      (mod) => mod.BimbinganBelajarDesaTextEditor
    ),
  { ssr: false }
);

function EditFasilitasYangDisediakan() {
  const router = useRouter();
  const editState = useProxy(stateBimbinganBelajarDesa.fasilitasYangDisediakanState);

  // === State lokal form ===
  const [formData, setFormData] = useState({ judul: '', deskripsi: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalData, setOriginalData] = useState({
    judul: '',
    deskripsi: '',
  });

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.judul?.trim() !== '' &&
      !isHtmlEmpty(formData.deskripsi)
    );
  };

  // Load data pertama kali
  useShallowEffect(() => {
    if (!editState.findById.data) {
      editState.findById.initialize();
    }
  }, []);

  // Sinkronkan formData saat data load
  useEffect(() => {
    if (editState.findById.data) {
      setFormData({
        judul: editState.findById.data.judul ?? '',
        deskripsi: editState.findById.data.deskripsi ?? ''
      });
      setOriginalData({
        judul: editState.findById.data.judul ?? '',
        deskripsi: editState.findById.data.deskripsi ?? '',
      });
    }
  }, [editState.findById.data]);

  const handleChange = (field: 'judul' | 'deskripsi', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetForm = () => {
    setFormData({
      judul: originalData.judul,
      deskripsi: originalData.deskripsi,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (editState.findById.data) {
        // Update global state hanya saat submit
        const payload = {
          ...editState.findById.data,
          judul: formData.judul,
          deskripsi: formData.deskripsi
        };
        await editState.update.save(payload);

        toast.success('Berhasil menyimpan perubahan');
        router.push('/admin/pendidikan/bimbingan-belajar-desa/fasilitas-yang-disediakan');
      }
    } catch (err) {
      console.error('Error saving:', err);
      toast.error('Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => router.back();

  if (editState.findById.loading) {
    return (
      <Box>
        <Center h={400}>
          <Text>Memuat data fasilitas yang disediakan...</Text>
        </Center>
      </Box>
    );
  }

  return (
   <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Stack gap="xs">
        <Group mb="md">
          <Button
            variant="subtle"
            onClick={handleBack}
            p="xs"
            radius="md"
          >
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
          <Title order={4} ml="sm" c="dark">
            Edit Fasilitas Yang Disediakan
          </Title>
        </Group>

        <Paper
          w={{ base: '100%', md: '50%' }}
          bg={colors['white-1']}
          p="md"
          radius="md"
          shadow="sm"
          style={{ border: '1px solid #e0e0e0' }}
        >
          <Stack gap="xs">
            <Title order={3}>Formulir Edit</Title>

            {/* Judul */}
            <TextInput
              label={<Text fw="bold">Judul</Text>}
              placeholder="Masukkan judul fasilitas"
              value={formData.judul}
              onChange={(e) => handleChange('judul', e.currentTarget.value)}
              error={!formData.judul && 'Judul wajib diisi'}
            />

            {/* Deskripsi */}
            <Box>
              <Text fz="sm" fw="bold" mb="xs">Deskripsi</Text>
              <BimbinganBelajarDesaTextEditor
                showSubmit={false}
                onChange={(value) => handleChange('deskripsi', value)}
                initialContent={formData.deskripsi}
              />
            </Box>

            {/* Tombol Aksi */}
            <Group justify="right">
              {/* Tombol Batal */}
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
      </Stack>
    </Box>
  );
}

export default EditFasilitasYangDisediakan;
