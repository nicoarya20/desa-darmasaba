'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { DokumenFolderView } from '../../_com/DokumenFolderView';
import { DokumenSampahPanel } from '../../_com/DokumenSampahPanel';
import { DokumenZipButton } from '../../_com/DokumenZipButton';


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
  const totalDokumen = (data.dokumenUmum?.length ?? 0) + (data.folders ?? []).reduce((n, f) => n + f.dokumen.length, 0);

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
        w={{ base: "100%", md: "70%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        withBorder
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
                  style={{ wordBreak: "break-word", whiteSpace: "normal", lineHeight: 1.6 }}
                  
                />
              </Box>

              <Box>
                <Group justify="space-between" gap="xs" mb="xs">
                  <Text fz="lg" fw="bold">Dokumen</Text>
                  <DokumenZipButton
                    programId={data.id}
                    label="Unduh semua (ZIP)"
                    target="semua dokumen"
                    disabled={totalDokumen === 0}
                  />
                </Group>
                <DokumenFolderView key={data.id} programId={data.id} folders={data.folders ?? []} dokumenUmum={data.dokumenUmum ?? []} />
              </Box>

              <DokumenSampahPanel
                key={`sampah-${data.id}`}
                programId={data.id}
                folders={data.folders ?? []}
                onRestored={() => void detailState.findUnique.load(data.id)}
              />

              <Group gap="sm" mt="md">
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

                  <Button
                    color="green"
                    onClick={() => router.push(`/admin/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/${data.id}/edit`)}
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

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus data Desa Anti Korupsi ini?"
      />
    </Box>
  );
}