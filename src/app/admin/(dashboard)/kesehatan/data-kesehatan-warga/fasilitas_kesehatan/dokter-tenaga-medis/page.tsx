'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

import HeaderSearch from '@/app/admin/(dashboard)/_com/header';
import JudulList from '@/app/admin/(dashboard)/_com/judulList';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import { useState } from 'react';


function DokterTenagaMedis() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <HeaderSearch
        title='Dokter dan Tenaga Medis'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDokterTenagaMedis search={search} />
    </Box>
  );
}

function ListDokterTenagaMedis({ search }: { search: string }) {
  const stateFasilitasKesehatan = useProxy(fasilitasKesehatanState.dokter)
  const router = useRouter();
  const {
    data,
    loading,
    load,
    page,
    totalPages
  } = stateFasilitasKesehatan.findMany

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

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
        <Stack>
          <JudulList
            title='List Fasilitas Kesehatan'
            href={`/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/dokter-tenaga-medis/create`}
          />
          <Box style={{ overflowX: "auto" }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Fasilitas Kesehatan</TableTh>
                  <TableTh>Alamat</TableTh>
                  <TableTh>Jam Operasional</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>{item.name}</TableTd>
                    <TableTd>{item.specialist}</TableTd>
                    <TableTd>
                      <Text dangerouslySetInnerHTML={{ __html: item.jadwal }} />
                    </TableTd>
                    <TableTd>
                      <Button onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/${item.id}`)}>
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
  )
}

export default DokterTenagaMedis;
