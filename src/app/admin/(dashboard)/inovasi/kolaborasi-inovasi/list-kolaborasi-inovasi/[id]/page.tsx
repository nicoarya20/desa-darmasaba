'use client'
import { useProxy } from 'valtio/utils';

import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import kolaborasiInovasiState from '@/app/admin/(dashboard)/_state/inovasi/kolaborasi-inovasi';
import colors from '@/con/colors';

function DetailKolaborasiInovasi() {
  const kolaborasiState = useProxy(kolaborasiInovasiState)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    kolaborasiState.findUnique.load(params?.id as string)
  }, [])


  const handleHapus = () => {
    if (selectedId) {
      kolaborasiState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/inovasi/kolaborasi-inovasi")
    }
  }

  if (!kolaborasiState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton h={40} />
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
          <Text fz={"xl"} fw={"bold"}>Detail Kolaborasi Inovasi</Text>
          {kolaborasiState.findUnique.data ? (
            <Paper key={kolaborasiState.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Nama Kolaborasi Inovasi</Text>
                  <Text fz={"lg"}>{kolaborasiState.findUnique.data?.name}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Tahun</Text>
                  <Text fz={"lg"}>{kolaborasiState.findUnique.data?.tahun}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi Singkat</Text>
                  <Text fz={"lg"} >{kolaborasiState.findUnique.data?.slug}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: kolaborasiState.findUnique.data?.deskripsi }} />
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Kolaborator</Text>
                  <Text fz={"lg"}>{kolaborasiState.findUnique.data?.kolaborator}</Text>
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (kolaborasiState.findUnique.data) {
                        setSelectedId(kolaborasiState.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={kolaborasiState.delete.loading || !kolaborasiState.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (kolaborasiState.findUnique.data) {
                        router.push(`/admin/inovasi/kolaborasi-inovasi/${kolaborasiState.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!kolaborasiState.findUnique.data}
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
        text='Apakah anda yakin ingin menghapus kolaborasi inovasi ini?'
      />
    </Box>
  );
}

export default DetailKolaborasiInovasi;