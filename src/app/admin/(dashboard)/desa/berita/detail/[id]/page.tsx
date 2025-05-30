'use client'
import { useProxy } from 'valtio/utils';

import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import colors from '@/con/colors';
import { ModalKonfirmasiHapus } from '../../../../_com/modalKonfirmasiHapus';
import stateDashboardBerita from '../../../../_state/desa/berita';

function DetailBerita() {
  const beritaState = useProxy(stateDashboardBerita)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    beritaState.berita.findUnique.load(params?.id as string)
  }, [])


  const handleHapus = () => {
    if (selectedId) {
      beritaState.berita.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/desa/berita")
    }
  }

  if (!beritaState.berita.findUnique.data) {
    return (
      <Stack py={10}>
        {Array.from({ length: 10 }).map((_, k) => (
          <Skeleton key={k} h={40} />
        ))}
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
            {beritaState.berita.findUnique.data ? (
              <Paper key={beritaState.berita.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Kategori</Text>
                  <Text fz={"lg"}>{beritaState.berita.findUnique.data?.kategoriBerita?.name}</Text>
                  <Text fw={"bold"} fz={"lg"}>Judul</Text>
                  <Text fz={"lg"}>{beritaState.berita.findUnique.data?.judul}</Text>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                  <Text fz={"lg"} >{beritaState.berita.findUnique.data?.deskripsi}</Text>
                  <Text fw={"bold"} fz={"lg"}>Gambar</Text>
                  <Image w={{ base: 150, md: 150, lg: 150 }} src={beritaState.berita.findUnique.data?.image?.link} alt="gambar" />
                  <Flex gap={"xs"} mt={10}>
                    <Button
                      onClick={() => {
                        if (beritaState.berita.findUnique.data) {
                          setSelectedId(beritaState.berita.findUnique.data.id);
                          setModalHapus(true);
                        }
                      }}
                      disabled={beritaState.berita.delete.loading || !beritaState.berita.findUnique.data}
                      color={"red"} 
                    >
                      <IconX size={20} />
                    </Button>
                    <Button
                      onClick={() => {
                        if (beritaState.berita.findUnique.data) {
                          router.push(`/admin/desa/berita/edit/${beritaState.berita.findUnique.data.id}`);
                        }
                      }}
                      disabled={!beritaState.berita.findUnique.data}
                      color={"green"} 
                    >
                      <IconEdit size={20} />
                    </Button>
                  </Flex>
                </Box>
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

export default DetailBerita;