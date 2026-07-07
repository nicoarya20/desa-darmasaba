'use client'
import colors from '@/con/colors';
import { Box, Card, Group, Stack, Text } from '@mantine/core';
import { IconClock, IconSpeakerphone } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { timeAgoId } from './timeAgo';

interface PengumumanCardProps {
  judul: string;
  deskripsi?: string | null;
  createdAt: Date | string;
  onClick: () => void;
}

/** Kartu ringkas untuk grid "Pengumuman Terbaru". Tinggi seragam. */
export default function PengumumanCard({
  judul,
  deskripsi,
  createdAt,
  onClick,
}: PengumumanCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ cursor: 'pointer', height: '100%' }}
      onClick={onClick}
    >
      <Card
        shadow="xs"
        radius="lg"
        withBorder
        h="100%"
        p="md"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <Stack gap={8} h="100%">
          <Group gap={8} wrap="nowrap" align="flex-start">
            <Box
              c={colors['blue-button']}
              mt={2}
              style={{ display: 'flex', flexShrink: 0 }}
            >
              <IconSpeakerphone size={18} />
            </Box>
            <Text fw={700} fz="sm" lineClamp={2} c={colors['blue-button-7']}>
              {judul}
            </Text>
          </Group>
          <Text
            fz="xs"
            c="dimmed"
            lineClamp={2}
            style={{ lineHeight: 1.5 }}
            dangerouslySetInnerHTML={{ __html: deskripsi || '-' }}
          />
          <Group gap={4} mt="auto" pt={4} c="gray">
            <IconClock size={13} />
            <Text fz="xs" c="gray">
              {timeAgoId(createdAt)}
            </Text>
          </Group>
        </Stack>
      </Card>
    </motion.div>
  );
}
