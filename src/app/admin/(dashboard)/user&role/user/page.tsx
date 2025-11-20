'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Select, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCheck, IconSearch, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import { ModalKonfirmasiHapus } from '../../_com/modalKonfirmasiHapus';
import user from '../../_state/user/user-state';


function User() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='User'
        placeholder='Cari nama user...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListUser search={search} />
    </Box>
  );
}

function ListUser({ search }: { search: string }) {
  const stateUser = useProxy(user.userState)
  const stateRole = useProxy(user.roleState)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateUser.findMany;

  const handleDelete = () => {
    if (selectedId) {
      stateUser.delete.submit(selectedId)
      setModalHapus(false)
      setSelectedId(null)

      stateUser.findMany.load()
    }
  }


  useShallowEffect(() => {
    stateRole.findMany.load()
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

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
          <Title order={4}>Daftar User</Title>
        </Group>
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}>Nama User</TableTh>
                <TableTh style={{ width: '20%' }}>Nomor</TableTh>
                <TableTh style={{ width: '20%' }}>Role</TableTh>
                <TableTh style={{ width: '15%' }}>Aktif / Nonaktif</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '25%', }}>
                      <Text fw={500} truncate="end" lineClamp={1}>{item.username}</Text>
                    </TableTd>
                    <TableTd style={{ width: '20%', }}>
                      <Text truncate fz="sm" c="dimmed">
                        {item.nomor}
                      </Text>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
                      <Select
                        placeholder="Pilih role"
                        data={stateRole.findMany.data.map((r) => ({
                          label: r.name,
                          value: r.id,
                        }))}
                        value={item.roleId} // ⬅ role milik user ini
                        onChange={async (val) => {
                          if (!val) return;

                          await stateUser.update.submit({
                            id: item.id,
                            roleId: val, // ⬅ kirim roleId
                          });

                          // reload data supaya UI up-to-date
                          stateUser.findMany.load(page, 10, search);
                        }}
                        searchable
                        clearable={false} // role harus ada
                        nothingFoundMessage="Role tidak ditemukan"
                      />
                    </TableTd>

                    <TableTd style={{ width: '15%' }}>
                      <Tooltip
                        label={item.isActive ? "Nonaktifkan user" : "Aktifkan user"}
                        withArrow
                      >
                        <Button
                          variant="light"
                          color={item.isActive ? "green" : "red"}
                          onClick={async () => {
                            await stateUser.update.submit({
                              id: item.id,
                              isActive: !item.isActive, // toggle
                            });

                            stateUser.findMany.load(page, 10, search);
                          }}
                        >
                          {item.isActive ? <IconCheck size={20} /> : <IconX size={20} />}
                        </Button>
                      </Tooltip>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data user yang cocok</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
      </Paper>
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
      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text='Apakah anda yakin ingin menghapus user ini?'
      />
    </Box>
  );
}

export default User;
