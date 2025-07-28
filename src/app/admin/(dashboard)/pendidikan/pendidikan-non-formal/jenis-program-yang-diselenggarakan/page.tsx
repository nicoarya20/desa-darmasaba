'use client'
import colors from '@/con/colors';
import { Box, Button, Grid, GridCol, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import pendidikanNonFormalState from '../../../_state/pendidikan/pendidikan-non-formal';

function Page() {
  const router = useRouter()
  const listPreview = useProxy(pendidikanNonFormalState.stateJenisProgram)
  useShallowEffect(() => {
    listPreview.findById.load('edit')
  }, [])

  if (!listPreview.findById.data) {
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
            <Title order={2}>Preview Jenis Program Yang Diselenggarakan</Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }}>
            <Button bg={colors['blue-button']} onClick={() => router.push('/admin/pendidikan/pendidikan-non-formal/jenis-program-yang-diselenggarakan/edit')}>
              <IconEdit size={16} />
            </Button>
          </GridCol>
        </Grid>
        <Box>
          <Stack gap={'lg'}>
            <Paper p={"xl"} bg={colors['BG-trans']}>
              <Box px={{ base: 0, md: 30 }}>
                <Text fz={{ base: "h3", md: "h2" }} fw={"bold"} dangerouslySetInnerHTML={{ __html: listPreview.findById.data.judul }} />
              </Box>
              <Box px={{ base: 0, md: 30 }}>
                <Text fz={{ base: "md", md: "h3" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: listPreview.findById.data.deskripsi }} />
              </Box>
            </Paper>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  )
}

export default Page;
