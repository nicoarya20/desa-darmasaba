'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Tooltip
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailAPBDesa() {
  const apbState = useProxy(PendapatanAsliDesa.ApbDesa);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    apbState.findUnique.load(params?.id as string);
  }, []);

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);

  const handleHapus = () => {
    if (selectedId) {
      apbState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push(
        '/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa'
      );
    }
  };

  if (!apbState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = apbState.findUnique.data;

  return (
    <Box py={10}>
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      <Paper
        withBorder
        w={{ base: '100%', md: '70%', lg: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail APB Desa
          </Text>

          <Paper bg={colors['BG-trans']} p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">
                  Tahun
                </Text>
                <Text fz="md" c="dimmed">
                  {data.tahun}
                </Text>
              </Box>

              <Box>
                <Stack gap="xs">
                  <Text fw="bold" fz="lg">
                    Detail Pembiayaan
                  </Text>
                  {(data?.pembiayaan || []).map((item) => (
                    <Text fz="md" c="dimmed" key={item.id}>
                      {item.name}: {formatRupiah(Number(item.value))}
                    </Text>
                  ))}
                  <Text fz="md" fw="bold">
                    Total:{' '}
                    {formatRupiah(
                      (data?.pembiayaan || []).reduce(
                        (sum, item) => sum + Number(item.value),
                        0
                      )
                    )}
                  </Text>
                </Stack>
              </Box>

              <Box>
                <Stack gap="xs">
                  <Text fw="bold" fz="lg">
                    Detail Belanja
                  </Text>
                  {(data?.belanja || []).map((item) => (
                    <Text fz="md" c="dimmed" key={item.id}>
                      {item.name}: {formatRupiah(Number(item.value))}
                    </Text>
                  ))}
                  <Text fz="md" fw="bold">
                    Total:{' '}
                    {formatRupiah(
                      (data?.belanja || []).reduce(
                        (sum, item) => sum + Number(item.value),
                        0
                      )
                    )}
                  </Text>
                </Stack>
              </Box>

              <Box>
                <Stack gap="xs">
                  <Text fw="bold" fz="lg">
                    Detail Pendapatan
                  </Text>
                  {(data?.pendapatan || []).map((item) => (
                    <Text fz="md" c="dimmed" key={item.id}>
                      {item.name}: {formatRupiah(Number(item.value))}
                    </Text>
                  ))}
                  <Text fz="md" fw="bold">
                    Total:{' '}
                    {formatRupiah(
                      (data?.pendapatan || []).reduce(
                        (sum, item) => sum + Number(item.value),
                        0
                      )
                    )}
                  </Text>
                </Stack>
              </Box>

              <Group gap="sm" mt={10}>
                <Tooltip label="Hapus APB Desa" withArrow position="top">
                  <Button
                    color="red"
                    onClick={() => {
                      setSelectedId(data.id);
                      setModalHapus(true);
                    }}
                    variant="light"
                    radius="md"
                    size="md"
                  >
                    <IconTrash size={20} />
                  </Button>
                </Tooltip>

                <Tooltip label="Edit APB Desa" withArrow position="top">
                  <Button
                    color="green"
                    onClick={() =>
                      router.push(
                        `/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa/${data.id}/edit`
                      )
                    }
                    variant="light"
                    radius="md"
                    size="md"
                  >
                    <IconEdit size={20} />
                  </Button>
                </Tooltip>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus APB Desa ini?"
      />
    </Box>
  );
}

export default DetailAPBDesa;
