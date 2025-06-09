'use client'
import colors from '@/con/colors';
import {
  Box,
  Button, Group, Paper,
  Stack,
  Title
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import stateVisiMisiPPID from '../../../_state/ppid/visi_misi_ppid/visimisiPPID';
import MisiPPID from '../misiPPID/misi-PPID';
import VisiPPID from '../visiPPID/visi-PPID';


function VisiMisiPPIDEdit() {
  const router = useRouter()
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
              <Title order={3}>Edit Visi Misi PPID</Title>
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
        </Box>
      </Stack>
    </Box>
  );
}

export default VisiMisiPPIDEdit;
