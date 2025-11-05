/* eslint-disable react-hooks/exhaustive-deps */
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
  Title
} from '@mantine/core';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateLayananDesa from '../../../_state/desa/layananDesa';

function PelayananTelunjukSakti() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Pelayanan Telunjuk Sakti"
        placeholder="Cari layanan..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPelayananTelunjukSakti search={search} />
    </Box>
  );
}

function ListPelayananTelunjukSakti({ search }: { search: string }) {
  const telunjukSaktiState = useProxy(stateLayananDesa.pelayananTelunjukSaktiDesa);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = telunjukSaktiState.findMany;

  useEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={400} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Pelayanan Telunjuk Sakti</Title>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() =>
                router.push('/admin/desa/layanan/pelayanan_telunjuk_sakti_desa/create')
              }
            >
              Tambah Baru
            </Button>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover style={{ minWidth: '700px' }}>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '30%' }}>Nama</TableTh>
                <TableTh style={{ width: '40%' }}>Link</TableTh>
                <TableTh style={{ width: '30%' }}>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={200}>
                        <Text fw={500} truncate="end" lineClamp={1}>
                          {item.name}
                        </Text></Box>

                    </TableTd>
                    <TableTd>
                      <Box w={200}>
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          <Text lineClamp={1} dangerouslySetInnerHTML={{ __html: item.deskripsi }} style={{wordBreak: "break-word", whiteSpace: "normal"}} truncate="end" fz={"sm"} />
                        </a>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/desa/layanan/pelayanan_telunjuk_sakti_desa/${item.id}`
                          )
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
                  <TableTd colSpan={3}>
                    <Center py={20}>
                      <Text color="dimmed">
                        Tidak ada data layanan yang cocok
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
            load(newPage, 10, search);
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

export default PelayananTelunjukSakti;

