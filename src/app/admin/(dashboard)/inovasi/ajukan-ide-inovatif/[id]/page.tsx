'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import ajukanIdeInovatifState from '../../../_state/inovasi/ajukan-ide-inovatif';

function DetailAjukanIdeInofativDesa() {
  const state = useProxy(ajukanIdeInovatifState)
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter()
  const params = useParams()

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      state.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/inovasi/ajukan-ide-inovatif")
    }
  }

  if (!state.findUnique.data) {
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
          <Flex justify="space-between" gap={"xs"}>
            <Text fz={"xl"} fw={"bold"}>Detail Ajukan Ide Inovatif Desa</Text>
            <Button
              onClick={() => {
                if (state.findUnique.data) {
                  setSelectedId(state.findUnique.data.id);
                  setModalHapus(true);
                }
              }}
              disabled={state.delete.loading || !state.findUnique.data}
              color={"red"}
            >
              <IconX size={20} />
            </Button>
          </Flex>
          {state.findUnique.data ? (
            <Paper key={state.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Nama</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.name}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Alamat</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: state.findUnique.data?.alamat }} />
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Nama Ide Inovatif</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.namaIde}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: state.findUnique.data?.deskripsi }} />
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Masalah</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.masalah}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Benefit</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.benefit}</Text>
                </Box>
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
        text='Apakah anda yakin ingin menghapus ajukan ide inovatif ini?'
      />
    </Box>
  );
}

export default DetailAjukanIdeInofativDesa;
