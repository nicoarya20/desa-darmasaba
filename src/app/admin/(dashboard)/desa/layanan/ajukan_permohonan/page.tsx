/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
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
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateLayananDesa from '../../../_state/desa/layananDesa';

function AjukanPermohonan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Pelayanan Ajukan Permohonan'
        placeholder='Cari nama atau deskripsi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListAjukanPermohonan search={search} />
    </Box>
  );
}

function ListAjukanPermohonan({ search }: { search: string }) {
  const AjukanPermohonanState = useProxy(stateLayananDesa.ajukanPermohonan);
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = AjukanPermohonanState.findMany;

  useEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  // Loading state
  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        <Title order={4}>List Ajukan Permohonan</Title>
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '30%' }}>Nama</TableTh>
                <TableTh style={{ width: '45%' }}>Alamat</TableTh>
                <TableTh style={{ width: '15%' }}>NIK</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '30%' }}>
                      <Box w={200}>
                        <Text fw={500} truncate="end" lineClamp={1}>
                          {item.nama}
                        </Text>
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '45%' }}>
                      <Box w={200}>
                        <Text fw={500} truncate="end" lineClamp={1}>
                          {item.alamat}
                        </Text>
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '45%' }}>
                      <Box w={200}>
                        <Text fw={500} truncate="end" lineClamp={1}>
                          {item.nik}
                        </Text>
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '15%' }}>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() =>
                          router.push(`/admin/desa/layanan/ajukan_permohonan/${item.id}`)
                        }
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data ajukan permohonan yang cocok</Text>
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

export default AjukanPermohonan;
