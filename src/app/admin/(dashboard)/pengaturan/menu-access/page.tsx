'use client'

import { canManageMenuAccess } from '@/lib/auth-policy'
import { authStore } from '@/store/authStore'
import { Alert, Paper, Stack, Title } from '@mantine/core'
import { useSnapshot } from 'valtio'
import { UserMenuAccessForm } from './_com/UserMenuAccessForm'

/** Pengaturan → Menu Access: batasi menu admin per user (kosong = menu bawaan role). */
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
        <UserMenuAccessForm />
      </Paper>
    </Stack>
  )
}
