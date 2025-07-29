'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import beasiswaDesaState from '@/app/admin/(dashboard)/_state/pendidikan/beasiswa-desa';
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';


function DetailBeasiswaPendaftar() {
  const state = useProxy(beasiswaDesaState.beasiswaPendaftar)
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter()
  const params = useParams()

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      state.delete.delete(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/pendidikan/beasiswa-desa/beasiswa-pendaftar")
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
            <Text fz={"xl"} fw={"bold"}>Detail Beasiswa Pendaftar</Text>
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
                  <Text fw={"bold"} fz={"lg"}>Nama Lengkap</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.namaLengkap}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>NIK</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.nik}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Tempat Lahir</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.tempatLahir}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Tanggal Lahir</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.tanggalLahir ? new Date(state.findUnique.data.tanggalLahir).toLocaleDateString() : '-'}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Jenis Kelamin</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.jenisKelamin}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Kewarganegaraan</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.kewarganegaraan}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Agama</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.agama}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Alamat KTP</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.alamatKTP}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Alamat Domisili</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.alamatDomisili}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>No HP</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.noHp}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Email</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.email}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Status Pernikahan</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.statusPernikahan}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Ukuran Baju</Text>
                  <Text fz={"lg"}>{state.findUnique.data?.ukuranBaju}</Text>
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
        text='Apakah anda yakin ingin menghapus beasiswa desa ini?'
      />
    </Box>
  );
}

export default DetailBeasiswaPendaftar;
