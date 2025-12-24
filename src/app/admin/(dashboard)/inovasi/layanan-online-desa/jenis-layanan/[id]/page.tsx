'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import layananonlineDesa from '@/app/admin/(dashboard)/_state/inovasi/layanan-online-desa';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailJenisLayanan() {
  const state = useProxy(layananonlineDesa.jenisLayanan)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      state.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/inovasi/layanan-online-desa/jenis-layanan")
    }
  }

  if (!state.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    )
  }

  const data = state.findUnique.data

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Tombol kembali */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      {/* Card utama */}
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
            Detail Jenis Layanan
          </Text>

          {/* Detail isi */}
          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama</Text>
                <Text fz="md" c="dimmed">{data?.nama || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text
                  fz="md"
                  c="dimmed"
                  dangerouslySetInnerHTML={{ __html: data?.deskripsi || '-' }}
                  style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                />
              </Box>

              {/* Tombol aksi */}
              <Group gap="sm" mt="sm">
                <Button
                  color="red"
                  onClick={() => {
                    setSelectedId(data.id)
                    setModalHapus(true)
                  }}
                  variant="light"
                  radius="md"
                  size="md"
                  disabled={state.delete.loading}
                >
                  <IconTrash size={20} />
                </Button>

                <Button
                  color="green"
                  onClick={() => router.push(`/admin/inovasi/layanan-online-desa/jenis-layanan/${data.id}/edit`)}
                  variant="light"
                  radius="md"
                  size="md"
                >
                  <IconEdit size={20} />
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah Anda yakin ingin menghapus jenis layanan ini?'
      />
    </Box>
  );
}

export default DetailJenisLayanan;
