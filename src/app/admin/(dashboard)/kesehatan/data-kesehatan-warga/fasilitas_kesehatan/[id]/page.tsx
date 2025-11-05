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

function DetailFasilitasKesehatan() {
  const params = useParams();
  const router = useRouter();
  const state = useProxy(fasilitasKesehatanState.fasilitasKesehatan);
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
        '/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan'
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
    <Box py={10}>
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
            Detail Fasilitas Kesehatan
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama Fasilitas</Text>
                <Text fz="md" c="dimmed">{data.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Informasi Umum</Text>
                <Text fz="md" fw="bold">Fasilitas</Text>
                <Text fz="md" c="dimmed">{data.informasiumum?.fasilitas || '-'}</Text>
                <Text fz="md" fw="bold">Alamat</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data.informasiumum?.alamat || '-'}</Text>
                <Text fz="md" fw="bold">Jam Operasional</Text>
                <Text fz="md" c="dimmed">{data.informasiumum?.jamOperasional || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Layanan Unggulan</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.layananunggulan?.content || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Fasilitas Pendukung</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.fasilitaspendukung?.content || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Prosedur Pendaftaran</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.prosedurpendaftaran?.content || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Dokter & Tenaga Medis</Text>
                <Text fz="md" fw="bold">Nama</Text>
                <Text fz="md" c="dimmed">{data.dokterdantenagamedis?.name || '-'}</Text>
                <Text fz="md" fw="bold">Spesialis</Text>
                <Text fz="md" c="dimmed">{data.dokterdantenagamedis?.specialist || '-'}</Text>
                <Text fz="md" fw="bold">Jadwal</Text>
                <Text fz="md" c="dimmed">{data.dokterdantenagamedis?.jadwal || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Tarif & Layanan</Text>
                <Text fz="md" fw="bold">Layanan</Text>
                <Text fz="md" c="dimmed">{data.tarifdanlayanan?.layanan || '-'}</Text>
                <Text fz="md" fw="bold">Tarif</Text>
                <Text fz="md" c="dimmed">{data.tarifdanlayanan?.tarif || '-'}</Text>
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
                      `/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/${data.id}/edit`
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
        text="Apakah anda yakin ingin menghapus fasilitas kesehatan ini?"
      />
    </Box>
  );
}

export default DetailFasilitasKesehatan;
