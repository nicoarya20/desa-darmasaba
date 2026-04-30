'use client'
import colors from '@/con/colors';
import {
  Badge,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconArrowRight, IconCalendar, IconMapPin, IconUsers } from '@tabler/icons-react';

const formatTanggal = (val: string) =>
  val
    ? new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

export function KegiatanCard({
  item,
  onNavigate,
}: {
  item: {
    id: string;
    judul: string;
    deskripsiSingkat: string;
    tanggal: string;
    lokasi?: string;
    partisipan?: number;
    image?: { link: string } | null;
    kategoriKegiatan?: { nama: string } | null;
  };
  onNavigate: () => void;
}) {
  return (
    <Card
      shadow="sm"
      radius="lg"
      withBorder
      style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
      onClick={onNavigate}
    >
      <Card.Section>
        <Image
          src={item.image?.link || '/images/placeholder-small.jpg'}
          height={200}
          alt={item.judul}
          fit="cover"
          loading="lazy"
        />
      </Card.Section>

      <Stack mt="md" gap="xs">
        <Badge color="blue" variant="light" size="sm" radius="md" w="fit-content">
          {item.kategoriKegiatan?.nama || 'Kegiatan'}
        </Badge>

        <Title order={4} lineClamp={2} lh={1.35} fz={{ base: 'sm', md: 'md' }}>
          {item.judul}
        </Title>

        <Text c="dimmed" lineClamp={2} fz={{ base: 'xs', md: 'sm' }} lh={1.55}>
          {item.deskripsiSingkat}
        </Text>

        <Divider my={4} />

        <Stack gap={4}>
          <Group gap={6} wrap="nowrap">
            <IconCalendar size={13} color="gray" />
            <Text fz="xs" c="dimmed">{formatTanggal(item.tanggal)}</Text>
          </Group>
          <Group gap={6} wrap="nowrap">
            <IconMapPin size={13} color="gray" />
            <Text fz="xs" c="dimmed" lineClamp={1}>{item.lokasi || '-'}</Text>
          </Group>
          <Group gap={6} wrap="nowrap">
            <IconUsers size={13} color="gray" />
            <Text fz="xs" c="dimmed">{item.partisipan ?? 0} partisipan</Text>
          </Group>
        </Stack>

        <Flex justify="flex-end" mt="xs">
          <Button
            size="compact-sm"
            variant="light"
            color={colors['blue-button']}
            rightSection={<IconArrowRight size={14} />}
            radius="md"
          >
            Lihat Detail
          </Button>
        </Flex>
      </Stack>
    </Card>
  );
}
