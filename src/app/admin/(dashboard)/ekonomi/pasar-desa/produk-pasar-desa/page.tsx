'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
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
  Tooltip
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import pasarDesaState from '../../../_state/ekonomi/pasar-desa/pasar-desa';

function PasarDesa() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Produk Pasar Desa"
        placeholder="Cari produk pasar desa..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPasarDesa search={search} />
    </Box>
  );
}

function ListPasarDesa({ search }: { search: string }) {
  const statePasar = useProxy(pasarDesaState.pasarDesa);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = statePasar.findMany;

  useShallowEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Produk Pasar Desa</Title>
          <Tooltip label="Tambah Produk Baru" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() =>
                router.push('/admin/ekonomi/pasar-desa/produk-pasar-desa/create')
              }
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}>Nama Produk</TableTh>
                <TableTh style={{ width: '20%' }}>Harga Produk</TableTh>
                <TableTh style={{ width: '15%' }}>Rating</TableTh>
                <TableTh style={{ width: '25%' }}>Alamat Usaha</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} truncate="end" lineClamp={1}>
                        {item.nama}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text>Rp.{item.harga}</Text>
                    </TableTd>
                    <TableTd>
                      <Text>{item.rating || '-'}</Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate fz="sm" c="dimmed">
                        {item.alamatUsaha || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/ekonomi/pasar-desa/produk-pasar-desa/${item.id}`
                          )
                        }
                      >
                        <IconDeviceImac size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={20}>
                      <Text color="dimmed">
                        Tidak ada produk pasar desa yang cocok
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

export default PasarDesa;
