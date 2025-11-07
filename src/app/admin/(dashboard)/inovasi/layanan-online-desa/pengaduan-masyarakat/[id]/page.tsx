'use client'
import { Box, Button, Group, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import layananonlineDesa from '@/app/admin/(dashboard)/_state/inovasi/layanan-online-desa';
import colors from '@/con/colors';

function DetailPengaduanMasyarakat() {
  const pengaduanState = useProxy(layananonlineDesa);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    pengaduanState.pengaduanMasyarakat.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      pengaduanState.pengaduanMasyarakat.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/inovasi/layanan-online-desa/pengaduan-masyarakat");
    }
  };

  if (!pengaduanState.pengaduanMasyarakat.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = pengaduanState.pengaduanMasyarakat.findUnique.data;

  return (
    <Box py={10}>
      {/* Tombol Kembali */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      {/* Card Detail */}
      <Paper
        withBorder
        w={{ base: "100%", md: "60%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          {/* Judul Halaman */}
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Pengaduan Masyarakat
          </Text>

          {/* Isi Data */}
          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama</Text>
                <Text fz="md" c="dimmed">{data?.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Email</Text>
                <Text fz="md" c="dimmed">{data?.email || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Nomor Telepon</Text>
                <Text fz="md" c="dimmed">{data?.nomorTelepon || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">NIK</Text>
                <Text fz="md" c="dimmed">{data?.nik || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Judul Pengaduan</Text>
                <Text fz="md" c="dimmed">{data?.judulPengaduan || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Lokasi Kejadian</Text>
                <Text fz="md" c="dimmed">{data?.lokasiKejadian || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi Pengaduan</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data?.deskripsiPengaduan || '-' }} />
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Jenis Pengaduan</Text>
                <Text fz="md" c="dimmed">{data?.jenisPengaduan?.nama || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Gambar</Text>
                {data?.image?.link ? (
                  <Image
                    src={data.image.link}
                    alt="Gambar Pengaduan"
                    w={120}
                    h={120}
                    radius="md"
                    fit="cover"
                    loading="lazy"
                  />
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada gambar</Text>
                )}
              </Box>

              {/* Action Button */}
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
                  disabled={pengaduanState.pengaduanMasyarakat.delete.loading}
                >
                  <IconTrash size={20} />
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
        text="Apakah anda yakin ingin menghapus pengaduan masyarakat ini?"
      />
    </Box>
  );
}

export default DetailPengaduanMasyarakat;
