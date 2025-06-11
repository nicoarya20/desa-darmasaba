'use client'
import colors from '@/con/colors';
import { Box, Button, Grid, GridCol, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateStrukturPPID from '../../_state/ppid/struktur_ppid/struktur_PPID';
import { useShallowEffect } from '@mantine/hooks';

function Page() {
  const router = useRouter()
  const strukturPPID = useProxy(stateStrukturPPID)
  useShallowEffect(() => {
    strukturPPID.struktur.load("1")
  }, [])

  if (!strukturPPID.struktur.data) {
    return <Stack>
      <Skeleton radius={10} h={800} />
    </Stack>
  }

  const dataArray = Array.isArray(strukturPPID.struktur.data)
    ? strukturPPID.struktur.data
    : [strukturPPID.struktur.data];

  return (
    <Paper bg={colors['white-1']} p={'md'}>
      <Stack gap={"xs"}>
        <Grid>
          <GridCol span={{ base: 12, md: 11 }}>
            <Title order={3}>Preview Struktur PPID</Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }}>
            <Button onClick={() => router.push(`/admin/ppid/struktur-ppid/${strukturPPID.struktur.data?.id}`)} bg={colors['blue-button']}>
              <IconEdit size={16} />
            </Button>
          </GridCol>
        </Grid>
        {dataArray.map((item) => (
          <Paper key={item.id} p={"xl"} bg={colors['BG-trans']}>
            <Box>
              <Text fw={"bold"} fz={"h4"}>{item.name}</Text>
              <Image 
              w={{ base: "100%", md: "100%" }} 
              src={item.image?.link}
              alt=''
              onError={(e) => {
                e.currentTarget.src = "/struktur_ppid.png";
              }}
              />
            </Box>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}

export default Page;
