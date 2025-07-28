'use client'
import stateProgramPendidikanAnak from '@/app/admin/(dashboard)/_state/pendidikan/program-pendidikan-anak';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

const ProgramPendidikanAnakTextEditor = dynamic(() => import('../../_lib/programPendidikanAnakTextEditor').then(mod => mod.ProgramPendidikanAnakTextEditor), {
  ssr: false,
});

function EditTujuanProgram() {
  const router = useRouter()
  const editState = useProxy(stateProgramPendidikanAnak.programUnggulanState)
  const [judul, setJudul] = useState('');
  const [content, setContent] = useState('');

  useShallowEffect(() => {
    if (!editState.findById.data) {
      editState.findById.initialize(); // biar masuk ke `findFirst` route kamu
    }
  }, []);

  useEffect(() => {
    if (editState.findById.data) {
      setJudul(editState.findById.data.judul ?? '')
      setContent(editState.findById.data.deskripsi ?? '')
    }
  }, [editState.findById.data])

  const submit = () => {
    if (editState.findById.data) {
      editState.findById.data.judul = judul;
      editState.findById.data.deskripsi = content;
      editState.update.save(editState.findById.data)
    }
    router.push('/admin/pendidikan/program-pendidikan-anak/program-unggulan')
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
              <Title order={3}>Edit Program Unggulan</Title>
              <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Judul</Text>}
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
              />
              <Text fw={"bold"}>Deskripsi</Text>
              <ProgramPendidikanAnakTextEditor
                showSubmit={false}
                onChange={setContent}
                initialContent={content}
              />
              <Group>
                <Button
                  bg={colors['blue-button']}
                  onClick={submit}
                  loading={editState.update.loading}
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

export default EditTujuanProgram;
