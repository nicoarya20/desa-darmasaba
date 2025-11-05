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
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateGallery from '../../../_state/desa/gallery';

function Video() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Video'
        placeholder='Cari judul atau deskripsi video...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListVideo search={search} />
    </Box>
  );
}

function ListVideo({ search }: { search: string }) {
  const videoState = useProxy(stateGallery.video)
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = videoState.findMany;

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
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Video</Title>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/desa/gallery/video/create')}
            >
              Tambah Baru
            </Button>
        </Group>
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}>Judul Video</TableTh>
                <TableTh style={{ width: '20%' }}>Tanggal</TableTh>
                <TableTh style={{ width: '30%' }}>Deskripsi</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '25%' }}>
                      <Box w={200}> 
                        <Text fw={500} truncate="end" lineClamp={1}>{item.name}</Text>
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
                     <Box w={200}>
                     <Text fz="sm" c="dimmed">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                     </Box>
                    </TableTd>
                    <TableTd style={{ width: '30%' }}>
                     <Box w={200}>
                      <Text fz="sm" truncate="end" lineClamp={1} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                     </Box>
                    </TableTd>
                    <TableTd style={{ width: '15%' }}>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/desa/gallery/video/${item.id}`)}
                      >
                        <IconDeviceImac size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed">Tidak ada video yang cocok</Text>
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

export default Video;
