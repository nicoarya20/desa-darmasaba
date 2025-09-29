/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Box, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
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
    <Box py="xl">
      <Stack align="center" gap="xl">
        <Image
          src="/darmasaba-icon.png"
          alt="Lambang Desa Darmasaba"
          w={{ base: 160, md: 240 }}
          radius="md"
          loading="lazy"
        />

        <Paper
          p="xl"
          radius="lg"
          shadow="md"
          withBorder
          w="100%"
          style={{
            background: 'linear-gradient(145deg, #ffffff, #f5f7fa)',
          }}
        >
          <Text
            c={colors['blue-button']}
            ta="center"
            fw={700}
            fz={{ base: '2rem', md: '2.5rem' }}
            mb="md"
          >
            Visi Desa
          </Text>
          <Text
            fz={{ base: '1.125rem', md: '1.375rem' }}
            ta="center"
            fw={500}
            lh={1.6}
            dangerouslySetInnerHTML={{ __html: data.visi }}
            style={{wordBreak: "break-word", whiteSpace: "normal"}}
          />
        </Paper>

        <Paper
          p="xl"
          radius="lg"
          shadow="md"
          withBorder
          w="100%"
          style={{
            background: 'linear-gradient(145deg, #ffffff, #f5f7fa)',
          }}
        >
          <Text
            c={colors['blue-button']}
            ta="center"
            fw={700}
            fz={{ base: '2rem', md: '2.5rem' }}
            mb="md"
          >
            Misi Desa
          </Text>
          <Text
            fz={{ base: '1.125rem', md: '1.375rem' }}
            fw={500}
            lh={1.6}
            dangerouslySetInnerHTML={{ __html: data.misi }}
            style={{wordBreak: "break-word", whiteSpace: "normal"}}
          />
        </Paper>
      </Stack>
    </Box>
  );
}

export default VisiMisiDesa;
