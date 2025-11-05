'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconFile, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import apbdes from '../../_state/landing-page/apbdes';


function APBDes() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='APBDes'
        placeholder='Cari APBDes...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListAPBDes search={search} />
    </Box>
  );
}

function ListAPBDes({ search }: { search: string }) {
  const listState = useProxy(apbdes)
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = listState.findMany

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

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
          <Title order={4}>Daftar APBDes</Title>
            <Button 
              leftSection={<IconPlus size={18} />} 
              color="blue" 
              variant="light" 
              onClick={() => router.push('/admin/landing-page/apbdes/create')}
            >
              Tambah Baru
            </Button>
        </Group>
        
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '30%' }}>Nama APBDes</TableTh>
                <TableTh style={{ width: '25%' }}>Jumlah</TableTh>
                <TableTh style={{ width: '25%' }}>Dokumen</TableTh>
                <TableTh style={{ width: '20%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} truncate="end">{item.name}</Text>
                    </TableTd>
                    <TableTd>
                      <Box w={150}>
                        <Text>Rp. {item.jumlah}</Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      {item.file?.link ? (
                        <Button
                          component="a"
                          href={item.file.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="light"
                          leftSection={<IconFile size={18} />}
                          size="sm"
                        >
                          Lihat Dokumen
                        </Button>
                      ) : (
                        <Text c="dimmed" fz="sm">Tidak ada dokumen</Text>
                      )}
                    </TableTd>
                    <TableTd>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() => router.push(`/admin/landing-page/apbdes/${item.id}`)}
                        fullWidth
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data APBDes yang cocok</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
      </Paper>
      
      <Center mt="md">
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  )
}

export default APBDes;
