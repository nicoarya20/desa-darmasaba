'use client'
import colors from '@/con/colors';
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
import penghargaanState from '../../../_state/desa/penghargaan';

function DetailPenghargaan() {
  const statePenghargaan = useProxy(penghargaanState);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();

  useShallowEffect(() => {
    statePenghargaan.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      statePenghargaan.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push('/admin/desa/penghargaan');
    }
  };

  if (!statePenghargaan.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = statePenghargaan.findUnique.data;

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
        w={{ base: '100%', md: '60%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Penghargaan
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">
                  Gambar
                </Text>
                {data.image?.link ? (
                  <Image
                    src={data.image.link}
                    alt={data.name || 'Gambar Penghargaan'}
                    w={200}
                    h={200}
                    radius="md"
                    fit="cover"
                    loading="lazy"
                  />
                ) : (
                  <Text fz="sm" c="dimmed">
                    Tidak ada gambar
                  </Text>
                )}
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Judul
                </Text>
                <Text fz="md" c="dimmed">
                  {data.name || '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Juara
                </Text>
                <Text fz="md" c="dimmed">
                  {data.juara || '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Deskripsi
                </Text>
                <Text
                  fz="md"
                  c="dimmed"
                  dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
                  style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                />
              </Box>

              <Group gap="sm" mt={10}>
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
                    router.push(`/admin/desa/penghargaan/${data.id}/edit`)
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

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus penghargaan ini?"
      />
    </Box>
  );
}

export default DetailPenghargaan;
