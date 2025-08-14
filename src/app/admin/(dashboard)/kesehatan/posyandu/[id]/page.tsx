'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Flex, Text, Image, Skeleton } from '@mantine/core';
import { IconArrowBack, IconX, IconEdit } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import posyandustate from '../../../_state/kesehatan/posyandu/posyandu';
import { useShallowEffect } from '@mantine/hooks';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailPosyandu() {
  const statePosyandu = useProxy(posyandustate)
  const params = useParams()
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useShallowEffect(() => {
    statePosyandu.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      statePosyandu.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/kesehatan/posyandu")
    }
  }

  if (!statePosyandu.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Posyandu</Text>
          {statePosyandu.findUnique.data ? (
            <Paper key={statePosyandu.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Nama Posyandu</Text>
                  <Text fz={"lg"}>{statePosyandu.findUnique.data.name}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Nomor Posyandu</Text>
                  <Text fz={"lg"}>{statePosyandu.findUnique.data.nomor}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Deskripsi Posyandu</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: statePosyandu.findUnique.data.deskripsi }} />
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Jadwal Pelayanan</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: statePosyandu.findUnique.data.jadwalPelayanan }} />
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Gambar</Text>
                  <Image src={statePosyandu.findUnique.data.image?.link} alt="gambar" />
                </Box>
                <Box>
                  <Flex gap={"xs"}>
                    <Button onClick={() => {
                      if (statePosyandu.findUnique.data) {
                        setSelectedId(statePosyandu.findUnique.data.id)
                        setModalHapus(true)
                      }
                    }} color="red">
                      <IconX size={20} />
                    </Button>
                    <Button onClick={() => router.push(`/admin/kesehatan/posyandu/${statePosyandu.findUnique.data?.id}/edit`)} color="green">
                      <IconEdit size={20} />
                    </Button>
                  </Flex>
                </Box>
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </Paper>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus posyandu ini?"
      />
    </Box>
  );
}

export default DetailPosyandu;
