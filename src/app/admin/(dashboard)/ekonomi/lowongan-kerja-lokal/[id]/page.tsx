'use client'
import { useProxy } from 'valtio/utils';

import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import colors from '@/con/colors';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import lowonganKerjaState from '../../../_state/ekonomi/lowongan-kerja';



function DetailLowonganKerjaLokal() {
  const lowonganState = useProxy(lowonganKerjaState)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    lowonganState.findUnique.load(params?.id as string)
  }, [])


  const handleHapus = () => {
    if (selectedId) {
      lowonganState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/ekonomi/lowongan-kerja-lokal")
    }
  }

  if (!lowonganState.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Lowongan Kerja Lokal</Text>
          {lowonganState.findUnique.data ? (
            <Paper key={lowonganState.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Bekerja Sebagai</Text>
                  <Text fz={"lg"}>{lowonganState.findUnique.data?.posisi}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Nama Usaha</Text>
                  <Text fz={"lg"}>{lowonganState.findUnique.data?.namaPerusahaan}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Lokasi</Text>
                  <Text fz={"lg"}>{lowonganState.findUnique.data?.lokasi}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Tipe Pekerjaan</Text>
                  <Text fz={"lg"}>{lowonganState.findUnique.data?.tipePekerjaan}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Gaji</Text>
                  <Text fz={"lg"}>{lowonganState.findUnique.data?.gaji}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: lowonganState.findUnique.data?.deskripsi }} />
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Kualifikasi</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: lowonganState.findUnique.data?.kualifikasi }} />
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (lowonganState.findUnique.data) {
                        setSelectedId(lowonganState.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={lowonganState.delete.loading || !lowonganState.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (lowonganState.findUnique.data) {
                        router.push(`/admin/ekonomi/lowongan-kerja-lokal/${lowonganState.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!lowonganState.findUnique.data}
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
        text='Apakah anda yakin ingin menghapus lowongan kerja ini?'
      />
    </Box>
  );
}

export default DetailLowonganKerjaLokal;