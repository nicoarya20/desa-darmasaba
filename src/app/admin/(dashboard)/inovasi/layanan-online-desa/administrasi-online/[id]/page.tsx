'use client'

import { Box, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import layananonlineDesa from '@/app/admin/(dashboard)/_state/inovasi/layanan-online-desa';
import colors from '@/con/colors';

function DetailAdministrasiOnline() {
  const stateAdminOnline = useProxy(layananonlineDesa.administrasiOnline);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    stateAdminOnline.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      stateAdminOnline.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/inovasi/layanan-online-desa/administrasi-online");
    }
  };

  if (!stateAdminOnline.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = stateAdminOnline.findUnique.data;

  return (
   <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group justify='space-between' align='center' w={{ base: "100%", md: "70%" }} mb={10}>
        {/* Tombol Kembali */}
        <Button
          variant="subtle"
          onClick={() => router.back()}
          leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        >
          Kembali
        </Button>

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
      </Group>
      {/* Konten Detail */}
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
            Detail Administrasi Online
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama</Text>
                <Text fz="md" c="dimmed">{data.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Alamat</Text>
                <Text fz="md" c="dimmed">{data.alamat || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Nomor Telepon</Text>
                <Text fz="md" c="dimmed">{data.nomorTelepon || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Jenis Layanan</Text>
                <Text fz="md" c="dimmed">{data.jenisLayanan?.nama || '-'}</Text>
              </Box>

            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus administrasi online ini?"
      />
    </Box>
  );
}

export default DetailAdministrasiOnline;
