'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Flex, Text, Image, Skeleton } from '@mantine/core';
import { IconArrowBack, IconX, IconEdit } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import infoWabahPenyakit from '../../../_state/kesehatan/info-wabah-penyakit/infoWabahPenyakit';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailInfoWabahPenyakit() {
  const infoWabahPenyakitState = useProxy(infoWabahPenyakit)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();
  const params = useParams()

  useShallowEffect(() => {
    infoWabahPenyakitState.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      infoWabahPenyakitState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/kesehatan/info-wabah-penyakit")
    }
  }

  if (!infoWabahPenyakitState.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Info Wabah Penyakit</Text>
          {infoWabahPenyakitState.findUnique.data ? (
            <Paper bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Judul</Text>
                  <Text fz={"lg"}>{infoWabahPenyakitState.findUnique.data.name}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Deskripsi Singkat</Text>
                  <Text fz={"lg"}>{infoWabahPenyakitState.findUnique.data.deskripsiSingkat}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Deskripsi</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: infoWabahPenyakitState.findUnique.data.deskripsiLengkap }} />
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Gambar</Text>
                  <Image src={infoWabahPenyakitState.findUnique.data.image?.link} alt="gambar" />
                </Box>
                <Box>
                  <Flex gap={"xs"}>
                    <Button color="red" onClick={() => {
                      if (infoWabahPenyakitState.findUnique.data) {
                        setSelectedId(infoWabahPenyakitState.findUnique.data.id)
                        setModalHapus(true)
                      }
                    }}
                      disabled={infoWabahPenyakitState.delete.loading || !infoWabahPenyakitState.findUnique.data}
                    >
                      <IconX size={20} />
                    </Button>
                    <Button onClick={() => router.push(`/admin/kesehatan/info-wabah-penyakit/${infoWabahPenyakitState.findUnique.data?.id}/edit`)} color="green">
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
        text="Apakah anda yakin ingin menghapus info wabah penyakit ini?"
      />
    </Box>
  );
}

export default DetailInfoWabahPenyakit;
