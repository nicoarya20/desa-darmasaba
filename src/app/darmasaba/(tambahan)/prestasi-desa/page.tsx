/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { BackgroundImage, Box, Button, Center, Container, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import BackButton from '../../(pages)/desa/layanan/_com/BackButto';
import { useRouter } from 'next/navigation';
import prestasiState from '@/app/admin/(dashboard)/_state/landing-page/prestasi-desa';
import { useProxy } from 'valtio/utils';
import { useEffect, useState } from 'react';

function Page() {
  const state = useProxy(prestasiState.prestasiDesa);
  const [loading, setLoading] = useState(true);
  const [prestasiData, setPrestasiData] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await prestasiState.kategoriPrestasi.findMany.load();
        await state.findMany.load();
        setPrestasiData(state.findMany.data || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"} >
      <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
      <Container w={{ base: "100%", md: "50%" }}>
        <Text ta={"center"} fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
          Prestasi Desa
        </Text>
        <Text ta={"center"} py={10}>
          Temukan berbagai prestasi dan keunggulan yang dimiliki Desa Darmasaba.
        </Text>
      </Container>
      <SimpleGrid
        px={{ base: "md", md: 100 }}
        pb={20}
        cols={{
          base: 1,
          md: 3,
        }}
      >
        {loading ? (
          <Center>
            <Text fz={"2.4rem"}>Memuat Data...</Text>
          </Center>
        ) : (
          prestasiData.map((v, k) => {
            return (
              <BackgroundImage
                key={k}
                src={v.image?.link}
                
              radius={16}
              pos={"relative"}
            >
              <Box
                style={{
                  borderRadius: 16,
                  zIndex: 0
                }}
                pos={"absolute"}
                w={"100%"}
                h={"100%"}
                bg={colors.trans.dark[2]}
              />
              <Stack justify='space-between' h={"100%"} gap={0} p={"lg"} pos={"relative"}>
                <Group>
                  <Paper radius={"lg"} py={7} px={10}>
                    <Text>{v.kategori?.name}</Text>
                  </Paper>
                </Group>
                <Box p={"lg"}>
                  <Text
                    fw={"bold"}
                    c={"white"}
                    size={"1.8rem"}
                    style={{
                      textAlign: "center",
                      lineHeight: 1.4,
                      minHeight: '5.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    lineClamp={3}
                    dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                  />
                </Box>
                <Group justify="center">
                  <Button px={20} radius={"100"} size="md" bg={colors["blue-button"]}
                    onClick={() => router.push(`/darmasaba/prestasi-desa/${v.id}`)}>
                    Detail
                  </Button>
                </Group>
              </Stack>
            </BackgroundImage>
          )
        })
      )}
      </SimpleGrid>
    </Stack>
  );
}

export default Page;
