'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateDashboardKegiatan from '@/app/admin/(dashboard)/_state/desa/kegiatanDesa';
import colors from '@/con/colors';
import { Box, Button, Group, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

interface KegiatanDetail {
  id: string;
  judul: string;
  deskripsiSingkat: string;
  deskripsiLengkap: string;
  tanggal: string;
  lokasi: string;
  partisipan: number;
  kategoriKegiatan?: { nama: string } | null;
  image?: { link: string } | null;
}

function DetailKegiatanDesa() {
  const kegiatanState = useProxy(stateDashboardKegiatan);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    kegiatanState.kegiatan.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      kegiatanState.kegiatan.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push('/admin/desa/kegiatan-desa/list-kegiatan-desa');
    }
  };

  if (!kegiatanState.kegiatan.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = kegiatanState.kegiatan.findUnique.data as unknown as KegiatanDetail;

  const formatTanggal = (val: string) => {
    if (!val) return '-';
    return new Date(val).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
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
            Detail Kegiatan Desa
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Kategori</Text>
                <Text fz="md" c="dimmed">{data.kategoriKegiatan?.nama || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Judul</Text>
                <Text fz="md" c="dimmed">{data.judul || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Tanggal</Text>
                <Text fz="md" c="dimmed">{formatTanggal(data.tanggal)}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Lokasi</Text>
                <Text fz="md" c="dimmed">{data.lokasi || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Partisipan</Text>
                <Text fz="md" c="dimmed">{data.partisipan ?? 0} orang</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi Singkat</Text>
                <Text fz="md" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                  {data.deskripsiSingkat || '-'}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi Lengkap</Text>
                <Paper bg="white" p="md" radius="md" mt="xs">
                  <Text
                    fz="md"
                    c="dimmed"
                    dangerouslySetInnerHTML={{ __html: data.deskripsiLengkap || '-' }}
                  />
                </Paper>
              </Box>

              {data.image?.link && (
                <Box>
                  <Text fz="lg" fw="bold">Gambar</Text>
                  <Image
                    src={data.image.link}
                    alt={data.judul || 'Gambar Kegiatan'}
                    w={{ base: '100%', md: 400 }}
                    h={300}
                    radius="md"
                    fit="cover"
                    loading="lazy"
                    mt="xs"
                  />
                </Box>
              )}

              <Group gap="sm" mt="md">
                <Button
                  color="red"
                  onClick={() => { setSelectedId(data.id); setModalHapus(true); }}
                  variant="light"
                  radius="md"
                  size="md"
                  leftSection={<IconTrash size={20} />}
                >
                  Hapus
                </Button>
                <Button
                  color="green"
                  onClick={() =>
                    router.push(
                      `/admin/desa/kegiatan-desa/list-kegiatan-desa/${data.id}/edit`
                    )
                  }
                  variant="light"
                  radius="md"
                  size="md"
                  leftSection={<IconEdit size={20} />}
                >
                  Edit
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
        text="Apakah Anda yakin ingin menghapus kegiatan desa ini?"
      />
    </Box>
  );
}

export default DetailKegiatanDesa;
