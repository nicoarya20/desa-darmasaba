'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';


export default function DetailKegiatanDesa() {
  const detailState = useProxy(korupsiState.desaAntikorupsi)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    detailState.findUnique.load(params?.id as string)
  }, [])


  const handleHapus = () => {
    if (selectedId) {
      detailState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi")
    }
  }

  if (!detailState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = detailState.findUnique.data;

  return (
    <Box py={10}>
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      <Paper
        w={{ base: "100%", md: "50%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Desa Anti Korupsi
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="md">
              <Box>
                <Text fz="lg" fw="bold">Judul</Text>
                <Text fz="md" c="dimmed">{data.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Kategori</Text>
                <Text fz="md" c="dimmed">{data.kategori?.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold" mb="xs">Deskripsi</Text>
                <Box 
                  fz="md" 
                  c="dimmed" 
                  dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
                  style={{ lineHeight: 1.6 }}
                />
              </Box>

              <Box>
                <Text fz="lg" fw="bold" mb="xs">Dokumen</Text>
                {data.file?.link ? (
                  <Box 
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      height: '500px',
                      width: '100%'
                    }}
                  >
                    <iframe
                      src={data.file.link}
                      width="100%"
                      height="100%"
                      style={{ border: 'none' }}
                    />
                  </Box>
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada dokumen tersedia</Text>
                )}
              </Box>

              <Group gap="sm" mt="md">
                <Tooltip label="Hapus Data" withArrow position="top">
                  <Button
                    color="red"
                    onClick={() => {
                      setSelectedId(data.id);
                      setModalHapus(true);
                    }}
                    variant="light"
                    radius="md"
                    size="md"
                    disabled={detailState.delete.loading}
                  >
                    <IconTrash size={20} />
                  </Button>
                </Tooltip>

                <Tooltip label="Edit Data" withArrow position="top">
                  <Button
                    color="green"
                    onClick={() => router.push(`/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/${data.id}/edit`)}
                    variant="light"
                    radius="md"
                    size="md"
                  >
                    <IconEdit size={20} />
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
        text="Apakah Anda yakin ingin menghapus data Desa Anti Korupsi ini?"
      />
    </Box>
  );
}