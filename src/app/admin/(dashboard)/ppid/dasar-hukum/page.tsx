'use client';
import colors from '@/con/colors';
import { Box, Button, Center, Divider, Grid, GridCol, Image, Paper, Skeleton, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateDasarHukumPPID from '../../_state/ppid/dasar_hukum/dasarHukum';

function Page() {
  const router = useRouter()
  const listDasarHukum = useProxy(stateDasarHukumPPID)
  useShallowEffect(() => {
    listDasarHukum.findById.load('1')
  }, [])

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
            <Tooltip label="Edit Dasar Hukum" withArrow>
              <Button
                c="green"
                variant="light"
                leftSection={<IconEdit size={18} stroke={2} />}
                radius="md"
                onClick={() => router.push('/admin/ppid/dasar-hukum/edit')}
              >
                Edit
              </Button>
            </Tooltip>
          </GridCol>
        </Grid>

        <Paper p="xl" bg={'white'} withBorder radius="md" shadow="xs">
          <Box px={{ base: 'sm', md: 100 }}>
            <Grid>
              <GridCol span={12}>
                <Center>
                  <Image src="/darmasaba-icon.png" w={{ base: 100, md: 150 }} alt="Logo PPID" />
                </Center>
              </GridCol>
              <GridCol span={12}>
                <Text 
                  ta="center" 
                  fz={{ base: '1.5rem', md: '2rem' }} 
                  fw="bold" 
                  c={colors['blue-button']}
                  dangerouslySetInnerHTML={{ __html: listDasarHukum.findById.data.judul }} 
                />
              </GridCol>
            </Grid>

            <Divider my="xl" color={colors['blue-button']} />

            <Box 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: listDasarHukum.findById.data.content }}
              style={{
                fontSize: '1.1rem',
                lineHeight: 1.7,
                textAlign: 'justify'
              }}
            />
          </Box>
        </Paper>
      </Stack>
    </Paper>
  )
}

export default Page;
