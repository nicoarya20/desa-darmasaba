/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { ActionIcon, BackgroundImage, Box, Center, Container, Flex, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import BackButton from '../../(pages)/desa/layanan/_com/BackButto';
import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes';
import { useProxy } from 'valtio/utils';
import { useEffect, useState } from 'react';
import { Link } from 'next-view-transitions';

function Page() {
  const state = useProxy(apbdes);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await state.findMany.load();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [])

  const data = state.findMany.data || [];
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={22}>
      <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
      <Container w={{ base: "100%", md: "50%" }}>
        <Stack align="center" gap={0}>
          <Text fz={"3.4rem"} fw={"bold"}>
            APBDes
          </Text>
          <Text
            py={10}
            ta={"justify"}
          >
            Transparansi APBDes Darmasaba adalah langkah nyata menuju tata kelola pemerintahan desa yang bersih dan bertanggung jawab. Adapun APBDes sebagai berikut:
          </Text>
        </Stack>
      </Container>
      <SimpleGrid
        px={{ base: "md", md: 100 }}
        cols={{
          base: 1,
          sm: 3,
        }}
      >
        {loading ? (
          <Center>
            <Text fz={"2.4rem"}>Memuat Data...</Text>
          </Center>
        ) : (
          data.map((v, k) => {
            return (
              <BackgroundImage
                key={k}
                src={v.image?.link || ''}
                h={350}
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
                  <Box p={"lg"}>
                    <Text
                      c={"white"}
                      size={"1.5rem"}
                      style={{
                        textAlign: "center",
                      }}>{v.name}</Text>
                  </Box>
                  <Text
                    fw={"bold"}
                    c={"white"}
                    size={"3.5rem"}
                    style={{
                      textAlign: "center",
                    }}>{v.jumlah}</Text>
                  <Group justify="center">
                    <ActionIcon px={70} py={20} radius={"xl"} size="md" bg={colors["blue-button"]} component={Link} href={v.file?.link || ''}>
                      <Flex gap={"md"}>
                        <IconDownload size={20} />
                        <Text fz={"sm"} c={"white"}>Download</Text>
                      </Flex>
                    </ActionIcon>
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
