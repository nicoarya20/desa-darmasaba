'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import stateGallery from '../../../_state/desa/gallery';

function Video() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Posisi Organisasi'
        placeholder='pencarian'
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

  const filteredData = (data || [])

  if (loading || !data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Video'
          href='/admin/desa/gallery/video/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Judul Video</TableTh>
              <TableTh>Tanggal Video</TableTh>
              <TableTh>Deskripsi Video</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>
                  <Box w={200}>
                    <Text lineClamp={1}>{item.name}</Text>
                  </Box>
                </TableTd>
                
                <TableTd>
                  <Box w={200}>
                  {new Date(item.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  </Box>
                </TableTd>
                <TableTd>
                  <Box w={200}>
                    <Text lineClamp={1} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                  </Box>
                </TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/desa/gallery/video/${item.id}`)}>
                    <IconDeviceImac size={20} />
                  </Button>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </Paper>
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => load(newPage)} // ini penting!
          total={totalPages}
          mt="md"
          mb="md"
        />
      </Center>
    </Box>
  );
}

export default Video;
