'use client'
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
  Title,
  TextInput
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconPlus, IconSearch, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import umkmState from '../../../_state/ekonomi/umkm/umkm';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';

function DataUmkm() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const state = useProxy(umkmState.umkm.findMany);
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useShallowEffect(() => {
    state.load(state.page, 10, debouncedSearch);
  }, [state.page, debouncedSearch]);

  const handleHapus = async () => {
    if (selectedId) {
      const success = await umkmState.umkm.del.submit(selectedId);
      if (success) {
        setModalHapus(false);
        setSelectedId(null);
      }
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>Data UMKM</Title>
        <Button 
          leftSection={<IconPlus size={18} />} 
          color="blue"
          onClick={() => router.push('/admin/ekonomi/umkm/data-umkm/create')}
        >
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
                        <Button 
                          variant="subtle" 
                          color="blue" 
                          size="xs"
                          onClick={() => router.push(`/admin/ekonomi/umkm/data-umkm/${item.id}/edit`)}
                        >
                          <IconEdit size={16} />
                        </Button>
                        <Button 
                          variant="subtle" 
                          color="red" 
                          size="xs"
                          onClick={() => {
                            setSelectedId(item.id);
                            setModalHapus(true);
                          }}
                        >
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

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus UMKM ini? Menghapus UMKM juga akan berdampak pada produk dan penjualan yang terkait."
      />
    </Stack>
  );
}

export default DataUmkm;
