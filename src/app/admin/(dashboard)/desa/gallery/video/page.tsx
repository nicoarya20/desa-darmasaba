'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import JudulListTab from '../../../_com/jusulListTab';
import { useProxy } from 'valtio/utils';
import stateGallery from '../../../_state/desa/gallery';
import { useShallowEffect } from '@mantine/hooks';

function Video() {
  const videoState = useProxy(stateGallery.video)
  const router = useRouter();

  useShallowEffect(() => {
    videoState.findMany.load()
  }, [])

  if (!videoState.findMany.data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    )
  }
  
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulListTab
          title='List Video'
          href='/admin/desa/gallery/video/create'
          placeholder='pencarian'
          searchIcon={<IconSearch size={16} />}
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
            {videoState.findMany.data?.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.name}</TableTd>
                <TableTd>{new Date(item.createdAt).toDateString()}</TableTd>
                <TableTd>
                  <Text dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
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
    </Box>
  );
}

export default Video;
