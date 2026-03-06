/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import {
  IconAlertTriangle,
  IconAmbulance,
  IconArrowBack, IconBook, IconBuilding, IconBuildingCommunity, IconCash, IconChartLine, IconChristmasTreeFilled, IconClipboard,
  IconDroplet,
  IconEdit, IconFileText, IconFiretruck, IconFirstAidKit, IconHome, IconHomeEco, IconHospital, IconInfoCircle, IconLeaf, IconLifebuoy, IconMessageReport, IconPhoneCall, IconRecycle, IconRun, IconScale,
  IconSchool,
  IconShield,
  IconShieldFilled, IconShoppingCart, IconStethoscope, IconTent, IconTrash, IconTree, IconTrendingUp,
  IconTrophy, IconTruck,
  IconUsers
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
    rumah: IconHome,
    pohon: IconTree,
    air: IconDroplet,
    bantuan: IconCash,
    pelatihan: IconSchool,
    subsidi: IconShoppingCart,
    layananKesehatan: IconHospital,

    // ===== Keamanan & Darurat =====
    polisi: IconShieldFilled,
    ambulans: IconAmbulance,
    pemadam: IconFiretruck,
    darurat: IconAlertTriangle,
    sar: IconLifebuoy,
    evakuasi: IconRun,
    keamanan: IconShield,
    teleponDarurat: IconPhoneCall,

    // ===== Kesehatan =====
    rumahSakit: IconHospital,
    puskesmas: IconFirstAidKit,
    klinik: IconStethoscope,

    // ===== Pemerintahan =====
    bangunan: IconBuilding,
    kantorDesa: IconBuildingCommunity,
    administrasi: IconFileText,
    informasi: IconInfoCircle,
    pengaduan: IconMessageReport,
    layananPublik: IconUsers,
    book: IconBook
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
    <Box px={{ base: 0, md: 'lg' }} py="xs">
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
        w={{ base: "100%", md: "70%" }}
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
                <Box pl={5}>
                  <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data?.deskripsi || '-' }} />
                </Box>
              </Box>

              {/* Tombol aksi */}
              <Group gap="sm" mt="md">
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
                  onClick={() => router.push(`/admin/lingkungan/program-penghijauan/${data.id}/edit`)}
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
        text="Apakah Anda yakin ingin menghapus program penghijauan ini?"
      />
    </Box>
  );
}

export default DetailProgramPenghijauan;
