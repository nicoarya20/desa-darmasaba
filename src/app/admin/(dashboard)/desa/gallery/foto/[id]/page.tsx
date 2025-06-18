'use client'
import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
import React from 'react';
import { useProxy } from 'valtio/utils';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useShallowEffect } from '@mantine/hooks';
import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import colors from '@/con/colors';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';

function DetailFoto() {
  const fotoState = useProxy(stateGallery.foto)
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    fotoState.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      fotoState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/desa/gallery/foto")
    }
  }

  if (!fotoState.findUnique.data) {
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
      <Paper bg={colors['white-1']} w={{ base: "100%", md: "100%", lg: "50%" }} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Detail Foto</Text>
          {fotoState.findUnique.data ? (
            <Paper key={fotoState.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Judul</Text>
                  <Text fz={"lg"}>{fotoState.findUnique.data?.name}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Tanggal Foto</Text>
                  <Text fz={"lg"}>{new Date(fotoState.findUnique.data?.createdAt).toDateString()}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: fotoState.findUnique.data?.deskripsi }} />
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Gambar</Text>
                  <Image w={{ base: 300, md: 350}} src={fotoState.findUnique.data?.imageGalleryFoto?.link} alt="gambar" />
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (fotoState.findUnique.data) {
                        setSelectedId(fotoState.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={fotoState.delete.loading || !fotoState.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (fotoState.findUnique.data) {
                        router.push(`/admin/desa/gallery/foto/${fotoState.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!fotoState.findUnique.data}
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

export default DetailFoto;
