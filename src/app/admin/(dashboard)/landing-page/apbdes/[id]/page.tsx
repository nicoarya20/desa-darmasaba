'use client'
import { useProxy } from 'valtio/utils';

import { ActionIcon, Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconFile, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import colors from '@/con/colors';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import apbdes from '../../../_state/landing-page/apbdes';

function DetailAPBDes() {
  const apbdesState = useProxy(apbdes)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    apbdesState.findUnique.load(params?.id as string)
  }, [])


  const handleHapus = () => {
    if (selectedId) {
      apbdesState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/landing-page/APBDes")
    }
  }

  if (!apbdesState.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail APBDes</Text>
          {apbdesState.findUnique.data ? (
            <Paper key={apbdesState.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Nama APBDes</Text>
                  <Text fz={"lg"}>{apbdesState.findUnique.data?.name}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Jumlah</Text>
                  <Text fz={"lg"}>{apbdesState.findUnique.data?.jumlah}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Gambar</Text>
                  <Image w={{ base: 150, md: 150, lg: 150 }} src={apbdesState.findUnique.data?.image?.link} alt="gambar" />
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Dokumen</Text>
                  {apbdesState.findUnique.data?.file?.link ? (
                    <ActionIcon
                      component="a"
                      href={apbdesState.findUnique.data.file.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="transparent"
                    >
                      <IconFile size={25} color={colors['blue-button']}/>
                    </ActionIcon>
                  ) : (
                    <Text>Tidak ada dokumen tersedia</Text>
                  )}
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (apbdesState.findUnique.data) {
                        setSelectedId(apbdesState.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={apbdesState.delete.loading || !apbdesState.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (apbdesState.findUnique.data) {
                        router.push(`/admin/landing-page/APBDes/${apbdesState.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!apbdesState.findUnique.data}
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
        text='Apakah anda yakin ingin menghapus APBDes ini?'
      />
    </Box>
  );
}

export default DetailAPBDes;