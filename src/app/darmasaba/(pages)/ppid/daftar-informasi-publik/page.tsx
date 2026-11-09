'use client'

import daftarInformasiPublik from '@/app/admin/(dashboard)/_state/ppid/daftar_informasi_publik/daftarInformasiPublik';
import colors from '@/con/colors';
import { DOKUMEN_PERENCANAAN_PUBLIC_HREF } from '@/lib/dokumen-perencanaan';
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
  Tooltip,
  Title
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconBrandWhatsapp, IconDeviceImacCog, IconFileInfo, IconMail, IconSearch } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';
import { useTransitionRouter } from 'next-view-transitions';

function Page() {
  const listData = useProxy(daftarInformasiPublik)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 1000ms delay
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
        <Image
          src="/darmasaba-icon.png"
          w={{ base: 70, md: 100 }}
          alt="Logo Desa Darmasaba"
          loading="lazy"
        />
      </Center>

      <Title
        order={2}
        ta="center"
        fz={{ base: '1.6rem', md: '2.4rem' }}
        c={colors['blue-button']}
        lh={1.35}
        style={{ fontWeight: 700 }}
      >
        Daftar Informasi Publik
      </Title>

      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap="lg">
          <Paper p="lg" radius="xl" shadow="sm" withBorder>
            <Stack gap="sm">
              <Title
                order={4}
                ta="center"
                fz={{ base: 'lg', md: 'xl' }}
                c={colors['blue-button']}
                lh={1.2}
                style={{ fontWeight: 700 }}
              >
                Tentang Informasi Publik
              </Title>

              <Text
                ta="center"
                fz={{ base: 'sm', md: 'md' }}
                c="black"
                lh={1.6}
                style={{ maxWidth: 900, margin: '0 auto' }}
              >
                Daftar Informasi Publik Desa Darmasaba adalah kumpulan data yang dapat diakses oleh masyarakat sesuai dengan ketentuan peraturan yang berlaku.
              </Text>
            </Stack>
          </Paper>

          <Paper p="md" radius="xl" shadow="xs" withBorder>
            <Group justify="space-between" wrap="wrap" gap="sm">
              <Text fz={{ base: 'sm', md: 'md' }} lh={1.5}>
                Dokumen RPJM Desa, RKP Desa, dan berita acara musyawarah tersedia di Monev &amp; Pembangunan.
              </Text>
              <Button component={Link} href={DOKUMEN_PERENCANAAN_PUBLIC_HREF} variant="light" radius="md" size="compact-md">
                Dokumen Perencanaan
              </Button>
            </Group>
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
                <IconFileInfo size={48} stroke={1.5} color={colors['blue-button']} />
                <Text fz="md" c="dimmed" lh={1.5}>Tidak ada informasi publik yang ditemukan.</Text>
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
                      <TableTd ta="center">
                        <Text fz="sm" lh={1.4}>
                          {(page - 1) * 5 + index + 1}
                        </Text>
                      </TableTd>

                      <TableTd>
                        <Box>
                          <Badge variant="light" size="lg" color="blue">
                            <Text fw={650} fz="sm" c="blue" lineClamp={1} lh={1.2}>
                              {item.jenisInformasi}
                            </Text>
                          </Badge>
                        </Box>
                      </TableTd>

                      <TableTd>
                        <Box>
                          <Text
                            lineClamp={1}
                            fz={{ base: 'sm', md: 'md' }}
                            c="dark"
                            lh={1.5}
                            style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                            dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                          />
                        </Box>
                      </TableTd>

                      <TableTd ta="center">
                        <Box>
                          <Text ta="center" fz="sm" lh={1.4}>
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
                              onClick={() => router.push(`/darmasaba/ppid/daftar-informasi-publik/${item.id}`)}
                              aria-label={`Detail ${item.jenisInformasi}`}
                            >
                              <Text fz="xs" lh={1.2}>Detail</Text>
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
              <Title order={5} fz={{ base: 'lg', md: 'xl' }} fw="bold" c={colors['blue-button']} lh={1.2}>
                Kontak PPID
              </Title>

              <Group>
                <IconMail color="gray" size={16} style={{ marginRight: 6 }} />
                <Text c="dimmed" fz="sm" lh={1.6}>
                  Email:{' '}
                  <Text c="dimmed" span fw={500} fz="sm" lh={1.6}>
                    ppid@desadarmasaba.id
                  </Text>
                </Text>
              </Group>

              <Group>
                <IconBrandWhatsapp color="gray" size={16} style={{ marginRight: 6 }} />
                <Text c="dimmed" fz="sm" lh={1.6}>
                  WhatsApp:{' '}
                  <Text c="dimmed" span fw={500} fz="sm" lh={1.6}>
                    081-xxx-xxx-xxx
                  </Text>
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
