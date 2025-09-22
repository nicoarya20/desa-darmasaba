'use client'
import { Box, Button, Grid, GridCol, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateKonservasiAdatBali from '../../../_state/lingkungan/konservasi-adat-bali';

function Page() {
  const router = useRouter();
  const listNilaiKonservasiAdat = useProxy(stateKonservasiAdatBali.stateNilaiKonservasiAdat);

  useShallowEffect(() => {
    listNilaiKonservasiAdat.findById.load('edit');
  }, []);

  if (!listNilaiKonservasiAdat.findById.data) {
    return (
      <Stack py={20}>
        <Skeleton radius="md" height={600} />
      </Stack>
    );
  }

  return (
    <Box p="md">
      <Paper withBorder p={{ base: 'md', md: 'lg' }} radius="md">
        <Grid align="center" mb={{ base: 'md', md: 'lg' }}>
          <GridCol span={{ base: 12, md: 11 }}>
            <Title order={3} fw={600}>
              Preview Nilai Konservasi Adat
            </Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }} style={{ textAlign: 'right' }}>
            <Button
              size="sm"
              variant="light"
              color="green"
              radius="md"
              leftSection={<IconEdit size={16} />}
              onClick={() =>
                router.push('/admin/lingkungan/konservasi-adat-bali/nilai-konservasi-adat/edit')
              }
            >
              Edit
            </Button>
          </GridCol>
        </Grid>

        <Stack gap="md">
          <Paper p={{ base: 'md', md: 'xl' }} bg="#ECEEF8" radius="md">
            <Box mb="md">
              <Text
                fz={{ base: 'xl', md: '2xl' }}
                fw={600}
                c="black"
                dangerouslySetInnerHTML={{ __html: listNilaiKonservasiAdat.findById.data.judul }}
              />
            </Box>
            <Box>
              <Text
                fz={{ base: 'md', md: 'lg' }}
                ta="justify"
                c="dimmed"
                lineClamp={10}
                dangerouslySetInnerHTML={{ __html: listNilaiKonservasiAdat.findById.data.deskripsi }}
              />
            </Box>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Page;
