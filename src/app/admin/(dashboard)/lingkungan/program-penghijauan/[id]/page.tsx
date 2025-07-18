/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconChartLine, IconChristmasTreeFilled, IconClipboard, IconEdit, IconHomeEco, IconLeaf, IconRecycle, IconScale, IconShieldFilled, IconTent, IconTrash, IconTrendingUp, IconTrophy, IconTruck, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import programPenghijauanState from '../../../_state/lingkungan/program-penghijauan';

// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

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
      <Stack>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper w={{ base: "100%", md: "50%" }} bg={colors['white-1']} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Detail Program Penghijauan</Text>

          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Nama Program Penghijauan</Text>
                <Text fz={"lg"}>{stateProgramPenghijauan.findUnique.data?.name}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Ikon Program Penghijauan</Text>
                {iconMap[stateProgramPenghijauan.findUnique.data?.icon] && (
                  <Box title={stateProgramPenghijauan.findUnique.data?.icon}>
                    {React.createElement(iconMap[stateProgramPenghijauan.findUnique.data?.icon], { size: 24 })}
                  </Box>
                )}
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Judul Deskripsi Program Penghijauan</Text>
                <Text fz={"lg"}>{stateProgramPenghijauan.findUnique.data?.judul}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Deskripsi Program Penghijauan</Text>
                <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: stateProgramPenghijauan.findUnique.data?.deskripsi }}></Text>
              </Box>
              <Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (stateProgramPenghijauan.findUnique.data) {
                        setSelectedId(stateProgramPenghijauan.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={stateProgramPenghijauan.delete.loading || !stateProgramPenghijauan.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (stateProgramPenghijauan.findUnique.data) {
                        router.push(`/admin/lingkungan/program-penghijauan/${stateProgramPenghijauan.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!stateProgramPenghijauan.findUnique.data}
                    color={"green"}
                  >
                    <IconEdit size={20} />
                  </Button>
                </Flex>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus program penghijauan ini?"
      /> 
    </Box>
  );
}

export default DetailProgramPenghijauan;
