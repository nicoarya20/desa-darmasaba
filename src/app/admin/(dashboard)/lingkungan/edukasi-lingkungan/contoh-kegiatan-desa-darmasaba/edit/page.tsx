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

const EdukasiLingkunganTextEditor = dynamic(() => import('../../_lib/edukasiLingkunganTextEditor').then(mod => mod.EdukasiLingkunganTextEditor), {
  ssr: false,
});

function EditContohKegiatanDesaDarmasaba() {
  const router = useRouter()
  const contohEdukasiState = useProxy(stateEdukasiLingkungan.stateContohEdukasiLingkungan)
  const [judul, setJudul] = useState('');
  const [content, setContent] = useState('');

  useShallowEffect(() => {
    if (!contohEdukasiState.findById.data) {
      contohEdukasiState.findById.initialize(); // biar masuk ke `findFirst` route kamu
    }
  }, []);

  useEffect(() => {
    if (contohEdukasiState.findById.data) {
      setJudul(contohEdukasiState.findById.data.judul ?? '')
      setContent(contohEdukasiState.findById.data.deskripsi ?? '')
    }
  }, [contohEdukasiState.findById.data])

  const submit = () => {
    if (contohEdukasiState.findById.data) {
      contohEdukasiState.findById.data.judul = judul;
      contohEdukasiState.findById.data.deskripsi = content;
      contohEdukasiState.update.save(contohEdukasiState.findById.data)
    }
    router.push('/admin/lingkungan/edukasi-lingkungan/contoh-kegiatan-desa-darmasaba')
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
              <Title order={3}>Edit Contoh Kegiatan Di Desa Darmasaba</Title>
              <Text fw={"bold"}>Judul</Text>
              <EdukasiLingkunganTextEditor
                showSubmit={false}
                onChange={setJudul}
                initialContent={judul}
              />
              <Text fw={"bold"}>Deskripsi</Text>
              <EdukasiLingkunganTextEditor
                showSubmit={false}
                onChange={setContent}
                initialContent={content}
              />
              <Group>
                <Button
                  bg={colors['blue-button']}
                  onClick={submit}
                  loading={contohEdukasiState.update.loading}
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

export default EditContohKegiatanDesaDarmasaba;
