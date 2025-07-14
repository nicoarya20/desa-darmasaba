'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import daftarInformasiPublik from '../../../_state/ppid/daftar_informasi_publik/daftarInformasiPublik';
import { useShallowEffect } from '@mantine/hooks';

function DetailDaftarInformasiPublik() {
  const [modalHapus, setModalHapus] = useState(false)
  const stateDaftarInformasi = useProxy(daftarInformasiPublik)
  const router = useRouter()
  const params = useParams()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useShallowEffect(() => {
    stateDaftarInformasi.findUnique.load(params?.id as string)
  }, [params?.id])

  const handleHapus = () => {
    if (selectedId) {
      stateDaftarInformasi.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/ppid/daftar-informasi-publik-desa-darmasaba")
    }
  }

  if (!stateDaftarInformasi.findUnique.data) {
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
      <Paper bg={colors['white-1']} w={{ base: "100%", md: "100%", lg: "50%" }} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Detail Berita</Text>
          {stateDaftarInformasi.findUnique.data ? (
            <Paper key={stateDaftarInformasi.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Jenis Informasi</Text>
                  <Text fz={"lg"}>{stateDaftarInformasi.findUnique.data?.jenisInformasi}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Tanggal</Text>
                  <Text fz={"lg"}>{stateDaftarInformasi.findUnique.data?.tanggal
                    ? new Date(stateDaftarInformasi.findUnique.data.tanggal).toLocaleDateString()
                    : "-"}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: stateDaftarInformasi.findUnique.data?.deskripsi }} />
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (stateDaftarInformasi.findUnique.data) {
                        setSelectedId(stateDaftarInformasi.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={stateDaftarInformasi.delete.loading || !stateDaftarInformasi.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (stateDaftarInformasi.findUnique.data) {
                        router.push(`/admin/ppid/daftar-informasi-publik-desa-darmasaba/${stateDaftarInformasi.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!stateDaftarInformasi.findUnique.data}
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
        text='Apakah anda yakin ingin menghapus berita ini?'
      />
    </Box>
  );
}

export default DetailDaftarInformasiPublik;
