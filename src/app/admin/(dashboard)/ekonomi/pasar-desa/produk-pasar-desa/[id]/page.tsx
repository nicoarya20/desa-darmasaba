'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Flex, Text, Image, Skeleton } from '@mantine/core';
import { IconArrowBack, IconX, IconEdit } from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import pasarDesaState from '../../../../_state/ekonomi/pasar-desa/pasar-desa';
import { useShallowEffect } from '@mantine/hooks';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';

function DetailPasarDesa() {
  const statePasar = useProxy(pasarDesaState)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter();

  useShallowEffect(() => {
    statePasar.kategoriProduk.findUnique.load(params?.id as string)
    statePasar.pasarDesa.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      statePasar.pasarDesa.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/ekonomi/pasar-desa/produk-pasar-desa")
    }
  }

  if (!statePasar.pasarDesa.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Pasar Desa</Text>
          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Nama Produk</Text>
                <Text fz={"lg"}>{statePasar.pasarDesa.findUnique.data?.nama}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Harga Produk</Text>
                <Text fz={"lg"}>Rp.{statePasar.pasarDesa.findUnique.data?.harga}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Rating Produk</Text>
                <Text fz={"lg"}>{statePasar.pasarDesa.findUnique.data?.rating}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Alamat Usaha</Text>
                <Text fz={"lg"}>{statePasar.pasarDesa.findUnique.data?.alamatUsaha}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Gambar</Text>
                <Image src={statePasar.pasarDesa.findUnique.data?.image?.link} alt="gambar" />
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Kategori</Text>
                <Stack gap={4}>
                  {statePasar.pasarDesa.findUnique.data?.kategori?.length > 0 ? (
                    statePasar.pasarDesa.findUnique.data.kategori.map((kat) => (
                      <Text fz={"lg"} key={kat.id}>• {kat.nama}</Text>
                    ))
                  ) : (
                    <Text fz={"lg"} c="dimmed">Tidak ada kategori</Text>
                  )}
                </Stack>
              </Box>

              <Box>
                <Flex gap={"xs"}>
                  <Button
                    onClick={() => {
                      if (statePasar.pasarDesa.findUnique.data) {
                        setSelectedId(statePasar.pasarDesa.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={!statePasar.pasarDesa.findUnique.data}
                    color="red">
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (statePasar.pasarDesa.findUnique.data) {
                        router.push(`/admin/ekonomi/pasar-desa/produk-pasar-desa/${statePasar.pasarDesa.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!statePasar.pasarDesa.findUnique.data}
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
        text="Apakah anda yakin ingin menghapus produk ini?"
      />
    </Box>
  );
}

export default DetailPasarDesa;
