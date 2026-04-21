'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, Image, Skeleton, Group, Badge, Divider, Title } from '@mantine/core';
import { IconArrowBack, IconBrandWhatsapp, IconMapPin, IconUser } from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import React from 'react';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import umkmState from '@/app/admin/(dashboard)/_state/ekonomi/umkm/umkm';

function DetailProdukPasarUser() {
  const router = useRouter();
  const params = useParams();
  const state = useProxy(umkmState.produk.findUnique);

  useShallowEffect(() => {
    state.load(params?.id as string);
  }, []);

  const data = state.data;

  if (state.loading || !data) {
    return (
      <Stack py={10} px={{ base: 'md', md: 100 }}>
        <Skeleton height={400} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={20} bg={colors.Bg}>
      {/* Tombol kembali */}
      <Box px={{ base: 'md', md: 100 }}>
        <Button
          variant="subtle"
          onClick={() => router.push('/darmasaba/ekonomi/umkm')}
          leftSection={<IconArrowBack size={20} color={colors['blue-button']} />}
          mb={15}
        >
          <Text fz={{ base: 'md', md: 'lg' }} lh={1.5}>
            Kembali ke Katalog
          </Text>
        </Button>
      </Box>

      <Paper
        w={{ base: '90%', md: '70%' }}
        mx="auto"
        p="lg"
        radius="md"
        shadow="sm"
        bg="white"
      >
        <Stack gap="lg">
          {/* Gambar Produk */}
          <Image
            src={data.image?.link || '/no-image.jpg'}
            alt={data.nama}
            radius="md"
            h={{ base: 250, md: 400 }}
            w="100%"
            fit="cover"
            fallbackSrc="/no-image.jpg"
          />

          {/* Detail Produk */}
          <Stack gap="xs">
            <Group justify="space-between" align="flex-start">
              <Stack gap={5}>
                <Badge color="blue" variant="light">{data.kategoriProduk?.nama}</Badge>
                <Title order={1} fw={800} c={colors['blue-button']}>
                  {data.nama}
                </Title>
              </Stack>
              <Badge color={data.stok > 0 ? 'green' : 'red'} size="lg">
                {data.stok > 0 ? `Stok: ${data.stok}` : 'Stok Habis'}
              </Badge>
            </Group>
            
            <Text fz="2rem" fw={900} c="orange">
              Rp {data.harga?.toLocaleString('id-ID')}
            </Text>

            <Divider my="sm" />

            <Stack gap="md">
              <Box>
                <Title order={3} mb="xs">Informasi Penjual</Title>
                <Paper withBorder p="md" radius="md" bg="gray.0">
                  <Group justify="space-between">
                    <Stack gap={4}>
                      <Text fw={700} fz="lg" c="blue" style={{ cursor: 'pointer' }} onClick={() => router.push(`/darmasaba/ekonomi/umkm/${data.umkmId}`)}>
                        {data.umkm?.nama}
                      </Text>
                      <Group gap="xs">
                        <IconUser size={16} color="gray" />
                        <Text size="sm" c="dimmed">{data.umkm?.pemilik}</Text>
                      </Group>
                      <Group gap="xs">
                        <IconMapPin size={16} color="red" />
                        <Text size="sm" c="dimmed">{data.umkm?.alamat || 'Darmasaba'}</Text>
                      </Group>
                    </Stack>
                    {data.umkm?.kontak && (
                      <Button
                        color="green"
                        radius="md"
                        component="a"
                        href={`https://wa.me/${data.umkm.kontak.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        leftSection={<IconBrandWhatsapp size={20}/>}
                      >
                        WhatsApp
                      </Button>
                    )}
                  </Group>
                </Paper>
              </Box>

              <Box>
                <Title order={3} mb="xs">Deskripsi Produk</Title>
                <Text fz="md" lh={1.6} c="dark">
                  {data.deskripsi || 'Tidak ada deskripsi tersedia untuk produk ini.'}
                </Text>
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

export default DetailProdukPasarUser;