'use client'

import { Box, Button, Paper } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import colors from '@/con/colors';


function DetailPengumuman() {
  // const pengumumanState = useProxy(stateDesaPengumuman)
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
  //         <Skeleton h={400} />
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
        {/* <Stack>
          <Text fz={"xl"} fw={"bold"}>Detail Pengumuman</Text>
          {pengumumanState.pengumuman.findUnique.data ? (
            <Paper key={pengumumanState.pengumuman.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Kategori</Text>
                  <Text fz={"lg"}>{pengumumanState.pengumuman.findUnique.data?.CategoryPengumuman?.name}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Judul</Text>
                  <Text fz={"lg"}>{pengumumanState.pengumuman.findUnique.data?.judul}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                  <Text fz={"lg"}>{pengumumanState.pengumuman.findUnique.data?.deskripsi}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Konten</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: pengumumanState.pengumuman.findUnique.data?.content }} />
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (pengumumanState.pengumuman.findUnique.data) {
                        setSelectedId(pengumumanState.pengumuman.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={pengumumanState.pengumuman.delete.loading || !pengumumanState.pengumuman.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                   onClick={() => {
                    if (pengumumanState.pengumuman.findUnique.data) {
                      router.push(`/admin/desa/pengumuman/${pengumumanState.pengumuman.findUnique.data.id}/edit`);
                    }
                   }}
                    disabled={!pengumumanState.pengumuman.findUnique.data}
                    color={"green"}
                  >
                    <IconEdit size={20} />
                  </Button>
                </Flex>
              </Stack>
            </Paper>
          ) : null}
        </Stack> */}
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