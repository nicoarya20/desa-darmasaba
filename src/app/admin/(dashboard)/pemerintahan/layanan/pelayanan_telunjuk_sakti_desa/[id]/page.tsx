'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import { formatBiayaPelayanan } from '@/lib/pelayanan-waktu-biaya';
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

function DetailPelayananTelunjukSakti() {
  const telunjukSaktiState = useProxy(
    stateLayananDesa.pelayananTelunjukSaktiDesa
  );
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    telunjukSaktiState.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      telunjukSaktiState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push('/admin/pemerintahan/layanan/pelayanan_telunjuk_sakti_desa');
    }
  };

  if (!telunjukSaktiState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = telunjukSaktiState.findUnique.data;

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
            Detail Pelayanan Telunjuk Sakti Desa
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">
                  Nama
                </Text>
                <Text fz="md" c="dimmed">
                  {data?.name || '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Link
                </Text>
                {data?.link ? (
                  <Text
                    fz="md"
                    component="a"
                    href={data.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    c="blue"
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      wordBreak: "break-word",
                    }}
                  >
                    {data.link}
                  </Text>
                ) : (
                  <Text fz="sm" c="dimmed">
                    Tidak ada link
                  </Text>
                )}
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Deskripsi
                </Text>
                <Text
                  fz="md"
                  c="dimmed"
                  dangerouslySetInnerHTML={{
                    __html: data?.deskripsi || '-',
                  }}
                  style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Estimasi Waktu
                </Text>
                <Text fz="md" c="dimmed">
                  {data?.estimasiWaktu || '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Biaya
                </Text>
                <Text fz="md" c="dimmed">
                  {formatBiayaPelayanan(data?.biaya) ?? '-'}
                </Text>
              </Box>

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
                    disabled={telunjukSaktiState.delete.loading}
                  >
                    <IconTrash size={20} />
                  </Button>

                  <Button
                    color="green"
                    onClick={() =>
                      router.push(
                        `/admin/pemerintahan/layanan/pelayanan_telunjuk_sakti_desa/${data.id}/edit`
                      )
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
        text="Apakah Anda yakin ingin menghapus layanan ini?"
      />
    </Box>
  );
}

export default DetailPelayananTelunjukSakti;
