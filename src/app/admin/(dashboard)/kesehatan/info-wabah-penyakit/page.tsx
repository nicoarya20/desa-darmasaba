'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
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
  Group,
} from '@mantine/core';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import infoWabahPenyakit from '../../_state/kesehatan/info-wabah-penyakit/infoWabahPenyakit';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';

function InfoWabahPenyakit() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      {/* Header Search */}
      <HeaderSearch
        title='Info Wabah Penyakit'
        placeholder='Cari judul atau deskripsi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListInfoWabahPenyakit search={search} />
    </Box>
  );
}

function ListInfoWabahPenyakit({ search }: { search: string }) {
  const infoWabahPenyakitState = useProxy(infoWabahPenyakit)
  const router = useRouter()

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = infoWabahPenyakitState.findMany;

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Info Wabah Penyakit</Title>
          <Tooltip label="Tambah Info Wabah" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/kesehatan/info-wabah-penyakit/create')}
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
                      <Text truncate fz="sm" c="dimmed">
                        {item.deskripsiSingkat}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Image w={100} src={item.image?.link} alt="image" radius="md" />
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/kesehatan/info-wabah-penyakit/${item.id}`)}
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
                      <Text color="dimmed">
                        Tidak ada data info wabah penyakit yang cocok
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
            load(newPage, 10)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  )
}

export default InfoWabahPenyakit;
