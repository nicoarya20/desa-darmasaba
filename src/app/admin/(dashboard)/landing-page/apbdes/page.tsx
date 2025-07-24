/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { ActionIcon, Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImacCog, IconFile, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import apbdes from '../../_state/landing-page/apbdes';


function APBDes() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='APBDes'
        placeholder='pencarian'
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
  useEffect(() => {
    listState.findMany.load()
  }, [])

  const filteredData = (listState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.jumlah.toLowerCase().includes(keyword)
    )
  });

  if (!listState.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <JudulList
            title='List APBDes'
            href='/admin/landing-page/APBDes/create'
          />
          <Box style={{ overflowX: 'auto' }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Nama APBDes</TableTh>
                  <TableTh>Jumlah APBDes</TableTh>
                  <TableTh>Document</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{item.name}</Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Text truncate="end" fz={"sm"}>{item.jumlah}</Text>
                    </TableTd>
                    <TableTd>
                      {item.file?.link ? (
                        <ActionIcon
                          component="a"
                          href={item.file.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant='transparent'
                        >
                          <IconFile size={25} color={colors['blue-button']}/>
                        </ActionIcon>
                      ) : (
                        <Text>Tidak ada dokumen tersedia</Text>
                      )}
                    </TableTd>
                    <TableTd>
                      <Button onClick={() => router.push(`/admin/landing-page/APBDes/${item.id}`)}>
                        <IconDeviceImacCog size={25} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

export default APBDes;
