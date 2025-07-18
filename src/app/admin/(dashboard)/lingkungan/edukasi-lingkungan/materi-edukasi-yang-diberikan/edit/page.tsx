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

function EditMateriEdukasiYangDiberikan() {
  const router = useRouter()
  const materiEdukasiState = useProxy(stateEdukasiLingkungan.stateMateriEdukasiLingkungan)
  const [judul, setJudul] = useState('');
  const [content, setContent] = useState('');

  useShallowEffect(() => {
    if (!materiEdukasiState.findById.data) {
      materiEdukasiState.findById.initialize(); // biar masuk ke `findFirst` route kamu
    }
  }, []);

  useEffect(() => {
    if (materiEdukasiState.findById.data) {
      setJudul(materiEdukasiState.findById.data.judul ?? '')
      setContent(materiEdukasiState.findById.data.deskripsi ?? '')
    }
  }, [materiEdukasiState.findById.data])

  const submit = () => {
    if (materiEdukasiState.findById.data) {
      materiEdukasiState.findById.data.judul = judul;
      materiEdukasiState.findById.data.deskripsi = content;
      materiEdukasiState.update.save(materiEdukasiState.findById.data)
    }
    router.push('/admin/lingkungan/edukasi-lingkungan/materi-edukasi-yang-diberikan')
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
              <Title order={3}>Edit Materi Edukasi Yang Diberikan</Title>
              <Text fw={"bold"}>Judul</Text>
              <EdukasiLingkunganTextEditor
                showSubmit={false}
                onChange={setJudul}
                initialContent={judul}
              />
              <Text fw={"bold"}>Content</Text>
              <EdukasiLingkunganTextEditor
                showSubmit={false}
                onChange={setContent}
                initialContent={content}
              />
              <Group>
                <Button
                  bg={colors['blue-button']}
                  onClick={submit}
                  loading={materiEdukasiState.update.loading}
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

export default EditMateriEdukasiYangDiberikan;
