'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import beasiswaDesaState from '@/app/admin/(dashboard)/_state/pendidikan/beasiswa-desa';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailBeasiswaPendaftar() {
  const state = useProxy(beasiswaDesaState.beasiswaPendaftar);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      state.delete.delete(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/pendidikan/beasiswa-desa/beasiswa-pendaftar");
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
        w={{ base: "100%", md: "70%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Beasiswa Pendaftar
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama Lengkap</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data.namaLengkap || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">NIK</Text>
                <Text fz="md" c="dimmed">{data.nik || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">Tempat Lahir</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data.tempatLahir || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">Tanggal Lahir</Text>
                <Text fz="md" c="dimmed">
                  {data.tanggalLahir ? new Date(data.tanggalLahir).toLocaleDateString() : '-'}
                </Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">Jenis Kelamin</Text>
                <Text fz="md" c="dimmed">{data.jenisKelamin || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">Kewarganegaraan</Text>
                <Text fz="md" c="dimmed">{data.kewarganegaraan || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">Agama</Text>
                <Text fz="md" c="dimmed">{data.agama || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">Alamat KTP</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data.alamatKTP || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">Alamat Domisili</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data.alamatDomisili || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">No HP</Text>
                <Text fz="md" c="dimmed">{data.noHp || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">Email</Text>
                <Text fz="md" c="dimmed">{data.email || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">Status Pernikahan</Text>
                <Text fz="md" c="dimmed">{data.statusPernikahan || '-'}</Text>
              </Box>
              <Box>
                <Text fz="lg" fw="bold">Ukuran Baju</Text>
                <Text fz="md" c="dimmed">{data.ukuranBaju || '-'}</Text>
              </Box>

              <Group gap="sm" mt="md">
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
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus data pendaftar ini?"
      />
    </Box>
  );
}

export default DetailBeasiswaPendaftar;
