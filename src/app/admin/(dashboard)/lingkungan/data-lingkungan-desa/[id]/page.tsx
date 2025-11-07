/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import {
  IconArrowBack,
  IconChartLine,
  IconChristmasTreeFilled,
  IconClipboard,
  IconDroplet,
  IconEdit,
  IconHome,
  IconHomeEco,
  IconLeaf,
  IconRecycle,
  IconScale,
  IconShieldFilled,
  IconTent,
  IconTrash,
  IconTree,
  IconTrendingUp,
  IconTrophy,
  IconTruck,
} from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import dataLingkunganDesaState from '../../../_state/lingkungan/data-lingkungan-desa';

function DetailDataLingkunganDesa() {
  const [modalHapus, setModalHapus] = useState(false);
  const stateDataLingkungan = useProxy(dataLingkunganDesaState);
  const router = useRouter();
  const params = useParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const iconMap: Record<string, React.FC<any>> = {
    ekowisata: IconLeaf,
    kompetisi: IconTrophy,
    wisata: IconTent,
    ekonomi: IconChartLine,
    sampah: IconRecycle,
    truck: IconTruck,
    scale: IconScale,
    clipboard: IconClipboard,
    trash: IconTrash,
    lingkunganSehat: IconHomeEco,
    sumberOksigen: IconChristmasTreeFilled,
    ekonomiBerkelanjutan: IconTrendingUp,
    mencegahBencana: IconShieldFilled,
    rumah: IconHome,
    pohon: IconTree,
    air: IconDroplet,
  };

  useShallowEffect(() => {
    stateDataLingkungan.findUnique.load(params?.id as string);
  }, [params?.id]);

  const handleHapus = () => {
    if (selectedId) {
      stateDataLingkungan.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push('/admin/lingkungan/data-lingkungan-desa');
    }
  };

  if (!stateDataLingkungan.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = stateDataLingkungan.findUnique.data;

  return (
    <Box py={10}>
      {/* Back Button */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      {/* Main Card */}
      <Paper
        withBorder
        w={{ base: '100%', md: '60%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          {/* Title */}
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Data Lingkungan Desa
          </Text>

          {/* Content Card */}
          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama Data Lingkungan Desa</Text>
                <Text fz="md" c="dimmed">{data?.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Jumlah Data Lingkungan Desa</Text>
                <Text fz="md" c="dimmed">{data?.jumlah || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Ikon Data Lingkungan Desa</Text>
                {iconMap[data?.icon] ? (
                  <Box title={data?.icon}>
                    {React.createElement(iconMap[data.icon], { size: 28, color: colors['blue-button'] })}
                  </Box>
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada ikon</Text>
                )}
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data?.deskripsi || '-' }} />
              </Box>

              {/* Action Buttons */}
              <Group gap="sm" mt="sm">
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

                <Button
                  color="green"
                  onClick={() => router.push(`/admin/lingkungan/data-lingkungan-desa/${data.id}/edit`)}
                  variant="light"
                  radius="md"
                  size="md"
                >
                  <IconEdit size={20} />
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus data lingkungan desa ini?"
      />
    </Box>
  );
}

export default DetailDataLingkunganDesa;
