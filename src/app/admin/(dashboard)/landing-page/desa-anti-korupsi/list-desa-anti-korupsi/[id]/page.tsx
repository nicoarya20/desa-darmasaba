'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';


function DetailKegiatanDesa() {
  const detailState = useProxy(korupsiState.desaAntikorupsi)
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
      router.push("/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi")
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
          <Text fz={"xl"} fw={"bold"}>Detail List Desa Anti Korupsi</Text>
          {detailState.findUnique.data ? (
            <Paper key={detailState.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Judul</Text>
                  <Text fz={"lg"}>{detailState.findUnique.data?.name}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: detailState.findUnique.data?.deskripsi }} />
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Kategori</Text>
                  <Text fz={"lg"}>{detailState.findUnique.data?.kategori?.name}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Dokumen</Text>
                  {detailState.findUnique.data?.file?.link ? (
                    <iframe
                      src={detailState.findUnique.data.file.link}
                      width="100%"
                      height="500px"
                      style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                    />
                  ) : (
                    <Text>Tidak ada dokumen tersedia</Text>
                  )}
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
                        router.push(`/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/${detailState.findUnique.data.id}/edit`);
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
        text='Apakah anda yakin ingin menghapus desa anti korupsi ini?'
      />
    </Box>
  );
}

export default DetailKegiatanDesa;