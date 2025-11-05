'use client';
import colors from '@/con/colors';
import { Box, Button, Center, Divider, Grid, GridCol, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateVisiMisiPPID from '../../_state/ppid/visi_misi_ppid/visimisiPPID';


function VisiMisiPPIDList() {
  const router = useRouter()
  const listVisiMisi = useProxy(stateVisiMisiPPID);
  useShallowEffect(() => {
    listVisiMisi.findById.load('1');
  }, []);

  if (listVisiMisi.findById.loading) {
    return (
      <Center py={40}>
        <Skeleton radius="md" height={800} width="100%" />
      </Center>
    );
  }

  if (!listVisiMisi.findById.data) {
    return (
      <Center py={60}>
        <Stack align="center" gap="sm">
          <Text fw={500} c="dimmed">Belum ada data visi misi PPID</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Paper bg={colors['white-1']} p="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Grid align="center">
          <GridCol span={{ base: 12, md: 11 }}>
            <Title order={3} c={colors['blue-button']}>Preview Visi Misi PPID</Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }}>
              <Button
                c="green"
                variant="light"
                leftSection={<IconEdit size={18} stroke={2} />}
                radius="md"
                onClick={() => router.push('/admin/ppid/visi-misi-ppid/edit')}
              >
                Edit
              </Button>
          </GridCol>
        </Grid>

        <Paper p="xl" bg={'white'} withBorder radius="md" shadow="xs">
          <Box px={{ base: 'sm', md: 100 }}>
            <Grid>
              <GridCol span={12}>
                <Center>
                  <Image loading='lazy' src="/darmasaba-icon.png" w={{ base: 100, md: 150 }} alt="Logo PPID" />
                </Center>
              </GridCol>
              <GridCol span={12}>
                <Text ta="center" fz={{ base: '1.2rem', md: '1.8rem' }} fw="bold" c={colors['blue-button']}>
                  MOTO PPID DESA DARMASABA
                </Text>
                <Text ta="center" fz={{ base: '1rem', md: '1.2rem' }} c="dimmed" mt="sm">
                  MEMBERIKAN INFORMASI YANG CEPAT, MUDAH, TEPAT DAN TRANSPARAN
                </Text>
              </GridCol>
            </Grid>

            <Divider my="xl" color={colors['blue-button']} />

            <Box>
              <Text fz={{ base: '1.5rem', md: '1.75rem' }} fw="bold" ta="center" mb="lg" c={colors['blue-button']}>
                VISI PPID
              </Text>
              <Box 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: listVisiMisi.findById.data.visi }}
                style={{wordBreak: "break-word", whiteSpace: "normal", textAlign: "justify"}}
              />
            </Box>

            <Divider my="xl" color={colors['blue-button']} />

            <Box mt="xl">
              <Text fz={{ base: '1.5rem', md: '1.75rem' }} fw="bold" ta="center" mb="lg" c={colors['blue-button']}>
                MISI PPID
              </Text>
              <Box 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: listVisiMisi.findById.data.misi }}
                style={{wordBreak: "break-word", whiteSpace: "normal", textAlign: "justify"}}
              />
            </Box>
          </Box>
        </Paper>
      </Stack>
    </Paper>
  );
}

export default VisiMisiPPIDList;
