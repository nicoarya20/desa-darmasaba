'use client'
import HeaderSearch from '@/app/admin/(dashboard)/_com/header';
import persentasekelahiran from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
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
import { IconArrowBack, IconEdit, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';


function Kematian() {
  const [search, setSearch] = useState("");
  const router = useRouter();


  return (
    <Box>
      {/* Tombol Back */}
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian')}>
          <IconArrowBack color={colors["blue-button"]} size={30} />
        </Button>
      </Box>


      {/* Header dengan Search */}
      <HeaderSearch
        title='Data Kematian'
        placeholder='Cari nama atau alamat...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />


      <ListKematian search={search} />
    </Box>
  );
}


function ListKematian({ search }: { search: string }) {
  const statePersentase = useProxy(persentasekelahiran.kematian);
  const router = useRouter();


  const { data, page, totalPages, loading, load } = statePersentase.findMany;


  useShallowEffect(() => {
    load(page, 10, search);
  }, [page, search]);


  const filteredData = data || [];


  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }


  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Data Kematian</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kematian/create'
              )
            }
          >
            Tambah Baru
          </Button>
        </Group>


        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>Nama</TableTh>
                <TableTh>Tanggal</TableTh>
                <TableTh>Jenis Kelamin</TableTh>
                <TableTh>Alamat</TableTh>
                <TableTh>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={150}>
                        <Text fw={500} truncate="end" lineClamp={1}>
                          {item.nama}
                        </Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={150}>
                        {new Date(item.tanggal).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={150}>
                        {item.jenisKelamin}
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={150}>
                        <Text truncate fz="sm" c="dimmed">
                          {item.alamat}
                        </Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kematian/${item.id}`
                          )
                        }
                      >
                        <IconEdit size={18} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={20}>
                      <Text color="dimmed">
                        Tidak ada data kematian yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
      </Paper>


      {/* Pagination */}
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10, search);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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


export default Kematian;