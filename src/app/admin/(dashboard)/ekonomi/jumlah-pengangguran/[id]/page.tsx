'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import jumlahPengangguranState from '@/app/admin/(dashboard)/_state/ekonomi/jumlah-pengangguran';
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailJumlahPengangguran() {
  const router = useRouter();
  const params = useParams();
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stateDetail = useProxy(jumlahPengangguranState.jumlahPengangguran);

  useShallowEffect(() => {
    stateDetail.findUnique.load(params?.id as string);
  }, [params?.id]);

  const handleHapus = () => {
    if (selectedId) {
      stateDetail.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/ekonomi/jumlah-pengangguran");
    }
  };

  if (!stateDetail.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = stateDetail.findUnique.data;

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Tombol Kembali */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      {/* Paper Detail */}
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
            Detail Data Pengangguran
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fw="bold">Pengangguran Terdidik</Text>
                <Text c="dimmed">{data.educatedUnemployment || '-'}</Text>
              </Box>

              <Box>
                <Text fw="bold">Pengangguran Tidak Terdidik</Text>
                <Text c="dimmed">{data.uneducatedUnemployment || '-'}</Text>
              </Box>

              <Box>
                <Text fw="bold">Perubahan</Text>
                <Text c="dimmed">
                  {data.percentageChange !== null && data.percentageChange !== undefined
                    ? `${data.percentageChange}%`
                    : 'Tidak ada data perubahan'}
                </Text>
              </Box>

              <Box>
                <Text fw="bold">Tahun</Text>
                <Text c="dimmed">{data.year || '-'}</Text>
              </Box>

              <Box>
                <Text fw="bold">Bulan</Text>
                <Text c="dimmed">{data.month || '-'}</Text>
              </Box>

              <Box>
                <Text fw="bold">Total Pengangguran</Text>
                <Text c="dimmed">{data.totalUnemployment || '-'}</Text>
              </Box>

              {/* Tombol Edit & Hapus */}
              <Flex gap="sm">
                <Button
                  onClick={() => {
                    setSelectedId(data.id);
                    setModalHapus(true);
                  }}
                  color="red"
                  variant="light"
                  radius="md"
                  size="md"
                >
                  <IconX size={20} />
                </Button>

                <Button
                  onClick={() => router.push(`/admin/ekonomi/jumlah-pengangguran/${data.id}/edit`)}
                  color="green"
                  variant="light"
                  radius="md"
                  size="md"
                >
                  <IconEdit size={20} />
                </Button>
              </Flex>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus data ini?"
      />
    </Box>
  );
}

export default DetailJumlahPengangguran;
