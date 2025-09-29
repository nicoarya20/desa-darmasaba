'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import desaDigitalState from '../../../_state/inovasi/desa-digital';

function DetailDesaDigital() {
  const stateDesaDigital = useProxy(desaDigitalState)
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter()
  const params = useParams()

  useShallowEffect(() => {
    stateDesaDigital.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      stateDesaDigital.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/inovasi/desa-digital-smart-village")
    }
  }

  if (!stateDesaDigital.findUnique.data) {
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
      <Paper bg={colors['white-1']} w={{ base: "100%", md: "100%", lg: "50%" }} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Detail Desa Digital Smart Village</Text>
          {stateDesaDigital.findUnique.data ? (
            <Paper key={stateDesaDigital.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Judul</Text>
                  <Text fz={"lg"}>{stateDesaDigital.findUnique.data?.name}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                  <Text fz={"lg"} style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: stateDesaDigital.findUnique.data?.deskripsi }} />
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Gambar</Text>
                  <Image w={{ base: 150, md: 150, lg: 150 }} src={stateDesaDigital.findUnique.data?.image?.link} alt="gambar" loading="lazy"/>
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (stateDesaDigital.findUnique.data) {
                        setSelectedId(stateDesaDigital.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={stateDesaDigital.delete.loading || !stateDesaDigital.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (stateDesaDigital.findUnique.data) {
                        router.push(`/admin/inovasi/desa-digital-smart-village/${stateDesaDigital.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!stateDesaDigital.findUnique.data}
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
        text='Apakah anda yakin ingin menghapus desa digital smart village ini?'
      />
    </Box>
  );
}

export default DetailDesaDigital;
