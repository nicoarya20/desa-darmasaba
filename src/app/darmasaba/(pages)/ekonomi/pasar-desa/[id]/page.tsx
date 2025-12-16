'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, Image, Skeleton, Group, Badge, Divider, Title } from '@mantine/core';
import { IconArrowBack, IconBrandWhatsapp, IconMapPin, IconPhone, IconStar } from '@tabler/icons-react';
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
      <Box px={{ base: 'md', md: 100 }}>
        <Button
          variant="subtle"
          onClick={() => router.back()}
          leftSection={<IconArrowBack size={20} color={colors['blue-button']} />}
          mb={15}
        >
          <Text fz={{ base: 'md', md: 'lg' }} lh={1.5}>
            Kembali ke daftar produk
          </Text>
        </Button>
      </Box>

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
              h={250}
              w="100%"
              fit="cover"
              loading="lazy"
            />
          ) : (
            <Box
              h={300}
              bg="gray.1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--mantine-radius-md)' }}
            >
              <Text c="dimmed" fz={{ base: 'sm', md: 'md' }} lh={1.5}>
                Tidak ada gambar
              </Text>
            </Box>
          )}

          {/* Detail Produk */}
          <Stack gap="xs">
            <Title order={2} lh={1.1} c={colors['blue-button']}>
              {data.nama || 'Produk Tanpa Nama'}
            </Title>
            <Group>
              <Badge color="green" size="lg" radius="md">
                <Text c={"white"} fz={{ base: 'sm', md: 'md' }} fw={600} lh={1.4}>
                  Rp {data.harga?.toLocaleString('id-ID')}
                </Text>
              </Badge>
              {data.rating && (
                <Group gap={4}>
                  <IconStar size={18} color="#FFD43B" />
                  <Text fz={{ base: 'sm', md: 'md' }} fw={500} lh={1.5}>
                    {data.rating}
                  </Text>
                </Group>
              )}
            </Group>
          </Stack>

          <Divider my="sm" />

          {/* Info Tambahan */}
          <Stack gap="sm">
            <Box>
              <Title order={3} lh={1.15}>
                Kategori
              </Title>
              <Group gap="xs" mt={4}>
                {data.KategoriToPasar && data.KategoriToPasar.length > 0 ? (
                  data.KategoriToPasar.map((kategori) => (
                    <Badge key={kategori.id} color="blue" variant="light" fz={{ base: 'xs', md: 'sm' }} lh={1.4}>
                      {kategori.kategori.nama}
                    </Badge>
                  ))
                ) : (
                  <Text fz={{ base: 'xs', md: 'sm' }} c="dimmed" lh={1.5}>
                    Tidak ada kategori
                  </Text>
                )}
              </Group>
            </Box>

            {data.alamatUsaha && (
              <Group gap={6}>
                <IconMapPin size={18} color={colors['blue-button']} />
                <Text fz={{ base: 'sm', md: 'md' }} lh={1.5}>
                  {data.alamatUsaha}
                </Text>
              </Group>
            )}

            {data.kontak && (
              <Group gap={6}>
                <IconPhone size={18} color={colors['blue-button']} />
                <Text fz={{ base: 'sm', md: 'md' }} lh={1.5}>
                  {data.kontak}
                </Text>
              </Group>
            )}
          </Stack>

          <Divider my="sm" />

          {/* Deskripsi */}
          <Box>
            <Title order={3} lh={1.15}>
              Deskripsi Produk
            </Title>
            <Text fz={{ base: 'sm', md: 'md' }} c="dimmed" mt={4} lh={1.5}>
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
              leftSection={<IconBrandWhatsapp/>}
            >
              <Text c={"white"} fz={{ base: 'sm', md: 'md' }} lh={1.5}>
                Hubungi Penjual via WhatsApp
              </Text>
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

export default DetailProdukPasarUser;