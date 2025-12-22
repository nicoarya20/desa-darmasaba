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
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import keamananLingkunganState from '../../_state/keamanan/keamanan-lingkungan';

function KeamananLingkungan() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      {/* Header Search */}
      <HeaderSearch
        title='Keamanan Lingkungan'
        placeholder='Cari nama atau deskripsi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <ListKeamananLingkungan search={search} />
    </Box>
  );
}

function ListKeamananLingkungan({ search }: { search: string }) {
  const keamananState = useProxy(keamananLingkunganState)
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000)

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = keamananState.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch)
  }, [page, debouncedSearch])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    )
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Keamanan Lingkungan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/keamanan/keamanan-lingkungan-pecalang-patwal/create')
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Table highlightOnHover
            miw={0}
            style={{ tableLayout: 'fixed', width: '100%' }}>
            <TableThead>
              <TableTr>
                <TableTh>Nama</TableTh>
                <TableTh>Deskripsi</TableTh>
                <TableTh style={{ width: 140, textAlign: 'center' }}>
                  Aksi
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd style={{ overflow: 'hidden' }}>
                      <Text
                        fz="sm"
                        c="dimmed"
                        lh={1.5}
                        lineClamp={1}
                        style={{
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                        }}
                        dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                      />
                    </TableTd>
                    <TableTd style={{ width: 140, textAlign: 'center' }}>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/keamanan/keamanan-lingkungan-pecalang-patwal/${item.id}`)}
                        leftSection={<IconDeviceImacCog size={20} />}
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={{ base: 'sm', md: 'lg' }}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data keamanan lingkungan yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Box hiddenFrom="md">
          <Stack gap="sm">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder radius="md" p="sm">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Nama</Text>
                      <Text fz="sm" fw={500} lh={1.5}>{item.name}</Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Deskripsi</Text>
                      <Box pl={8}>
                        <Text fz="sm" lineClamp={3} style={{ wordBreak: 'break-word' }} fw={500} lh={1.5} c="dimmed" dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                      </Box>
                    </Box>
                    <Box>
                      <Button
                        variant="light"
                        color="blue"
                        fullWidth
                        onClick={() => router.push(`/admin/keamanan/keamanan-lingkungan-pecalang-patwal/${item.id}`)}
                      >
                        <IconDeviceImacCog size={18} />
                        <Text ml={5} fz="sm" fw={500} lh={1.4}>
                          Detail
                        </Text>
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="lg">
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data keamanan lingkungan yang cocok
                </Text>
              </Center>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Pagination */}
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt={{ base: 'sm', md: 'md' }}
          mb={{ base: 'sm', md: 'md' }}
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default KeamananLingkungan;