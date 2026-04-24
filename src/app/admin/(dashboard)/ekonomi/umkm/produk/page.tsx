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
  TextInput,
  Badge
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconPlus, IconSearch, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import umkmState from '../../../_state/ekonomi/umkm/umkm';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';

function ProdukUmkm() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const state = useProxy(umkmState.produk.findMany);
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useShallowEffect(() => {
    state.load(state.page, 10, debouncedSearch);
  }, [state.page, debouncedSearch]);

  const handleHapus = async () => {
    if (selectedId) {
      const success = await umkmState.produk.del.submit(selectedId);
      if (success) {
        setModalHapus(false);
        setSelectedId(null);
      }
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>Daftar Produk UMKM</Title>
        <Button 
          leftSection={<IconPlus size={18} />} 
          color="blue"
          onClick={() => router.push('/admin/ekonomi/umkm/produk/create')}
        >
          Tambah Produk
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md">
        <TextInput
          placeholder="Cari nama produk..."
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
                  <TableTh>Nama Produk</TableTh>
                  <TableTh>UMKM</TableTh>
                  <TableTh>Harga</TableTh>
                  <TableTh>Stok</TableTh>
                  <TableTh>Status Stok</TableTh>
                  <TableTh>Aksi</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {state.data.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd fw={500}>{item.nama}</TableTd>
                    <TableTd>{item.umkm?.nama || '-'}</TableTd>
                    <TableTd>Rp {item.harga.toLocaleString()}</TableTd>
                    <TableTd>{item.stok}</TableTd>
                    <TableTd>
                      <Badge color={item.stok < 5 ? 'red' : item.stok < 20 ? 'yellow' : 'green'}>
                        {item.stok < 5 ? 'Rendah' : item.stok < 20 ? 'Menipis' : 'Aman'}
                      </Badge>
                    </TableTd>
                    <TableTd>
                      <Group gap="xs">
                        <Button 
                          variant="subtle" 
                          color="blue" 
                          size="xs"
                          onClick={() => router.push(`/admin/ekonomi/umkm/produk/${item.id}/edit`)}
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
        text="Apakah Anda yakin ingin menghapus produk ini?"
      />
    </Stack>
  );
}

export default ProdukUmkm;
