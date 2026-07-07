'use client'
import colors from '@/con/colors';
import { Badge, Card, Group, Image, Stack, Text } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { timeAgoId } from './timeAgo';

interface BeritaCardProps {
  judul: string;
  deskripsi?: string | null;
  imageLink?: string | null;
  kategori?: string | null;
  createdAt: Date | string;
  onClick: () => void;
}

/** Kartu berita untuk grid "Berita Terbaru". Tinggi seragam (flex-column). */
export default function BeritaCard({
  judul,
  deskripsi,
  imageLink,
  kategori,
  createdAt,
  onClick,
}: BeritaCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ cursor: 'pointer', height: '100%' }}
      onClick={onClick}
    >
      <Card
        shadow="sm"
        radius="lg"
        withBorder
        h="100%"
        p={0}
        style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <Card.Section pos="relative">
          <Image
            src={imageLink || '/no-image.jpg'}
            fallbackSrc="/no-image.jpg"
            alt={judul}
            w="100%"
            h={170}
            fit="cover"
            loading="lazy"
          />
          {kategori && (
            <Badge
              bg={colors['blue-button']}
              pos="absolute"
              top={12}
              left={12}
              radius="sm"
              px={10}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
            >
              {kategori}
            </Badge>
          )}
        </Card.Section>

        <Stack gap={6} p="md" style={{ flex: 1 }}>
          <Text fw={700} fz="sm" lineClamp={2} c={colors['blue-button-7']}>
            {judul}
          </Text>
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
