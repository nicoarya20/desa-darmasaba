'use client'

import { Box, Button, Flex, Image, Paper, Stack, Text } from '@mantine/core';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import colors from '@/con/colors';
// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
// import stateDashboardBerita from '../../../_state/desa/berita';

function DetailPengumuman() {
  // const pengumumanState = useProxy(stateDashboardpengumuman)
  // const [modalHapus, setModalHapus] = useState(false)
  // const [selectedId, setSelectedId] = useState<string | null>(null)
  // const params = useParams()
  const router = useRouter()

  // useShallowEffect(() => {
  //   pengumumanState.pengumuman.findUnique.load(params?.id as string)
  // }, [])


  // const handleHapus = () => {
  //   if (selectedId) {
  //     pengumumanState.pengumuman.delete.byId(selectedId)
  //     setModalHapus(false)
  //     setSelectedId(null)
  //     router.push("/admin/desa/pengumuman")
  //   }
  // }

  // if (!pengumumanState.pengumuman.findUnique.data) {
  //   return (
  //     <Stack py={10}>
  //       {Array.from({ length: 10 }).map((_, k) => (
  //         <Skeleton key={k} h={40} />
  //       ))}
  //     </Stack>
  //   )
  // }

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper bg={colors['white-1']} w={{ base: "100%", md: "100%", lg: "50%" }} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Detail Pengumuman</Text>
            <Paper bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Kategori</Text>
                  <Text fz={"lg"}>Pendidikan</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Judul</Text>
                  <Text fz={"lg"}>Pengumuman Pendidikan</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi Singkat</Text>
                  <Text fz={"lg"}>Pengumuman Pendidikan</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                  <Text fz={"lg"}>Pengumuman Pendidikan</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Tanggal</Text>
                  <Text fz={"lg"}>2025-06-04</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Waktu</Text>
                  <Text fz={"lg"}>08:00 - 17:00</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Gambar</Text>
                  <Image w={{ base: 150, md: 150, lg: 150 }} src={"/"} alt="gambar" />
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Konten</Text>
                  <Text fz={"lg"}>Pengumuman Pendidikan</Text>
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => router.push("/admin/desa/pengumuman")}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => router.push("/admin/desa/pengumuman/edit")}
                    color={"green"}
                  >
                    <IconEdit size={20} />
                  </Button>
                </Flex>
              </Stack>
            </Paper>
        </Stack>
      </Paper>

      {/* Modal Konfirmasi Hapus
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus berita ini?'
      /> */}
    </Box>
  );
}

export default DetailPengumuman;