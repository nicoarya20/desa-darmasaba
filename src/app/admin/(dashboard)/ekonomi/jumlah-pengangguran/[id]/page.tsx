'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import jumlahPengangguranState from '@/app/admin/(dashboard)/_state/ekonomi/jumlah-pengangguran';
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailJumlahPengangguran() {
  const router = useRouter();
  const params = useParams()
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const stateDetail = useProxy(jumlahPengangguranState.jumlahPengangguran)

  useShallowEffect(() => {
    stateDetail.findUnique.load(params?.id as string)
  }, [params?.id])

  const handleHapus = () => {
    if (selectedId) {
      stateDetail.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/ekonomi/jumlah-pengangguran")
    }
  }

  if (!stateDetail.findUnique.data) {
    return (
      <Box>
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
          <Text fz={"xl"} fw={"bold"}>Detail Data Pengangguran</Text>
          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fw={"bold"}>Pengangguran Terdidik</Text>
                <Text>{stateDetail.findUnique.data?.educatedUnemployment}</Text>
              </Box>
              <Box>
                <Text fw={"bold"}>Pengangguran Tidak Terdidik</Text>
                <Text>{stateDetail.findUnique.data?.uneducatedUnemployment}</Text>
              </Box>
              <Box>
                <Text fw={"bold"}>Perubahan</Text>
                <Text>{stateDetail.findUnique.data?.percentageChange}</Text>
              </Box>
              <Box>
                <Text fw={"bold"}>Tahun</Text>
                <Text>{stateDetail.findUnique.data?.year}</Text>
              </Box>
              <Box>
                <Text fw={"bold"}>Bulan</Text>
                <Text>{stateDetail.findUnique.data?.month}</Text>
              </Box>
              <Box>
                <Text fw={"bold"}>Total Pengangguran</Text>
                <Text>{stateDetail.findUnique.data?.totalUnemployment}</Text>
              </Box>
              <Box>
                <Flex gap={"xs"}>
                  <Button
                  onClick={() => {
                    if (stateDetail.findUnique.data) {
                      setSelectedId(stateDetail.findUnique.data.id);
                      setModalHapus(true);
                    }
                  }}
                  disabled={stateDetail.delete.loading || !stateDetail.findUnique.data}
                  color={"red"}>
                    <IconX size={20} />
                  </Button>
                  <Button onClick={() => router.push(`/admin/ekonomi/jumlah-pengangguran/${stateDetail.findUnique.data?.id}/edit`)} color="green">
                    <IconEdit size={20} />
                  </Button>
                </Flex>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus data ini?"
      />
    </Box>
  );
}

export default DetailJumlahPengangguran;

