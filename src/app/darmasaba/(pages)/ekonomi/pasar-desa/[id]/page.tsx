'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, Image, Skeleton, Group, Badge, Divider } from '@mantine/core';
import { IconArrowBack, IconMapPin, IconPhone, IconStar } from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import React from 'react';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import pasarDesaState from '@/app/admin/(dashboard)/_state/ekonomi/pasar-desa/pasar-desa';

function DetailProdukPasarUser() {
  const router = useRouter();
  const params = useParams();
  const statePasar = useProxy(pasarDesaState);

  useShallowEffect(() => {
    statePasar.pasarDesa.findUnique.load(params?.id as string);
  }, []);

  const data = statePasar.pasarDesa.findUnique.data;

  if (!data) {
    return (
      <Stack py={10}>
        <Skeleton height={400} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={20}>
      {/* Tombol kembali */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={20} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali ke daftar produk
      </Button>

      <Paper
        w={{ base: '100%', md: '70%' }}
        mx="auto"
        p="lg"
        radius="md"
        shadow="sm"
        bg={colors['white-1']}
      >
        <Stack gap="lg">
          {/* Gambar Produk */}
          {data.image?.link ? (
            <Image
              src={data.image.link}
              alt={data.nama}
              radius="md"
              h={300}
              w="100%"
              fit="cover"
              loading="lazy"
            />
          ) : (
            <Box
              h={300}
              bg="gray.1"
              display="flex"
              style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 'md' }}
            >
              <Text c="dimmed">Tidak ada gambar</Text>
            </Box>
          )}

          {/* Detail Produk */}
          <Stack gap="xs">
            <Text fz="2xl" fw="bold" c={colors['blue-button']}>
              {data.nama || 'Produk Tanpa Nama'}
            </Text>
            <Group>
              <Badge color="green" size="lg" radius="md">
                Rp {data.harga?.toLocaleString('id-ID')}
              </Badge>
              {data.rating && (
                <Group gap={4}>
                  <IconStar size={18} color="#FFD43B" />
                  <Text fz="md" fw={500}>{data.rating}</Text>
                </Group>
              )}
            </Group>
          </Stack>

          <Divider my="sm" />

          {/* Info Tambahan */}
          <Stack gap="sm">
            <Box>
              <Text fz="lg" fw={600}>Kategori</Text>
              <Group gap="xs" mt={4}>
                {data.KategoriToPasar && data.KategoriToPasar.length > 0 ? (
                  data.KategoriToPasar.map((kategori) => (
                    <Badge key={kategori.id} color="blue" variant="light">
                      {kategori.kategori.nama}
                    </Badge>
                  ))
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada kategori</Text>
                )}
              </Group>
            </Box>

            {data.alamatUsaha && (
              <Group gap={6}>
                <IconMapPin size={18} color={colors['blue-button']} />
                <Text fz="md">{data.alamatUsaha}</Text>
              </Group>
            )}

            {data.kontak && (
              <Group gap={6}>
                <IconPhone size={18} color={colors['blue-button']} />
                <Text fz="md">{data.kontak}</Text>
              </Group>
            )}
          </Stack>

          <Divider my="sm" />

          {/* Deskripsi */}
          <Box>
            <Text fz="lg" fw={600}>Deskripsi Produk</Text>
            <Text fz="md" c="dimmed" mt={4}>
              Tidak ada deskripsi.
            </Text>
          </Box>

          {/* Tombol Aksi User */}
          {data.kontak && (
            <Button
              mt="md"
              color="green"
              size="lg"
              radius="md"
              component="a"
              href={`https://wa.me/${data.kontak.replace(/[^0-9]/g, '')}`}
              target="_blank"
            >
              Hubungi Penjual via WhatsApp
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

export default DetailProdukPasarUser;
