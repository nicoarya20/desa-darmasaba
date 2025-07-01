'use client'
import { useProxy } from 'valtio/utils';

import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import colors from '@/con/colors';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import tipsKeamananState from '../../../_state/keamanan/tips-keamanan';


function DetailTipsKeamanan() {
  const stateKeamanan = useProxy(tipsKeamananState)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    stateKeamanan.findUnique.load(params?.id as string)
  }, [])


  const handleHapus = () => {
    if (selectedId) {
      stateKeamanan.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/keamanan/tips-keamanan")
    }
  }

  if (!stateKeamanan.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Tips Keamanan</Text>
          {stateKeamanan.findUnique.data ? (
            <Paper key={stateKeamanan.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Nama Tips Keamanan</Text>
                  <Text fz={"lg"}>{stateKeamanan.findUnique.data?.judul}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: stateKeamanan.findUnique.data?.deskripsi }} />
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Gambar</Text>
                  <Image w={{ base: 150, md: 150, lg: 150 }} src={stateKeamanan.findUnique.data?.image?.link} alt="gambar" />
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (stateKeamanan.findUnique.data) {
                        setSelectedId(stateKeamanan.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={stateKeamanan.delete.loading || !stateKeamanan.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (stateKeamanan.findUnique.data) {
                        router.push(`/admin/keamanan/tips-keamanan/${stateKeamanan.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!stateKeamanan.findUnique.data}
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
        text='Apakah anda yakin ingin menghapus tips keamanan ini?'
      />
    </Box>
  );
}

export default DetailTipsKeamanan;