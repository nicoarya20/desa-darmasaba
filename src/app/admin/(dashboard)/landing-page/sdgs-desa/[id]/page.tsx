'use client'
import { useProxy } from 'valtio/utils';

import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import colors from '@/con/colors';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import sdgsDesa from '../../../_state/landing-page/sdgs-desa';

function DetailSDGSDesa() {
  const sdgsState = useProxy(sdgsDesa)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    sdgsState.findUnique.load(params?.id as string)
  }, [])


  const handleHapus = () => {
    if (selectedId) {
      sdgsState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/landing-page/SDGs-Desa")
    }
  }

  if (!sdgsState.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail SDGS Desa</Text>
          {sdgsState.findUnique.data ? (
            <Paper key={sdgsState.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Nama SDGS Desa</Text>
                  <Text fz={"lg"}>{sdgsState.findUnique.data?.name}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Jumlah</Text>
                  <Text fz={"lg"}>{sdgsState.findUnique.data?.jumlah}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Gambar</Text>
                  <Image w={{ base: 150, md: 150, lg: 150 }} src={sdgsState.findUnique.data?.image?.link} alt="gambar" />
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (sdgsState.findUnique.data) {
                        setSelectedId(sdgsState.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={sdgsState.delete.loading || !sdgsState.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (sdgsState.findUnique.data) {
                        router.push(`/admin/landing-page/SDGs-Desa/${sdgsState.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!sdgsState.findUnique.data}
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
        text='Apakah anda yakin ingin menghapus SDGS Desa ini?'
      />
    </Box>
  );
}

export default DetailSDGSDesa;