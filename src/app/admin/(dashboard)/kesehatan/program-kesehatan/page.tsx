'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
  Image,
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
  Title,
  Tooltip,
} from '@mantine/core';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import { useRouter } from 'next/navigation';
import programKesehatan from '../../_state/kesehatan/program-kesehatan/programKesehatan';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';

function ProgramKesehatan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      {/* Header dengan Search */}
      <HeaderSearch
        title='Program Kesehatan'
        placeholder='Cari program kesehatan...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListProgramKesehatan search={search} />
    </Box>
  );
}

function ListProgramKesehatan({ search }: { search: string }) {
  const stateProgram = useProxy(programKesehatan);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = stateProgram.findMany;

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
        {/* Header List + Tombol Tambah */}
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Program Kesehatan</Title>
          <Tooltip label="Tambah Program Kesehatan" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/kesehatan/program-kesehatan/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>

        {/* Tabel */}
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>Judul</TableTh>
                <TableTh>Deskripsi Singkat</TableTh>
                <TableTh>Image</TableTh>
                <TableTh>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} truncate="end" lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Box w={200}>
                        <Text fz="sm" truncate="end" lineClamp={2} dangerouslySetInnerHTML={{ __html: item.deskripsiSingkat }} />
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Image w={100} src={item.image?.link} alt="image" radius="md" loading="lazy"/>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/kesehatan/program-kesehatan/${item.id}`)}
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada program kesehatan yang cocok</Text>
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

export default ProgramKesehatan;
