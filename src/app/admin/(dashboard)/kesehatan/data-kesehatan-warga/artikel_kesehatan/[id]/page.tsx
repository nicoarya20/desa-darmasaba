'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import artikelKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailArtikelKesehatan() {
  const params = useParams()
  const router = useRouter();
  const stateArtikelKesehatan = useProxy(artikelKesehatanState)
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useShallowEffect(() => {
    stateArtikelKesehatan.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      stateArtikelKesehatan.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/kesehatan/data-kesehatan-warga/artikel_kesehatan")
    }
  }

  if (!stateArtikelKesehatan.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Artikel Kesehatan</Text>
          {stateArtikelKesehatan.findUnique.data ? (
            <Paper bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Judul</Text>
                  <Text fz={"md"}>{stateArtikelKesehatan.findUnique.data.title}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Deskripsi</Text>
                  <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateArtikelKesehatan.findUnique.data.content }} />
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Pendahuluan</Text>
                  <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateArtikelKesehatan.findUnique.data.introduction.content }} />
                </Box>
                <Box>
                  <Stack gap={"xs"}>
                    <Text fz={"lg"} fw={"bold"}>Gejala</Text>
                    <Text fz={"md"} fw={"bold"}>Judul Gejala</Text>
                    <Text fz={"md"}>{stateArtikelKesehatan.findUnique.data.symptom.title}</Text>
                    <Text fz={"md"} fw={"bold"}>Deskripsi Gejala</Text>
                    <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateArtikelKesehatan.findUnique.data.symptom.content }} />
                  </Stack>
                </Box>
                <Box>
                  <Stack gap={"xs"}>
                    <Text fz={"lg"} fw={"bold"}>Pencegahan</Text>
                    <Text fz={"md"} fw={"bold"}>Judul Pencegahan</Text>
                    <Text fz={"md"}>{stateArtikelKesehatan.findUnique.data.prevention.title}</Text>
                    <Text fz={"md"} fw={"bold"}>Deskripsi Pencegahan</Text>
                    <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateArtikelKesehatan.findUnique.data.prevention.content }} />
                  </Stack>
                </Box>
                <Box>
                  <Stack gap={"xs"}>
                    <Text fz={"lg"} fw={"bold"}>Pertolongan Pertama</Text>
                    <Text fz={"md"} fw={"bold"}>Judul Pertolongan Pertama</Text>
                    <Text fz={"md"}>{stateArtikelKesehatan.findUnique.data.firstaid.title}</Text>
                    <Text fz={"md"} fw={"bold"}>Deskripsi Pertolongan Pertama</Text>
                    <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateArtikelKesehatan.findUnique.data.firstaid.content }} />
                  </Stack>
                </Box>
                <Box>
                  <Stack gap={"xs"}>
                    <Text fz={"lg"} fw={"bold"}>Mitos dan Fakta</Text>
                    <Text fz={"md"} fw={"bold"}>Judul Mitos dan Fakta</Text>
                    <Text fz={"md"}>{stateArtikelKesehatan.findUnique.data.mythvsfact.title}</Text>
                    <Text fz={"md"} fw={"bold"}>Deskripsi Mitos</Text>
                    <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateArtikelKesehatan.findUnique.data.mythvsfact.mitos }} />
                    <Text fz={"md"} fw={"bold"}>Deskripsi Fakta</Text>
                    <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateArtikelKesehatan.findUnique.data.mythvsfact.fakta }} />
                  </Stack>
                </Box>
                <Box>
                  <Stack gap={"xs"}>
                    <Text fz={"lg"} fw={"bold"}>Kapan Harus ke Dokter</Text>
                    <Text fz={"md"} fw={"bold"}>Deskripsi Kapan Harus ke Dokter</Text>
                    <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateArtikelKesehatan.findUnique.data.doctorsign.content }} />
                  </Stack>
                </Box>
                <Box>
                  <Flex gap={"xs"}>
                    <Button color="red" onClick={() => {
                      if (stateArtikelKesehatan.findUnique.data) {
                        setSelectedId(stateArtikelKesehatan.findUnique.data.id)
                        setModalHapus(true)
                      }
                    }}>
                      <IconX size={20} />
                    </Button>
                    <Button onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/artikel_kesehatan/${stateArtikelKesehatan.findUnique.data?.id}/edit`)} color="green">
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
        text="Apakah anda yakin ingin menghapus artikel kesehatan ini?"
      />
    </Box>
  );
}

export default DetailArtikelKesehatan;
