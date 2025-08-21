'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Image, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
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

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateMediaSosial.findMany;

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  // Handle loading state
  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={550} />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py={10}>
        <Paper bg={colors['white-1']} p={'md'}>
          <JudulList
            title='List Media Sosial'
            href='/admin/landing-page/profile/media-sosial/create'
          />
          <Box style={{ overflowX: "auto" }}>
            <Table striped withTableBorder withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh>Nama Media Sosial / Nama Kontak</TableTh>
                  <TableTh>Image</TableTh>
                  <TableTh>Icon URL / No Telephone</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
            </Table>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Media Sosial'
          href='/admin/landing-page/profile/media-sosial/create'
        />
        <Box style={{ overflowY: "auto" }}>
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
                  <TableTd>
                    <Box w={250}>
                      <a style={{color: "black"}} href={item.iconUrl} target="_blank" rel="noopener noreferrer">
                        <Text truncate fz={'sm'}>{item.iconUrl}</Text>
                      </a>
                    </Box>
                  </TableTd>
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
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo(0, 0);
          }}
          total={totalPages}
          mt="md"
          mb="md"
        />
      </Center>
    </Box>
  );
}

export default MediaSosial;
