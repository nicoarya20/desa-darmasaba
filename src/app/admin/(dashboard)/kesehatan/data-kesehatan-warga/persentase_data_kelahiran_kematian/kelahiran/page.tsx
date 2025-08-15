'use client'
import HeaderSearch from '@/app/admin/(dashboard)/_com/header';
import JudulList from '@/app/admin/(dashboard)/_com/judulList';
import persentasekelahiran from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';


function Kelahiran() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors["blue-button"]} size={30} />
        </Button>
      </Box>
      <HeaderSearch
        title='Data Kelahiran'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKelahiran search={search} />
    </Box>
  );
}
function ListKelahiran({ search }: { search: string }) {
  const statePersentase = useProxy(persentasekelahiran.kelahiran);
  const router = useRouter();


  const {
    data,
    page,
    totalPages,
    loading,
    load
  } = statePersentase.findMany;

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box>
      <Stack gap={"xs"}>
        {/* Form Input */}
        <Paper bg={colors['white-1']} p={'md'}>
          <JudulList
            title='List Data Kelahiran'
            href='/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran/create'
          />
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Nama</TableTh>
                <TableTh>Tanggal</TableTh>
                <TableTh>Jenis Kelamin</TableTh>
                <TableTh>Alamat</TableTh>
                <TableTh>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.nama}</TableTd>
                  <TableTd>
                    {new Date(item.tanggal).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </TableTd>
                  <TableTd>{item.jenisKelamin}</TableTd>
                  <TableTd>{item.alamat}</TableTd>
                  <TableTd>
                    <Button color='green' onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran/${item.id}`)}>
                      <IconDeviceImacCog size={20} />
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Paper>
      </Stack>
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

export default Kelahiran;
