import { Box, Card, Image, Stack, Text, Tooltip } from '@mantine/core';
import { IconUserCircle } from '@tabler/icons-react';
import React from 'react';
import { Prisma } from '@prisma/client';
import colors from '@/con/colors';

interface ProfileViewProps {
  data: Prisma.PejabatDesaGetPayload<{ include: { image: true } }> | null;
}

export default function ProfileView({ data }: ProfileViewProps) {
  if (!data) {
    return (
      <Card radius="2xl" className="glass3" py="xl" px="lg" withBorder>
        <Stack align="center" gap="sm">
          <IconUserCircle size={72} stroke={1.4} />
          <Text fw={500} c="dimmed">
            Profil belum tersedia
          </Text>
          <Text fz="sm" c="dimmed">
            Data pejabat desa akan muncul di sini
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack
      justify="end"
      align="end"
      pos="relative"
      w={{ base: '100%', md: '40%' }}
      px="xl"
    >
      {data.image?.link ? (
        <Image
          src={data.image.link}
          alt={data.name || 'Foto profil'}
          fit="cover"
          radius="lg"
          loading="lazy"
        />
      ) : (
        <Stack align="center" gap="xs" w="100%" py="xl">
          <IconUserCircle size={96} stroke={1.5} />
          <Text c="dimmed" fz="sm">
            Belum ada foto
          </Text>
        </Stack>
      )}
      <Box pos="absolute" bottom={0} w="100%" p={{ base: 'xs', md: 'md' }}>
        <Card
          px="lg"
          radius="2xl"
          withBorder
          className="glass3"
          style={{ border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <Tooltip label="Jabatan Resmi" withArrow>
            <Text fz="sm" c="dimmed">
              {data.position || 'Tidak ada jabatan'}
            </Text>
          </Tooltip>
          <Text c={colors['blue-button']} fw={700} fz="xl" mt={4}>
            {data.name}
          </Text>
        </Card>
      </Box>
    </Stack>
  );
}
