/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import {
  IconArrowBack, IconChartLine, IconChristmasTreeFilled, IconClipboard,
  IconEdit, IconHomeEco, IconLeaf, IconRecycle, IconScale,
  IconShieldFilled, IconTent, IconTrash, IconTrendingUp,
  IconTrophy, IconTruck
} from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import programPenghijauanState from '../../../_state/lingkungan/program-penghijauan';

function DetailProgramPenghijauan() {
  const [modalHapus, setModalHapus] = useState(false)
  const stateProgramPenghijauan = useProxy(programPenghijauanState)
  const router = useRouter()
  const params = useParams()
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
  };

  useShallowEffect(() => {
    stateProgramPenghijauan.findUnique.load(params?.id as string)
  }, [params?.id])

  const handleHapus = () => {
    if (selectedId) {
      stateProgramPenghijauan.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/lingkungan/program-penghijauan")
    }
  }

  if (!stateProgramPenghijauan.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    )
  }

  const data = stateProgramPenghijauan.findUnique.data

  return (
    <Box py={10}>
      {/* Tombol kembali */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      {/* Konten detail */}
      <Paper
        withBorder
        w={{ base: "100%", md: "60%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Program Penghijauan
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama Program</Text>
                <Text fz="md" c="dimmed">{data?.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Ikon Program</Text>
                {iconMap[data?.icon] ? (
                  <Box title={data?.icon}>
                    {React.createElement(iconMap[data.icon], { size: 28, color: colors['blue-button'] })}
                  </Box>
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada ikon</Text>
                )}
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Judul Deskripsi</Text>
                <Text fz="md" c="dimmed">{data?.judul || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text fz="md" c="dimmed" dangerouslySetInnerHTML={{ __html: data?.deskripsi || '-' }} />
              </Box>

              {/* Tombol aksi */}
              <Group gap="sm" mt="md">
                <Tooltip label="Hapus Program" withArrow position="top">
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

                <Tooltip label="Edit Program" withArrow position="top">
                  <Button
                    color="green"
                    onClick={() => router.push(`/admin/lingkungan/program-penghijauan/${data.id}/edit`)}
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

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus program penghijauan ini?"
      /> 
    </Box>
  );
}

export default DetailProgramPenghijauan;
