'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text, Tooltip, Image } from '@mantine/core';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import programKesehatan from '../../../_state/kesehatan/program-kesehatan/programKesehatan';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailProgramKesehatan() {
  const state = useProxy(programKesehatan);
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
      router.push("/admin/kesehatan/program-kesehatan");
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
    <Box py={10}>
      {/* Tombol kembali */}
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
        w={{ base: "100%", md: "50%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Program Kesehatan
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Judul</Text>
                <Text fz="md" c="dimmed">{data?.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi Singkat</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data?.deskripsiSingkat || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data?.deskripsi || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Gambar</Text>
                {data?.image?.link ? (
                  <Image src={data.image.link} alt="gambar program kesehatan" radius="md" loading="lazy"/>
                ) : (
                  <Text fz="md" c="dimmed">-</Text>
                )}
              </Box>

              <Group gap="sm">
                <Tooltip label="Hapus Data" withArrow position="top">
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

                <Tooltip label="Edit Data" withArrow position="top">
                  <Button
                    color="green"
                    onClick={() => router.push(`/admin/kesehatan/program-kesehatan/${data?.id}/edit`)}
                    variant="light"
                    radius="md"
                    size="md"
                  >
                    <IconEdit size={20} />
                  </Button>
                </Tooltip>
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
        text="Apakah Anda yakin ingin menghapus program kesehatan ini?"
      />
    </Box>
  );
}

export default DetailProgramKesehatan;
