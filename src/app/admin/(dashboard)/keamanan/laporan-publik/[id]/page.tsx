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
import { sanitizeRichText } from '@/lib/rich-text';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import laporanPublikState from '../../../_state/keamanan/laporan-publik';

function DetailLaporanPublik() {
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stateLaporan = useProxy(laporanPublikState);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    stateLaporan.findUnique.load(params?.id as string);
  }, []);

  const handleDelete = () => {
    if (selectedId) {
      stateLaporan.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push('/admin/keamanan/laporan-publik');
    }
  };

  if (!stateLaporan.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = stateLaporan.findUnique.data;

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

      <Paper
        withBorder
        w={{ base: '100%', md: '70%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Laporan Publik
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Judul Laporan Publik</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data.judul || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Tanggal Laporan Publik</Text>
                <Text fz="md" c="dimmed">
                  {data.tanggalWaktu
                    ? new Date(data.tanggalWaktu).toLocaleString('id-ID')
                    : '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Lokasi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data.lokasi || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Status</Text>
                <Box
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    backgroundColor:
                      data.status === 'Selesai' ? '#94EF95FF' :
                        data.status === 'Proses' ? '#F1D295FF' :
                          '#F38E8EFF',
                    color:
                      data.status === 'Selesai' ? '#01BA01FF' :
                        data.status === 'Proses' ? '#B67A00FF' :
                          '#AE1700FF',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    minWidth: '80px',
                  }}
                >
                  {data.status || '-'}
                </Box>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Kronologi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: sanitizeRichText(data.kronologi) }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Penanganan</Text>
                {data.penanganan?.length ? (
                  data.penanganan.map((item, index) => (
                    <Box key={index}>
                      <Text
                        fz="md"
                        c="dimmed"
                        dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.deskripsi) || '-' }}
                        style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                      />
                    </Box>
                  ))
                ) : (
                  <Text fz="sm" fs="italic" c="dimmed">
                    Belum ada penanganan
                  </Text>
                )}
              </Box>

              {/* Tombol Aksi */}
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
                  disabled={stateLaporan.delete.loading}
                >
                  <IconTrash size={20} />
                </Button>

                <Button
                  color="green"
                  onClick={() =>
                    router.push(`/admin/keamanan/laporan-publik/${data.id}/edit`)
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
        onConfirm={handleDelete}
        text="Apakah anda yakin ingin menghapus laporan publik ini?"
      />
    </Box>
  );
}

export default DetailLaporanPublik;
