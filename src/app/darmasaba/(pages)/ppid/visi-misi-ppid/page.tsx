'use client'
import stateVisiMisiPPID from '@/app/admin/(dashboard)/_state/ppid/visi_misi_ppid/visimisiPPID';
import colors from '@/con/colors';
import { Box, Center, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const allList = useProxy(stateVisiMisiPPID)
  useShallowEffect(() => {
    allList.findById.load("1") // Assuming "1" is your default ID, adjust as needed
  }, [])

  if (!allList.findById.data) return <Stack>
    {Array.from({ length: 10 }).map((v, k) => <Skeleton key={k} h={40} />)}
  </Stack>

  const dataArray = Array.isArray(allList.findById.data)
    ? allList.findById.data
    : [allList.findById.data];
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      {dataArray.map((item) => (
        <Box key={item.id} px={{ base: "md", md: 100 }}>
          <Stack gap={'lg'}>
            <Paper p={"xl"} bg={colors['white-trans-1']}>
              <Box pb={30}>
                <Center>
                  <Image src={"/darmasaba-icon.png"} w={{ base: 100, md: 150 }} alt='' />
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
                <Text fz={{ base: "md", md: "h3" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: item.visi }} />
              </Box>
              <Box px={{ base: 20, md: 50 }}>
                <Text ta={"center"} fz={{ base: "h3", md: "h2" }} fw={"bold"}>
                  MISI PPID
                </Text>
                <Text fz={{ base: "md", md: "h3" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: item.misi }} />
              </Box>
            </Paper>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

export default Page;
