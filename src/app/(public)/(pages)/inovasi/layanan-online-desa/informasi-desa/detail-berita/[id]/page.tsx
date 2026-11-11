/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import { BeritaTanggal } from '@/app/(public)/(pages)/pemerintahan/berita/_com/BeritaTanggal';
import colors from '@/con/colors';
import { Box, Center, Container, Image, Skeleton, Stack, Text } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';



function Page() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const state = useProxy(stateDashboardBerita.berita)
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
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container w={{ base: "100%", md: "50%" }} >
        <Box pb={20}>
          <Text ta={"center"} fz={{ base: "1.5rem", md: "2.4rem" }} lh={{ base: 1.25, md: 1.2 }} c={colors["blue-button"]} fw={"bold"}>
            {state.findUnique.data?.judul}
          </Text>
          <BeritaTanggal item={state.findUnique.data} />
        </Box>
        <Image src={state.findUnique.data?.image?.link || ''} alt='' w={"100%"} loading="lazy" />
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={"xs"}>
          <Text
            py={20}
            fz={{ base: "sm", md: "lg" }}
            lh={{ base: 1.6, md: 1.8 }} // ✅ line-height lebih rapat dan responsif
            ta="justify"
            style={{
              wordBreak: "break-word",
              whiteSpace: "normal",
            }}
            dangerouslySetInnerHTML={{
              __html: state.findUnique.data?.content || "",
            }}
          />
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
