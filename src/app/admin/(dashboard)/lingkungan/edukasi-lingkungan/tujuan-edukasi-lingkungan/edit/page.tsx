'use client'

import stateEdukasiLingkungan from '@/app/admin/(dashboard)/_state/lingkungan/edukasi-lingkungan';
import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

const EdukasiLingkunganTextEditor = dynamic(
  () => import('../../_lib/edukasiLingkunganTextEditor').then(mod => mod.EdukasiLingkunganTextEditor),
  { ssr: false }
);

export default function EditTujuanEdukasiLingkungan() {
  const router = useRouter();
  const tujuanEdukasiState = useProxy(stateEdukasiLingkungan.stateTujuanEdukasi);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State lokal untuk form, gak tergantung global state
  const [formData, setFormData] = useState({ judul: '', deskripsi: '' });
  const [originalData, setOriginalData] = useState({
    judul: '',
    deskripsi: '',
  });

  // Initialize global state
  useShallowEffect(() => {
    if (!tujuanEdukasiState.findById.data) {
      tujuanEdukasiState.findById.initialize();
    }
  }, []);

  // Sync initial values dari global state ke form lokal
  useEffect(() => {
    if (tujuanEdukasiState.findById.data) {
      setFormData({
        judul: tujuanEdukasiState.findById.data.judul ?? '',
        deskripsi: tujuanEdukasiState.findById.data.deskripsi ?? '',
      });
      setOriginalData({
        judul: tujuanEdukasiState.findById.data.judul ?? '',
        deskripsi: tujuanEdukasiState.findById.data.deskripsi ?? '',
      });
    }
  }, [tujuanEdukasiState.findById.data]);

  const handleResetForm = () => {
    setFormData({
      judul: originalData.judul,
      deskripsi: originalData.deskripsi,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  // Handler input
  const handleChange = (field: 'judul' | 'deskripsi', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submit = () => {
    try {
      setIsSubmitting(true);
      if (tujuanEdukasiState.findById.data) {
        // Update global state hanya saat submit
        const updatedData = {
          ...tujuanEdukasiState.findById.data,
          judul: formData.judul,
          deskripsi: formData.deskripsi,
        };
        tujuanEdukasiState.update.save(updatedData);
      }
      router.push('/admin/lingkungan/edukasi-lingkungan/tujuan-edukasi-lingkungan');
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data tujuan edukasi lingkungan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
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
          Edit Tujuan Edukasi Lingkungan
        </Title>
      </Group>

      <Paper
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        w={{ base: '100%', md: '50%' }}
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <Box>
            <Text fw="bold" mb={6}>
              Judul
            </Text>
            <EdukasiLingkunganTextEditor
              showSubmit={false}
              onChange={(value) => handleChange('judul', value)}
              initialContent={formData.judul}
            />
          </Box>

          <Box>
            <Text fw="bold" mb={6}>
              Konten
            </Text>
            <EdukasiLingkunganTextEditor
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
              onClick={submit}
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
