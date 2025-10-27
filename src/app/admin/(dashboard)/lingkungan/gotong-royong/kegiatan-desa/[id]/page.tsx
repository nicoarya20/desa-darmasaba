'use client'
import { useProxy } from 'valtio/utils';
import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import colors from '@/con/colors';
import gotongRoyongState from '@/app/admin/(dashboard)/_state/lingkungan/gotong-royong';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';

function DetailKegiatanDesa() {
  const kegiatanDesaState = useProxy(gotongRoyongState.kegiatanDesa);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    kegiatanDesaState.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      kegiatanDesaState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/lingkungan/gotong-royong/kegiatan-desa");
    }
  };

  if (!kegiatanDesaState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = kegiatanDesaState.findUnique.data;

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

      {/* Container Detail */}
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
            Detail Kegiatan Desa
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              {/* Judul */}
              <Box>
                <Text fz="lg" fw="bold">Judul Kegiatan Desa Inovasi</Text>
                <Text fz="md" c="dimmed">{data.judul || '-'}</Text>
              </Box>

              {/* Tanggal */}
              <Box>
                <Text fz="lg" fw="bold">Tanggal</Text>
                <Text fz="md" c="dimmed">
                  {data.tanggal ? new Date(data.tanggal).toLocaleDateString() : '-'}
                </Text>
              </Box>

              {/* Deskripsi Singkat */}
              <Box>
                <Text fz="lg" fw="bold">Deskripsi Singkat</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.deskripsiSingkat || '-' }} />
              </Box>

              {/* Deskripsi Lengkap */}
              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.deskripsiLengkap || '-' }} />
              </Box>

              {/* Kategori */}
              <Box>
                <Text fz="lg" fw="bold">Kategori Kegiatan</Text>
                <Text fz="md" c="dimmed">{data.kategoriKegiatan?.nama || '-'}</Text>
              </Box>

              {/* Partisipan */}
              <Box>
                <Text fz="lg" fw="bold">Partisipan</Text>
                <Text fz="md" c="dimmed">{data.partisipan || '-'}</Text>
              </Box>

              {/* Lokasi */}
              <Box>
                <Text fz="lg" fw="bold">Lokasi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data.lokasi || '-'}</Text>
              </Box>

              {/* Gambar */}
              <Box>
                <Text fz="lg" fw="bold">Gambar</Text>
                {data.image?.link ? (
                  <Image
                    src={data.image.link}
                    alt={data.judul || 'Gambar Kegiatan Desa'}
                    w={150}
                    h={150}
                    radius="md"
                    fit="cover"
                    loading="lazy"
                  />
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada gambar</Text>
                )}
              </Box>

              {/* Tombol Hapus & Edit */}
              <Flex gap="sm" mt={10}>
                <Tooltip label="Hapus Kegiatan Desa" withArrow position="top">
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
                    <IconX size={20} />
                  </Button>
                </Tooltip>

                <Tooltip label="Edit Kegiatan Desa" withArrow position="top">
                  <Button
                    color="green"
                    onClick={() => router.push(`/admin/lingkungan/gotong-royong/kegiatan-desa/${data.id}/edit`)}
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
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus kegiatan desa ini?'
      />
    </Box>
  );
}

export default DetailKegiatanDesa;
