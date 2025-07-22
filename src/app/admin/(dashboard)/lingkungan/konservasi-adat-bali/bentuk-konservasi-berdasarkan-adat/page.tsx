'use client'
import colors from '@/con/colors';
import { Box, Button, Grid, GridCol, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateKonservasiAdatBali from '../../../_state/lingkungan/konservasi-adat-bali';

function Page() {
  const router = useRouter()
  const listBentukKonservasiBerdasarkanAdat = useProxy(stateKonservasiAdatBali.stateBentukKonservasiBerdasarkanAdat)
  useShallowEffect(() => {
    listBentukKonservasiBerdasarkanAdat.findById.load('edit')
  }, [])

  if (!listBentukKonservasiBerdasarkanAdat.findById.data) {
    return (
      <Stack>
        <Skeleton radius={10} h={800} />
      </Stack>
    )
  }
  return (
    <Paper bg={colors['white-1']} p={'md'} radius={10}>
      <Stack gap={"22"}>
        <Grid>
          <GridCol span={{ base: 12, md: 11 }}>
            <Title order={2}>Preview Bentuk Konservasi Berdasarkan Adat</Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }}>
            <Button bg={colors['blue-button']} onClick={() => router.push('/admin/lingkungan/konservasi-adat-bali/bentuk-konservasi-berdasarkan-adat/edit')}>
              <IconEdit size={16} />
            </Button>
          </GridCol>
        </Grid>
        <Box>
          <Stack gap={'lg'}>
            <Paper p={"xl"} bg={colors['BG-trans']}>
              <Box px={{ base: 0, md: 30 }}>
                <Text fz={{ base: "h3", md: "h2" }} fw={"bold"} dangerouslySetInnerHTML={{ __html: listBentukKonservasiBerdasarkanAdat.findById.data.judul }} />
              </Box>
              <Box px={{ base: 0, md: 30 }}>
                <Text fz={{ base: "md", md: "h3" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: listBentukKonservasiBerdasarkanAdat.findById.data.deskripsi }} />
              </Box>
            </Paper>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  )
}

export default Page;
