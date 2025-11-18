import colors from '@/con/colors';
import { Box, Card, Image, Stack, Text } from '@mantine/core';
import { Prisma } from '@prisma/client';
import { IconUserCircle } from '@tabler/icons-react';

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
      w={{
        base: '100%',    // mobile: full width
        xs: '100%',      // small mobile
        sm: '85%',       // tablet: 85%
        md: '60%',       // laptop: 60%
        lg: '55%',       // laptop large: 55%
        xl: '50%'        // extra large (4K): 50%
      }}
      px={{ base: 'md', sm: 'lg', md: 'xl', xl: '2xl' }}
      h={{ base: 'auto', sm: '500px', md: '600px', lg: '650px', xl: '700px' }}
    >
      {data.image?.link ? (
        <Box
          pos="relative"
          w="100%"
          h="100%"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <Image
            src={data.image.link}
            alt={data.name || 'Foto profil'}
            fit="contain"
            radius="lg"
            loading="lazy"
            w="100%"
            h="100%"
            style={{
              objectPosition: 'center bottom',
            }}
          />
        </Box>
      ) : (
        <Stack align="center" gap="xs" w="100%" py="xl">
          <IconUserCircle size={96} stroke={1.5} />
          <Text c="dimmed" fz="sm">
            Belum ada foto
          </Text>
        </Stack>
      )}

      {/* Box nama dan jabatan - responsive positioning */}
      <Box
        pos="absolute"
        bottom={{ base: -30, sm: -25, md: -20 }}
        right={0}
        w={{ base: '95%', sm: '100%' }}
        px={{ base: 'xs', sm: 'sm', md: 'md' }}
        style={{ pointerEvents: 'none' }}
      >
        <Card
          px={{ base: 'md', sm: 'lg' }}
          py={{ base: 'xs', sm: 'sm' }}
          radius="lg"
          withBorder
          style={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(6px)',
            pointerEvents: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
            <Text
              fz={{ base: 'xs', sm: 'sm' }}
              c="dimmed"
              lineClamp={1}
            >
              {data.position || 'Tidak ada jabatan'}
            </Text>
          <Text
            c={colors['blue-button']}
            fw={700}
            fz={{ base: 'lg', sm: 'xl' }}
            mt={4}
            lineClamp={2}
          >
            {data.name}
          </Text>
        </Card>
      </Box>
    </Stack>
  );
}