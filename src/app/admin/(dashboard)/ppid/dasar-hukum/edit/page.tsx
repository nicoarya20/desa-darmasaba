'use client';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import stateDasarHukumPPID from '../../../_state/ppid/dasar_hukum/dasarHukum';
import { useRouter } from 'next/navigation';
import { IconArrowBack } from '@tabler/icons-react';

const PPIDTextEditor = dynamic(
  () => import('../../_com/PPIDTextEditor').then(mod => mod.PPIDTextEditor),
  { ssr: false }
);

function EditDasarHukum() {
  const router = useRouter();
  const dasarHukumState = useProxy(stateDasarHukumPPID);

  // Gabungkan judul & content jadi satu state lokal
  const [formData, setFormData] = useState({ judul: '', content: '' });

  // Load data awal sekali
  useShallowEffect(() => {
    if (!dasarHukumState.findById.data) {
      dasarHukumState.findById.initialize();
    }
  }, []);

  // Set state lokal saat data global sudah tersedia
  useEffect(() => {
    if (dasarHukumState.findById.data) {
      setFormData({
        judul: dasarHukumState.findById.data.judul ?? '',
        content: dasarHukumState.findById.data.content ?? '',
      });
    }
  }, [dasarHukumState.findById.data]);

  const handleSubmit = () => {
    if (dasarHukumState.findById.data) {
      // Update global state hanya saat submit
      const updated = { ...dasarHukumState.findById.data, ...formData };
      dasarHukumState.update.save(updated);
    }
    router.push('/admin/ppid/dasar-hukum');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Dasar Hukum PPID
        </Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="xl">
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Judul
            </Text>
            <Box style={{ border: '1px solid #dee2e6', borderRadius: '0.25rem' }}>
              <PPIDTextEditor
                showSubmit={false}
                initialContent={formData.judul}
                onChange={value => setFormData(prev => ({ ...prev, judul: value }))}
              />
            </Box>
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Konten
            </Text>
            <Box style={{ border: '1px solid #dee2e6', borderRadius: '0.25rem' }}>
              <PPIDTextEditor
                showSubmit={false}
                initialContent={formData.content}
                onChange={value => setFormData(prev => ({ ...prev, content: value }))}
              />
            </Box>
          </Box>

          <Group justify="flex-end" mt="md">
            <Button
              onClick={handleSubmit}
              loading={dasarHukumState.update.loading}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditDasarHukum;
