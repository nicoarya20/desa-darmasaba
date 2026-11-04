'use client'
import { Box, Button, Card, Grid, Group, Image, Paper, Skeleton, Stack, Text, Badge, AspectRatio } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash, IconVideo } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateKesejahteraanMasyarakat from '@/app/admin/(dashboard)/_state/ekonomi/kesejahteraan-masyarakat';
import colors from '@/con/colors';

interface ExistingImage {
  id: string;
  link: string;
  name: string;
}

interface KesejahteraanDetail {
  id: string;
  judul: string;
  deskripsi: string;
  content: string;
  image?: { link: string } | null;
  images?: ExistingImage[];
  linkVideo?: string | null;
}

function DetailKesejahteraan() {
  const state = useProxy(stateKesejahteraanMasyarakat);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    state.kesejahteraan.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      state.kesejahteraan.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/ekonomi/kesejahteraan-masyarakat");
    }
  };

  if (!state.kesejahteraan.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = state.kesejahteraan.findUnique.data as unknown as KesejahteraanDetail;

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Tombol Back */}
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
        w={{ base: "100%", md: "70%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Program Kesejahteraan
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              {/* Judul */}
              <Box>
                <Text fz="lg" fw="bold">Judul</Text>
                <Text fz="md" c="dimmed">{data.judul || '-'}</Text>
              </Box>

              {/* Deskripsi */}
              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text
                  fz="md"
                  c="dimmed"
                  style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                  dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
                />
              </Box>

              {/* Gambar Utama (Featured) */}
              <Box>
                <Text fz="lg" fw="bold">Gambar Utama</Text>
                {data.image?.link ? (
                  <Image
                    src={data.image.link}
                    alt={data.judul || 'Gambar Program Kesejahteraan'}
                    w={{ base: '100%', md: 400 }}
                    h={300}
                    radius="md"
                    fit="cover"
                    loading="lazy"
                  />
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada gambar utama</Text>
                )}
              </Box>

              {/* Gallery Images */}
              {data.images && data.images.length > 0 && (
                <Box>
                  <Group gap="xs" mb="sm">
                    <Text fz="lg" fw="bold">Galeri Dokumentasi</Text>
                    <Badge color="blue" variant="light">
                      {data.images.length}
                    </Badge>
                  </Group>
                  <Grid gap="md">
                    {data.images.map((img, index) => (
                      <Grid.Col span={{ base: 6, md: 4 }} key={img.id}>
                        <Card p="xs" radius="md" withBorder>
                          <Image
                            src={img.link}
                            alt={img.name || `Gallery ${index + 1}`}
                            h={150}
                            radius="sm"
                            fit="cover"
                            loading="lazy"
                          />
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* YouTube Video */}
              {data.linkVideo && (
                <Box>
                  <Group gap="xs" mb="sm">
                    <Text fz="lg" fw="bold">Video YouTube</Text>
                    <IconVideo size={20} color={colors['blue-button']} />
                  </Group>
                  <AspectRatio ratio={16 / 9} mah={400}>
                    <iframe
                      src={data.linkVideo}
                      title="YouTube Video"
                      allowFullScreen
                      style={{ borderRadius: 10, border: '1px solid #ddd' }}
                    />
                  </AspectRatio>
                </Box>
              )}

              {/* Konten */}
              <Box>
                <Text fz="lg" fw="bold">Konten</Text>
                <Paper bg="white" p="md" radius="md" mt="xs">
                  <Text
                    fz="md"
                    c="dimmed"
                    dangerouslySetInnerHTML={{ __html: data.content || '-' }}
                  />
                </Paper>
              </Box>

              {/* Action Buttons */}
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
                  leftSection={<IconTrash size={20} />}
                >
                  Hapus
                </Button>

                <Button
                  color="green"
                  onClick={() => router.push(`/admin/ekonomi/kesejahteraan-masyarakat/${data.id}/edit`)}
                  variant="light"
                  radius="md"
                  size="md"
                  leftSection={<IconEdit size={20} />}
                >
                  Edit
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus program kesejahteraan ini?"
      />
    </Box>
  );
}

export default DetailKesejahteraan;
