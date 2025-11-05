'use client'
import { IconKey, IconMapper } from '@/app/admin/(dashboard)/_com/iconMap';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import kontakDarurat from '@/app/admin/(dashboard)/_state/keamanan/kontak-darurat-keamanan';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailKontakDaruratKeamanan() {
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const kontakState = useProxy(kontakDarurat.kontakDaruratKeamananState);

  useShallowEffect(() => {
    kontakDarurat.kontakDaruratItem.findMany.load();
    kontakState.findUnique.load(params?.id as string);
  }, []);

  const handleDelete = () => {
    if (selectedId) {
      kontakState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/keamanan/kontak-darurat/kontak-darurat-keamanan");
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
            Detail Kontak Darurat Keamanan
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              {/* Judul */}
              <Box>
                <Text fz="lg" fw="bold">Judul Kontak Darurat</Text>
                <Text fz="md" c="dimmed">{data?.nama || '-'}</Text>
              </Box>

              <Box>
                <Text fz={"lg"} fw={"bold"}>Ikon Program Kreatif Desa</Text>
                {data?.icon && (
                  <IconMapper
                    name={data?.icon as IconKey}
                    size={32}
                    color={colors['blue-button']}
                  />
                )}
              </Box>

              {/* Kontak Items */}
              <Box>
                <Text fz="lg" fw="bold">Kontak</Text>
                <Stack>
                  {data?.kontakItems.map((item, index) => (
                    <Box key={index}>
                      <Text fz="md" fw="bold">{item.kontakItem.nama}</Text>
                      <Text fz="md" c="dimmed">{item.kontakItem.nomorTelepon}</Text>
                      {item.kontakItem.icon && (
                        <IconMapper
                          name={item.kontakItem.icon as IconKey}
                          size={32}
                          color={colors['blue-button']}
                        />
                      )}
                    </Box>
                  ))}
                </Stack>
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
                  onClick={() => router.push(`/admin/keamanan/kontak-darurat/kontak-darurat-keamanan/${data.id}/edit`)}
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
        text="Apakah anda yakin ingin menghapus kontak darurat ini?"
      />
    </Box>
  );
}

export default DetailKontakDaruratKeamanan;
