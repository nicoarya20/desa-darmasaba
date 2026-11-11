'use client';
import colors from '@/con/colors';
import { Anchor, Box, Group, Paper, Text, Title } from '@mantine/core';
import { Link } from 'next-view-transitions';
import type { PetaInformasiGroup } from '../_lib/petaInformasi';

const listStyle = { listStyle: 'none', margin: 0, padding: 0 } as const;

/** Kartu satu menu utama: judul H2 dan daftar tautan halamannya (link asli, bisa dibuka di tab baru). */
export default function PetaInformasiGroupCard({ group }: { group: PetaInformasiGroup }) {
  const headingId = `peta-grup-${group.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <Paper component="section" aria-labelledby={headingId} radius="lg" p="md" bg="white" withBorder h="100%">
      <Group justify="space-between" align="baseline" wrap="nowrap" gap="xs" mb="xs">
        <Title id={headingId} order={2} fz={{ base: 'lg', md: 'xl' }} fw={700} c={colors['blue-button-7']}>
          {group.name}
        </Title>
        <Text fz="xs" c={colors['blue-button-7']} style={{ whiteSpace: 'nowrap' }}>
          {group.pages.length} halaman
        </Text>
      </Group>
      <Box component="ul" style={listStyle}>
        {group.pages.map((page) => (
          <Box component="li" key={page.href} py={6} style={{ borderTop: `1px solid ${colors.grey[1]}` }}>
            <Anchor component={Link} href={page.href} c={colors['blue-button']} fz={{ base: 'sm', md: 'md' }} fw={500}>
              {page.label}
            </Anchor>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
