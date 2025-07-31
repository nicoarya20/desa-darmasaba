'use client'
import colors from '@/con/colors';
import { Box, Button, Image, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import profileLandingPageState from '../../../_state/landing-page/profile';

function MediaSosial() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Media Sosial'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListMediaSosial search={search} />
    </Box>
  );
}

function ListMediaSosial({ search }: { search: string }) {
  const stateMediaSosial = useProxy(profileLandingPageState.mediaSosial)
  const router = useRouter();

  useShallowEffect(() => {
    stateMediaSosial.findMany.load()
  }, [])

  const filteredData = (stateMediaSosial.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.iconUrl?.toLowerCase().includes(keyword)
    );
  });

  if (!stateMediaSosial.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Media Sosial'
          href='/admin/landing-page/profile/media-sosial/create'
        />
       <Box style={{overflowY: "auto"}}>
       <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Media Sosial / Nama Kontak</TableTh>
              <TableTh>Image</TableTh>
              <TableTh>Icon URL / No Telephone</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.name}</TableTd>
                <TableTd>
                  <Box w={50} h={50}>
                    <Image src={item.image?.link} alt={item.name} />
                  </Box>
                </TableTd>
                <TableTd>{item.iconUrl}</TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/landing-page/profile/media-sosial/${item.id}`)}>
                    <IconDeviceImac size={20} />
                  </Button>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
       </Box>
      </Paper>
    </Box>
  );
}

export default MediaSosial;
