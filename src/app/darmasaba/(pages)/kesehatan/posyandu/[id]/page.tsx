'use client';

import colors from '@/con/colors';
import { Button, Center, Flex, Group, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconCalendar, IconInfoCircle, IconPhone } from '@tabler/icons-react';
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
      <Stack py="xl" px={{ base: 'md', md: 100 }}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = statePosyandu.findUnique.data;

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" px={{ base: 'md', md: 100 }} gap="xl">
      {/* Tombol Kembali */}
      <Group>
        <Button
          variant="subtle"
          onClick={() => router.back()}
          leftSection={<IconArrowBack size={22} color={colors['blue-button']} />}
          mb="sm"
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
        bg={colors['white-trans-1']}
        maw={800}
        mx="auto"
      >
        <Stack gap="md">
          {/* Header */}
          <Text
            ta="center"
            fz={{ base: '1.8rem', md: '2.2rem' }}
            fw={700}
            c={colors['blue-button']}
          >
            {data.name || 'Posyandu Desa'}
          </Text>

          {/* Gambar */}
          {data.image?.link ? (
            <Center>
              <Image
                src={data.image.link}
                alt={`Gambar ${data.name}`}
                w="100%"
                h={300}
                radius="md"
                fit="cover"
                loading="lazy"
              />
            </Center>
          ) : (
            <Center>
              <Text fz="sm" c="dimmed">
                Tidak ada gambar
              </Text>
            </Center>
          )}

          {/* Info utama */}
          <Stack gap="sm" mt="md">
            <Flex align="flex-start" gap="xs">
              <IconPhone size={18} stroke={1.5} style={{ marginTop: 3 }} />
              <Text fz="sm" c="dimmed">
                {data.nomor || 'Nomor tidak tersedia'}
              </Text>
            </Flex>

            <Flex align="flex-start" gap="xs">
              <IconCalendar size={18} stroke={1.5} style={{ marginTop: 3 }} />
              <Text
                fz="sm"
                c="dimmed"
                dangerouslySetInnerHTML={{ __html: data.jadwalPelayanan || '-' }}
                style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
              />
            </Flex>

            <Flex align="flex-start" gap="xs">
              <IconInfoCircle size={18} stroke={1.5} style={{ marginTop: 3 }} />
              <Text
                fz="sm"
                c="dimmed"
                lh={1.6}
                dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
                style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
              />
            </Flex>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
