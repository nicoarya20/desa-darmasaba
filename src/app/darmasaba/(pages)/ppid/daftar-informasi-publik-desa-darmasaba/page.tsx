'use client'

import daftarInformasiPublik from '@/app/admin/(dashboard)/_state/ppid/daftar_informasi_publik/daftarInformasiPublik';
import colors from '@/con/colors';
import {
  Box,
  Center,
  Image,
  Pagination,
  Skeleton,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  TextInput,
  Paper,
  Badge,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconSearch, IconFileInfo, IconMail, IconBrandWhatsapp } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const listData = useProxy(daftarInformasiPublik)
  const [search, setSearch] = useState('')

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = listData.findMany

  useShallowEffect(() => {
    load(page, 5, search)
  }, [page, search])

  if (loading || !data) {
    return (
      <Stack pos="relative" bg={colors.Bg} py="xl" gap="lg">
        <Box px={{ base: 'md', md: 100 }}>
          <Skeleton h={40} radius="xl" />
        </Box>
        <Skeleton h={50} radius="xl" />
        <Skeleton h={50} radius="xl" />
        <Skeleton h={50} radius="xl" />
      </Stack>
    )
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="xl">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Center>
        <Image src="/darmasaba-icon.png" w={{ base: 70, md: 100 }} alt="Logo Desa Darmasaba" />
      </Center>
      <Text ta="center" fz={{ base: "1.8rem", md: "2.5rem" }} c={colors["blue-button"]} fw="bold" lh={1.4}>
        Daftar Informasi Publik Desa Darmasaba
      </Text>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap="lg">
          <Paper p="lg" radius="xl" shadow="sm" withBorder>
            <Stack gap="sm">
              <Text fz={{ base: 'lg', md: 'xl' }} fw="bold" c={colors["blue-button"]}>
                Tentang Informasi Publik
              </Text>
              <Text fz={{ base: 'sm', md: 'md' }} c="dimmed">
                Daftar Informasi Publik Desa Darmasaba adalah kumpulan data yang dapat diakses oleh masyarakat sesuai dengan ketentuan peraturan yang berlaku.
              </Text>
            </Stack>
          </Paper>

          <TextInput
            placeholder="Cari informasi publik..."
            aria-label="Pencarian informasi publik"
            leftSection={<IconSearch size={20} stroke={1.5} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            radius="xl"
            size="md"
          />

          {data.length === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="sm">
                <IconFileInfo size={48} stroke={1.5} color={colors["blue-button"]} />
                <Text fz="md" c="dimmed">Tidak ada informasi publik yang ditemukan.</Text>
              </Stack>
            </Center>
          ) : (
            <Table withRowBorders withColumnBorders withTableBorder highlightOnHover verticalSpacing="md">
              <TableThead bg={colors['blue-button']}>
                <TableTr c={colors['white-1']}>
                  <TableTh fz="sm" ta="center" w="5%">No</TableTh>
                  <TableTh fz="sm" ta="center" w="25%">Jenis Informasi</TableTh>
                  <TableTh fz="sm" ta="center" w="40%">Deskripsi</TableTh>
                  <TableTh fz="sm" ta="center" w="20%">Tanggal Publikasi</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody bg={colors['white-1']}>
                {data.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd ta="center">{(page - 1) * 5 + index + 1}</TableTd>
                    <TableTd>
                      <Badge variant="light" size="lg" color="blue">
                        {item.jenisInformasi}
                      </Badge>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" c="dark" dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                    </TableTd>
                    <TableTd ta="center">
                      {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      }) : '-'}
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          )}

          <Center>
            <Pagination
              value={page}
              onChange={(newPage) => load(newPage, 5, search)}
              total={totalPages}
              my="lg"
              radius="xl"
              size="md"
            />
          </Center>

          <Paper p="lg" radius="xl" shadow="xs" withBorder>
            <Stack gap="xs">
              <Text fz="lg" fw="bold" c={colors["blue-button"]}>Kontak PPID</Text>
              <Text fz="sm" c="dimmed" lh={1.6}>
                <IconMail size={16} style={{ marginRight: 6 }} /> Email: <Text span fw="500">ppid@desadarmasaba.id</Text>
              </Text>
              <Text fz="sm" c="dimmed" lh={1.6}>
                <IconBrandWhatsapp size={16} style={{ marginRight: 6 }} /> WhatsApp: <Text span fw="500">081-xxx-xxx-xxx</Text>
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
