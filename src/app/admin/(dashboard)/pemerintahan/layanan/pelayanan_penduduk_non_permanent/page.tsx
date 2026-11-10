'use client'
import colors from '@/con/colors';
import { formatBiayaPelayanan } from '@/lib/pelayanan-waktu-biaya';
import {
  Box,
  Button,
  Center,
  Divider,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateLayananDesa from '../../../_state/desa/layananDesa';

function PelayananPendudukNonPermanent() {
  const router = useRouter();
  const pelayananPendudukNonPermanen = useProxy(
    stateLayananDesa.pelayananPendudukNonPermanen
  );

  useShallowEffect(() => {
    pelayananPendudukNonPermanen.findById.load('edit');
  }, []);

  if (!pelayananPendudukNonPermanen.findById.data) {
    return (
      <Stack align="center" justify="center" py="xl">
        <Skeleton radius="md" height={800} />
      </Stack>
    );
  }

  const data = pelayananPendudukNonPermanen.findById.data;

  return (
    <Paper bg={colors['white-1']} p="lg" radius="md" shadow="sm">
      <Stack gap="md">
        {/* Header */}
        <Group justify='space-between' align="center">

          <Title
            order={3}
            lh={1.2}
            c={colors['blue-button']}
          >
            Preview Pelayanan Penduduk Non Permanen
          </Title>
          <Button
            c="green"
            variant="light"
            leftSection={<IconEdit size={18} stroke={2} />}
            radius="md"
            onClick={() =>
              router.push(
                `/admin/pemerintahan/layanan/pelayanan_penduduk_non_permanent/${data.id}`
              )
            }
          >
            Edit
          </Button>
        </Group>

        {/* Content */}
        <Paper p="xl" bg={'white'} withBorder radius="md" shadow="xs">
          <Box px={{ base: 0, md: 50 }} pb="xl">
            <Center>
              <Title
                order={2}
                lh={1.2}
                ta="center"
                c={colors['blue-button']}
              >
                {data.name}
              </Title>
            </Center>

            <Divider my="md" color={colors['blue-button']} />

            <Text ta="center" fz="sm" c="dimmed">
              Estimasi Waktu: {data.estimasiWaktu || '-'} • Biaya: {formatBiayaPelayanan(data.biaya) ?? '-'}
            </Text>

            <Box mt="lg">
              <Text
                py={10}
                ta="justify"
                fz={{ base: 'sm', md: 'md' }}
                lh={{ base: 1.5, md: 1.55 }}
                c="dark"
                dangerouslySetInnerHTML={{ __html: data.deskripsi }}
                style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
              />
            </Box>
          </Box>
        </Paper>
      </Stack>
    </Paper>
  );
}

export default PelayananPendudukNonPermanent;