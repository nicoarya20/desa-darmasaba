'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Flex, Text, Image } from '@mantine/core';
import { IconArrowBack, IconX, IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import penangananDarurat from '../../../_state/kesehatan/penanganan-darurat/penangananDarurat';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import { useParams } from 'next/navigation';
import { Skeleton } from '@mantine/core';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailPenangananDarurat() {
  const penangananDaruratState = useProxy(penangananDarurat)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();
  const params = useParams()

  useShallowEffect(() => {
    penangananDaruratState.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      penangananDaruratState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/kesehatan/penanganan-darurat")
    }
  }

  if (!penangananDaruratState.findUnique.data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
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
          <Text fz={"xl"} fw={"bold"}>Detail Penanganan Darurat</Text>
          {penangananDaruratState.findUnique.data ? (
            <Paper bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Nama Penanganan Darurat</Text>
                  <Text fz={"lg"}>{penangananDaruratState.findUnique.data.name}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Deskripsi</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: penangananDaruratState.findUnique.data.deskripsi }} />
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Gambar</Text>
                  <Image src={penangananDaruratState.findUnique.data.image?.link} alt="gambar" />
                </Box>
                <Box>
                  <Flex gap={"xs"}>
                    <Button color="red" onClick={() => {
                      if (penangananDaruratState.findUnique.data) {
                        setSelectedId(penangananDaruratState.findUnique.data.id)
                        setModalHapus(true)
                      }
                    }}
                      disabled={penangananDaruratState.delete.loading || !penangananDaruratState.findUnique.data}>
                      <IconX size={20} />
                    </Button>
                    <Button onClick={() => router.push(`/admin/kesehatan/penanganan-darurat/${penangananDaruratState.findUnique.data?.id}/edit`)} color="green">
                      <IconEdit size={20} />
                    </Button>
                  </Flex>
                </Box>
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus penanganan darurat ini?"
      />
    </Box>
  );
}

export default DetailPenangananDarurat;
