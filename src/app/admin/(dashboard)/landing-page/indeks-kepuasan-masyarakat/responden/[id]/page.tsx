'use client'

import { ModalKonfirmasiHapus } from "@/app/admin/(dashboard)/_com/modalKonfirmasiHapus"
import indeksKepuasanState from "@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan"
import colors from "@/con/colors"
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from "@mantine/core"
import { useShallowEffect } from "@mantine/hooks"
import { IconArrowBack, IconEdit, IconX } from "@tabler/icons-react"
import { useRouter, useParams } from "next/navigation"
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
      router.push("/admin/ppid/ikm-desa-darmasaba/responden")
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
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper w={{ base: "100%", md: "50%" }} bg={colors['white-1']} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Detail Responden</Text>

          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Nama Responden</Text>
                <Text fz={"lg"}>{stateDetail.findUnique.data?.name}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Tanggal</Text>
                <Text fz={"lg"}>{
                  stateDetail.findUnique.data?.tanggal
                    ? new Date(stateDetail.findUnique.data.tanggal).toLocaleDateString('id-ID')
                    : '-'
                }</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Jenis Kelamin</Text>
                <Text fz={"lg"}>{stateDetail.findUnique.data?.jenisKelamin?.name}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Rating</Text>
                <Text fz={"lg"}>{stateDetail.findUnique.data?.rating?.name}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Kelompok Umur</Text>
                <Text fz={"lg"}>{stateDetail.findUnique.data?.kelompokUmur?.name}</Text>
              </Box>
              <Flex gap={"xs"} mt={10}>
                <Button
                  onClick={() => {
                    if (stateDetail.findUnique.data) {
                      setSelectedId(stateDetail.findUnique.data.id);
                      setModalHapus(true);
                    }
                  }}
                  disabled={stateDetail.delete.loading || !stateDetail.findUnique.data}
                  color={"red"}
                >
                  <IconX size={20} />
                </Button>
                <Button
                  onClick={() => {
                    if (stateDetail.findUnique.data) {
                      router.push(`/admin/ppid/ikm-desa-darmasaba/responden/${stateDetail.findUnique.data.id}/edit`);
                    }
                  }}
                  disabled={!stateDetail.findUnique.data}
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
        text="Apakah anda yakin ingin menghapus responden ini?"
      />
    </Box>
  )
}