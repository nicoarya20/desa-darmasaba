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

function EditNilaiKonservasiAdat() {
  const router = useRouter();
  const nilaiKonservasiState = useProxy(stateKonservasiAdatBali.stateNilaiKonservasiAdat);

  // state lokal untuk form
  const [formData, setFormData] = useState({ judul: '', deskripsi: '' });

  // load data awal
  useShallowEffect(() => {
    if (!nilaiKonservasiState.findById.data) {
      nilaiKonservasiState.findById.initialize();
    }
  }, []);

  // sync state lokal saat data backend siap
  useEffect(() => {
    if (nilaiKonservasiState.findById.data) {
      setFormData({
        judul: nilaiKonservasiState.findById.data.judul ?? '',
        deskripsi: nilaiKonservasiState.findById.data.deskripsi ?? '',
      });
    }
  }, [nilaiKonservasiState.findById.data]);

  const handleChange = (field: 'judul' | 'deskripsi', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submit = () => {
    if (nilaiKonservasiState.findById.data) {
      // update global state saat submit
      nilaiKonservasiState.findById.data.judul = formData.judul;
      nilaiKonservasiState.findById.data.deskripsi = formData.deskripsi;
      nilaiKonservasiState.update.save(nilaiKonservasiState.findById.data);
    }
    router.push('/admin/lingkungan/konservasi-adat-bali/nilai-konservasi-adat');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Nilai Konservasi Adat
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
              onChange={val => handleChange('judul', val)}
              initialContent={formData.judul}
            />
          </Box>

          <Box>
            <Text fw="bold" mb={6}>
              Deskripsi
            </Text>
            <KonservasiAdatBaliTextEditor
              showSubmit={false}
              onChange={val => handleChange('deskripsi', val)}
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
              loading={nilaiKonservasiState.update.loading}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditNilaiKonservasiAdat;
