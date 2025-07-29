'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailDataPerpustakaan() {
  const stateDetail = useProxy(perpustakaanDigitalState.dataPerpustakaan)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter();

  useShallowEffect(() => {
    stateDetail.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      stateDetail.delete.delete(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/pendidikan/perpustakaan-digital/data-perpustakaan")
    }
  }

  if (!stateDetail.findUnique.data) {
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
      <Paper w={{ base: "100%", md: "50%" }} bg={colors['white-1']} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Detail Data Perpustakaan</Text>
          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Judul</Text>
                <Text fz={"lg"}>{stateDetail.findUnique.data?.judul}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Deskripsi</Text>
                <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: stateDetail.findUnique.data?.deskripsi }} />
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Kategori</Text>
                <Text fz={"lg"}>{stateDetail.findUnique.data?.kategori.name}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Gambar</Text>
                <Image src={stateDetail.findUnique.data?.image.link} alt="gambar" />
              </Box>
              <Box>
                <Flex gap={"xs"}>
                  <Button
                    onClick={() => {
                      if (stateDetail.findUnique.data) {
                        setSelectedId(stateDetail.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={!stateDetail.findUnique.data}
                    color="red">
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (stateDetail.findUnique.data) {
                        router.push(`/admin/pendidikan/perpustakaan-digital/data-perpustakaan/${stateDetail.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!stateDetail.findUnique.data}
                    color="green">
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
        text="Apakah anda yakin ingin menghapus data ini?"
      />
    </Box>
  );
}

export default DetailDataPerpustakaan;
