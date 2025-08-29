'use client'
import { useProxy } from 'valtio/utils';

import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import colors from '@/con/colors';

import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';

function DetailSiswa() {
  const detailState = useProxy(infoSekolahPaud.siswa)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    detailState.findUnique.load(params?.id as string)
  }, [])


  const handleHapus = () => {
    if (selectedId) {
      detailState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/pendidikan/info-sekolah/siswa")
    }
  }

  if (!detailState.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Siswa</Text>
          {detailState.findUnique.data ? (
            <Paper key={detailState.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Nama</Text>
                  <Text fz={"lg"}>{detailState.findUnique.data?.nama}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Lembaga</Text>
                  <Text fz={"lg"} >{detailState.findUnique.data?.lembaga?.nama}</Text>
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (detailState.findUnique.data) {
                        setSelectedId(detailState.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={detailState.delete.loading || !detailState.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (detailState.findUnique.data) {
                        router.push(`/admin/pendidikan/info-sekolah/siswa/${detailState.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!detailState.findUnique.data}
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
        text='Apakah anda yakin ingin menghapus siswa ini?'
      />
    </Box>
  );
}

export default DetailSiswa;