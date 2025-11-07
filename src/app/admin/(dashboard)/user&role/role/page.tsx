/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Title } from '@mantine/core';
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
  const listDataState = useProxy(user.roleState)
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    listDataState.findMany.load()
  }, [])

  const handleDelete = () => {
    if (selectedId) {
      listDataState.delete.delete(selectedId)
      setModalHapus(false)
      setSelectedId(null)

      listDataState.findMany.load()
    }
  }

  const filteredData = (listDataState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword)
    );
  });

  if (!listDataState.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }
  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Role</Title>
          <Button leftSection={<IconPlus size={18} />} color="blue" variant="light" onClick={() => router.push('/admin/user&role/role/create')}>
            Tambah Baru
          </Button>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table striped withRowBorders style={{ minWidth: '700px' }}>
            <TableThead>
              <TableTr>
                <TableTh>Role</TableTh>
                <TableTh>Edit</TableTh>
                <TableTh>Hapus</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.name}</TableTd>
                  <TableTd>
                    <Button variant="light" color='green' onClick={() => router.push(`/admin/user&role/role/${item.id}`)}>
                      <IconEdit size={20} />
                    </Button>
                  </TableTd>
                  <TableTd>
                    <Button
                      variant="light"
                      color='red'
                      disabled={listDataState.delete.loading}
                      onClick={() => {
                        setSelectedId(item.id)
                        setModalHapus(true)
                      }}>
                      <IconTrash size={20} />
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
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
  )
}

export default Role;
