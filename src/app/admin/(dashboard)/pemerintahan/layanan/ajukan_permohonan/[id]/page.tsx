'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
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

function DetailAjukanPermohonan() {
  const ajukanPermohonanState = useProxy(stateLayananDesa.ajukanPermohonan);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    ajukanPermohonanState.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      ajukanPermohonanState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push('/admin/pemerintahan/layanan/ajukan_permohonan');
    }
  };

  if (!ajukanPermohonanState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = ajukanPermohonanState.findUnique.data;

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
            Detail Surat Keterangan
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">
                  Nama
                </Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
                  {data?.nama || '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  NIK
                </Text>
                <Text fz="md" c="dimmed">
                  {data?.nik || '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Alamat
                </Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
                  {data?.alamat || '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Nomor KK
                </Text>
                <Text fz="md" c="dimmed">
                  {data?.nomorKk || '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">
                  Kategori
                </Text>
                <Text fz="md" c="dimmed">
                  {data?.kategori.name || '-'}
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
                    disabled={ajukanPermohonanState.delete.loading}
                  >
                    <IconTrash size={20} />
                  </Button>

                  <Button
                    color="green"
                    onClick={() =>
                      router.push(
                        `/admin/pemerintahan/layanan/ajukan_permohonan/${data.id}/edit`
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
        text="Apakah Anda yakin ingin menghapus ajukan permohonan ini?"
      />
    </Box>
  );
}

export default DetailAjukanPermohonan;
