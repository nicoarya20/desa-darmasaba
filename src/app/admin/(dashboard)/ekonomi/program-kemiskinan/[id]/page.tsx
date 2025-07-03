/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import programKemiskinanState from '../../../_state/ekonomi/program-kemiskinan';


function DetailProgramKemiskinan() {
  const programState = useProxy(programKemiskinanState)
  const [lineChart, setLineChart] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();
  const params = useParams()

  useShallowEffect(() => {
    setMounted(true);
    programState.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      programState.delete.delete(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/ekonomi/program-kemiskinan")
    }
  }

  useEffect(() => {
    if (programState.findUnique.data) {
      setLineChart([programState.findUnique.data]);
    }
  }, [programState.findUnique.data])

  if (!programState.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Program Kemiskinan</Text>
          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fw={"bold"}>Judul Program</Text>
                <Text fz={"sm"}>{programState.findUnique.data?.nama}</Text>
              </Box>
              <Box>
                <Text fw={"bold"}>Deskripsi Singkat</Text>
                <Text fz={"sm"} dangerouslySetInnerHTML={{ __html: programState.findUnique.data?.deskripsi }}></Text>
              </Box>
              <Box>
                <Text fw={"bold"}>Ikon URL</Text>
                <Text fz={"sm"}>{programState.findUnique.data?.ikonUrl}</Text>
              </Box>
              <Text fw={"bold"}>Statistik Jumlah Masyarakat Miskin</Text>
              <Box>
                <Text fw={"bold"}>Jumlah Masyarakat Miskin</Text>
                <Text fz={"sm"}>{programState.findUnique.data?.statistik?.jumlah}</Text>
              </Box>
              <Box>
                <Text fw={"bold"}>Tahun</Text>
                <Text fz={"sm"}>{programState.findUnique.data?.statistik?.tahun}</Text>
              </Box>
              <Flex gap={"xs"} mt={10}>
                <Button
                  onClick={() => {
                    if (programState.findUnique.data) {
                      setSelectedId(programState.findUnique.data.id);
                      setModalHapus(true);
                    }
                  }}
                  disabled={programState.delete.loading || !programState.findUnique.data}
                  color={"red"}
                >
                  <IconX size={20} />
                </Button>
                <Button
                  onClick={() => {
                    if (programState.findUnique.data) {
                      router.push(`/admin/ekonomi/program-kemiskinan/${programState.findUnique.data.id}/edit`);
                    }
                  }}
                  disabled={!programState.findUnique.data}
                  color={"green"}
                >
                  <IconEdit size={20} />
                </Button>
              </Flex>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus program kemiskinan ini?"
      />
    </Box>
  );
}

export default DetailProgramKemiskinan;

