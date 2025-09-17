'use client'
import { IconKey, IconMapper } from '@/app/admin/(dashboard)/_com/iconMap';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import kontakDarurat from '@/app/admin/(dashboard)/_state/keamanan/kontak-darurat-keamanan';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailKontakDarurat() {
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const kontakState = useProxy(kontakDarurat.kontakDaruratItem);

  useShallowEffect(() => {
    kontakState.findUnique.load(params?.id as string);
  }, []);

  const handleDelete = () => {
    if (selectedId) {
      kontakState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/keamanan/kontak-darurat/kontak-darurat-item");
    }
  };

  if (!kontakState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = kontakState.findUnique.data;

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
        w={{ base: "100%", md: "50%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Kontak Darurat Item
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              {/* Judul */}
              <Box>
                <Text fz="lg" fw="bold">Judul Kontak Darurat Item</Text>
                <Text fz="md" c="dimmed">{data?.nama || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Nomor Telepon Kontak Darurat Item</Text>
                <Text fz="md" c="dimmed">{data?.nomorTelepon || '-'}</Text>
              </Box>

              <Box>
                <Text fz={"lg"} fw={"bold"}>Ikon Kontak Darurat</Text>
                {data?.icon && (
                  <IconMapper
                    name={data?.icon as IconKey}
                    size={32}
                    color={colors['blue-button']}
                  />
                )}
              </Box>

              {/* Aksi */}
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
                    onClick={() => router.push(`/admin/keamanan/kontak-darurat/kontak-darurat-item/${data.id}/edit`)}
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

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text="Apakah anda yakin ingin menghapus kontak darurat ini?"
      />
    </Box>
  );
}

export default DetailKontakDarurat;
