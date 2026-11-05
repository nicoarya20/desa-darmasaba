import colors from '@/con/colors';
import { Anchor, Group, Paper, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';
import {
  PENGANTAR_MUSYAWARAH_JUDUL,
  PENGANTAR_MUSYAWARAH_LINKS,
  PENGANTAR_MUSYAWARAH_TEKS,
} from './pengantar-musyawarah.const';

/** Blok info: ide warga dapat dibawa ke Musyawarah Desa / Musrenbangdes, beserta tautan terkait. */
export default function PengantarMusyawarah() {
  return (
    <Paper p="xl">
      <Stack gap="xs" align="center">
        <Title order={2} c={colors['blue-button']} fw="bold" ta="center" fz={{ base: 'h4', md: 'h3' }}>
          {PENGANTAR_MUSYAWARAH_JUDUL}
        </Title>
        <Text ta="center" fz={{ base: 'sm', md: 'md' }} lh="1.6">
          {PENGANTAR_MUSYAWARAH_TEKS}
        </Text>
        <Group justify="center" gap="lg">
          {PENGANTAR_MUSYAWARAH_LINKS.map((link) => (
            <Anchor
              key={link.href}
              component={Link}
              href={link.href}
              fw={600}
              fz={{ base: 'sm', md: 'md' }}
              c={colors['blue-button']}
            >
              {link.label}
            </Anchor>
          ))}
        </Group>
      </Stack>
    </Paper>
  );
}
