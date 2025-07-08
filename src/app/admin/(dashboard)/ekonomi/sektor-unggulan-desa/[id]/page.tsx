'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import grafikSektorUnggulan from '../../../_state/ekonomi/sektor-unggulan-desa';

function DetailSektorUnggulanDesa() {
  const stateGrafik = useProxy(grafikSektorUnggulan)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter();

  useShallowEffect(() => {
    stateGrafik.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      stateGrafik.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/ekonomi/sektor-unggulan-desa")
    }
  }

  if (!stateGrafik.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Sektor Unggulan Desa</Text>
          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Nama Sektor Unggulan</Text>
                <Text fz={"lg"}>{stateGrafik.findUnique.data?.name}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Deskripsi Sektor Unggulan</Text>
                <Text fz={"lg"}>{stateGrafik.findUnique.data?.description}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Jumlah Sektor Unggulan</Text>
                <Text fz={"lg"}>{stateGrafik.findUnique.data?.value}</Text>
              </Box>
              <Box>
                <Flex gap={"xs"}>
                  <Button
                    onClick={() => {
                      if (stateGrafik.findUnique.data) {
                        setSelectedId(stateGrafik.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={!stateGrafik.findUnique.data}
                    color="red">
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (stateGrafik.findUnique.data) {
                        router.push(`/admin/ekonomi/sektor-unggulan-desa/${stateGrafik.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!stateGrafik.findUnique.data}
                    color="green">
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
        text="Apakah anda yakin ingin menghapus sektor unggulan ini?"
      />
    </Box>
  );
}

export default DetailSektorUnggulanDesa;
