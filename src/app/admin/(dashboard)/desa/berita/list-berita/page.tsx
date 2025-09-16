'use client'
import colors from '@/con/colors';
import {
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
  Title,
  Tooltip,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCircleDashedPlus, IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateDashboardBerita from '../../../_state/desa/berita';

function Berita() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Berita"
        placeholder="Cari judul atau kategori berita..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListBerita search={search} />
    </Box>
  );
}

function ListBerita({ search }: { search: string }) {
  const beritaState = useProxy(stateDashboardBerita);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = beritaState.berita.findMany;

  useShallowEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  const filteredData = data || [];

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Berita</Title>
          <Tooltip label="Tambah Berita" withArrow>
            <Button
              leftSection={<IconCircleDashedPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/desa/berita/list-berita/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '30%' }}>Judul</TableTh>
                <TableTh style={{ width: '20%' }}>Kategori</TableTh>
                <TableTh style={{ width: '25%' }}>Gambar</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '30%' }}>
                      <Box w={200}>
                        <Text fw={500} truncate="end" lineClamp={1}>
                          {item.judul}
                        </Text>
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
                      <Text fz="sm" c="dimmed">
                        {item.kategoriBerita?.name || '-'}
                      </Text>
                    </TableTd>
                    <TableTd style={{ width: '25%' }}>
                      <Box
                        w={80}
                        h={80}
                        style={{ borderRadius: 8, overflow: 'hidden' }}
                      >
                        {item.image?.link ? (
                          <Image src={item.image.link} alt="gambar" fit="cover" />
                        ) : (
                          <Box bg={colors['blue-button']} w="100%" h="100%" />
                        )}
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '15%' }}>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/desa/berita/list-berita/${item.id}`)
                        }
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">
                        Tidak ada data berita yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
      </Paper>

      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default Berita;
