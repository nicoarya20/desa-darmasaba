'use client'
import { useProxy } from 'valtio/utils';

import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import layananonlineDesa from '@/app/admin/(dashboard)/_state/inovasi/layanan-online-desa';
import colors from '@/con/colors';


function DetailPengaduanMasyarakat() {
  const pengaduanState = useProxy(layananonlineDesa)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    pengaduanState.pengaduanMasyarakat.findUnique.load(params?.id as string)
  }, [])


  const handleHapus = () => {
    if (selectedId) {
      pengaduanState.pengaduanMasyarakat.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/inovasi/layanan-online-desa/pengaduan-masyarakat")
    }
  }

  if (!pengaduanState.pengaduanMasyarakat.findUnique.data) {
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
          <Flex gap={"xs"} justify={"space-between"} mt={10}>
            <Text fz={"xl"} fw={"bold"}>Detail Pengaduan Masyarakat</Text>
            <Button
              onClick={() => {
                if (pengaduanState.pengaduanMasyarakat.findUnique.data) {
                  setSelectedId(pengaduanState.pengaduanMasyarakat.findUnique.data.id);
                  setModalHapus(true);
                }
              }}
              disabled={pengaduanState.pengaduanMasyarakat.delete.loading || !pengaduanState.pengaduanMasyarakat.findUnique.data}
              color={"red"}
            >
              <IconTrash size={20} />
            </Button>
          </Flex>
          {pengaduanState.pengaduanMasyarakat.findUnique.data ? (
            <Paper key={pengaduanState.pengaduanMasyarakat.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Nama</Text>
                  <Text fz={"lg"}>{pengaduanState.pengaduanMasyarakat.findUnique.data?.name}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Email</Text>
                  <Text fz={"lg"}>{pengaduanState.pengaduanMasyarakat.findUnique.data?.email}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Nomor Telepon</Text>
                  <Text fz={"lg"} >{pengaduanState.pengaduanMasyarakat.findUnique.data?.nomorTelepon}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>NIK</Text>
                  <Text fz={"lg"} >{pengaduanState.pengaduanMasyarakat.findUnique.data?.nik}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Judul Pengaduan</Text>
                  <Text fz={"lg"} >{pengaduanState.pengaduanMasyarakat.findUnique.data?.judulPengaduan}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Lokasi Kejadian</Text>
                  <Text fz={"lg"} >{pengaduanState.pengaduanMasyarakat.findUnique.data?.lokasiKejadian}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi Pengaduan</Text>
                  <Text fz={"lg"} >{pengaduanState.pengaduanMasyarakat.findUnique.data?.deskripsiPengaduan}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Jenis Pengaduan</Text>
                  <Text fz={"lg"} >{pengaduanState.pengaduanMasyarakat.findUnique.data?.jenisPengaduan?.nama}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Gambar</Text>
                  <Image w={{ base: 150, md: 150, lg: 150 }} src={pengaduanState.pengaduanMasyarakat.findUnique.data?.image?.link} alt="gambar" loading="lazy"/>
                </Box>
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
        text='Apakah anda yakin ingin menghapus administrasi online ini?'
      />
    </Box>
  );
}

export default DetailPengaduanMasyarakat;