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
import { useDebouncedValue, useShallowEffect, useDisclosure } from '@mantine/hooks';
import { IconSearch, IconEdit, IconTrash, IconCircleDashedPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import umkmState from '../../../_state/ekonomi/umkm/umkm';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DataUmkm() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const state = useProxy(umkmState.umkm.findMany);
  const deleteState = useProxy(umkmState.umkm.delete);
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useShallowEffect(() => {
    state.load(state.page, 10, debouncedSearch);
  }, [state.page, debouncedSearch]);

  const handleDelete = async () => {
    if (selectedId) {
      const success = await umkmState.umkm.delete.byId(selectedId);
      if (success) {
        close();
        setSelectedId(null);
      }
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>Data UMKM</Title>
        <TextInput
          placeholder="Cari UMKM atau Pemilik..."
          leftSection={<IconSearch size={18} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          mb="md"
        />
      </Group>

      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="md" pb={"sm"}>
          <Title order={4}>Daftar UMKM</Title>
          <Button
            leftSection={<IconCircleDashedPlus size={18} />}
            color="blue"
            onClick={() => router.push('/admin/ekonomi/umkm/data-umkm/create')}
          >
            Tambah UMKM
          </Button>
        </Group>

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
                            open();
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
        opened={opened}
        onClose={close}
        onConfirm={handleDelete}
        loading={deleteState.loading}
        text="Apakah Anda yakin ingin menghapus data UMKM ini? Tindakan ini tidak dapat dibatalkan."
      />
    </Stack>
  );
}

export default DataUmkm;
