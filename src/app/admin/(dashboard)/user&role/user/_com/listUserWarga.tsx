'use client'
import colors from '@/con/colors';
import { Avatar, Box, Button, Center, Group, Pagination, Paper, Select, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import user from '../../../_state/user/user-state';

// Role admin yang bisa diberikan ke warga saat ACC (0=DEVELOPER & 1=SUPER ADMIN
// dikunci — hanya via seed/DB). Mengubah role warga → admin membuat mereka bisa
// akses dashboard admin (proxy mengarahkan role >4 ke /profile).
const ASSIGNABLE_ROLE_IDS = ["2", "3", "4"];

// Daftar warga publik (role 5, hasil login Google). Super admin bisa meng-ACC
// warga menjadi admin dengan memilih role. Data difilter server-side (roleGroup="warga").
export default function ListUserWarga({ search }: { search: string }) {
  const stateUser = useProxy(user.userState);
  const stateRole = useProxy(user.roleState);
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  const { data, page, totalPages, loading } = stateUser.warga;

  const reload = (p = page) => stateUser.warga.load(p, 10, debouncedSearch);

  useShallowEffect(() => {
    stateRole.findMany.load();
    stateUser.warga.load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const handlePromote = async (userId: string, username: string, newRoleId: string) => {
    const roleName = stateRole.findMany.data.find((r) => r.id === newRoleId)?.name || newRoleId;

    const confirmed = window.confirm(
      `Jadikan "${username}" sebagai ${roleName}?\n\n` +
      `• User akan bisa mengakses dashboard admin\n` +
      `• User akan logout otomatis & perlu login ulang`
    );
    if (!confirmed) return;

    setPromotingId(userId);
    const success = await stateUser.update.submit({ id: userId, roleId: newRoleId });
    setPromotingId(null);

    // Warga yang dipromosikan keluar dari daftar warga → reload agar hilang dari tab ini.
    if (success) reload();
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
          <Title order={4} lh={1.2}>Daftar Warga (Login Google)</Title>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table highlightOnHover miw={0} style={{ tableLayout: 'fixed', width: '100%' }}>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '35%' }}><Text fz="xs" fw={600} lh={1.4} ta="left">Nama</Text></TableTh>
                <TableTh style={{ width: '35%' }}><Text fz="xs" fw={600} lh={1.4} ta="left">Email</Text></TableTh>
                <TableTh style={{ width: '30%' }}><Text fz="xs" fw={600} lh={1.4} ta="left">Jadikan Admin</Text></TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {rows.length > 0 ? (
                rows.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Group gap="xs" wrap="nowrap">
                        <Avatar src={item.avatarUrl} size="sm" radius="xl" />
                        <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>{item.username}</Text>
                      </Group>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" fw={500} lh={1.5} c="gray.7" truncate="end" lineClamp={1}>{item.email ?? "-"}</Text>
                    </TableTd>
                    <TableTd>
                      <Select
                        placeholder="Pilih role admin"
                        data={roleOptions}
                        value={null}
                        onChange={(val) => { if (val) handlePromote(item.id, item.username, val); }}
                        searchable
                        clearable={false}
                        nothingFoundMessage="Role tidak ditemukan"
                        disabled={stateUser.update.loading && promotingId === item.id}
                        styles={{ input: { fontSize: '0.95rem', fontWeight: 500 } }}
                      />
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={{ base: 'sm', md: 'md' }}>
                      <Text c="gray.6" fz="sm" lh={1.5}>Belum ada warga yang login Google</Text>
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
                    <Group gap="xs" wrap="nowrap">
                      <Avatar src={item.avatarUrl} size="md" radius="xl" />
                      <Box style={{ minWidth: 0 }}>
                        <Text fz="sm" fw={500} lh={1.4} truncate="end" lineClamp={1}>{item.username}</Text>
                        <Text fz="xs" c="gray.7" style={{ wordBreak: 'break-all' }}>{item.email ?? "-"}</Text>
                      </Box>
                    </Group>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4} mb={4}>Jadikan Admin</Text>
                      <Select
                        placeholder="Pilih role admin"
                        data={roleOptions}
                        value={null}
                        onChange={(val) => { if (val) handlePromote(item.id, item.username, val); }}
                        searchable
                        clearable={false}
                        nothingFoundMessage="Role tidak ditemukan"
                        disabled={stateUser.update.loading && promotingId === item.id}
                        size="xs"
                      />
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="sm">
                <Text c="gray.6" fz="sm" lh={1.5}>Belum ada warga yang login Google</Text>
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
    </Box>
  );
}
