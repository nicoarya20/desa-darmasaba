'use client'
import stateKonservasiAdatBali from '@/app/admin/(dashboard)/_state/lingkungan/konservasi-adat-bali';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

const KonservasiAdatBaliTextEditor = dynamic(
  () => import('../../_lib/konservasiAdatBaliTextEditor').then(mod => mod.KonservasiAdatBaliTextEditor),
  { ssr: false }
);

function EditBentukKonservasiBerdasarkanAdat() {
  const router = useRouter();
  const bentukKonservasiState = useProxy(stateKonservasiAdatBali.stateBentukKonservasiBerdasarkanAdat);

  // Gabung semua field form jadi satu object
  const [formData, setFormData] = useState({ judul: '', deskripsi: '' });

  // Initialize data dari global state
  useShallowEffect(() => {
    if (!bentukKonservasiState.findById.data) {
      bentukKonservasiState.findById.initialize();
    }
  }, []);

  useEffect(() => {
    if (bentukKonservasiState.findById.data) {
      setFormData({
        judul: bentukKonservasiState.findById.data.judul ?? '',
        deskripsi: bentukKonservasiState.findById.data.deskripsi ?? '',
      });
    }
  }, [bentukKonservasiState.findById.data]);

  const handleChange = (field: 'judul' | 'deskripsi', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submit = () => {
    if (bentukKonservasiState.findById.data) {
      // Update global state cuma pas submit
      const updatedData = { ...bentukKonservasiState.findById.data, ...formData };
      bentukKonservasiState.update.save(updatedData);
    }
    router.push('/admin/lingkungan/konservasi-adat-bali/bentuk-konservasi-berdasarkan-adat');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Bentuk Konservasi Berdasarkan Adat
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
            <KonservasiAdatBaliTextEditor
              showSubmit={false}
              onChange={(value: string) => handleChange('judul', value)}
              initialContent={formData.judul}
            />
          </Box>

          <Box>
            <Text fw="bold" mb={6}>
              Deskripsi
            </Text>
            <KonservasiAdatBaliTextEditor
              showSubmit={false}
              onChange={(value: string) => handleChange('deskripsi', value)}
              initialContent={formData.deskripsi}
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
              loading={bentukKonservasiState.update.loading}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditBentukKonservasiBerdasarkanAdat;
