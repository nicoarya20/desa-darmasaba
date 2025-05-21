'use client'
import colors from '@/con/colors';
import {
  Box, Button, Group, Paper, SimpleGrid, Skeleton, Stack, Text, Title
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import { useEffect, useState } from 'react';
import stateVisiMisiPPID from '../../_state/ppid/visi_misi_ppid/visimisiPPID';
import VisiPPID from './visiPPID/visi-PPID';
import MisiPPID from './misiPPID/misi-PPID';



function Page() {
  return (
    <Box>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <VisiMisiPPIDCreate />
        <VisiMisiPPIDList />
      </SimpleGrid>
    </Box>
  );
}

function VisiMisiPPIDCreate() {
  const visiMisi = useProxy(stateVisiMisiPPID);
  const [draftVisi, setDraftVisi] = useState('');
  const [draftMisi, setDraftMisi] = useState('');

  useShallowEffect(() => {
    if (!visiMisi.findById.data) {
      visiMisi.findById.initialize();
    }
  }, []);

  useEffect(() => {
    if (visiMisi.findById.data) {
      setDraftVisi(visiMisi.findById.data.visi ?? '');
      setDraftMisi(visiMisi.findById.data.misi ?? '');
    }
  }, [visiMisi.findById.data]);

  const submit = () => {
    if (visiMisi.findById.data) {
      // update nilai di state global hanya saat submit
      visiMisi.findById.data.visi = draftVisi;
      visiMisi.findById.data.misi = draftMisi;
      visiMisi.update.save(visiMisi.findById.data);
    }
  };

  return (
    <Paper bg={colors['white-1']} p={'md'} radius={10}>
      <Stack gap={'xs'}>
        <Title order={3}>Visi Misi PPID</Title>
        <VisiPPID value={draftVisi} onChange={setDraftVisi} />
        <MisiPPID value={draftMisi} onChange={setDraftMisi} />
        <Group>
          <Button
            bg={colors['blue-button']}
            onClick={submit}
            loading={visiMisi.update.loading}
          >
            Submit
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}

function VisiMisiPPIDList() {
  const listVisiMisi = useProxy(stateVisiMisiPPID);
  useShallowEffect(() => {
    listVisiMisi.findById.load('1');
  }, []);

  if (!listVisiMisi.findById.data) {
    return (
      <Stack>
        {Array.from({ length: 10 }).map((_, k) => (
          <Skeleton key={k} h={40} />
        ))}
      </Stack>
    );
  }

  return (
    <Paper bg={colors['white-1']} p={'md'} radius={10}>
      <Stack gap={'xs'}>
        <Title order={3}>List Visi Misi PPID</Title>
        <Box>
          <Text fw={'bold'}>Visi PPID</Text>
          <Text
            dangerouslySetInnerHTML={{
              __html: listVisiMisi.findById.data.visi,
            }}
          ></Text>
        </Box>
        <Box>
          <Text fw={'bold'}>Misi PPID</Text>
          <Text
            dangerouslySetInnerHTML={{
              __html: listVisiMisi.findById.data.misi,
            }}
          ></Text>
        </Box>
      </Stack>
    </Paper>
  );
}

export default Page;
