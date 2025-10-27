'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import pencegahanKriminalitasState from '../../../_state/keamanan/pencegahan-kriminalitas';

function DetailPencegahanKriminalitas() {
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const kriminalitasState = useProxy(pencegahanKriminalitasState);

  useShallowEffect(() => {
    kriminalitasState.findUnique.load(params?.id as string);
  }, []);

  const handleDelete = () => {
    if (selectedId) {
      kriminalitasState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/keamanan/pencegahan-kriminalitas");
    }
  };

  if (!kriminalitasState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = kriminalitasState.findUnique.data;

  return (
    <Box py={10}>
      {/* Tombol Kembali */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      {/* Detail */}
      <Paper
        withBorder
        w={{ base: "100%", md: "50%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Pencegahan Kriminalitas
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Judul</Text>
                <Text fz="md" c="dimmed">{data?.judul || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi Singkat</Text>
                {data?.deskripsiSingkat ? (
                  <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.deskripsiSingkat }} />
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada deskripsi singkat</Text>
                )}
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                {data?.deskripsi ? (
                  <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.deskripsi }} />
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada deskripsi</Text>
                )}
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Video</Text>
                {data?.linkVideo ? (
                  <Box
                    component="iframe"
                    src={convertToEmbedUrl(data.linkVideo)}
                    width="100%"
                    height={300}
                    allowFullScreen
                    style={{ borderRadius: 8 }}
                  />
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada video</Text>
                )}
              </Box>

              {/* Tombol Aksi */}
              <Flex gap="sm" mt="sm">
                <Tooltip label="Hapus" withArrow position="top">
                  <Button
                    color="red"
                    onClick={() => {
                      setSelectedId(data.id);
                      setModalHapus(true);
                    }}
                    variant="light"
                    radius="md"
                    size="md"
                  >
                    <IconTrash size={20} />
                  </Button>
                </Tooltip>

                <Tooltip label="Edit" withArrow position="top">
                  <Button
                    color="green"
                    onClick={() => router.push(`/admin/keamanan/pencegahan-kriminalitas/${data.id}/edit`)}
                    variant="light"
                    radius="md"
                    size="md"
                  >
                    <IconEdit size={20} />
                  </Button>
                </Tooltip>
              </Flex>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text="Apakah anda yakin ingin menghapus pencegahan kriminalitas ini?"
      />
    </Box>
  );

  function convertToEmbedUrl(youtubeUrl: string): string {
    try {
      const url = new URL(youtubeUrl);
      const videoId = url.searchParams.get("v");
      if (!videoId) return youtubeUrl;
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (err) {
      console.error("Error converting YouTube URL to embed:", err);
      return youtubeUrl;
    }
  }
}

export default DetailPencegahanKriminalitas;
