'use client'
import stateEdukasiLingkungan from '@/app/admin/(dashboard)/_state/lingkungan/edukasi-lingkungan';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

const EdukasiLingkunganTextEditor = dynamic(
  () => import('../../_lib/edukasiLingkunganTextEditor').then(mod => mod.EdukasiLingkunganTextEditor),
  { ssr: false }
);

export default function EditMateriEdukasiYangDiberikan() {
  const router = useRouter();
  const materiEdukasiState = useProxy(stateEdukasiLingkungan.stateMateriEdukasiLingkungan);

  // State lokal gabungan untuk form
  const [formData, setFormData] = useState({ judul: '', content: '' });

  // Initialize data kalau belum ada
  useShallowEffect(() => {
    if (!materiEdukasiState.findById.data) {
      materiEdukasiState.findById.initialize();
    }
  }, []);

  // Set formData saat data tersedia
  useEffect(() => {
    if (materiEdukasiState.findById.data) {
      setFormData({
        judul: materiEdukasiState.findById.data.judul ?? '',
        content: materiEdukasiState.findById.data.deskripsi ?? '',
      });
    }
  }, [materiEdukasiState.findById.data]);

  // Handler perubahan form
  const handleChange = (field: 'judul' | 'content', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submit = () => {
    if (materiEdukasiState.findById.data) {
      const updatedData = {
        ...materiEdukasiState.findById.data,
        judul: formData.judul,
        deskripsi: formData.content,
      };
      materiEdukasiState.update.save(updatedData);
    }
    router.push('/admin/lingkungan/edukasi-lingkungan/materi-edukasi-yang-diberikan');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Materi Edukasi Yang Diberikan
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
              onChange={(val) => handleChange('judul', val)}
              initialContent={formData.judul}
            />
          </Box>

          <Box>
            <Text fw="bold" mb={6}>
              Konten
            </Text>
            <EdukasiLingkunganTextEditor
              showSubmit={false}
              onChange={(val) => handleChange('content', val)}
              initialContent={formData.content}
            />
          </Box>

          <Group justify="right" mt="md">
            <Button
              onClick={submit}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
              loading={materiEdukasiState.update.loading}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
