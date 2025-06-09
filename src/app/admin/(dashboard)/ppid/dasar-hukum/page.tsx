'use client'
import colors from '@/con/colors';
import { Box, Button, Grid, GridCol, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
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

  if (!listDasarHukum.findById.data) {
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
            <Title order={2}>Preview Dasar Hukum PPID</Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }}>
            <Button bg={colors['blue-button']} onClick={() => router.push('/admin/ppid/dasar-hukum/edit')}>
              <IconEdit size={16} />
            </Button>
          </GridCol>
        </Grid>
        <Box px={{ base: "md", md: 100 }}>
          <Stack gap={'lg'}>
            <Paper p={"xl"} bg={colors['BG-trans']}>
              <Box px={{ base: 20, md: 50 }} pb={30}>
                <Text ta={"center"} fz={{ base: "h3", md: "h2" }} fw={"bold"}>
                  {listDasarHukum.findById.data.judul}
                </Text>
              </Box>
              <Box px={{ base: 20, md: 50 }}>
                <Text fz={{ base: "md", md: "h3" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: listDasarHukum.findById.data.content }} />
              </Box>
            </Paper>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  )
}

export default Page;
