'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailPerbekelDariMasa() {
  const state = useProxy(stateProfileDesa.mantanPerbekel)
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      state.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/desa/profile/profile-perbekel-dari-masa-ke-masa")
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
          <Text fz={"xl"} fw={"bold"}>Detail Perbekel Dari Masa Ke Masa</Text>
          {state.findUnique.data ? (
            <Paper key={state.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Nama Perbekel</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.nama}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Daerah</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.daerah}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Periode</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.periode}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Gambar</Text>
                  <Image w={{ base: 300, md: 350}} src={state.findUnique.data?.image?.link} alt="gambar" />
                </Box>
                <Flex gap={"xs"} mt={10}>
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
                  <Button
                    onClick={() => {
                      if (state.findUnique.data) {
                        router.push(`/admin/desa/profile/profile-perbekel-dari-masa-ke-masa/${state.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!state.findUnique.data}
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
        text='Apakah anda yakin ingin menghapus perbekel dari masa ke masa ini?'
      />
    </Box>
  );
}

export default DetailPerbekelDariMasa;
