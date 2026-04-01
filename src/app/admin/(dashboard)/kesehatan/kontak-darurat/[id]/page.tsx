'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import kontakDarurat from '../../../_state/kesehatan/kontak-darurat/kontakDarurat';

function DetailKontakDarurat() {
  const state = useProxy(kontakDarurat);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      state.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/kesehatan/kontak-darurat");
    }
  };

  if (!state.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = state.findUnique.data;

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Tombol Back */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      {/* Wrapper Detail */}
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
            Detail Kontak Darurat
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Judul</Text>
                <Text fz="md" c="dimmed">{data.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Telepon</Text>
                <Text fz="md" c="dimmed">{data.whatsapp || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text
                  fz="md"
                  c="dimmed"
                  dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
                  style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Gambar</Text>
                {data.image?.link ? (
                  <Image
                    src={data.image.link}
                    alt="gambar"
                    radius="md"
                    maw={300}
                    loading="lazy"
                  />
                ) : (
                  <Text fz="md" c="dimmed">-</Text>
                )}
              </Box>

              {/* Aksi */}
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
                  disabled={state.delete.loading}
                >
                  <IconTrash size={20} />
                </Button>

                <Button
                  color="green"
                  onClick={() =>
                    router.push(`/admin/kesehatan/kontak-darurat/${data.id}/edit`)
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
        text="Apakah anda yakin ingin menghapus kontak darurat ini?"
      />
    </Box>
  );
}

export default DetailKontakDarurat;
