'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailVideo() {
  const videoState = useProxy(stateGallery.video);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    videoState.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      videoState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/desa/gallery/video");
    }
  };

  if (!videoState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = videoState.findUnique.data;

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Tombol Kembali */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      {/* Detail Video */}
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
            Detail Video
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Judul</Text>
                <Text fz="md" c="dimmed">{data?.name || '-'}</Text>
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

              <Box>
                <Text fz="lg" fw="bold">Tanggal Video</Text>
                <Text fz="md" c="dimmed">
                  {data?.createdAt ? new Date(data.createdAt).toDateString() : '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                {data?.deskripsi ? (
                  <Text
                    fz="md"
                    c="dimmed"
                    dangerouslySetInnerHTML={{ __html: data.deskripsi }}
                    style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                  />
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada deskripsi</Text>
                )}
              </Box>

              {/* Tombol Aksi */}
              <Group gap="sm">
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

                  <Button
                    color="green"
                    onClick={() =>
                      router.push(`/admin/desa/gallery/video/${data.id}/edit`)
                    }
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
        text="Apakah Anda yakin ingin menghapus video ini?"
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

export default DetailVideo;
