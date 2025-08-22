'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import profileLandingPageState from '@/app/admin/(dashboard)/_state/landing-page/profile';
import colors from '@/con/colors';
import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailProgramInovasi() {
  const stateProgramInovasi = useProxy(profileLandingPageState.programInovasi)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter();

  useShallowEffect(() => {
    stateProgramInovasi.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      stateProgramInovasi.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/landing-page/profile/program-inovasi")
    }
  }

  if (!stateProgramInovasi.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Program Inovasi</Text>
          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Nama Program Inovasi</Text>
                <Text fz={"lg"}>{stateProgramInovasi.findUnique.data?.name}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Deskripsi</Text>
                <Text
                  fz={"lg"}
                  
                >{stateProgramInovasi.findUnique.data?.description}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Link</Text>
                <a
                  href={stateProgramInovasi.findUnique.data?.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                    width: '100%'
                  }}
                >
                  {stateProgramInovasi.findUnique.data?.link || "Tidak ada link"}
                </a>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Gambar</Text>
                <Image src={stateProgramInovasi.findUnique.data?.image?.link} alt="gambar" />
              </Box>
              <Box>
                <Flex gap={"xs"}>
                  <Button
                    onClick={() => {
                      if (stateProgramInovasi.findUnique.data) {
                        setSelectedId(stateProgramInovasi.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={!stateProgramInovasi.findUnique.data}
                    color="red">
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (stateProgramInovasi.findUnique.data) {
                        router.push(`/admin/landing-page/profile/program-inovasi/${stateProgramInovasi.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!stateProgramInovasi.findUnique.data}
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
        text="Apakah anda yakin ingin menghapus program inovasi ini?"
      />
    </Box>
  );
}

export default DetailProgramInovasi;
