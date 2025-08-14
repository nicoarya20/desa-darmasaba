'use client'
import { useProxy } from 'valtio/utils';

import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import persentaseKelahiranKematian from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';


function DetailKelahiran() {
  const state = useProxy(persentaseKelahiranKematian.kelahiran)
  const [modalHapus, setModalHapus] = useState(false)
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
      router.push("/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran")
    }
  }

  if (!state.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Data Kelahiran</Text>
          {state.findUnique.data ? (
            <Paper key={state.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Nama</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.nama}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Tanggal</Text>
                  <Text fz={"lg"}>
                    {new Date(state.findUnique.data?.tanggal).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Jenis Kelamin</Text>
                  <Text fz={"lg"} >{state.findUnique.data?.jenisKelamin}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Alamat</Text>
                  <Text fz={"lg"} >{state.findUnique.data?.alamat}</Text>
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
                        router.push(`/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran/${state.findUnique.data.id}/edit`);
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
        text='Apakah anda yakin ingin menghapus data ini?'
      />
    </Box>
  );
}

export default DetailKelahiran;