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
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import kontakDarurat from '../../_state/kesehatan/kontak-darurat/kontakDarurat';

function KontakDarurat() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      {/* Header Search */}
      <HeaderSearch
        title='Kontak Darurat'
        placeholder='Cari judul atau deskripsi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <ListKontakDarurat search={search} />
    </Box>
  );
}

function ListKontakDarurat({ search }: { search: string }) {
  const kontakDaruratState = useProxy(kontakDarurat)
  const router = useRouter();

  const { data, page, totalPages, loading, load } = kontakDaruratState.findMany;

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
        <Stack mb="md" gap="sm">
          <Box display="flex" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <Title order={4}>Daftar Kontak Darurat</Title>
            <Tooltip label="Tambah Kontak Darurat" withArrow>
              <Button
                leftSection={<IconPlus size={18} />}
                color="blue"
                variant="light"
                onClick={() => router.push('/admin/kesehatan/kontak-darurat/create')}
              >
                Tambah Baru
              </Button>
            </Tooltip>
          </Box>
        </Stack>

        {/* Tabel */}
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>Judul</TableTh>
                <TableTh>Deskripsi</TableTh>
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
                      <Text truncate fz="sm" c="dimmed" lineClamp={1} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                    </TableTd>
                    <TableTd>
                      <Image w={100} src={item.image?.link} alt="image" radius="md" loading="lazy"/>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/kesehatan/kontak-darurat/${item.id}`)}
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
                      <Text color="dimmed">Tidak ada data kontak darurat yang cocok</Text>
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
            load(newPage, 10);
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
  )
}

export default KontakDarurat;
