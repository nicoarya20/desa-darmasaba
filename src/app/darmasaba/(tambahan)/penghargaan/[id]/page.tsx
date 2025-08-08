/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Stack, Container, Text, Image, ActionIcon, Box, Divider, Flex, Center, Skeleton } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconBrandWhatsapp } from '@tabler/icons-react';
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import penghargaanState from '@/app/admin/(dashboard)/_state/desa/penghargaan';
import { useState } from 'react';

function Page() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const state = useProxy(penghargaanState);
  const [loading, setLoading] = useState(true);

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
    <Stack pos={"relative"} bg={colors['BG-trans']} py={"xl"} gap={22}>
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container w={{ base: "100%", md: "50%" }}>
        <Stack align="center" gap={0}>
          <Text
            ta={"center"}
            fw={"bold"}
            fz={"2.3rem"}
          >
            {state.findUnique.data?.name}
          </Text>
          <Image py={20} src={state.findUnique.data?.image?.link || ''} alt='' />
        </Stack>
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Text
          pb={20}
          ta={"justify"}
          fw={"bold"}
          dangerouslySetInnerHTML={{ __html: state.findUnique.data?.deskripsi || '' }}
        />
        <Box py={20}>
          <Divider color={colors['blue-button']} />
          <Flex justify={"space-between"} py={20}>
            <Text fz={"sm"}>{new Date(state.findUnique.data?.createdAt).toLocaleDateString()}</Text>
            <Box>
              <Flex gap={"lg"}>
                <ActionIcon variant='transparent'>
                  <IconBrandFacebook color={colors['blue-button']} size={"30"} />
                </ActionIcon>
                <ActionIcon variant='transparent'>
                  <IconBrandInstagram color={colors['blue-button']} size={"30"} />
                </ActionIcon>
                <ActionIcon variant='transparent'>
                  <IconBrandTwitter color={colors['blue-button']} size={"30"} />
                </ActionIcon>
                <ActionIcon variant='transparent'>
                  <IconBrandWhatsapp color={colors['blue-button']} size={"30"} />
                </ActionIcon>
              </Flex>
            </Box>
          </Flex>
          <Divider color={colors['blue-button']} pb={50} />
        </Box>
      </Box>
    </Stack>
  );
}

export default Page;
