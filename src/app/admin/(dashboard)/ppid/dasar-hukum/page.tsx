'use client';
import colors from '@/con/colors';
import { Box, Button, Center, Divider, Grid, GridCol, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateDasarHukumPPID from '../../_state/ppid/dasar_hukum/dasarHukum';

function Page() {
  const router = useRouter();
  const listDasarHukum = useProxy(stateDasarHukumPPID);
  useShallowEffect(() => {
    listDasarHukum.findById.load('1');
  }, []);

  if (listDasarHukum.findById.loading) {
    return (
      <Center py={40}>
        <Skeleton radius="md" height={800} width="100%" />
      </Center>
    );
  }

  if (!listDasarHukum.findById.data) {
    return (
      <Center py={60}>
        <Stack align="center" gap="sm">
          <Text fw={500} c="dimmed">Belum ada data dasar hukum PPID</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Paper bg={colors['white-1']} p="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Grid align="center">
          <GridCol span={{ base: 12, md: 11 }}>
            <Title order={3} c={colors['blue-button']}>Preview Dasar Hukum PPID</Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }}>
            <Button
              w={{ base: '100%', md: "110%" }}
              c="green"
              variant="light"
              leftSection={<IconEdit size={18} stroke={2} />}
              radius="md"
              onClick={() => router.push('/admin/ppid/dasar-hukum/edit')}
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
                  <Image loading="lazy" src="/darmasaba-icon.png" w={{ base: 100, md: 150 }} alt="Logo PPID" />
                </Center>
              </GridCol>
              <GridCol span={12}>
                <Title
                  order={3}
                  ta="center"
                  lh={{ base: 1.15, md: 1.1 }}
                  fw="bold"
                  c={colors['blue-button']}
                  dangerouslySetInnerHTML={{ __html: listDasarHukum.findById.data.judul }}
                  style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                />
              </GridCol>
            </Grid>

            <Divider my="xl" color={colors['blue-button']} />

            <Text
              dangerouslySetInnerHTML={{ __html: listDasarHukum.findById.data.content }}
              style={{
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                fontSize: '1rem',
                lineHeight: 1.55,
                textAlign: 'justify',
              }}
            />
          </Box>
        </Paper>
      </Stack>
    </Paper>
  );
}

export default Page;