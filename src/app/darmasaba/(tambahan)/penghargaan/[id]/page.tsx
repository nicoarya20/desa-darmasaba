/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Stack, Container, Text, Image, ActionIcon, Box, Divider, Flex, Center, Skeleton, Paper, Tooltip } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconBrandWhatsapp } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import penghargaanState from '@/app/admin/(dashboard)/_state/desa/penghargaan';

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
        console.error('Gagal memuat data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <Center h={"70vh"}>
        <Stack align="center" gap="sm">
          <Skeleton height={40} width={200} radius="xl" />
          <Skeleton height={300} width={300} radius="md" />
          <Skeleton height={20} width="80%" radius="xl" />
        </Stack>
      </Center>
    );
  }

  if (!state.findUnique.data) {
    return (
      <Center h={"70vh"}>
        <Paper withBorder shadow="md" p="xl" radius="lg">
          <Text ta="center" fz="lg" fw="bold" c="dimmed">
            Data penghargaan tidak tersedia
          </Text>
          <Text ta="center" fz="sm" c="dimmed" mt="sm">
            Silakan kembali dan pilih penghargaan lainnya
          </Text>
        </Paper>
      </Center>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={22}>
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container w={{ base: "100%", md: "60%" }}>
        <Stack align="center" gap="md">
          <Text ta="center" fw="bold" fz={{ base: "1.8rem", md: "2.3rem" }} lh={1.3}>
            {state.findUnique.data?.name}
          </Text>
          <Image
            src={state.findUnique.data?.image?.link || ''}
            alt="Gambar penghargaan"
            radius="lg"
            fit="contain"
            mah={400}
            fallbackSrc="https://placehold.co/600x400?text=Tidak+Ada+Gambar"
          />
        </Stack>
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Text
          pb={20}
          ta="justify"
          fz="md"
          lh={1.6}
          dangerouslySetInnerHTML={{ __html: state.findUnique.data?.deskripsi || '' }}
        />
        <Box py={20}>
          <Divider color={colors['blue-button']} />
          <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} gap="sm" py={20}>
            <Text fz="sm" c="dimmed">
              Diterbitkan: {new Date(state.findUnique.data?.createdAt).toLocaleDateString('id-ID')}
            </Text>
            <Flex gap="md">
              <Tooltip label="Bagikan ke Facebook" withArrow>
                <ActionIcon variant="light" radius="xl" size="lg" color="blue">
                  <IconBrandFacebook size={22} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Bagikan ke Instagram" withArrow>
                <ActionIcon variant="light" radius="xl" size="lg" color="pink">
                  <IconBrandInstagram size={22} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Bagikan ke Twitter" withArrow>
                <ActionIcon variant="light" radius="xl" size="lg" color="cyan">
                  <IconBrandTwitter size={22} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Bagikan ke WhatsApp" withArrow>
                <ActionIcon variant="light" radius="xl" size="lg" color="green">
                  <IconBrandWhatsapp size={22} />
                </ActionIcon>
              </Tooltip>
            </Flex>
          </Flex>
          <Divider color={colors['blue-button']} />
        </Box>
      </Box>
    </Stack>
  );
}

export default Page;
