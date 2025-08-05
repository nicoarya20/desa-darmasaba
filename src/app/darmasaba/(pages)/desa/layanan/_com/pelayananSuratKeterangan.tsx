/* eslint-disable react-hooks/exhaustive-deps */
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import { BackgroundImage, Box, Button, Center, Group, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { useProxy } from 'valtio/utils';

function PelayananSuratKeterangan({ search }: { search: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  const state = useProxy(stateLayananDesa)
  const filteredData = useMemo(() => {
    if (!state.suratKeterangan.findMany.data) return [];
    return state.suratKeterangan.findMany.data.filter(item => {
      const keyword = search.toLowerCase();
      return (
        item.name?.toLowerCase().includes(keyword)
      );
    })
  }, [state.suratKeterangan.findMany.data, search]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await state.suratKeterangan.findMany.load()
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData()
  }, [])
  return (
    <Box pb={10}>
      <Text fz={{ base: "h4", md: 'h2' }} fw={"bold"}>Pelayanan Surat Keterangan</Text>
      <SimpleGrid
        py={20}
        cols={{
          base: 1,
          sm: 3
        }}
      >
        {loading ? (
          <Center>
            <Skeleton h={250} />
          </Center>
        ) : (
          filteredData.map((v, k) => {
            return (
              <BackgroundImage
                key={k}
                src={v.image?.link || ''}
                h={250}
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
                  <Group justify="center">
                    <Button px={20} radius={"100"} size="md" bg={colors["blue-button"]}
                      onClick={() => router.push(`/darmasaba/desa/layanan/${v.id}`)}>
                      Detail
                    </Button>
                  </Group>
                </Stack>
              </BackgroundImage>
            )
          })
        )}
      </SimpleGrid>
    </Box>

  );
}

export default PelayananSuratKeterangan;
