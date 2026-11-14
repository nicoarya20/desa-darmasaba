'use client';
import colors from '@/con/colors';
import { ActionIcon, Box, Button, Center, Group, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { IconInfoCircle, type IconProps } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import React from 'react';

export type InfoSekolahStat = {
  icon: React.ComponentType<IconProps>;
  jumlah: number;
  nama: string;
  helper: string;
  href: string;
};

type Props = { stat: InfoSekolahStat; loading: boolean; onOpen: (href: string) => void };

/** Kartu angka ringkasan Info Sekolah (ikon, jumlah, label + tooltip, tombol Lihat Detail). */
export function InfoSekolahStatCard({ stat, loading, onOpen }: Props) {
  const { icon, jumlah, nama, helper, href } = stat;
  return (
    <motion.div whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.995 }} style={{ width: '100%' }}>
      <Skeleton visible={loading}>
        <Paper
          p="lg"
          radius="lg"
          style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 8px 28px rgba(0,0,0,0.06)', minHeight: 260 }}
          role="article"
          aria-label={`${nama} kartu statistik`}
        >
          <Stack gap="sm" mb="md">
            <Center>
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#eff6ff',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                }}
                aria-hidden
              >
                {React.createElement(icon, { color: colors['blue-button'], size: 34, stroke: 1.6 })}
              </Box>
            </Center>
            <Group justify="center" align="center" gap="xs">
              <Stack gap={0}>
                <Text ta="center" fz={{ base: 18, md: 22 }} fw={800} c="#0f172a">
                  {jumlah.toLocaleString('id-ID')}
                </Text>
                <Group gap={6} align="center">
                  <Text ta="center" fz="sm" fw={700} c={colors['blue-button']}>{nama}</Text>
                  <Tooltip label={helper} position="right" withArrow>
                    <ActionIcon aria-label={`Info ${nama}`} variant="transparent" size="xs">
                      <IconInfoCircle size={16} style={{ color: colors['blue-button'] }} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Stack>
            </Group>
          </Stack>
          <Group justify="center" mt="8px">
            <Button
              radius="xl"
              variant="outline"
              aria-label={`Lihat detail ${nama}`}
              style={{ borderColor: colors['blue-button'], color: colors['blue-button'], paddingLeft: 20, paddingRight: 20 }}
              onClick={() => onOpen(href)}
            >
              Lihat Detail
            </Button>
          </Group>
        </Paper>
      </Skeleton>
    </motion.div>
  );
}
