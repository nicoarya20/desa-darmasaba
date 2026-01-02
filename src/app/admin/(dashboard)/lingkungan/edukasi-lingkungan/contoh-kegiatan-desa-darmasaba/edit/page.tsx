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
  () =>
    import('../../_lib/edukasiLingkunganTextEditor').then(
      (mod) => mod.EdukasiLingkunganTextEditor
    ),
  { ssr: false }
);

export default function EditContohKegiatanDesaDarmasaba() {
  const router = useRouter();
  const contohEdukasiState = useProxy(
    stateEdukasiLingkungan.stateContohEdukasiLingkungan
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // state lokal untuk form
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
  });

  const [originalData, setOriginalData] = useState({
    judul: '',
    deskripsi: '',
  });

  // load data awal
  useShallowEffect(() => {
    if (!contohEdukasiState.findById.data) {
      contohEdukasiState.findById.initialize();
    }
  }, []);

  // update state lokal saat data global sudah ada
  useEffect(() => {
    if (contohEdukasiState.findById.data) {
      setFormData({
        judul: contohEdukasiState.findById.data.judul ?? '',
        deskripsi: contohEdukasiState.findById.data.deskripsi ?? '',
      });
      setOriginalData({
        judul: contohEdukasiState.findById.data.judul ?? '',
        deskripsi: contohEdukasiState.findById.data.deskripsi ?? '',
      });
    }
  }, [contohEdukasiState.findById.data]);

  // handler perubahan input
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

  // submit update
  const handleSubmit = () => {
    try {
      setIsSubmitting(true);
      if (contohEdukasiState.findById.data) {
        const updatedData = {
          ...contohEdukasiState.findById.data,
          judul: formData.judul,
          deskripsi: formData.deskripsi,
        };
        contohEdukasiState.update.save(updatedData);
      }
      router.push(
        '/admin/lingkungan/edukasi-lingkungan/contoh-kegiatan-desa-darmasaba'
      );
    } catch (error) {
      console.error("Error updating contoh kegiatan desa darmasaba:", error);
      toast.error("Terjadi kesalahan saat memperbarui contoh kegiatan desa darmasaba");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Contoh Kegiatan di Desa Darmasaba
        </Title>
      </Group>

      {/* Form Paper */}
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
              Deskripsi
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
