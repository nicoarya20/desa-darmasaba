'use client'
import colors from '@/con/colors';
import { Box, Button, Grid, GridCol, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateKonservasiAdatBali from '../../../_state/lingkungan/konservasi-adat-bali';

function Page() {
  const router = useRouter();
  const listBentukKonservasiBerdasarkanAdat = useProxy(
    stateKonservasiAdatBali.stateBentukKonservasiBerdasarkanAdat
  );

  useShallowEffect(() => {
    listBentukKonservasiBerdasarkanAdat.findById.load('edit');
  }, []);

  if (!listBentukKonservasiBerdasarkanAdat.findById.data) {
    return (
      <Stack py={20} align="center">
        <Skeleton radius="md" height={600} width="100%" />
      </Stack>
    );
  }

  return (
    <Box p={{ base: 'md', md: 'xl' }}>
      <Paper withBorder radius="md" p={{ base: 'md', md: 'lg' }} bg={colors['white-1']}>
        {/* Header */}
        <Grid align="center" mb="lg">
          <GridCol span={{ base: 12, md: 11 }}>
            <Title order={3} fw={600} c="dark">
              Preview Bentuk Konservasi Berdasarkan Adat
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
                router.push(
                  '/admin/lingkungan/konservasi-adat-bali/bentuk-konservasi-berdasarkan-adat/edit'
                )
              }
            >
              Edit
            </Button>
          </GridCol>
        </Grid>

        {/* Konten */}
        <Stack gap="md">
          <Paper radius="md" p={{ base: 'md', md: 'xl' }} bg={colors['BG-trans']} shadow="sm">
            <Box mb="md">
              <Text
                fz={{ base: 'xl', md: '2xl' }}
                fw={600}
                c="dark"
                dangerouslySetInnerHTML={{
                  __html: listBentukKonservasiBerdasarkanAdat.findById.data.judul,
                }}
              />
            </Box>
            <Box>
              <Text
                fz={{ base: 'md', md: 'lg' }}
                ta="justify"
                c="dimmed"
                lineClamp={10}
                dangerouslySetInnerHTML={{
                  __html: listBentukKonservasiBerdasarkanAdat.findById.data.deskripsi,
                }}
              />
            </Box>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Page;
