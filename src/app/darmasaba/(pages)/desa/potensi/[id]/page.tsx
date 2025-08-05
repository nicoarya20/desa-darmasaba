/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import potensiDesaState from '@/app/admin/(dashboard)/_state/desa/potensi';
import colors from '@/con/colors';
import { Box, Center, Container, Image, Skeleton, Stack, Text } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../layanan/_com/BackButto';


function Page() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const state = useProxy(potensiDesaState.potensiDesa)
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
          <Text ta={"center"} fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
            {state.findUnique.data?.name}
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
            fz={"1.5rem"}
          >
            Informasi dan Pelayanan Administrasi Digital
          </Text>
        </Box>
        <Image src={state.findUnique.data?.image?.link || ''} alt='' w={"100%"} />
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Text py={20} fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          {state.findUnique.data?.deskripsi || ''}
        </Text>
      </Box>
    </Stack>
  );
}

export default Page;
