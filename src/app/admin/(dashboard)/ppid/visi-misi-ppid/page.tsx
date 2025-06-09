'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Grid,
  GridCol,
  Image,
  Paper,
  Skeleton, Stack, Text,
  Title
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import stateVisiMisiPPID from '../../_state/ppid/visi_misi_ppid/visimisiPPID';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';


function VisiMisiPPIDList() {
  const router = useRouter()
  const listVisiMisi = useProxy(stateVisiMisiPPID);
  useShallowEffect(() => {
    listVisiMisi.findById.load('1');
  }, []);

  if (!listVisiMisi.findById.data) {
    return (
      <Stack>
        <Skeleton radius={10} h={800} />
      </Stack>
    );
  }

  return (
    <Paper bg={colors['white-1']} p={'md'} radius={10}>
      <Stack pos={"relative"} gap={"22"}>
        <Grid>
          <GridCol span={{ base: 12, md: 11 }}>
            <Title order={2}>Preview Visi Misi PPID</Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }}>
            <Button bg={colors['blue-button']} onClick={() => router.push('/admin/ppid/visi-misi-ppid/edit')}>
              <IconEdit size={16} />
            </Button>
          </GridCol>
        </Grid>
        <Box px={{ base: "md", md: 100 }}>
          <Stack gap={'lg'}>
            <Paper p={"xl"} bg={colors['BG-trans']}>
              <Box pb={30}>
                <Center>
                  <Image src={"/api/img/darmasaba-icon.png"} w={{ base: 100, md: 150 }} alt='' />
                </Center>
                <Text ta={"center"} fz={{ base: "h2", md: "2.5rem" }} fw={"bold"}>
                  MOTO PPID DESA DARMASABA
                </Text>
                <Text ta={"center"} fz={{ base: "h4", md: "h3" }} >
                  MEMBERIKAN INFORMASI YANG CEPAT, MUDAH, TEPAT DAN TRANSPARAN
                </Text>
              </Box>
              <Box px={{ base: 20, md: 50 }} pb={30}>
                <Text ta={"center"} fz={{ base: "h3", md: "h2" }} fw={"bold"}>
                  VISI PPID
                </Text>
                <Text fz={{ base: "md", md: "h3" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: listVisiMisi.findById.data.visi }} />
              </Box>
              <Box px={{ base: 20, md: 50 }}>
                <Text ta={"center"} fz={{ base: "h3", md: "h2" }} fw={"bold"}>
                  MISI PPID
                </Text>
                <Text fz={{ base: "md", md: "h3" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: listVisiMisi.findById.data.misi }} />
              </Box>
            </Paper>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

export default VisiMisiPPIDList;
