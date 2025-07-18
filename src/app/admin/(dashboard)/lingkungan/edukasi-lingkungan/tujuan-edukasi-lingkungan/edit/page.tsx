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

function EditTujuanEdukasiLingkungan() {
  const router = useRouter()
  const tujuanEdukasiState = useProxy(stateEdukasiLingkungan.stateTujuanEdukasi)
  const [judul, setJudul] = useState('');
  const [content, setContent] = useState('');

  useShallowEffect(() => {
    if (!tujuanEdukasiState.findById.data) {
      tujuanEdukasiState.findById.initialize(); // biar masuk ke `findFirst` route kamu
    }
  }, []);

  useEffect(() => {
    if (tujuanEdukasiState.findById.data) {
      setJudul(tujuanEdukasiState.findById.data.judul ?? '')
      setContent(tujuanEdukasiState.findById.data.deskripsi ?? '')
    }
  }, [tujuanEdukasiState.findById.data])

  const submit = () => {
    if (tujuanEdukasiState.findById.data) {
      tujuanEdukasiState.findById.data.judul = judul;
      tujuanEdukasiState.findById.data.deskripsi = content;
      tujuanEdukasiState.update.save(tujuanEdukasiState.findById.data)
    }
    router.push('/admin/lingkungan/edukasi-lingkungan/tujuan-edukasi-lingkungan')
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
              <Title order={3}>Edit Tujuan Edukasi Lingkungan</Title>
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
                  loading={tujuanEdukasiState.update.loading}
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

export default EditTujuanEdukasiLingkungan;
