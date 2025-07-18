/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconChartLine, IconChristmasTreeFilled, IconClipboard, IconDroplet, IconEdit, IconHome, IconHomeEco, IconLeaf, IconRecycle, IconScale, IconShieldFilled, IconTent, IconTrash, IconTree, IconTrendingUp, IconTrophy, IconTruck, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import dataLingkunganDesaState from '../../../_state/lingkungan/data-lingkungan-desa';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailDataLingkunganDesa() {
  const [modalHapus, setModalHapus] = useState(false)
  const stateDataLingkungan = useProxy(dataLingkunganDesaState)
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
    air: IconDroplet
  };

  useShallowEffect(() => {
    stateDataLingkungan.findUnique.load(params?.id as string)
  }, [params?.id])

  const handleHapus = () => {
    if (selectedId) {
      stateDataLingkungan.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/lingkungan/data-lingkungan-desa")
    }
  }

  if (!stateDataLingkungan.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Data Lingkungan Desa</Text>

          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Nama Data Lingkungan Desa</Text>
                <Text fz={"lg"}>{stateDataLingkungan.findUnique.data?.name}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Jumlah Data Lingkungan Desa</Text>
                <Text fz={"lg"}>{stateDataLingkungan.findUnique.data?.jumlah}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Ikon Data Lingkungan Desa</Text>
                {iconMap[stateDataLingkungan.findUnique.data?.icon] && (
                  <Box title={stateDataLingkungan.findUnique.data?.icon}>
                    {React.createElement(iconMap[stateDataLingkungan.findUnique.data?.icon], { size: 24 })}
                  </Box>
                )}
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Deskripsi</Text>
                <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: stateDataLingkungan.findUnique.data?.deskripsi }}></Text>
              </Box>
              <Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (stateDataLingkungan.findUnique.data) {
                        setSelectedId(stateDataLingkungan.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={stateDataLingkungan.delete.loading || !stateDataLingkungan.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (stateDataLingkungan.findUnique.data) {
                        router.push(`/admin/lingkungan/data-lingkungan-desa/${stateDataLingkungan.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!stateDataLingkungan.findUnique.data}
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
        text="Apakah anda yakin ingin menghapus data lingkungan desa ini?"
      /> 
    </Box>
  );
}

export default DetailDataLingkunganDesa;
