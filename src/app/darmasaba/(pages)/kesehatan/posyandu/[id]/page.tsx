'use client';

import colors from '@/con/colors';
import {
  Box, Button, Flex, Group, Image,
  Paper, Skeleton, Stack, Text, Title,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import {
  IconArrowBack, IconCalendar, IconInfoCircle,
  IconMapPin, IconPhone,
} from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import posyanduState from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu';

export default function DetailPosyanduUser() {
  const statePosyandu = useProxy(posyanduState);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    statePosyandu.findUnique.load(params?.id as string);
  }, []);

  if (!statePosyandu.findUnique.data) {
    return (
      <Stack py="xl" px={{ base: 'md', md: 100 }} bg={colors.Bg} mih="100vh">
        <Skeleton height={500} radius="lg" />
      </Stack>
    );
  }

  const data = statePosyandu.findUnique.data;

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" px={{ base: 'md', md: 100 }} gap="xl" mih="100vh">
      <Group>
        <Button
          variant="subtle"
          onClick={() => router.back()}
          leftSection={<IconArrowBack size={22} color={colors['blue-button']} />}
          c={colors['blue-button']}
        >
          Kembali
        </Button>
      </Group>

      <Paper
        withBorder
        p="xl"
        radius="lg"
        shadow="md"
        bg="white"
        maw={800}
        mx="auto"
        w="100%"
      >
        <Stack gap="lg">
          <Title ta="center" order={2} c={colors['blue-button']}>
            {data.name || 'Posyandu Desa'}
          </Title>

          {data.image?.link ? (
            <Image
              src={data.image.link}
              alt={`Gambar ${data.name}`}
              w="100%"
              h={300}
              radius="md"
              fit="cover"
              loading="lazy"
            />
          ) : (
            <Box
              h={200}
              style={{
                background: '#f4f5f6',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text fz="sm" c="dimmed">Tidak ada gambar</Text>
            </Box>
          )}

          <Stack gap="sm" mt="sm">
            {data.banjar && (
              <Flex align="center" gap="xs">
                <IconMapPin size={18} stroke={1.5} color={colors['blue-button']} />
                <Text fz={{ base: 'sm', md: 'md' }} c="black">
                  Banjar {data.banjar.name}
                </Text>
              </Flex>
            )}

            <Flex align="center" gap="xs">
              <IconPhone size={18} stroke={1.5} color="gray" />
              <Text fz={{ base: 'sm', md: 'md' }} c="black">
                {data.nomor || 'Nomor tidak tersedia'}
              </Text>
            </Flex>

            <Flex align="flex-start" gap="xs">
              <IconCalendar
                size={18}
                stroke={1.5}
                color="gray"
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <Text
                fz={{ base: 'sm', md: 'md' }}
                c="black"
                lh={1.6}
                dangerouslySetInnerHTML={{ __html: data.jadwalPelayanan || '–' }}
                style={{ wordBreak: 'break-word' }}
              />
            </Flex>

            <Flex align="flex-start" gap="xs">
              <IconInfoCircle
                size={18}
                stroke={1.5}
                color="gray"
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <Text
                fz={{ base: 'sm', md: 'md' }}
                c="black"
                lh={1.6}
                dangerouslySetInnerHTML={{ __html: data.deskripsi || '–' }}
                style={{ wordBreak: 'break-word' }}
              />
            </Flex>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
