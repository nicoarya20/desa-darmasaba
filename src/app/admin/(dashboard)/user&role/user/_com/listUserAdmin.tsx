'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Select, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title, Tooltip } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconCheck, IconTrash, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import user from '../../../_state/user/user-state';
import { authStore } from '@/store/authStore';

// Role yang boleh di-assign ke admin (0=DEVELOPER, 1=SUPER ADMIN dikunci — hanya via seed/DB).
const ASSIGNABLE_ROLE_IDS = ["2", "3", "4"];

// Daftar akun admin (role 0-4). Data difilter server-side via roleGroup="admin".
export default function ListUserAdmin({ search }: { search: string }) {
  const stateUser = useProxy(user.userState);
  const stateRole = useProxy(user.roleState);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading } = stateUser.findMany;

  const reload = (p = page) => stateUser.findMany.load(p, 10, debouncedSearch, "admin");

  const handleDelete = async () => {
    if (!selectedId) return;

    // Tunggu delete selesai sebelum reload — kalau tidak, reload menembak
    // server sebelum baris benar-benar terhapus (race) & user muncul lagi.
    const ok = await stateUser.deleteUser.delete(selectedId);
    setModalHapus(false);
    setSelectedId(null);

    if (ok) {
      // Bila baris terakhir di halaman ini yang dihapus, mundur satu halaman
      // agar tidak berhenti di halaman kosong.
      const nextPage = (data?.length ?? 0) === 1 && page > 1 ? page - 1 : page;
      reload(nextPage);
    }
  };

  useShallowEffect(() => {
    stateRole.findMany.load();
    stateUser.findMany.load(page, 10, debouncedSearch, "admin");
  }, [page, debouncedSearch]);

  const getRoleName = (roleId: string) => {
    const role = stateRole.findMany.data.find((r) => r.id === roleId);
    return role?.name || "Unknown Role";
  };

  const handleRoleChange = async (userId: string, username: string, oldRoleId: string, newRoleId: string) => {
    if (oldRoleId === newRoleId) return true;

    const confirmed = window.confirm(
      `⚠️ PERINGATAN\n\n` +
      `Mengubah role untuk "${username}" akan:\n` +
      `• Logout user otomatis dari semua device\n` +
      `• Mengubah akses menu sesuai role baru\n\n` +
      `Role: ${getRoleName(oldRoleId)} → ${getRoleName(newRoleId)}\n\n` +
      `Lanjutkan?`
    );

    if (!confirmed) {
      reload();
      return false;
    }

    const success = await stateUser.update.submit({ id: userId, roleId: newRoleId });

    if (success) {
      const currentUserId = authStore.user?.id;
      if (currentUserId === userId) {
        authStore.setUser(null);
        document.cookie = `${process.env.BASE_SESSION_KEY}=; Max-Age=0; path=/;`;
        alert("Perubahan memerlukan login ulang");
        window.location.href = "/login";
        return;
      }
      reload();
    }

    return success;
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    const success = await stateUser.update.submit({ id: userId, isActive: !currentStatus });

    if (success) {
      const currentUserId = authStore.user?.id;
      if (currentUserId === userId) {
        authStore.setUser(null);
        document.cookie = `${process.env.BASE_SESSION_KEY}=; Max-Age=0; path=/;`;
        alert("Perubahan memerlukan login ulang");
        window.location.href = "/login";
        return;
      }
      reload();
    }
  };

  const roleOptions = stateRole.findMany.data
    .filter(r => ASSIGNABLE_ROLE_IDS.includes(r.id))
    .map(r => ({ label: r.name, value: r.id }));

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  const rows = data || [];

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4} lh={1.2}>Daftar Admin</Title>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table highlightOnHover miw={0} style={{ tableLayout: 'fixed', width: '100%' }}>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}><Text fz="xs" fw={600} lh={1.4} ta="left">Nama User</Text></TableTh>
                <TableTh style={{ width: '20%' }}><Text fz="xs" fw={600} lh={1.4} ta="left">Email</Text></TableTh>
                <TableTh style={{ width: '20%' }}><Text fz="xs" fw={600} lh={1.4} ta="left">Role</Text></TableTh>
                <TableTh style={{ width: '15%' }}><Text fz="xs" fw={600} lh={1.4} ta="left">Aktif / Nonaktif</Text></TableTh>
                <TableTh style={{ width: '20%' }}><Text fz="xs" fw={600} lh={1.4} ta="left">Hapus</Text></TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {rows.length > 0 ? (
                rows.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>{item.username}</Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" fw={500} lh={1.5} c="gray.7" truncate="end" lineClamp={1}>{item.email ?? "-"}</Text>
                    </TableTd>
                    <TableTd>
                      <Select
                        placeholder="Pilih role"
                        data={roleOptions}
                        value={item.roleId}
                        onChange={(val) => { if (val) handleRoleChange(item.id, item.username, item.roleId, val); }}
                        searchable
                        clearable={false}
                        nothingFoundMessage="Role tidak ditemukan"
                        disabled={stateUser.update.loading}
                        styles={{ input: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 } }}
                      />
                    </TableTd>
                    <TableTd>
                      <Tooltip label={item.isActive ? "Nonaktifkan user" : "Aktifkan user"} withArrow>
                        <Button
                          variant="light"
                          color={item.isActive ? "green" : "red"}
                          onClick={() => handleToggleActive(item.id, item.isActive)}
                          disabled={stateUser.update.loading}
                          size="compact-sm"
                        >
                          {item.isActive ? <IconCheck size={18} /> : <IconX size={18} />}
                        </Button>
                      </Tooltip>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color='red'
                        disabled={stateUser.deleteUser.loading}
                        onClick={() => { setSelectedId(item.id); setModalHapus(true); }}
                        size="compact-sm"
                      >
                        <IconTrash size={18} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={{ base: 'sm', md: 'md' }}>
                      <Text c="gray.6" fz="sm" lh={1.5}>Tidak ada data admin yang cocok</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card View */}
        <Box hiddenFrom="md">
          <Stack gap="md">
            {rows.length > 0 ? (
              rows.map((item) => (
                <Paper key={item.id} withBorder p="md" radius="md">
                  <Stack gap="xs">
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>Nama User</Text>
                      <Text fz="sm" fw={500} lh={1.5}>{item.username}</Text>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>Email</Text>
                      <Text fz="sm" fw={500} lh={1.5} c="gray.7" style={{ wordBreak: 'break-all' }}>{item.email ?? "-"}</Text>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>Role</Text>
                      <Select
                        placeholder="Pilih role"
                        data={roleOptions}
                        value={item.roleId}
                        onChange={(val) => { if (val) handleRoleChange(item.id, item.username, item.roleId, val); }}
                        searchable
                        clearable={false}
                        nothingFoundMessage="Role tidak ditemukan"
                        disabled={stateUser.update.loading}
                        size="xs"
                        styles={{ input: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5 } }}
                      />
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>Aktif / Nonaktif</Text>
                      <Tooltip label={item.isActive ? "Nonaktifkan user" : "Aktifkan user"} withArrow>
                        <Button
                          variant="light"
                          color={item.isActive ? "green" : "red"}
                          onClick={() => handleToggleActive(item.id, item.isActive)}
                          disabled={stateUser.update.loading}
                          size="compact-xs"
                        >
                          {item.isActive ? <IconCheck size={16} /> : <IconX size={16} />}
                        </Button>
                      </Tooltip>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>Hapus</Text>
                      <Button
                        variant="light"
                        color='red'
                        disabled={stateUser.deleteUser.loading}
                        onClick={() => { setSelectedId(item.id); setModalHapus(true); }}
                        size="compact-xs"
                      >
                        <IconTrash size={16} />
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="sm">
                <Text c="gray.6" fz="sm" lh={1.5}>Tidak ada data admin yang cocok</Text>
              </Center>
            )}
          </Stack>
        </Box>
      </Paper>

      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => { reload(newPage); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          total={totalPages}
          mt="md"
          mb={{ base: 'sm', md: 'md' }}
          color="blue"
          radius="md"
        />
      </Center>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text='Apakah anda yakin ingin menghapus user ini?'
      />
    </Box>
  );
}
