'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailSuratKeterangan() {
  const suratKeteranganState = useProxy(stateLayananDesa.suratKeterangan)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    suratKeteranganState.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      suratKeteranganState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/desa/layanan/pelayanan_surat_keterangan")
    }
  }

  if (!suratKeteranganState.findUnique.data) {
    return (
      <Stack py={10}>
        {Array.from({ length: 10 }).map((_, k) => (
          <Skeleton key={k} h={40} />
        ))}
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
          <Text fz={"xl"} fw={"bold"}>Detail Surat Keterangan</Text>
          {suratKeteranganState.findUnique.data ? (
            <Paper key={suratKeteranganState.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Nama</Text>
                  <Text fz={"lg"}>{suratKeteranganState.findUnique.data?.name}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                  <Text fz={"lg"}dangerouslySetInnerHTML={{ __html: suratKeteranganState.findUnique.data?.deskripsi }}></Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Gambar</Text>
                  <Image w={{ base: 150, md: 150, lg: 150 }} src={suratKeteranganState.findUnique.data?.image?.link} alt="gambar" />
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (suratKeteranganState.findUnique.data) {
                        setSelectedId(suratKeteranganState.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={suratKeteranganState.delete.loading || !suratKeteranganState.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (suratKeteranganState.findUnique.data) {
                        router.push(`/admin/desa/layanan/pelayanan_surat_keterangan/${suratKeteranganState.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!suratKeteranganState.findUnique.data}
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
        text='Apakah anda yakin ingin menghapus berita ini?'
      />
    </Box>
  );
}

export default DetailSuratKeterangan;
