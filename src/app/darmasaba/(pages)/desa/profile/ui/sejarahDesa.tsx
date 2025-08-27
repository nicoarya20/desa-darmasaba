/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Box, Center, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function SejarahDesa() {
  const state = useProxy(stateProfileDesa.sejarahDesa);

  useEffect(() => {
    state.findUnique.load('edit');
  }, []);

  const { data, loading } = state.findUnique;

  if (loading || !data) {
    return (
      <Box py="lg">
        <Skeleton h={500} radius="lg" />
      </Box>
    );
  }

  return (
    <Box py="xl">
      <Stack align="center" gap="xl">
        <Stack align="center" gap="sm">
          <Center>
            <Image
              src="/darmasaba-icon.png"
              alt="Ikon Desa Darmasaba"
              w={{ base: 180, md: 260 }}
              radius="md"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
            />
          </Center>
          <Center>
            <Text
              c={colors['blue-button']}
              ta="center"
              fw={700}
              fz={{ base: '2rem', md: '2.8rem' }}
              style={{ letterSpacing: '-0.5px' }}
            >
              Sejarah Desa
            </Text>
          </Center>
        </Stack>
        <Paper
          p="xl"
          radius="lg"
          bg="white"
          shadow="sm"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%)',
            border: `1px solid ${colors['blue-button']}20`,
          }}
        >
          <Stack gap="md">
            <Text
              fz={{ base: 'md', md: 'lg' }}
              lh={1.8}
              ta="justify"
              style={{ color: '#2a2a2a' }}
              dangerouslySetInnerHTML={{ __html: data.deskripsi }}
            />
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default SejarahDesa;
