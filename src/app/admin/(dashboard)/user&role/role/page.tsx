/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
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
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import { ModalKonfirmasiHapus } from '../../_com/modalKonfirmasiHapus';
import user from '../../_state/user/user-state';

function Role() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Role'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListRole search={search} />
    </Box>
  );
}

function ListRole({ search }: { search: string }) {
  const listDataState = useProxy(user.roleState);
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    listDataState.findMany.load();
  }, []);

  const handleDelete = () => {
    if (selectedId) {
      listDataState.delete.delete(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      listDataState.findMany.load();
    }
  };

  const filteredData = (listDataState.findMany.data || []).filter((item) => {
    const keyword = search.toLowerCase();
    return item.name.toLowerCase().includes(keyword);
  });

  if (!listDataState.findMany.data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton h={500} />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Role
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/user&role/role/create')}
            fz={{ base: 'sm', md: 'md' }}
            px={{ base: 'xs', md: 'sm' }}
            py={{ base: 'xs', md: 'sm' }}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Table
            striped
            highlightOnHover
            withRowBorders
            miw={0}
            style={{
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <TableThead>
              <TableTr>
                <TableTh w="70%">Role</TableTh>
                <TableTh w="15%">Edit</TableTh>
                <TableTh w="15%">Hapus</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd fz="md" fw={500} lh={1.5}>
                    {item.name}
                  </TableTd>
                  <TableTd>
                    <Button
                      variant="light"
                      color="green"
                      onClick={() => router.push(`/admin/user&role/role/${item.id}`)}
                      fz="sm"
                      px="xs"
                      py="xs"
                    >
                      <IconEdit size={20} />
                    </Button>
                  </TableTd>
                  <TableTd>
                    <Button
                      variant="light"
                      color="red"
                      disabled={listDataState.delete.loading}
                      onClick={() => {
                        setSelectedId(item.id);
                        setModalHapus(true);
                      }}
                      fz="sm"
                      px="xs"
                      py="xs"
                    >
                      <IconTrash size={20} />
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card View */}
        <Box hiddenFrom="md">
          <Stack gap="md">
            {filteredData.map((item) => (
              <Paper key={item.id} withBorder p="md" radius="sm">
                <Stack gap="xs">
                  <Box>
                    <Text fz="xs" fw={600} lh={1.4}>
                      Role
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4}>
                      {item.name}
                    </Text>
                  </Box>
                  <Group justify="flex-end" gap="xs">
                    <Button
                      variant="light"
                      color="green"
                      onClick={() => router.push(`/admin/user&role/role/${item.id}`)}
                      fz="xs"
                      px="xs"
                      py="xs"
                    >
                      <IconEdit size={18} />
                    </Button>
                    <Button
                      variant="light"
                      color="red"
                      disabled={listDataState.delete.loading}
                      onClick={() => {
                        setSelectedId(item.id);
                        setModalHapus(true);
                      }}
                      fz="xs"
                      px="xs"
                      py="xs"
                    >
                      <IconTrash size={18} />
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Paper>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text='Apakah anda yakin ingin menghapus kategori Berita ini?'
      />
    </Box>
  );
}

export default Role;