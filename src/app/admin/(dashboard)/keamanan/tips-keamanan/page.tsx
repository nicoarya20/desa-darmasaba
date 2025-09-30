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
  Tooltip,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import { useState } from 'react';
import HeaderSearch from '../../_com/header';
import tipsKeamananState from '../../_state/keamanan/tips-keamanan';

function TipsKeamanan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Tips Keamanan'
        placeholder='Cari tips keamanan...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListTipsKeamanan search={search} />
    </Box>
  );
}

function ListTipsKeamanan({ search }: { search: string }) {
  const stateKeamanan = useProxy(tipsKeamananState)
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateKeamanan.findMany

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Tips Keamanan</Title>
          <Tooltip label="Tambah Tips Keamanan" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/keamanan/tips-keamanan/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}>Judul</TableTh>
                <TableTh style={{ width: '45%' }}>Deskripsi</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '25%' }}>
                      <Box w={200}>
                        <Text fw={500} truncate="end" lineClamp={1}>
                          {item.judul}
                        </Text>
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '45%' }}>
                      <Box w={200}>
                        <Text fz="sm" c="dimmed" lineClamp={1} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '15%' }}>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/keamanan/tips-keamanan/${item.id}`)}
                      >
                        <IconDeviceImac size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data tips keamanan yang cocok</Text>
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
            load(newPage, 10)
            window.scrollTo({ top: 0, behavior: 'smooth' })
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

export default TipsKeamanan;
