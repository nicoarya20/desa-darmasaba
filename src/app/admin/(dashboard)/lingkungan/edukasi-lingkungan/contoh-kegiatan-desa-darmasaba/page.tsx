'use client'
import { Box, Button, Group, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateEdukasiLingkungan from '../../../_state/lingkungan/edukasi-lingkungan';

function Page() {
  const router = useRouter();
  const listContohEdukasi = useProxy(stateEdukasiLingkungan.stateContohEdukasiLingkungan);

  useShallowEffect(() => {
    listContohEdukasi.findById.load('edit');
  }, []);

  if (!listContohEdukasi.findById.data) {
    return (
      <Stack py={20}>
        <Skeleton radius="md" height={600} />
      </Stack>
    );
  }

  return (
    <Box p="md">
      <Paper withBorder p={{ base: 'md', md: 'lg' }} radius="md">
        <Group justify="space-between" align="center" mb={{ base: 'md', md: 'lg' }}>
            <Title order={3} fw={600}>
              Preview Contoh Kegiatan Di Desa Darmasaba
            </Title>
            <Button
              size="sm"
              variant="light"
              color="green"
              radius="md"
              leftSection={<IconEdit size={16} />}
              onClick={() =>
                router.push(
                  '/admin/lingkungan/edukasi-lingkungan/contoh-kegiatan-desa-darmasaba/edit'
                )
              }
            >
              Edit
            </Button>
        </Group>

        <Stack gap="md">
          <Paper p={{ base: 'md', md: 'xl' }} bg="#ECEEF8" radius="md">
            <Box mb="md">
              <Text
                fz={{ base: 'xl', md: '2xl' }}
                fw={600}
                c="black"
                dangerouslySetInnerHTML={{ __html: listContohEdukasi.findById.data.judul }}
                style={{ wordBreak: "break-word", whiteSpace: "normal" }}
              />
            </Box>
            <Box>
              <Text
                fz={{ base: 'md', md: 'lg' }}
                ta="justify"
                c="dimmed"
                lineClamp={10}
                dangerouslySetInnerHTML={{ __html: listContohEdukasi.findById.data.deskripsi }}
                style={{ wordBreak: "break-word", whiteSpace: "normal" }}
              />
            </Box>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Page;
