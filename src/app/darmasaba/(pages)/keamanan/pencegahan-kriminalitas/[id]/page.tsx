'use client'
import pencegahanKriminalitasState from '@/app/admin/(dashboard)/_state/keamanan/pencegahan-kriminalitas';
import { Box, Button, Card, Center, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowLeft } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';


function DetailPencegahanKriminalitas() {
  const router = useRouter();
  const params = useParams();
  const kriminalitasState = useProxy(pencegahanKriminalitasState);

  useShallowEffect(() => {
    kriminalitasState.findUnique.load(params?.id as string);
  }, []);

  if (kriminalitasState.findUnique.loading) {
    return (
      <Center py="xl">
        <Loader size="lg" color="blue" />
      </Center>
    );
  }

  if (!kriminalitasState.findUnique.data) {
    return (
      <Center h={400}>
        <Stack align="center" gap="sm">
          <Text fz="lg" fw="bold" c="dimmed">Data tidak ditemukan</Text>
          <Button
            variant="light"
            color="blue"
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => router.push("/admin/keamanan/pencegahan-kriminalitas")}
          >
            Kembali ke daftar
          </Button>
        </Stack>
      </Center>
    );
  }

  const data = kriminalitasState.findUnique.data;

  return (
    <Box py="md" px="md">
      <Group mb="md">
        <Button
          variant="light"
          color="blue"
          onClick={() => router.back()}
          leftSection={<IconArrowLeft size={20} />}
        >
          Kembali
        </Button>
      </Group>

      <Card
        withBorder
        radius="xl"
        shadow="md"
        p="xl"
        bg="white"
      >
        <Stack gap="lg">
          <Title order={2} c="blue">Detail Pencegahan Kriminalitas</Title>

          <Paper radius="lg" p="lg" withBorder>
            <Stack gap="lg">
              <Stack gap={4}>
                <Text fz="sm" c="dimmed">Judul</Text>
                <Text fz="lg" fw={600}>{data?.judul || '-'}</Text>
              </Stack>

              <Stack gap={4}>
                <Text fz="sm" c="dimmed">Deskripsi Singkat</Text>
                {data?.deskripsiSingkat ? (
                  <Text fz="md" style={{wordBreak: "break-word", whiteSpace: "normal"}} dangerouslySetInnerHTML={{ __html: data.deskripsiSingkat }} />
                ) : (
                  <Text fz="sm" c="dimmed">Belum ada deskripsi singkat</Text>
                )}
              </Stack>

              <Stack gap={4}>
                <Text fz="sm" c="dimmed">Deskripsi Lengkap</Text>
                {data?.deskripsi ? (
                  <Text fz="md" style={{wordBreak: "break-word", whiteSpace: "normal"}} dangerouslySetInnerHTML={{ __html: data.deskripsi }} />
                ) : (
                  <Text fz="sm" c="dimmed">Belum ada deskripsi</Text>
                )}
              </Stack>

              <Stack gap={4}>
                <Text fz="sm" c="dimmed">Video</Text>
                {data?.linkVideo ? (
                  <Box
                    component="iframe"
                    src={convertToEmbedUrl(data.linkVideo)}
                    width="100%"
                    h={{ base: 320, md: 450 }}
                    allowFullScreen
                    style={{ borderRadius: 12, border: 'none' }}
                  />
                ) : (
                  <Text fz="sm" c="dimmed">Belum ada video</Text>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Card>
    </Box>
  );

  function convertToEmbedUrl(youtubeUrl: string): string {
    try {
      const url = new URL(youtubeUrl);
      const videoId = url.searchParams.get("v");
      if (!videoId) return youtubeUrl;
      return `https://www.youtube.com/embed/${videoId}`;
    } catch {
      return youtubeUrl;
    }
  }
}

export default DetailPencegahanKriminalitas;
