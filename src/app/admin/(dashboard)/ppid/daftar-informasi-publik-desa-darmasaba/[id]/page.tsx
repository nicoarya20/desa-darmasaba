'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import daftarInformasiPublik from '../../../_state/ppid/daftar_informasi_publik/daftarInformasiPublik';

function DetailDaftarInformasiPublik() {
  const [modalHapus, setModalHapus] = useState(false)
  const stateDaftarInformasi = useProxy(daftarInformasiPublik)
  const router = useRouter()
  const params = useParams()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useShallowEffect(() => {
    stateDaftarInformasi.findUnique.load(params?.id as string)
  }, [params?.id])

  const handleHapus = () => {
    if (selectedId) {
      stateDaftarInformasi.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/ppid/daftar-informasi-publik-desa-darmasaba")
    }
  }

  if (!stateDaftarInformasi.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    )
  }

  const data = stateDaftarInformasi.findUnique.data;

  return (
    <Box py="md">
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
        w={{ base: '100%', md: '60%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="xl">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Informasi Publik
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="lg">
              <Box>
                <Text fz="lg" fw="bold" mb={4}>Jenis Informasi</Text>
                <Text fz="md" c="dimmed">{data.jenisInformasi || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold" mb={4}>Tanggal Publikasi</Text>
                <Text fz="md" c="dimmed">
                  {data.tanggal ? new Date(data.tanggal).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  }) : '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold" mb={4}>Deskripsi</Text>
                <Box 
                  fz="md" 
                  c="dimmed" 
                  dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
                  className="prose max-w-none"
                  style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                />
              </Box>

              <Group gap="sm" mt="md">
                <Tooltip label="Edit Informasi" withArrow position="top">
                  <Button
                    variant="light"
                    color="green"
                    leftSection={<IconEdit size={18} />}
                    onClick={() => router.push(`/admin/ppid/daftar-informasi-publik-desa-darmasaba/${data.id}/edit`)}
                    disabled={!data}
                  >
                    Edit
                  </Button>
                </Tooltip>

                <Tooltip label="Hapus Informasi" withArrow position="top">
                  <Button
                    variant="light"
                    color="red"
                    leftSection={<IconTrash size={18} />}
                    onClick={() => {
                      setSelectedId(data.id);
                      setModalHapus(true);
                    }}
                    disabled={stateDaftarInformasi.delete.loading || !data}
                    loading={stateDaftarInformasi.delete.loading}
                  >
                    Hapus
                  </Button>
                </Tooltip>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah Anda yakin ingin menghapus informasi ini? Tindakan ini tidak dapat dibatalkan.'
      />
    </Box>
  );
}

export default DetailDaftarInformasiPublik;
