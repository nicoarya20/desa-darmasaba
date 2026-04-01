'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
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

function DetailDokterTenagaMedis() {
  const params = useParams();
  const router = useRouter();
  const state = useProxy(fasilitasKesehatanState.dokter);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      state.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push(
        '/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/dokter-tenaga-medis'
      );
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
        w={{ base: '100%', md: '70%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Dokter & Tenaga Medis
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama Dokter</Text>
                <Text fz="md" c="dimmed">{data.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="md" fw="bold">Specialist</Text>
                <Text fz="md" c="dimmed">{data.specialist || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Jadwal</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.jadwal || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Jadwal Libur</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.jadwalLibur || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Jam Buka Operasional</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.jamBukaOperasional || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Jam Tutup Operasional</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.jamTutupOperasional || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Jam Buka Libur</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.jamBukaLibur || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Jam Tutup Libur</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.jamTutupLibur || '-' }} />
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
                >
                  <IconTrash size={20} />
                </Button>

                <Button
                  color="green"
                  onClick={() =>
                    router.push(
                      `/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/dokter-tenaga-medis/${data.id}/edit`
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
        text="Apakah anda yakin ingin menghapus dokter & tenaga medis ini?"
      />
    </Box>
  );
}

export default DetailDokterTenagaMedis;
