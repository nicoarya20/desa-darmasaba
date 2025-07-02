'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useShallowEffect } from '@mantine/hooks';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import pencegahanKriminalitasState from '../../../_state/keamanan/pencegahan-kriminalitas';

function DetailPencegahanKriminalitas() {
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();
  const params = useParams()
  const kriminalitasState = useProxy(pencegahanKriminalitasState)

  useShallowEffect(() => {
    kriminalitasState.findUnique.load(params?.id as string)
  }, [])

  const handleDelete = () => {
    if (selectedId) {
      kriminalitasState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/keamanan/pencegahan-kriminalitas")
    }
  }

  if (!kriminalitasState.findUnique.data) {
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
      <Paper w={{ base: "100%", md: "50%" }} bg={colors['white-1']} p={'md'}>
        <Stack>
          <Paper bg={colors['BG-trans']} p={'md'}>
            <Text fz={"xl"} fw={"bold"}>Detail Pencegahan Kriminalitas</Text>
            {kriminalitasState.findUnique.data ? (
              <Paper key={kriminalitasState.findUnique.data.id} bg={colors['BG-trans']}>
                <Stack gap={"xs"} py={'md'}>
                  <Box>
                    <Text fw={"bold"} fz={"lg"}>Judul Program Keamanan</Text>
                    <Text fz={"lg"}>{kriminalitasState.findUnique.data?.programKeamanan.nama}</Text>
                  </Box>
                  <Box>
                    <Text fw={"bold"} fz={"lg"}>Slug</Text>
                    <Text fz={"lg"}>{kriminalitasState.findUnique.data?.programKeamanan.slug}</Text>
                  </Box>
                  <Box>
                    <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                    <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: kriminalitasState.findUnique.data?.programKeamanan.deskripsi || '' }} />
                  </Box>
                  <Box>
                    <Text fw={"bold"} fz={"lg"}>Judul Tips Keamanan</Text>
                    <Text fz={"lg"}>{kriminalitasState.findUnique.data?.tipsKeamanan.judul}</Text>
                  </Box>
                  <Box>
                    <Text fw={"bold"} fz={"lg"}>Slug Tips Keamanan</Text>
                    <Text fz={"lg"}>{kriminalitasState.findUnique.data?.tipsKeamanan.slug}</Text>
                  </Box>
                  <Box>
                    <Text fw={"bold"} fz={"lg"}>Deskripsi Tips Keamanan</Text>
                    <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: kriminalitasState.findUnique.data?.tipsKeamanan.konten || '' }} />
                  </Box>
                  <Flex gap={"xs"} mt={10}>
                    <Button
                      onClick={() => {
                        if (kriminalitasState.findUnique.data) {
                          setSelectedId(kriminalitasState.findUnique.data.id);
                          setModalHapus(true);
                        }
                      }}
                      disabled={kriminalitasState.delete.loading || !kriminalitasState.findUnique.data}
                      color={"red"}
                    >
                      <IconX size={20} />
                    </Button>
                    <Button
                      onClick={() => {
                        if (kriminalitasState.findUnique.data) {
                          router.push(`/admin/keamanan/pencegahan-kriminalitas/${kriminalitasState.findUnique.data.id}/edit`);
                        }
                      }}
                      disabled={!kriminalitasState.findUnique.data}
                      color={"green"}
                    >
                      <IconEdit size={20} />
                    </Button>
                  </Flex>
                </Stack>
              </Paper>
            ) : null}
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text="Apakah anda yakin ingin menghapus pencegahan kriminalitas ini?"
      />
    </Box>
  );
}

export default DetailPencegahanKriminalitas;
