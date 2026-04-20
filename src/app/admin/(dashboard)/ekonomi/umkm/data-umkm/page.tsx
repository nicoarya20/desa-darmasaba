'use client'
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
  Title,
  TextInput
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconPlus, IconSearch, IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import umkmState from '../../../_state/ekonomi/umkm/umkm';

function DataUmkm() {
  const [search, setSearch] = useState("");
  const state = useProxy(umkmState.umkm.findMany);
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  useShallowEffect(() => {
    state.load(state.page, 10, debouncedSearch);
  }, [state.page, debouncedSearch]);

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>Data UMKM</Title>
        <Button leftSection={<IconPlus size={18} />} color="blue">
          Tambah UMKM
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md">
        <TextInput
          placeholder="Cari UMKM atau Pemilik..."
          leftSection={<IconSearch size={18} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          mb="md"
        />

        {state.loading ? (
          <Skeleton height={400} />
        ) : (
          <Box style={{ overflowX: 'auto' }}>
            <Table highlightOnHover>
              <TableThead>
                <TableTr>
                  <TableTh>Nama UMKM</TableTh>
                  <TableTh>Pemilik</TableTh>
                  <TableTh>Kategori</TableTh>
                  <TableTh>Kontak</TableTh>
                  <TableTh>Aksi</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {state.data.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd fw={500}>{item.nama}</TableTd>
                    <TableTd>{item.pemilik}</TableTd>
                    <TableTd>{item.kategori?.nama || '-'}</TableTd>
                    <TableTd>{item.kontak || '-'}</TableTd>
                    <TableTd>
                      <Group gap="xs">
                        <Button variant="subtle" color="blue" size="xs">
                          <IconEdit size={16} />
                        </Button>
                        <Button variant="subtle" color="red" size="xs">
                          <IconTrash size={16} />
                        </Button>
                      </Group>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </Box>
        )}

        <Center mt="md">
          <Pagination
            total={state.totalPages}
            value={state.page}
            onChange={(p) => state.load(p, 10, debouncedSearch)}
          />
        </Center>
      </Paper>
    </Stack>
  );
}

export default DataUmkm;
