'use client'

import { ModalKonfirmasiHapus } from "@/app/admin/(dashboard)/_com/modalKonfirmasiHapus"
import indeksKepuasanState from "@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan"
import colors from "@/con/colors"
import { Box, Button, Group, Paper, Skeleton, Stack, Text } from "@mantine/core"
import { useShallowEffect } from "@mantine/hooks"
import { IconArrowBack, IconEdit, IconTrash } from "@tabler/icons-react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useProxy } from "valtio/utils"

export default function DetailResponden() {
  const [modalHapus, setModalHapus] = useState(false)
  const stateDetail = useProxy(indeksKepuasanState.responden)
  const router = useRouter()
  const params = useParams()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useShallowEffect(() => {
    stateDetail.findUnique.load(params?.id as string)
  }, [params?.id])

  const handleHapus = () => {
    if (selectedId) {
      stateDetail.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/landing-page/indeks-kepuasan-masyarakat/responden")
    }
  }

  if (!stateDetail.findUnique.data) {
    return (
      <Stack>
        <Skeleton h={500} />
      </Stack>
    )
  }
  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      <Paper
        withBorder
        w={{ base: "100%", md: "70%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Responden
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama Responden</Text>
                <Text fz="md" c="dimmed">{stateDetail.findUnique.data?.name || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">Tanggal</Text>
                <Text fz="md" c="dimmed">{
                  stateDetail.findUnique.data?.tanggal
                    ? new Date(stateDetail.findUnique.data.tanggal).toLocaleDateString('id-ID')
                    : '-'
                }</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">Jenis Kelamin</Text>
                <Text fz="md" c="dimmed">{stateDetail.findUnique.data?.jenisKelamin?.name || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">Rating</Text>
                <Text fz="md" c="dimmed">{stateDetail.findUnique.data?.rating?.name || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">Kelompok Umur</Text>
                <Text fz="md" c="dimmed">{stateDetail.findUnique.data?.kelompokUmur?.name || '-'}</Text>
              </Box>
              
              <Group gap="sm" mt="md">
                  <Button
                    color="red"
                    variant="light"
                    onClick={() => {
                      if (stateDetail.findUnique.data) {
                        setSelectedId(stateDetail.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={stateDetail.delete.loading || !stateDetail.findUnique.data}
                    leftSection={<IconTrash size={20} />}
                  >
                    Hapus
                  </Button>
                
                <Button
                    color="green"
                    variant="light"
                    onClick={() => {
                      if (stateDetail.findUnique.data) {
                        router.push(`/admin/landing-page/indeks-kepuasan-masyarakat/responden/${stateDetail.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!stateDetail.findUnique.data}
                    leftSection={<IconEdit size={20} />}
                  >
                    Edit
                  </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus responden ini?"
      />
    </Box>
  )
}