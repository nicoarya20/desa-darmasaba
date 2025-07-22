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

const KonservasiAdatBaliTextEditor = dynamic(() => import('../../_lib/konservasiAdatBaliTextEditor').then(mod => mod.KonservasiAdatBaliTextEditor), {
  ssr: false,
});

function EditBentukKonservasiBerdasarkanAdat() {
  const router = useRouter()
  const bentukKonservasiState = useProxy(stateKonservasiAdatBali.stateBentukKonservasiBerdasarkanAdat)
  const [judul, setJudul] = useState('');
  const [content, setContent] = useState('');

  useShallowEffect(() => {
    if (!bentukKonservasiState.findById.data) {
      bentukKonservasiState.findById.initialize(); // biar masuk ke `findFirst` route kamu
    }
  }, []);

  useEffect(() => {
    if (bentukKonservasiState.findById.data) {
      setJudul(bentukKonservasiState.findById.data.judul ?? '')
      setContent(bentukKonservasiState.findById.data.deskripsi ?? '')
    }
  }, [bentukKonservasiState.findById.data])

  const submit = () => {
    if (bentukKonservasiState.findById.data) {
      bentukKonservasiState.findById.data.judul = judul;
      bentukKonservasiState.findById.data.deskripsi = content;
      bentukKonservasiState.update.save(bentukKonservasiState.findById.data)
    }
    router.push('/admin/lingkungan/konservasi-adat-bali/bentuk-konservasi-berdasarkan-adat')
  }
  return (
    <Box>
      <Stack gap={'xs'}>
        <Box>
          <Button
            variant={'subtle'}
            onClick={() => router.back()}
          >
            <IconArrowBack color={colors['blue-button']} size={20} />
          </Button>
        </Box>
        <Box>
          <Paper bg={colors['white-1']} p={'md'} radius={10} w={{ base: '100%', md: '50%' }}>
            <Stack gap={'xs'}>
              <Title order={3}>Edit Bentuk Konservasi Berdasarkan Adat</Title>
              <Text fw={"bold"}>Judul</Text>
              <KonservasiAdatBaliTextEditor
                showSubmit={false}
                onChange={setJudul}
                initialContent={judul}
              />
              <Text fw={"bold"}>Content</Text>
              <KonservasiAdatBaliTextEditor
                showSubmit={false}
                onChange={setContent}
                initialContent={content}
              />
              <Group>
                <Button
                  bg={colors['blue-button']}    
                  onClick={submit}
                  loading={bentukKonservasiState.update.loading}
                >
                  Submit
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}

export default EditBentukKonservasiBerdasarkanAdat;
