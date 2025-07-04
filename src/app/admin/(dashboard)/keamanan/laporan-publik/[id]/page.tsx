'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import laporanPublikState from '../../../_state/keamanan/laporan-publik';
// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import { useState } from 'react';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailLaporanPublik() {
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const stateLaporan = useProxy(laporanPublikState)
  const params = useParams()
  const router = useRouter();

  useShallowEffect(() => {
    stateLaporan.findUnique.load(params?.id as string)
  }, [])

  const handleDelete = () => {
    if (selectedId) {
      stateLaporan.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/keamanan/laporan-publik")
    }
  }

  if (!stateLaporan.findUnique.data) {
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
      <Paper w={{ base: "100%", md: "50%" }} bg={colors['white-1']} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Detail Laporan Publik</Text>
          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Judul Laporan Publik</Text>
                <Text fz={"lg"}>{stateLaporan.findUnique.data?.judul}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Tanggal Laporan Publik</Text>
                <Text fz={"lg"}>
                  {stateLaporan.findUnique.data?.tanggalWaktu 
                    ? new Date(stateLaporan.findUnique.data.tanggalWaktu).toLocaleString('id-ID')
                    : '-'}
                </Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Lokasi</Text>
                <Text fz={"lg"}>{stateLaporan.findUnique.data?.lokasi}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Status</Text>
                <Text fz={"lg"}>{stateLaporan.findUnique.data?.status}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Kronologi</Text>
                <Text fz={"lg"}>
                  {stateLaporan.findUnique.data?.kronologi || '-'}
                </Text>
              </Box>
              <Text fz={"lg"} fw={"bold"}>Penanganan</Text>
              {stateLaporan.findUnique.data?.penanganan?.map((item, index) => (
                <Box key={index}>
                  <Text fz={"lg"} fw={"bold"}>Deskripsi Penanganan</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: item.deskripsi || '-' }} />
                </Box>
              ))}
              {!stateLaporan.findUnique.data?.penanganan?.length && (
                <Text fz={"lg"} fs="italic">Belum ada penanganan</Text>
              )}
              <Flex gap={"xs"} mt={10}>
                <Button
                  onClick={() => {
                    if (stateLaporan.findUnique.data) {
                      setSelectedId(stateLaporan.findUnique.data.id);
                      setModalHapus(true);
                    }
                  }}
                  disabled={stateLaporan.delete.loading || !stateLaporan.findUnique.data}
                  color={"red"}
                >
                  <IconX size={20} />
                </Button>
                <Button
                  onClick={() => {
                    if (stateLaporan.findUnique.data) {
                      router.push(`/admin/keamanan/laporan-publik/${stateLaporan.findUnique.data.id}/edit`);
                    }
                  }}
                  disabled={!stateLaporan.findUnique.data}
                  color={"green"}
                >
                  <IconEdit size={20} />
                </Button>
              </Flex>
            </Stack>
          </Paper>
          {/* Modal Konfirmasi Hapus */}
          <ModalKonfirmasiHapus
            opened={modalHapus}
            onClose={() => setModalHapus(false)}
            onConfirm={handleDelete}
            text='Apakah anda yakin ingin menghapus laporan publik ini?'
          />
        </Stack>
      </Paper>
    </Box>
  );
}

export default DetailLaporanPublik;
