'use client';

import { Box, Button, Group, Paper, Skeleton, Stack, Text, Alert } from '@mantine/core';
import Image from 'next/image';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash, IconPhoto } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import colors from '@/con/colors';
import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';

function DetailFoto() {
  const FotoState = useProxy(stateGallery.foto);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    FotoState.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      FotoState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/desa/gallery/foto");
    }
  };

  if (!FotoState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = FotoState.findUnique.data;
  const imageUrl = data.imageGalleryFoto?.link;

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
        withBorder
        // Gunakan max-width agar tidak terlalu lebar di desktop
        maw={800}
        w={{ base: "100%", md: "70%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz={{ base: 'xl', md: '2xl' }} fw="bold" c={colors['blue-button']}>
            Detail Foto
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Judul Foto</Text>
                <Text fz="md" c="dimmed">{data.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text
                  fz="md"
                  c="dimmed"
                  style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                  dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
                />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Gambar</Text>
                {imageUrl ? (
                  <Box
                    pos="relative"
                    style={{
                      width: '100%',
                      maxWidth: '600px', // Set a maximum width
                      margin: '0 auto',  // Center the container
                      aspectRatio: '16/9', // Use 16:9 aspect ratio
                      borderRadius: 8,
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <Image
                      src={imageUrl}
                      alt={data.name || 'Gambar Foto'}
                      fill
                      style={{
                        objectFit: 'contain', // Changed from 'cover' to 'contain' to show full image
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                      loading="lazy"
                      onError={() => setImageError(true)}
                    />
                  </Box>
                ) : imageError ? (
                  <Alert
                    color="orange"
                    icon={<IconPhoto size={16} />}
                    title="Gagal memuat gambar"
                    radius="md"
                  >
                    Gambar tidak dapat ditampilkan.
                  </Alert>
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada gambar</Text>
                )}
              </Box>

              {/* Action Buttons */}
              <Group gap="sm" justify="flex-start">
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
                  onClick={() => router.push(`/admin/desa/gallery/foto/${data.id}/edit`)}
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
        text="Apakah Anda yakin ingin menghapus foto ini?"
      />
    </Box>
  );
}

export default DetailFoto;