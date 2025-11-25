'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Select, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCheck, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import { ModalKonfirmasiHapus } from '../../_com/modalKonfirmasiHapus';
import user from '../../_state/user/user-state';
import { authStore } from '@/store/authStore';

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
  const stateUser = useProxy(user.userState);
  const stateRole = useProxy(user.roleState);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateUser.findMany;

  const handleDelete = () => {
    if (selectedId) {
      stateUser.deleteUser.delete(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      stateUser.findMany.load();
    }
  };

  useShallowEffect(() => {
    stateRole.findMany.load();
    load(page, 10, search);
  }, [page, search]);

  // ✅ Helper function untuk nama role
  const getRoleName = (roleId: string) => {
    // Cari dari data role yang sudah diload
    const role = stateRole.findMany.data.find((r) => r.id === roleId);
    return role?.name || "Unknown Role";
  };

  // ✅ Handler untuk perubahan role dengan konfirmasi
  const handleRoleChange = async (
    userId: string,
    username: string,
    oldRoleId: string,
    newRoleId: string
  ) => {
    // Skip jika sama
    if (oldRoleId === newRoleId) {
      return true;
    }

    // ✅ Konfirmasi perubahan role
    const confirmed = window.confirm(
      `⚠️ PERINGATAN\n\n` +
      `Mengubah role untuk "${username}" akan:\n` +
      `• Logout user otomatis dari semua device\n` +
      `• Mengubah akses menu sesuai role baru\n\n` +
      `Role: ${getRoleName(oldRoleId)} → ${getRoleName(newRoleId)}\n\n` +
      `Lanjutkan?`
    );

    if (!confirmed) {
      // Reload data untuk reset dropdown ke nilai lama
      stateUser.findMany.load(page, 10, search);
      return false;
    }

    // ✅ Submit update
    const success = await stateUser.update.submit({
      id: userId,
      roleId: newRoleId,
    });

    if (success) {
      // ✅ Logout user jika sedang mengedit diri sendiri
      const currentUserId = authStore.user?.id;
      if (currentUserId === userId) {
        authStore.setUser(null);
        document.cookie = `${process.env.BASE_SESSION_KEY}=; Max-Age=0; path=/;`;
        alert("Perubahan memerlukan login ulang");
        window.location.href = "/login";
        return;
      }

      // Reload data
      stateUser.findMany.load(page, 10, search);
    }

    return success;
  };

  // ✅ Handler untuk toggle isActive
  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    const success = await stateUser.update.submit({
      id: userId,
      isActive: !currentStatus,
    });

    if (success) {
      // ✅ Logout user jika sedang mengedit diri sendiri
      const currentUserId = authStore.user?.id;
      if (currentUserId === userId) {
        authStore.setUser(null);
        document.cookie = `${process.env.BASE_SESSION_KEY}=; Max-Age=0; path=/;`;
        alert("Perubahan memerlukan login ulang");
        window.location.href = "/login";
        return;
      }

      // Reload data
      stateUser.findMany.load(page, 10, search);
    }
  };

  const filteredData = (data || []).filter(
    (item) => item.roleId !== "0" // asumsikan id role SUPERADMIN = "0"
  );

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
                <TableTh style={{ width: '15%' }}>Hapus</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '25%' }}>
                      <Text fw={500} truncate="end" lineClamp={1}>
                        {item.username}
                      </Text>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
                      <Text truncate fz="sm" c="dimmed">
                        {item.nomor}
                      </Text>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
                      <Select
                        placeholder="Pilih role"
                        data={stateRole.findMany.data
                          .filter(r => r.id !== "0") // ❌ Sembunyikan SUPERADMIN
                          .map(r => ({
                            label: r.name,
                            value: r.id,
                          }))}
                        value={item.roleId}
                        onChange={(val) => {
                          if (!val) return;

                          // ✅ Panggil handleRoleChange dengan konfirmasi
                          handleRoleChange(
                            item.id,
                            item.username,
                            item.roleId,
                            val
                          );
                        }}
                        searchable
                        clearable={false}
                        nothingFoundMessage="Role tidak ditemukan"
                        disabled={stateUser.update.loading}
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
                          onClick={() => handleToggleActive(item.id, item.isActive)}
                          disabled={stateUser.update.loading}
                        >
                          {item.isActive ? <IconCheck size={20} /> : <IconX size={20} />}
                        </Button>
                      </Tooltip>
                    </TableTd>

                    <TableTd style={{ width: '15%' }}>
                      <Button
                        variant="light"
                        color='red'
                        disabled={stateUser.deleteUser.loading}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                      >
                        <IconTrash size={20} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={20}>
                      <Text c="dimmed">Tidak ada data user yang cocok</Text>
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