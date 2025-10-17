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
          fit="contain"
          radius="lg"
          loading="lazy"
          style={{
            objectPosition: 'bottom center',
            transform: 'translateY(10px)', // sedikit turun biar natural
          }}
        />
      ) : (
        <Stack align="center" gap="xs" w="100%" py="xl">
          <IconUserCircle size={96} stroke={1.5} />
          <Text c="dimmed" fz="sm">
            Belum ada foto
          </Text>
        </Stack>
      )}

      {/* Box nama dan jabatan - sedikit overlap dengan gambar */}
      <Box
        pos="absolute"
        bottom={-20} // bikin naik sedikit ke gambar
        right={0}
        w="100%"
        p={{ base: 'xs', md: 'md' }}
        style={{ pointerEvents: 'none' }} // biar ga ganggu klik di gambar
      >
        <Card
          px="lg"
          py="sm"
          radius="lg"
          withBorder
          style={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(6px)',
            pointerEvents: 'auto',
          }}
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
