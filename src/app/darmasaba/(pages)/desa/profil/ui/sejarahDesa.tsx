/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Box, Center, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
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
    <Box>
      <Stack align="center" gap="xl">
        {/* HEADER ICON + TITLE */}
        <Stack align="center" gap="sm">
          <Center>
            <Image
              src="/darmasaba-icon.png"
              alt="Ikon Desa Darmasaba"
              w={{ base: 160, md: 240 }}
              radius="md"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
              loading="lazy"
            />
          </Center>

          <Center>
            <Title
              order={1}
              c={colors['blue-button']}
              ta="center"
              style={{ letterSpacing: '-0.5px' }}
            >
              Sejarah Desa
            </Title>
          </Center>
        </Stack>

        {/* CONTENT */}
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
              fz={{ base: 'sm', md: 'md' }}
              lh={1.75}
              ta="justify"
              c="dark.7"
              style={{
                wordBreak: 'break-word',
                whiteSpace: 'normal',
              }}
              dangerouslySetInnerHTML={{ __html: data.deskripsi }}
            />
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default SejarahDesa;
