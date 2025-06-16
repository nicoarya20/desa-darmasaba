'use client'
import React, { useState } from 'react';
import penghargaanState from '../../../_state/desa/penghargaan';
import { useProxy } from 'valtio/utils';
import { useParams, useRouter } from 'next/navigation';
import { useShallowEffect } from '@mantine/hooks';
import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import colors from '@/con/colors';
import { IconArrowBack, IconX, IconEdit } from '@tabler/icons-react';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailPenghargaan() {
  const statePenghargaan = useProxy(penghargaanState)
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter()
  const params = useParams()

  useShallowEffect(() => {
    statePenghargaan.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      statePenghargaan.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/desa/penghargaan")
    }
  }

  if (!statePenghargaan.findUnique.data) {
    return (
      <Stack py={10}>
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
      <Paper bg={colors['white-1']} w={{ base: "100%", md: "100%", lg: "50%" }} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Detail Penghargaan</Text>
          {statePenghargaan.findUnique.data ? (
            <Paper key={statePenghargaan.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Judul</Text>
                  <Text fz={"lg"}>{statePenghargaan.findUnique.data?.name}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Juara</Text>
                  <Text fz={"lg"}>{statePenghargaan.findUnique.data?.juara}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: statePenghargaan.findUnique.data?.deskripsi }} />
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Gambar</Text>
                  <Image w={{ base: 150, md: 150, lg: 150 }} src={statePenghargaan.findUnique.data?.image?.link} alt="gambar" />
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (statePenghargaan.findUnique.data) {
                        setSelectedId(statePenghargaan.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={statePenghargaan.delete.loading || !statePenghargaan.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (statePenghargaan.findUnique.data) {
                        router.push(`/admin/desa/penghargaan/${statePenghargaan.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!statePenghargaan.findUnique.data}
                    color={"green"}
                  >
                    <IconEdit size={20} />
                  </Button>
                </Flex>
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </Paper>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus penghargaan ini?'
      />
    </Box>
  );
}

export default DetailPenghargaan;
