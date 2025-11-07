'use client'
import colors from '@/con/colors';
import { Box, Button, Divider, Grid, GridCol, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateProgramPendidikanAnak from '../../../_state/pendidikan/program-pendidikan-anak';

function Page() {
  const router = useRouter();
  const listPreview = useProxy(stateProgramPendidikanAnak.stateTujuanProgram);

  useShallowEffect(() => {
    listPreview.findById.load('edit');
  }, []);

  if (!listPreview.findById.data) {
    return (
      <Stack align="center" justify="center" py="xl">
        <Skeleton radius="md" height={400} w="90%" />
      </Stack>
    );
  }

  const data = listPreview.findById.data;

  return (
    <Paper bg={colors['white-1']} p="lg" radius="md" shadow="sm">
      <Stack gap="md">
        {/* Header */}
        <Grid align="center">
          <GridCol span={{ base: 12, md: 11 }}>
            <Title order={3} c={colors['blue-button']}>
              Pratinjau Tujuan Program
            </Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }}>
            <Button
              c="green"
              variant="light"
              leftSection={<IconEdit size={18} stroke={2} />}
              radius="md"
              onClick={() =>
                router.push(
                  '/admin/pendidikan/program-pendidikan-anak/tujuan-program/edit'
                )
              }
            >
              Edit
            </Button>
          </GridCol>
        </Grid>

        {/* Konten Preview */}
        <Paper
          p="xl"
          bg={colors['white-1']}
          withBorder
          radius="md"
          shadow="xs"
        >
          <Box px={{ base: 'sm', md: 50 }}>
            <Stack gap="lg">
              {/* Judul */}
              <Text
                ta="center"
                fz={{ base: '1.3rem', md: '1.8rem' }}
                fw="bold"
                c={colors['blue-button']}
                dangerouslySetInnerHTML={{ __html: data.judul }}
                style={{ wordBreak: "break-word", whiteSpace: "normal" }}
              />
              <Divider my="md" color={colors['blue-button']} />

              {/* Deskripsi */}
              <Text
                fz={{ base: '1rem', md: '1.2rem' }}
                lh={1.7}
                ta="justify"
                c="dimmed"
                dangerouslySetInnerHTML={{ __html: data.deskripsi }}
                style={{ wordBreak: "break-word", whiteSpace: "normal" }}
              />
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </Paper>
  );
}

export default Page;
