'use client'

import pendidikanNonFormalState from '@/app/admin/(dashboard)/_state/pendidikan/pendidikan-non-formal';
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

const TempatKegiatanTextEditor = dynamic(
  () =>
    import('../../_lib/pendidikanNonFormalTextEditor').then(
      (mod) => mod.PendidikanNonFormalTextEditor
    ),
  { ssr: false }
);

function EditTempatKegiatan() {
  const router = useRouter();
  const editState = useProxy(pendidikanNonFormalState.stateTempatKegiatan);

  // state lokal form
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
  });
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

  // load data pertama kali
  useShallowEffect(() => {
    if (!editState.findById.data) {
      editState.findById.initialize();
    }
  }, []);

  // sync state lokal ketika data fetch selesai
  useEffect(() => {
    if (editState.findById.data) {
      setFormData({
        judul: editState.findById.data.judul ?? '',
        deskripsi: editState.findById.data.deskripsi ?? '',
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
        const updatedData = {
          ...editState.findById.data,
          judul: formData.judul,
          deskripsi: formData.deskripsi,
        };

        await editState.update.save(updatedData);
        toast.success('Berhasil menyimpan perubahan');
        router.push(
          '/admin/pendidikan/pendidikan-non-formal/tempat-kegiatan'
        );
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
          <Text>Memuat data tempat kegiatan...</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Stack gap="xs">
        {/* Back Button + Title */}
        <Group mb="md">
          <Button variant="subtle" onClick={handleBack} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={22} />
          </Button>
          <Title order={4} ml="sm" c="dark">
            Edit Tempat Kegiatan
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
            <TextInput
              label={<Text fz="sm" fw="bold">Judul</Text>}
              placeholder="Masukkan judul tempat kegiatan"
              value={formData.judul}
              onChange={(e) => handleChange('judul', e.currentTarget.value)}
              error={!formData.judul && 'Judul wajib diisi'}
            />

            <Box>
              <Text fz="sm" fw="bold" mb="xs">
                Deskripsi
              </Text>
              <TempatKegiatanTextEditor
                showSubmit={false}
                onChange={(value) => handleChange('deskripsi', value)}
                initialContent={formData.deskripsi}
              />
            </Box>

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

export default EditTempatKegiatan;
