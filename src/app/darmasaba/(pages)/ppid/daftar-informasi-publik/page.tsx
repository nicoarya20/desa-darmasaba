'use client'

import daftarInformasiPublik from '@/app/admin/(dashboard)/_state/ppid/daftar_informasi_publik/daftarInformasiPublik';
import colors from '@/con/colors';
import {
  Badge,
  Box,
  Button,
  Center,
  Group,
  Image,
  Pagination,
  Paper,
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
  Tooltip
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconBrandWhatsapp, IconDeviceImacCog, IconFileInfo, IconMail, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useTransitionRouter } from 'next-view-transitions';

function Page() {
  const listData = useProxy(daftarInformasiPublik)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 500); // 500ms delay
  const router = useTransitionRouter()
  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = listData.findMany

  useShallowEffect(() => {
    load(page, 5, debouncedSearch)
  }, [page, debouncedSearch])

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
        <Image src="/darmasaba-icon.png" w={{ base: 70, md: 100 }} alt="Logo Desa Darmasaba" loading="lazy" />
      </Center>
      <Text ta="center" fz={{ base: "1.8rem", md: "2.5rem" }} c={colors["blue-button"]} fw="bold" lh={1.4}>
        Daftar Informasi Publik
      </Text>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap="lg">
          <Paper p="lg" radius="xl" shadow="sm" withBorder>
            <Stack gap="sm">
              <Text ta={"center"} fz={{ base: 'lg', md: 'xl' }} fw="bold" c={colors["blue-button"]}>
                Tentang Informasi Publik
              </Text>
              <Text ta={"center"} fz={{ base: 'sm', md: 'md' }} c="dimmed">
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
            <Box style={{ overflowX: 'auto' }}>
              <Table withRowBorders withColumnBorders withTableBorder highlightOnHover verticalSpacing="md">
                <TableThead bg={colors['blue-button']}>
                  <TableTr c={colors['white-1']}>
                    <TableTh fz="sm" ta="center" w="5%">No</TableTh>
                    <TableTh fz="sm" ta="center" w="25%">Jenis Informasi</TableTh>
                    <TableTh fz="sm" ta="center" w="40%">Deskripsi</TableTh>
                    <TableTh fz="sm" ta="center" w="20%">Tanggal Publikasi</TableTh>
                    <TableTh fz="sm" ta="center" w="15%">Aksi</TableTh>
                  </TableTr>
                </TableThead>
                <TableTbody bg={colors['white-1']}>
                  {data.map((item, index) => (
                    <TableTr key={item.id}>
                      <TableTd ta="center">{(page - 1) * 5 + index + 1}</TableTd>
                      <TableTd>
                        <Box>
                          <Badge variant="light" size="lg" color="blue">
                            <Text fw={650} fz={"sm"} c={'blue'} lineClamp={1}>
                              {item.jenisInformasi}
                            </Text>
                          </Badge>
                        </Box>
                      </TableTd>
                      <TableTd>
                        <Box>
                          <Text lineClamp={1} fz="sm" c="dark" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                        </Box>
                      </TableTd>
                      <TableTd ta="center">
                        <Box>
                          <Text ta={"center"}>
                            {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            }) : '-'}
                          </Text>
                        </Box>
                      </TableTd>
                      <TableTd style={{ textAlign: 'center' }}>
                        <Box>
                          <Tooltip label="Lihat Detail" withArrow>
                            <Button
                              size="xs"
                              radius="md"
                              variant="light"
                              color="blue"
                              leftSection={<IconDeviceImacCog size={16} />}
                              onClick={() => router.push(`/darmasaba/ppid/daftar-informasi-publik-desa-darmasaba/${item.id}`)}
                            >
                              Detail
                            </Button>
                          </Tooltip>
                        </Box>
                      </TableTd>
                    </TableTr>
                  ))}
                </TableTbody>
              </Table>
            </Box>
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
              <Group>
                <IconMail color='gray' size={16} style={{ marginRight: 6 }} />
                <Text c={"dimmed"} fz="sm" lh={1.6}>
                  Email: <Text c={"dimmed"} span fw="500">ppid@desadarmasaba.id</Text>
                </Text>
              </Group>
              <Group>
                <IconBrandWhatsapp color='gray' size={16} style={{ marginRight: 6 }} />
                <Text c={"dimmed"} fz="sm" lh={1.6}>
                  WhatsApp: <Text c={"dimmed"} span fw="500">081-xxx-xxx-xxx</Text>
                </Text>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
