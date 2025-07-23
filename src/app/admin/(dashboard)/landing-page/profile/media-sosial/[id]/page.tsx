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

function DetailMediaSosial() {
  const stateMediaSosial = useProxy(profileLandingPageState.mediaSosial)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter();

  useShallowEffect(() => {
    stateMediaSosial.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      stateMediaSosial.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/landing-page/profile/media-sosial")
    }
  }

  if (!stateMediaSosial.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Media Sosial</Text>
          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Nama Media Sosial / Nama Kontak</Text>
                <Text fz={"lg"}>{stateMediaSosial.findUnique.data?.name}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Icon URL / No Telephone</Text>
                <Text fz={"lg"}>{stateMediaSosial.findUnique.data?.iconUrl}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Gambar</Text>
                <Box w={100} h={100}>
                  <Image src={stateMediaSosial.findUnique.data?.image?.link} alt="gambar" />
                </Box>
              </Box>
              <Box>
                <Flex gap={"xs"}>
                  <Button
                    onClick={() => {
                      if (stateMediaSosial.findUnique.data) {
                        setSelectedId(stateMediaSosial.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={!stateMediaSosial.findUnique.data}
                    color="red">
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (stateMediaSosial.findUnique.data) {
                        router.push(`/admin/landing-page/profile/media-sosial/${stateMediaSosial.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!stateMediaSosial.findUnique.data}
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
        text="Apakah anda yakin ingin menghapus media sosial ini?"
      />
    </Box>
  );
}

export default DetailMediaSosial;
