/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import profileLandingPageState from '../../../_state/landing-page/profile';

function ProgramInovasi() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Program Inovasi'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListProgramInovasi search={search} />
    </Box>
  );
}

function ListProgramInovasi({ search }: { search: string }) {
  const stateProgramInovasi = useProxy(profileLandingPageState.programInovasi)
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateProgramInovasi.findMany;

  useEffect(() => {
    load(page, 10);
  }, [page]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(item => {
      const keyword = search.toLowerCase();
      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword) ||
        item.link?.toLowerCase().includes(keyword)
      );
    })
  }, [data, search]);

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
            title='List Program Inovasi'
            href='/admin/landing-page/profile/program-inovasi/create'
          />
          <Box style={{ overflowX: "auto" }}>
            <Table striped withTableBorder withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh>Nama Program</TableTh>
                  <TableTh>Deskripsi</TableTh>
                  <TableTh>Link</TableTh>
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
          title='List Program Inovasi'
          href='/admin/landing-page/profile/program-inovasi/create'
        />
        <Box style={{ overflowY: "auto" }}>
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Nama Program</TableTh>
                <TableTh>Deskripsi</TableTh>
                <TableTh>Link</TableTh>
                <TableTh>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.name}</TableTd>
                  <TableTd w={200}>{item.description}</TableTd>
                  <TableTd>
                    <Box w={250}>
                      <a style={{ color: "black" }} href={item.link} target="_blank" rel="noopener noreferrer">
                        <Text truncate fz={'sm'}>{item.link}</Text>
                      </a>
                    </Box>
                  </TableTd>
                  <TableTd>
                    <Button onClick={() => router.push(`/admin/landing-page/profile/program-inovasi/${item.id}`)}>
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

export default ProgramInovasi;
