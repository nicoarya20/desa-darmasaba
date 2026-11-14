'use client'
import colors from '@/con/colors';
import { Box, Container, Stack } from '@mantine/core';
import React from 'react';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';

/** Kerangka Info Sekolah: latar, tombol kembali, lalu halaman (ringkasan atau tabel). Filter jenjang ada di tiap tabel. */
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box style={{ minHeight: '100vh', background: colors.Bg, paddingBottom: 48 }}>
      <Container size="xl" py={{ base: 'md', md: 'xl' }}>
        <Stack gap="lg">
          <BackButton />
          {children}
        </Stack>
      </Container>
    </Box>
  );
}

export default Layout;
