'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import prestasiState from '@/app/admin/(dashboard)/_state/landing-page/prestasi-desa';
import colors from '@/con/colors';
import { Box, Button, Group, Image, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';


function DetailPrestasiDesa() {
  const detailState = useProxy(prestasiState.prestasiDesa)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    prestasiState.kategoriPrestasi.findMany.load()
    detailState.findUnique.load(params?.id as string)
  }, [])


  const handleHapus = () => {
    if (selectedId) {
      detailState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/landing-page/prestasi-desa/list-prestasi-desa")
    }
  }

  if (!detailState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton h={40} />
      </Stack>
    )
  }

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
        withBorder
        w={{ base: "100%", md: "60%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Prestasi Desa
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Judul</Text>
                <Text fz="md" c="dimmed">{detailState.findUnique.data?.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Kategori</Text>
                <Text fz="md" c="dimmed">{detailState.findUnique.data?.kategori?.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Box 
                  fz="md" 
                  c="dimmed" 
                  dangerouslySetInnerHTML={{ __html: detailState.findUnique.data?.deskripsi || '-' }}
                />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Gambar</Text>
                {detailState.findUnique.data?.image?.link ? (
                  <Image
                    src={detailState.findUnique.data.image.link}
                    alt={detailState.findUnique.data.name || 'Gambar Prestasi'}
                    w={300}
                    fit="contain"
                    style={{ borderRadius: '8px', border: '1px solid #e0e0e0' }}
                    loading='lazy'
                  />
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada gambar</Text>
                )}
              </Box>

              <Group gap="sm">
                <Tooltip label="Hapus Prestasi" withArrow position="top">
                  <Button
                    color="red"
                    onClick={() => {
                      if (detailState.findUnique.data) {
                        setSelectedId(detailState.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={detailState.delete.loading || !detailState.findUnique.data}
                    variant="light"
                    radius="md"
                    size="md"
                  >
                    <IconTrash size={20} />
                  </Button>
                </Tooltip>

                <Tooltip label="Edit Prestasi" withArrow position="top">
                  <Button
                    color="green"
                    onClick={() => {
                      if (detailState.findUnique.data) {
                        router.push(`/admin/landing-page/prestasi-desa/list-prestasi-desa/${detailState.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!detailState.findUnique.data}
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

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus prestasi desa ini?'
      />
    </Box>
  );
}

export default DetailPrestasiDesa;