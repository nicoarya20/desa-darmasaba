'use client'

import { canManageMenuAccess } from '@/lib/auth-policy'
import { authStore } from '@/store/authStore'
import { Alert, Paper, Stack, Tabs, Title } from '@mantine/core'
import { useSnapshot } from 'valtio'
import { PerUserMenuTab } from './_com/PerUserMenuTab'
import { PublicMenuTab } from './_com/PublicMenuTab'

/** Menu Access admin: tab Per User (batasi menu satu user) & Publik (menu untuk semua admin). */
export default function MenuAccessPage() {
  const { user } = useSnapshot(authStore)

  if (!canManageMenuAccess(user?.roleId)) {
    // API tetap menolak (403); ini hanya supaya role lain tidak melihat halaman kosong.
    return (
      <Alert color="red" title="Akses ditolak" m="md">
        Halaman ini hanya untuk Super Admin dan Developer.
      </Alert>
    )
  }

  return (
    <Stack>
      <Title order={2}>Menu Access</Title>
      <Paper p="xl" shadow="md" radius="md">
        <Tabs defaultValue="per-user" keepMounted={false}>
          <Tabs.List mb="lg">
            <Tabs.Tab value="per-user">Per User</Tabs.Tab>
            <Tabs.Tab value="publik">Publik</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="per-user">
            <PerUserMenuTab />
          </Tabs.Panel>
          <Tabs.Panel value="publik">
            <PublicMenuTab />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Stack>
  )
}
