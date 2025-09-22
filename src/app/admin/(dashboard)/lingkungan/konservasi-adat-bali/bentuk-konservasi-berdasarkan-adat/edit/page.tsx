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
  const [judul, setJudul] = useState('');
  const [content, setContent] = useState('');

  useShallowEffect(() => {
    if (!bentukKonservasiState.findById.data) {
      bentukKonservasiState.findById.initialize();
    }
  }, []);

  useEffect(() => {
    if (bentukKonservasiState.findById.data) {
      setJudul(bentukKonservasiState.findById.data.judul ?? '');
      setContent(bentukKonservasiState.findById.data.deskripsi ?? '');
    }
  }, [bentukKonservasiState.findById.data]);

  const submit = () => {
    if (bentukKonservasiState.findById.data) {
      bentukKonservasiState.findById.data.judul = judul;
      bentukKonservasiState.findById.data.deskripsi = content;
      bentukKonservasiState.update.save(bentukKonservasiState.findById.data);
    }
    router.push('/admin/lingkungan/konservasi-adat-bali/bentuk-konservasi-berdasarkan-adat');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
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
              onChange={setJudul}
              initialContent={judul}
            />
          </Box>

          <Box>
            <Text fw="bold" mb={6}>
              Deskripsi
            </Text>
            <KonservasiAdatBaliTextEditor
              showSubmit={false}
              onChange={setContent}
              initialContent={content}
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
