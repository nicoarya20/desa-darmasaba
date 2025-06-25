'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Flex, Text, Image, Skeleton } from '@mantine/core';
import { IconArrowBack, IconX, IconEdit } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import puskesmasState from '../../../_state/kesehatan/puskesmas/puskesmas';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailPuskesmas() {
  const params = useParams()
  const router = useRouter();
  const statePuskesmas = useProxy(puskesmasState)
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useShallowEffect(() => {
    statePuskesmas.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      statePuskesmas.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/kesehatan/puskesmas")
    }
  }

  if (!statePuskesmas.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Puskesmas</Text>
          {statePuskesmas.findUnique.data ? (
            <Paper bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Nama Puskesmas</Text>
                  <Text fz={"lg"}>{statePuskesmas.findUnique.data.name}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Alamat</Text>
                  <Text fz={"lg"}>{statePuskesmas.findUnique.data.alamat}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Jam Operasional</Text>
                  <Text fz={"lg"}>{statePuskesmas.findUnique.data.jam.workDays}</Text>
                  <Text fz={"lg"}>{statePuskesmas.findUnique.data.jam.weekDays}</Text>
                  <Text fz={"lg"}>{statePuskesmas.findUnique.data.jam.holiday}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Gambar</Text>
                  <Image src={statePuskesmas.findUnique.data.image?.link} alt="gambar" />
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Kontak</Text>
                  <Text fz={"lg"} >{statePuskesmas.findUnique.data.kontak.kontakPuskesmas}</Text>
                  <Text fz={"lg"} >{statePuskesmas.findUnique.data.kontak.email}</Text>
                  <Text fz={"lg"} >{statePuskesmas.findUnique.data.kontak.facebook}</Text>
                  <Text fz={"lg"} >{statePuskesmas.findUnique.data.kontak.kontakUGD}</Text>
                </Box>
                <Box>
                  <Flex gap={"xs"}>
                    <Button color="red" onClick={() => {
                      if (statePuskesmas.findUnique.data) {
                        setSelectedId(statePuskesmas.findUnique.data.id)
                        setModalHapus(true)
                      }
                    }}>
                      <IconX size={20} />
                    </Button>
                    <Button onClick={() => router.push(`/admin/kesehatan/puskesmas/${statePuskesmas.findUnique.data?.id}/edit`)} color="green">
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

export default DetailPuskesmas;
