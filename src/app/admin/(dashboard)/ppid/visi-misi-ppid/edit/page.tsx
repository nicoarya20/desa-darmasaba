'use client';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Title, Tooltip } from '@mantine/core';
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
    router.push('/admin/ppid/visi-misi-ppid')
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Visi Misi PPID
        </Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="xl">
          <Box>
            <VisiPPID value={draftVisi} onChange={setDraftVisi} />
          </Box>
          
          <Box>
            <MisiPPID value={draftMisi} onChange={setDraftMisi} />
          </Box>

          <Group justify="flex-end" mt="md">
            <Button
              onClick={submit}
              loading={visiMisi.update.loading}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default VisiMisiPPIDEdit;
