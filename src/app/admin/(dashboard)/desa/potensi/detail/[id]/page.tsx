'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useProxy } from 'valtio/utils';
import potensiDesaState from '../../../../_state/desa/potensi';
import { useShallowEffect } from '@mantine/hooks';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';

export default function DetailPotensi() {
  const router = useRouter()
  const params = useParams()
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const potensiState = useProxy(potensiDesaState)

  useShallowEffect(() => {
    potensiState.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      potensiState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/desa/potensi")
    }
  }

  if (!potensiState.findUnique.data) {
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
      <Paper w={{ base: "100%", md: "50%" }} bg={colors['white-1']} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Detail Potensi</Text>
          {potensiState.findUnique.data ? (
            <Paper key={potensiState.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Judul</Text>
                  <Text fz={"lg"}>{potensiState.findUnique.data.name}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Kategori</Text>
                  <Text fz={"lg"}>{potensiState.findUnique.data.kategori}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Deskripsi</Text>
                  <Text fz={"lg"}>{potensiState.findUnique.data.deskripsi}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Gambar</Text>
                  <Image src={potensiState.findUnique.data.image?.link} alt="gambar" />
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Konten</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: potensiState.findUnique.data.content }} />
                </Box>
                <Box>
                  <Flex gap={"xs"}>
                    <Button
                      onClick={() => {
                        if (potensiState.findUnique.data) {
                          setSelectedId(potensiState.findUnique.data.id)
                          setModalHapus(true)
                        }
                      }}
                      disabled={potensiState.delete.loading || !potensiState.findUnique.data}
                      color="red"
                    >
                      <IconX size={20} />
                    </Button>
                    <Button
                      onClick={() => {
                        if (potensiState.findUnique.data) {
                          router.push(`/admin/desa/potensi/edit/${potensiState.findUnique.data.id}`)
                        }
                      }}
                      disabled={!potensiState.findUnique.data}
                      color="green"
                    >
                      <IconEdit size={20} />
                    </Button>
                  </Flex>
                </Box>
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus potensi ini?"
      />
    </Box>
  );
}


