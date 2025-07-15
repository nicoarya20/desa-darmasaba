'use client'
import { useProxy } from 'valtio/utils';

import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import layananonlineDesa from '@/app/admin/(dashboard)/_state/inovasi/layanan-online-desa';
import colors from '@/con/colors';


function DetailAdministrasiOnline() {
  const beritaState = useProxy(layananonlineDesa)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    beritaState.administrasiOnline.findUnique.load(params?.id as string)
  }, [])


  const handleHapus = () => {
    if (selectedId) {
      beritaState.administrasiOnline.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/inovasi/layanan-online-desa/administrasi-online")
    }
  }

  if (!beritaState.administrasiOnline.findUnique.data) {
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
          <Flex gap={"xs"} justify={"space-between"} mt={10}>
            <Text fz={"xl"} fw={"bold"}>Detail Administrasi Online</Text>
            <Button
              onClick={() => {
                if (beritaState.administrasiOnline.findUnique.data) {
                  setSelectedId(beritaState.administrasiOnline.findUnique.data.id);
                  setModalHapus(true);
                }
              }}
              disabled={beritaState.administrasiOnline.delete.loading || !beritaState.administrasiOnline.findUnique.data}
              color={"red"}
            >
              <IconTrash size={20} />
            </Button>
          </Flex>
          {beritaState.administrasiOnline.findUnique.data ? (
            <Paper key={beritaState.administrasiOnline.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Nama</Text>
                  <Text fz={"lg"}>{beritaState.administrasiOnline.findUnique.data?.name}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Alamat</Text>
                  <Text fz={"lg"}>{beritaState.administrasiOnline.findUnique.data?.alamat}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Nomor Telepon</Text>
                  <Text fz={"lg"} >{beritaState.administrasiOnline.findUnique.data?.nomorTelepon}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Jenis Layanan</Text>
                  <Text fz={"lg"} >{beritaState.administrasiOnline.findUnique.data?.jenisLayanan?.nama}</Text>
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
        text='Apakah anda yakin ingin menghapus administrasi online ini?'
      />
    </Box>
  );
}

export default DetailAdministrasiOnline;