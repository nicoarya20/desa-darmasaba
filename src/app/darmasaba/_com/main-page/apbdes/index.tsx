/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes';
import colors from '@/con/colors';
import { ActionIcon, BackgroundImage, Box, Button, Center, Flex, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';


function Apbdes() {
  const state = useProxy(apbdes);
  const [loading, setLoading] = useState(false);
  const textHeading = {
    title: "APBDes",
    des: "Transparansi APBDes Darmasaba adalah langkah nyata menuju tata kelola pemerintahan desa yang bersih dan bertanggung jawab"
  }

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

  const data = (state.findMany.data || []).slice(0, 3);
  return (
    <>
      <Stack p={"sm"} gap={"4rem"} bg={colors.Bg}>
        <Box
          w={{
            base: '100%',
            sm: '60%',
          }}
        >
          <Stack gap={0}>
            <Text fz={"4.4rem"} fw={"bold"}>
              {textHeading.title}
            </Text>
            <Text fz={"1.4rem"}>
              {textHeading.des}
            </Text>
          </Stack>
        </Box>
        <SimpleGrid
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
        <Group pb={80} justify='center'>
          <Button component={Link} href="/darmasaba/apbdes" radius={"lg"} bg={colors["blue-button"]} fz={"h4"}>Lihat Semua</Button>
        </Group>
      </Stack>
    </>
  );
}

export default Apbdes;
