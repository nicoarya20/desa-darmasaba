'use client'
import colors from '@/con/colors';
import { Box, Button, Grid, GridCol, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateLayananDesa from '../../../_state/desa/layananDesa';

function SuratKeterangan() {
  const router = useRouter()
  const pelayananPendudukNonPermanen = useProxy(stateLayananDesa.pelayananPendudukNonPermanen)

  useShallowEffect(() => {
    pelayananPendudukNonPermanen.findById.load('1')
  }, [])

  if (!pelayananPendudukNonPermanen.findById.data) {
    return (
      <Stack>
        <Skeleton radius={10} h={800} />
      </Stack>
    )
  }
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Paper bg={colors['BG-trans']} p={'md'}>
          <Box py={15}>
            <Stack gap={"xs"}>
              <Grid>
                <GridCol span={{ base: 12, md: 11 }}>
                  <Text fz={"h4"} fw={"bold"}>Preview Pelayanan Perizinan Berusaha</Text>
                </GridCol>
                <GridCol span={{ base: 12, md: 1 }}>
                  <Button bg={colors['blue-button']} onClick={() => router.push('/admin/desa/layanan/pelayanan_penduduk_non_permanent/edit')}>
                    <IconEdit size={16} />
                  </Button>
                </GridCol>
              </Grid>
            </Stack>
          </Box>
          <Text fz={{ base: "h4", md: 'h2' }} fw={"bold"}>{pelayananPendudukNonPermanen.findById.data.name}</Text>
          <Text py={10} ta={"justify"} fz={{ base: "sm", md: 'h3' }} dangerouslySetInnerHTML={{ __html: pelayananPendudukNonPermanen.findById.data.deskripsi }} />
        </Paper>
      </Paper>
    </Box>
  );
}

export default SuratKeterangan;
