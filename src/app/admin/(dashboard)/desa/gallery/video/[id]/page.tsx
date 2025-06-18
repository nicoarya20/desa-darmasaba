'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';


function DetailVideo() {
  const videoState = useProxy(stateGallery.video)
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    videoState.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      videoState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/desa/gallery/video")
    }
  }

  if (!videoState.findUnique.data) {
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
      <Paper bg={colors['white-1']} w={{ base: "100%", md: "100%", lg: "50%" }} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Detail Video</Text>
          {videoState.findUnique.data ? (
            <Paper key={videoState.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Judul</Text>
                  <Text fz={"lg"}>{videoState.findUnique.data?.name}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Video</Text>
                  <Box component="iframe"
                    src={convertToEmbedUrl(videoState.findUnique.data?.linkVideo)}
                    width="100%"
                    height={300}
                    allowFullScreen
                    style={{ borderRadius: 8 }}
                  />

                </Box>

                <Box>
                  <Text fw={"bold"} fz={"lg"}>Tanggal Video</Text>
                  <Text fz={"lg"}>{new Date(videoState.findUnique.data?.createdAt).toDateString()}</Text>
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Deskripsi</Text>
                  <Text fz={"lg"} dangerouslySetInnerHTML={{ __html: videoState.findUnique.data?.deskripsi }} />
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (videoState.findUnique.data) {
                        setSelectedId(videoState.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={videoState.delete.loading || !videoState.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (videoState.findUnique.data) {
                        router.push(`/admin/desa/gallery/video/${videoState.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!videoState.findUnique.data}
                    color={"green"}
                  >
                    <IconEdit size={20} />
                  </Button>
                </Flex>
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </Paper>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus berita ini?'
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
