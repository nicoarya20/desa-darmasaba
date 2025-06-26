'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import kontakDarurat from '../../../_state/kesehatan/kontak-darurat/kontakDarurat';

function DetailKontakDarurat() {
  const kontakDaruratState = useProxy(kontakDarurat)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();
  const params = useParams()

  useShallowEffect(() => {
    kontakDaruratState.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      kontakDaruratState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/kesehatan/kontak-darurat")
    }
  }

  if (!kontakDaruratState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton h={400} />
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
          <Text fz={"xl"} fw={"bold"}>Detail Kontak Darurat</Text>
          {kontakDaruratState.findUnique.data ? (
            <Paper bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Judul</Text>
                  <Text fz={"lg"}>{kontakDaruratState.findUnique.data.name}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Deskripsi</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: kontakDaruratState.findUnique.data.deskripsi }} />
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Gambar</Text>
                  <Image src={kontakDaruratState.findUnique.data.image?.link} alt="gambar" />
                </Box>
                <Box>
                  <Flex gap={"xs"}>
                    <Button color="red" onClick={() => {
                      if (kontakDaruratState.findUnique.data) {
                        setSelectedId(kontakDaruratState.findUnique.data.id)
                        setModalHapus(true)
                      }
                    }}
                      disabled={kontakDaruratState.delete.loading || !kontakDaruratState.findUnique.data}
                    >
                      <IconX size={20} />
                    </Button>
                    <Button onClick={() => router.push(`/admin/kesehatan/kontak-darurat/${kontakDaruratState.findUnique.data?.id}/edit`)} color="green">
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
        text="Apakah anda yakin ingin menghapus kontak darurat ini?"
      />
    </Box>
  );
}

export default DetailKontakDarurat;
