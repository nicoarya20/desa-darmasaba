'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import stateDasarHukumPPID from '../../../_state/ppid/dasar_hukum/dasarHukum';
import { useRouter } from 'next/navigation';
import { IconArrowBack } from '@tabler/icons-react';

const PPIDTextEditor = dynamic(() => import('../../_com/PPIDTextEditor').then(mod => mod.PPIDTextEditor), {
  ssr: false,
});

function EditDasarHukum() {
  const router = useRouter()
  const dasarHukumState = useProxy(stateDasarHukumPPID)
  const [judul, setJudul] = useState('');
  const [content, setContent] = useState('');

  useShallowEffect(() => {
    if (!dasarHukumState.findById.data) {
      dasarHukumState.findById.initialize(); // biar masuk ke `findFirst` route kamu
    }
  }, []);

  useEffect(() => {
    if (dasarHukumState.findById.data) {
      setJudul(dasarHukumState.findById.data.judul ?? '')
      setContent(dasarHukumState.findById.data.content ?? '')
    }
  }, [dasarHukumState.findById.data])

  const submit = () => {
    if (dasarHukumState.findById.data) {
      dasarHukumState.findById.data.judul = judul;
      dasarHukumState.findById.data.content = content;
      dasarHukumState.update.save(dasarHukumState.findById.data)
    }
    router.push('/admin/ppid/dasar-hukum')
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
              <Title order={3}>Edit Dasar Hukum PPID</Title>
              <Text fw={"bold"}>Judul</Text>
              <PPIDTextEditor
                showSubmit={false}
                onChange={setJudul}
                initialContent={judul}
              />
              <Text fw={"bold"}>Content</Text>
              <PPIDTextEditor
                showSubmit={false}
                onChange={setContent}
                initialContent={content}
              />
              <Group>
                <Button
                  bg={colors['blue-button']}
                  onClick={submit}
                  loading={dasarHukumState.update.loading}
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

export default EditDasarHukum;
