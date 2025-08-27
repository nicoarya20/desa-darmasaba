/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import gotongRoyongState from '@/app/admin/(dashboard)/_state/lingkungan/gotong-royong';
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Box, Center, Container, Image, Skeleton, Stack, Text } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';




function Page() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const state = useProxy(gotongRoyongState.kegiatanDesa)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        await state.findUnique.load(id);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData()
  }, [id])

  if (loading) {
    return (
      <Center>
        <Skeleton height={500} />
      </Center>
    );
  }

  if (!state.findUnique.data) {
    return (
      <Center>
        <Text>Data tidak ditemukan</Text>
      </Center>
    );
  }


  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"} px={{ base: "md", md: 0 }}>
      <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
      <Container w={{ base: "100%", md: "50%" }} >
        <Box pb={20}>
          <Text ta={"center"} fz={"2.4rem"} c={colors["blue-button"]} fw={"bold"}>
            {state.findUnique.data?.judul}
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
            fz={"1.5rem"}
          >
            Informasi Kegiatan Gotong Royong
          </Text>
        </Box>
        <Image src={state.findUnique.data?.image?.link || ''} alt='' w={"100%"} />
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={"xs"}>
          <Text py={20} fz={{ base: "sm", md: "lg" }} ta={"justify"} dangerouslySetInnerHTML={{ __html: state.findUnique.data?.deskripsiLengkap || '' }} />
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
