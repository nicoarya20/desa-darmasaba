'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, Image, Skeleton, Group, Tooltip } from '@mantine/core';
import { IconArrowBack, IconTrash, IconEdit } from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import pasarDesaState from '../../../../_state/ekonomi/pasar-desa/pasar-desa';
import { useShallowEffect } from '@mantine/hooks';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';

function DetailPasarDesa() {
  const statePasar = useProxy(pasarDesaState);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    statePasar.pasarDesa.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      statePasar.pasarDesa.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push("/admin/ekonomi/pasar-desa/produk-pasar-desa");
    }
  };

  if (!statePasar.pasarDesa.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = statePasar.pasarDesa.findUnique.data;

  return (
    <Box py={10}>
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
        w={{ base: "100%", md: "60%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Pasar Desa
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama Produk</Text>
                <Text fz="md" c="dimmed">{data.nama || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Harga Produk</Text>
                <Text fz="md" c="dimmed">Rp. {data.harga || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Rating Produk</Text>
                <Text fz="md" c="dimmed">{data.rating || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Alamat Usaha</Text>
                <Text fz="md" c="dimmed">{data.alamatUsaha || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Kontak</Text>
                <Text fz="md" c="dimmed">{data.kontak || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Gambar</Text>
                {data.image?.link ? (
                  <Image
                    src={data.image.link}
                    alt={data.nama || 'Gambar Produk'}
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

              <Box>
                <Text fz="lg" fw="bold">Kategori</Text>
                <Stack gap={4}>
                  {data.KategoriToPasar && data.KategoriToPasar.length > 0 ? (
                    data.KategoriToPasar.map((kategori) => (
                      <Text fz="md" c="dimmed" key={kategori.id}>
                        • {kategori.kategori.nama}
                      </Text>
                    ))
                  ) : (
                    <Text fz="sm" c="dimmed">Tidak ada kategori</Text>
                  )}
                </Stack>
              </Box>

              <Group gap="sm">
                <Tooltip label="Hapus Produk" withArrow position="top">
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

                <Tooltip label="Edit Produk" withArrow position="top">
                  <Button
                    color="green"
                    onClick={() => router.push(`/admin/ekonomi/pasar-desa/produk-pasar-desa/${data.id}/edit`)}
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

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus produk ini?"
      />
    </Box>
  );
}

export default DetailPasarDesa;
