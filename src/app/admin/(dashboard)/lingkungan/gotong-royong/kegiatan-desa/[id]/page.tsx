'use client'
import { useProxy } from 'valtio/utils';

import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import colors from '@/con/colors';

import gotongRoyongState from '@/app/admin/(dashboard)/_state/lingkungan/gotong-royong';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';

function DetailKegiatanDesa() {
  const kegiatanDesaState = useProxy(gotongRoyongState.kegiatanDesa)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    kegiatanDesaState.findUnique.load(params?.id as string)
  }, [])


  const handleHapus = () => {
    if (selectedId) {
      kegiatanDesaState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/lingkungan/gotong-royong/kegiatan-desa")
    }
  }

  if (!kegiatanDesaState.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail kegiatanDesa Inovasi</Text>
          {kegiatanDesaState.findUnique.data ? (
            <Paper key={kegiatanDesaState.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Judul Kegiatan Desa Inovasi</Text>
                  <Text fz={"lg"}>{kegiatanDesaState.findUnique.data?.judul}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Tanggal</Text>
                  <Text fz={"lg"}>{kegiatanDesaState.findUnique.data?.tanggal
                    ? new Date(kegiatanDesaState.findUnique.data.tanggal).toLocaleDateString()
                    : "-"}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi Singkat</Text>
                  <Text fz={"lg"} >{kegiatanDesaState.findUnique.data?.deskripsiSingkat}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: kegiatanDesaState.findUnique.data?.deskripsiLengkap }} />
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Kategori Kegiatan</Text>
                  <Text fz={"lg"}>{kegiatanDesaState.findUnique.data?.kategoriKegiatan?.nama}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Partisipan</Text>
                  <Text fz={"lg"}>{kegiatanDesaState.findUnique.data?.partisipan}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Lokasi</Text>
                  <Text fz={"lg"}>{kegiatanDesaState.findUnique.data?.lokasi}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Gambar</Text>
                  <Image w={{ base: 150, md: 150, lg: 150 }} src={kegiatanDesaState.findUnique.data?.image?.link} alt="gambar" />
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (kegiatanDesaState.findUnique.data) {
                        setSelectedId(kegiatanDesaState.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={kegiatanDesaState.delete.loading || !kegiatanDesaState.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (kegiatanDesaState.findUnique.data) {
                        router.push(`/admin/lingkungan/gotong-royong/kegiatan-desa/${kegiatanDesaState.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!kegiatanDesaState.findUnique.data}
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
        text='Apakah anda yakin ingin menghapus kegiatan desa ini?'
      />
    </Box>
  );
}

export default DetailKegiatanDesa;