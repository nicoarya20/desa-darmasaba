'use client';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Tooltip
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';


function DetailDataPeminjaman() {
  const stateDetail = useProxy(perpustakaanDigitalState.peminjamanBuku);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    stateDetail.findUnique.load(params?.id as string);
  }, []);

  const data = stateDetail.findUnique.data;

  const handleHapus = () => {
    if (selectedId) {
      stateDetail.delete.delete(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push('/admin/pendidikan/perpustakaan-digital/peminjam');
    }
  };

  const renderStatusBadge = (status: string) => {
      const normalized = status?.toUpperCase();
  
      switch (normalized) {
        case 'DIPINJAM':
          return <Badge color="blue" variant="light">Dipinjam</Badge>;
        case 'DIKEMBALIKAN':
          return <Badge color="green" variant="light">Dikembalikan</Badge>;
        case 'TERLAMBAT':
          return <Badge color="orange" variant="light">Terlambat</Badge>;
        case 'DIBATALKAN':
          return <Badge color="red" variant="light">Dibatalkan</Badge>;
        default:
          return <Badge color="gray" variant="light">Tidak diketahui</Badge>;
      }
    };

  if (!data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
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
            Detail Data Peminjam Buku
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">
                  Nama
                </Text>
                <Text fz="md" c="dimmed">
                  {data.nama || '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  No Telp
                </Text>
                <Text
                  fz="md"
                  style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                >
                  {data.noTelp || '-'}
                </Text>
              </Box>

              {/* 🔹 Editable Status */}
              <Box>
                <Group justify="space-between" align="end">
                  <Box>
                    <Text fz="lg" fw="bold">
                      Status
                    </Text>
                    {renderStatusBadge(data.status || '')}
                  </Box>
                </Group>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Alamat
                </Text>
                <Text fz="md" c="dimmed">
                  {data.alamat || '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Buku
                </Text>
                <Text fz="md" c="dimmed">
                  {data.buku?.judul || '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Tanggal Pinjam
                </Text>
                <Text fz="md" c="dimmed">
                  {data.tanggalPinjam
                    ? new Date(data.tanggalPinjam).toLocaleDateString('id-ID')
                    : '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Tanggal Kembali
                </Text>
                <Text fz="md" c="dimmed">
                  {data.tanggalKembali
                    ? new Date(data.tanggalKembali).toLocaleDateString('id-ID')
                    : '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Batas Kembali
                </Text>
                <Text fz="md" c="dimmed">
                  {data.batasKembali
                    ? new Date(data.batasKembali).toLocaleDateString('id-ID')
                    : '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Catatan
                </Text>
                <Text
                  fz="md"
                  c="dimmed"
                  dangerouslySetInnerHTML={{ __html: data.catatan || '-' }}
                />
              </Box>

              <Group gap="sm" mt="sm">
                <Tooltip label="Hapus Peminjam Buku" withArrow position="top">
                  <Button
                    color="red"
                    onClick={() => {
                      setSelectedId(data.id);
                      setModalHapus(true);
                    }}
                    variant="light"
                    radius="md"
                    size="md"
                    disabled={stateDetail.delete.loading}
                  >
                    <IconTrash size={20} />
                  </Button>
                </Tooltip>

                <Tooltip label="Edit Peminjam Buku" withArrow position="top">
                  <Button
                    color="green"
                    onClick={() =>
                      router.push(`/admin/pendidikan/perpustakaan-digital/peminjam/${data.id}/edit`)
                    }
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

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus data ini?"
      />
    </Box>
  );
}

export default DetailDataPeminjaman;
