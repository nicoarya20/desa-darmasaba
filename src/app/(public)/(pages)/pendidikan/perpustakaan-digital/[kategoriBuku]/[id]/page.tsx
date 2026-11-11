'use client';

import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import {
  Badge,
  Box,
  Button,
  Center,
  Image,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowLeft, IconBook2 } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import ModalPeminjaman from '../../_lib/modalPeminjaman';

export default function DetailBukuUser() {
  const router = useRouter();
  const params = useParams();
  const stateDetail = useProxy(perpustakaanDigitalState.dataPerpustakaan);
  const [opened, setOpened] = useState(false);

  useShallowEffect(() => {
    if (params?.id) stateDetail.findUnique.load(params.id as string);
  }, [params?.id]);

  const data = stateDetail.findUnique.data;

  if (!data) {
    return (
      <Center h="70vh">
        <Loader color={colors['blue-button']} size="lg" />
      </Center>
    );
  }

  return (
    <Box bg={colors.Bg} py="xl" px={{ base: 'md', md: 100 }}>
      {/* Tombol Kembali */}
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={20} color={colors['blue-button']} />}
        onClick={() => router.back()}
        mb="lg"
      >
        Kembali
      </Button>

      <Paper
        withBorder
        shadow="md"
        radius="xl"
        bg="white"
        p={{ base: 'md', md: 'xl' }}
        maw={800}
        mx="auto"
      >
        <Stack gap="lg" align="center">
          {/* Cover Buku */}
          <Image
            src={data.image?.link || '/placeholder-book.jpg'}
            alt={data.judul}
            w={220}
            h={300}
            fit="contain"
            radius="md"
            loading="lazy"
          />

          {/* Judul & Kategori */}
          <Stack gap={4} align="center">
            <Title order={2} ta="center" c={colors['blue-button']}>
              {data.judul}
            </Title>
            {data.kategori?.name && (
              <Badge color="cyan" variant="light" size="md">
                {data.kategori.name}
              </Badge>
            )}
          </Stack>

          {/* Deskripsi Buku */}
          <Paper bg="#F9FAFF" p="md" radius="md" shadow="xs" w="100%">
            <Text fw={600} mb={6} c={colors['blue-button']}>
              Deskripsi Buku
            </Text>
            <Text
              fz="sm"
              lh={1.6}
              ta="justify"
              c="dimmed"
              dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
              style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
            />
          </Paper>

          {/* Tombol Pinjam */}
          <Button
            size="md"
            radius="xl"
            color="blue"
            mt="sm"
            leftSection={<IconBook2 size={20} />}
            onClick={() => setOpened(true)}
          >
            Pinjam Buku Ini
          </Button>
        </Stack>
      </Paper>

      {/* Modal Peminjaman */}
      <ModalPeminjaman
        opened={opened}
        onClose={() => setOpened(false)}
        buku={{
          id: data.id,
          judul: data.judul,
          deskripsi: data.deskripsi,
          image: data.image ? { link: data.image.link } : undefined,
          kategori: data.kategori ? { name: data.kategori.name } : undefined,
        }}
      />
    </Box>
  );
}
