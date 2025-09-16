'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { IconKey, IconMapper } from '../../../_com/iconMap';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import programKreatifState from '../../../_state/inovasi/program-kreatif';

// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailProgramKreatifDesa() {
  const [modalHapus, setModalHapus] = useState(false)
  const stateProgramKreatif = useProxy(programKreatifState)
  const router = useRouter()
  const params = useParams()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useShallowEffect(() => {
    stateProgramKreatif.findUnique.load(params?.id as string)
  }, [params?.id])

  const handleHapus = () => {
    if (selectedId) {
      stateProgramKreatif.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/inovasi/program-kreatif-desa")
    }
  }

  if (!stateProgramKreatif.findUnique.data) {
    return (
      <Stack>
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
          <Text fz={"xl"} fw={"bold"}>Detail Program Kreatif Desa</Text>

          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Nama Program Kreatif Desa</Text>
                <Text fz={"lg"}>{stateProgramKreatif.findUnique.data?.name}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Ikon Program Kreatif Desa</Text>
                {stateProgramKreatif.findUnique.data?.icon && (
                  <IconMapper
                    name={stateProgramKreatif.findUnique.data?.icon as IconKey}
                    size={32}
                    color={colors['blue-button']}
                  />
                )}
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Deskripsi Singkat</Text>
                <Text fz={"lg"}>{stateProgramKreatif.findUnique.data?.slug}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Deskripsi</Text>
                <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: stateProgramKreatif.findUnique.data?.deskripsi }}></Text>
              </Box>
              <Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (stateProgramKreatif.findUnique.data) {
                        setSelectedId(stateProgramKreatif.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={stateProgramKreatif.delete.loading || !stateProgramKreatif.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (stateProgramKreatif.findUnique.data) {
                        router.push(`/admin/inovasi/program-kreatif-desa/${stateProgramKreatif.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!stateProgramKreatif.findUnique.data}
                    color={"green"}
                  >
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
        text="Apakah anda yakin ingin menghapus program kreatif desa ini?"
      />
    </Box>
  );
}

export default DetailProgramKreatifDesa;
