'use client'

import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
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
import { IconKey, IconMapper } from '../../../_com/iconMap';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import programKemiskinanState from '../../../_state/ekonomi/program-kemiskinan';

function DetailProgramKemiskinan() {
  const programState = useProxy(programKemiskinanState);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();

  useShallowEffect(() => {
    programState.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      programState.delete.delete(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/ekonomi/program-kemiskinan");
    }
  };

  if (!programState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = programState.findUnique.data;

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

      {/* Card utama */}
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
            Detail Program Pengentasan Kemiskinan
          </Text>

          {/* Detail Content */}
          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Judul Program</Text>
                <Text fz="md" c="dimmed">{data.nama || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi Singkat</Text>
                <Text
                  fz="md"
                  c="dimmed"
                  dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
                  style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Ikon Program</Text>
                {data.icon ? (
                  <IconMapper
                    name={data.icon as IconKey}
                    size={32}
                    color={colors['blue-button']}
                  />
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada ikon</Text>
                )}
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Statistik Jumlah Masyarakat Miskin</Text>
                <Stack gap="xs" pl="sm">
                  <Box>
                    <Text fw="bold">Jumlah</Text>
                    <Text fz="md" c="dimmed">{data.statistik?.jumlah || '-'}</Text>
                  </Box>
                  <Box>
                    <Text fw="bold">Tahun</Text>
                    <Text fz="md" c="dimmed">{data.statistik?.tahun || '-'}</Text>
                  </Box>
                </Stack>
              </Box>

              {/* Action Buttons */}
              <Group gap="sm" mt="sm">
                <Button
                  color="red"
                  onClick={() => {
                    setSelectedId(data.id);
                    setModalHapus(true);
                  }}
                  variant="light"
                  radius="md"
                  size="md"
                  disabled={programState.delete.loading}
                >
                  <IconTrash size={20} />
                </Button>

                <Button
                  color="green"
                  onClick={() => router.push(`/admin/ekonomi/program-kemiskinan/${data.id}/edit`)}
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
        text="Apakah Anda yakin ingin menghapus program kemiskinan ini?"
      />
    </Box>
  );
}

export default DetailProgramKemiskinan;
