'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import polsekTerdekatState from '@/app/admin/(dashboard)/_state/keamanan/polsek-terdekat';
import colors from '@/con/colors';
import { Badge, Box, Button, Center, Flex, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { IconArrowDown, IconClock, IconNavigation, IconPhone, IconPin } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useRouter } from 'next/navigation';


function Page() {
  const state = useProxy(polsekTerdekatState.findFirst);
  const router = useRouter()
  const {
    data,
    loading,
    load,
  } = state;

  useEffect(() => {
    load();
  }, []);

  // kalau masih loading
  if (loading) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    );
  }

  // kalau data kosong
  if (!data) {
    return (
      <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
         <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box pb={10} px={{ base: 20, md: 100 }}>
        <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Kantor Polisi Terdekat
        </Text>
        <Text pb={15} fz={'md'} >
          Desa Darmasaba, Kecamatan Abiansemal, Kabupaten Badung
        </Text>
      </Box>
      <Center py="xl">
        <Text fz="lg" fw="bold" c="red">
          Data Polsek tidak ada
        </Text>
      </Center>
      </Stack >
    );
  }

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box pb={10} px={{ base: 20, md: 100 }}>
        <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Kantor Polisi Terdekat
        </Text>
        <Text pb={15} fz={'h4'} >
          Desa Darmasaba, Kecamatan Abiansemal, Kabupaten Badung
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <Paper radius={10} bg={colors["white-trans-1"]} p={'xl'}>
            <Stack gap={'xs'}>
              <SimpleGrid
                cols={{
                  base: 1,
                  md: 2,
                }}
              >
                {/* Content Sebelah Kiri */}
                {loading ? (
                  <Center><Skeleton h={400} /></Center>
                ) : data ? (
                  <>
                    <Box>
                      <Text c={colors["blue-button"]} fw={'bold'} fz={'h2'}>{data.nama}</Text>
                      <Text c={colors["blue-button"]} fz={'sm'}>{data.jarakKeDesa}</Text>
                      <Flex py={10} gap={9} align={'center'}>
                        <IconPin size={25} color={colors["blue-button"]} />
                        <Text c={colors["blue-button"]} fz={'lg'}>{data.alamat}</Text>
                      </Flex>
                      <Flex gap={9} align={'center'}>
                        <IconPhone size={25} color={colors["blue-button"]} />
                        <Text c={colors["blue-button"]} fz={'lg'}>{data.nomorTelepon}</Text>
                      </Flex>
                      <Flex py={10} gap={9} align={'center'}>
                        <IconClock size={25} color={colors["blue-button"]} />
                        <Text c={colors["blue-button"]} fz={'lg'}>{data.jamOperasional}</Text>
                      </Flex>
                      <Box>
                        <Text c={colors["blue-button"]} fw={'bold'} fz={'h2'}>Layanan Yang Tersedia :</Text>
                        <SimpleGrid
                          py={10}
                          cols={{
                            base: 1,
                            md: 2,
                          }}
                        >
                          <Box>
                            <Text c={colors["blue-button"]} fz={'lg'}>{data.layananPolsek.nama}</Text>
                          </Box>
                        </SimpleGrid>
                      </Box>
                      <Box>
                        <Button bg={colors["blue-button"]} onClick={() => router.push(`/darmasaba/keamanan/polsek-terdekat/semua-polsek`)} rightSection={<IconArrowDown size={20} />}>Lihat Kantor Polisi Lainnya</Button>
                      </Box>
                    </Box>
                    <Box pos={'relative'}>
                      <Box style={{ position: 'absolute', top: 0, right: 0 }}>
                        <Badge size='lg' c={'#287407'} bg={'#A8EDC4'}>Buka</Badge>
                      </Box>
                      <Box pt={40}>
                        <iframe style={{ border: 2, width: "100%" }} src={data.embedMapUrl} width="550" height="300" ></iframe>
                      </Box>
                      <Box pt={20}>
                        <Button onClick={() => router.push(data.linkPetunjukArah)} fullWidth bg={colors["blue-button"]} radius={10} leftSection={<IconNavigation size={20} />}>Petunjuk Arah</Button>
                      </Box>
                    </Box>
                  </>
                ) : null}
              </SimpleGrid>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
