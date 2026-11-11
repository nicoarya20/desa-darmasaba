'use client';
import { Alert, Button, Center, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useSnapshot } from 'valtio';
import { authStore } from '@/store/authStore';
import { canManageMenuVisibility } from '@/lib/auth-policy';
import { menuVisibilityGroups, type MenuVisibilityItem } from '@/app/(public)/_com/menu-visibility.logic';
import menuVisibilityState from '../../_state/pengaturan/menu-visibility-state';
import { MenuVisibilityGroupCard } from './_com/MenuVisibilityGroupCard';

const RESET_ALL_KEY = '*';

/** Pengaturan tampil/sembunyi submenu website publik — khusus Super Admin & Developer. */
export default function VisibilitasMenuPage() {
  const { user } = useSnapshot(authStore);
  const allowed = canManageMenuVisibility(user?.roleId);

  if (!allowed) {
    // API update tetap menolak (403); ini hanya supaya role lain tidak melihat halaman kosong.
    return (
      <Alert color="red" title="Akses ditolak" m="md">
        Halaman ini hanya untuk Super Admin dan Developer.
      </Alert>
    );
  }
  return <VisibilitasMenuSettings />;
}

function VisibilitasMenuSettings() {
  const snap = useSnapshot(menuVisibilityState);

  useShallowEffect(() => {
    void menuVisibilityState.load();
  }, []);

  const groups = menuVisibilityGroups(snap.overrides);
  const overriddenKeys = Object.keys(snap.overrides);

  // Kembali ke nilai default = hapus override (null), supaya "Default" tetap mengikuti config.
  const handleToggle = (item: MenuVisibilityItem, visible: boolean) => {
    const isVisible = visible === item.defaultVisible ? null : visible;
    void menuVisibilityState.save([{ menuKey: item.menuKey, isVisible }], item.menuKey);
  };

  const handleResetAll = () => {
    const changes = overriddenKeys.map((menuKey) => ({ menuKey, isVisible: null }));
    void menuVisibilityState.save(changes, RESET_ALL_KEY);
  };

  return (
    <Stack p="md" gap="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Title order={3}>Visibilitas Menu Website</Title>
          <Text fz="sm" c="dimmed">
            Submenu yang disembunyikan hilang dari navbar, pencarian, dan Peta Informasi, dan
            halamannya menampilkan 404 bagi pengunjung. Data tetap bisa dikelola di admin.
          </Text>
        </Stack>
        <Button
          variant="light"
          disabled={overriddenKeys.length === 0 || snap.savingKey !== null}
          loading={snap.savingKey === RESET_ALL_KEY}
          onClick={handleResetAll}
        >
          Kembalikan semua ke default
        </Button>
      </Group>
      {snap.loading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {groups.map((group) => (
            <MenuVisibilityGroupCard
              key={group.id}
              group={group}
              savingKey={snap.savingKey}
              onToggle={handleToggle}
            />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
