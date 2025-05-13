'use client'
import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import stateDasarHukumPPID from '../../../_state/ppid/dasar_hukum/dasarHukum';
import dynamic from 'next/dynamic';
import colors from '@/con/colors';
import { useShallowEffect } from '@mantine/hooks';

const PPIDTextEditor = dynamic(() => import('../../_com/PPIDTextEditor').then(mod => mod.PPIDTextEditor), {
  ssr: false,
});
function CreateDasarHukum() {
  const dasarHukumState = useProxy(stateDasarHukumPPID)
  useShallowEffect(() => {
    if (!dasarHukumState.findById.data) {
      dasarHukumState.findById.load(""); // biar masuk ke `findFirst` route kamu
    }
  }, []);

  const submit = () => {
    if (dasarHukumState.findById.data?.judul && dasarHukumState.findById.data?.content) {
      dasarHukumState.update.save(dasarHukumState.findById.data)
    }
  }
  return (
    <Box>
     <Stack gap={"xs"}>
     <Text fw={"bold"}>Judul</Text>
      <PPIDTextEditor
        showSubmit={false}
        key={`judul-${dasarHukumState.findById.data?.id ?? 'new'}`}
        onChange={(val) => {
          if (dasarHukumState.findById.data) {
            dasarHukumState.findById.data.judul = val
          }
        }}
        initialContent={dasarHukumState.findById.data?.judul ?? ''}
      />
      <Text fw={"bold"}>Content</Text>
      <PPIDTextEditor
        showSubmit={false}
        key={`content-${dasarHukumState.findById.data?.id ?? 'baru'}`}
        onChange={(val) => {
          if (dasarHukumState.findById.data) {
            dasarHukumState.findById.data.content = val
          }
        }}
        initialContent={dasarHukumState.findById.data?.content ?? ''}
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
    </Box>
  );
}

export default CreateDasarHukum;
