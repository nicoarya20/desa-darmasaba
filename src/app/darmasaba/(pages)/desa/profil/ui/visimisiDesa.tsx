/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Box, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function VisiMisiDesa() {
  const state = useProxy(stateProfileDesa.visiMisiDesa);

  useEffect(() => {
    state.findUnique.load('edit');
  }, []);

  const { data, loading } = state.findUnique;

  if (loading || !data) {
    return (
      <Box py="xl">
        <Skeleton h={500} radius="lg" />
      </Box>
    );
  }

  return (
    <Box>
      <Stack align="center" gap="xl">
        <Image
          src="/darmasaba-icon.png"
          alt="Lambang Desa Darmasaba"
          w={{ base: 160, md: 240 }}
          radius="md"
          loading="lazy"
        />

        {/* VISI */}
        <Paper
          p="xl"
          radius="lg"
          shadow="md"
          withBorder
          w="100%"
          style={{ background: 'linear-gradient(145deg, #ffffff, #f5f7fa)' }}
        >
          <Title
            order={1}
            c={colors['blue-button']}
            ta="center"
            mb="md"
          >
            Visi Desa
          </Title>

          <Text
            fz={{ base: 'sm', md: 'md' }}   // body text responsive
            lh={1.7}
            ta="center"
            dangerouslySetInnerHTML={{ __html: data.visi }}
            style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
          />
        </Paper>

        {/* MISI */}
        <Paper
          p="xl"
          radius="lg"
          shadow="md"
          withBorder
          w="100%"
          style={{ background: 'linear-gradient(145deg, #ffffff, #f5f7fa)' }}
        >
          <Title
            order={1}
            c={colors['blue-button']}
            ta="center"
            mb="md"
          >
            Misi Desa
          </Title>

          <Text
            fz={{ base: 'sm', md: 'md' }}   // body text responsive
            lh={1.7}
            ta="left"
            dangerouslySetInnerHTML={{ __html: data.misi }}
            style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
          />
        </Paper>
      </Stack>
    </Box>
  );
}

export default VisiMisiDesa;
