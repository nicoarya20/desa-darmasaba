'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Flex, Text, Image, Skeleton } from '@mantine/core';
import { IconArrowBack, IconX, IconEdit } from '@tabler/icons-react';
import { useRouter,useParams } from 'next/navigation';
import React from 'react';
// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import { useProxy } from 'valtio/utils';
import kontakDaruratKeamananState from '../../../_state/keamanan/kontak-darurat-keamanan';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailKontakDarurat() {
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();
  const params = useParams()
  const kontakState = useProxy(kontakDaruratKeamananState)

  useShallowEffect(() => {
    kontakState.findUnique.load(params?.id as string)
  }, [])

  const handleDelete = () => {
    if (selectedId) {
      kontakState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/keamanan/kontak-darurat")
    }
  }

  if (!kontakState.findUnique.data) {
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
        <Text fz={"xl"} fw={"bold"}>Detail Kontak Darurat</Text>
        {kontakState.findUnique.data ? (
          <Paper key={kontakState.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fw={"bold"} fz={"lg"}>Judul Kontak Darurat</Text>
                <Text fz={"lg"}>{kontakState.findUnique.data?.nama}</Text>
              </Box>
              <Box>
                <Text fw={"bold"} fz={"lg"}>Gambar</Text>
                <Image w={{ base: 150, md: 150, lg: 150 }} src={kontakState.findUnique.data?.image?.link} alt="gambar" />
              </Box>
              <Box>
                <Text fw={"bold"} fz={"lg"}>Kontak</Text>
                <Stack>
                  {kontakState.findUnique.data?.kontakItems.map((item, index) => (
                    <Box key={index}>
                      <Text fz={"lg"}>{item.nama}</Text>
                      <Text fz={"lg"}>{item.nomorTelepon}</Text>
                      <Image w={{ base: 150, md: 150, lg: 150 }} src={item.image?.link} alt="gambar" />
                    </Box>
                  ))}
                </Stack>
              </Box>
              <Flex gap={"xs"} mt={10}>
                <Button
                  onClick={() => {
                    if (kontakState.findUnique.data) {
                      setSelectedId(kontakState.findUnique.data.id);
                      setModalHapus(true);
                    }
                  }}
                  disabled={kontakState.delete.loading || !kontakState.findUnique.data}
                  color={"red"}
                >
                  <IconX size={20} />
                </Button>
                <Button
                  onClick={() => {
                    if (kontakState.findUnique.data) {
                      router.push(`/admin/keamanan/kontak-darurat/${kontakState.findUnique.data.id}/edit`);
                    }
                  }}
                  disabled={!kontakState.findUnique.data}
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
      onConfirm={handleDelete}
      text='Apakah anda yakin ingin menghapus kontak darurat ini?'
    />
  </Box>
  );
}

export default DetailKontakDarurat;
