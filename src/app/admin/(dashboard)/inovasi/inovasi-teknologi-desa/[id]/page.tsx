'use client'
import colors from '@/con/colors';
import { inovasiKategoriLabel } from '@/lib/inovasi-teknologi/kategori';
import {
  Box,
  Button,
  Group,
  Image,
  Paper,
  Skeleton,
  Stack,
  Text
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import inovasiTeknologiState from '../../../_state/inovasi/inovasi-teknologi-desa';
import { ADMIN_INOVASI_TEKNOLOGI_HREF } from '../_com/kategori-inovasi';

/** Detail admin Inovasi Teknologi Desa dengan aksi edit & hapus. */
function DetailInovasiTeknologiDesa() {
  const stateInovasi = useProxy(inovasiTeknologiState);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();

  useShallowEffect(() => {
    stateInovasi.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = async () => {
    if (!selectedId) return;
    // await delete dulu — tanpa ini, router.push berlari mendahului DELETE
    // yang belum commit, list mount & fetch data lama → item terhapus masih tampil.
    const ok = await stateInovasi.delete.byId(selectedId);
    setModalHapus(false);
    setSelectedId(null);
    if (ok) router.push(ADMIN_INOVASI_TEKNOLOGI_HREF);
  };

  if (!stateInovasi.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = stateInovasi.findUnique.data;

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Tombol Kembali */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      {/* Card Utama */}
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
            Detail Inovasi Teknologi Desa
          </Text>

          {/* Sub Card Detail */}
          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box pl={5}>
                <Text fz="lg" fw="bold">Judul</Text>
                <Text fz="md" c="dimmed">{data?.name || '-'}</Text>
              </Box>

              <Box pl={5}>
                <Text fz="lg" fw="bold">Kategori</Text>
                <Text fz="md" c="dimmed">{inovasiKategoriLabel(data?.kategori) || '-'}</Text>
              </Box>

              <Box pl={5}>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text
                  fz="md"
                  c="dimmed"
                  style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                  dangerouslySetInnerHTML={{ __html: data?.deskripsi || '-' }}
                />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Gambar</Text>
                {data?.image?.link ? (
                  <Image
                    src={data.image.link}
                    alt={data.name || 'Gambar Inovasi Teknologi Desa'}
                    w={200}
                    h={200}
                    radius="md"
                    fit="cover"
                    loading="lazy"
                  />
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada gambar</Text>
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
                  onClick={() => router.push(`${ADMIN_INOVASI_TEKNOLOGI_HREF}/${data.id}/edit`)}
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

      {/* Modal Konfirmasi */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus inovasi teknologi desa ini?"
      />
    </Box>
  );
}

export default DetailInovasiTeknologiDesa;
