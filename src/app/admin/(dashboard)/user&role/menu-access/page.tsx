/* eslint-disable react-hooks/exhaustive-deps */
// src/app/admin/user&role/menu-access/page.tsx

'use client'

import { navBar } from '@/app/admin/_com/list_PageAdmin'
import { withoutRestrictedSections } from '@/app/admin/_com/nav/menu-access.logic'
import { Button, Group, Paper, Select, Stack, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useProxy } from 'valtio/utils'
import user from '../../_state/user/user-state'
import { useShallowEffect } from '@mantine/hooks'
import { MenuAccessTree } from './_com/MenuAccessTree'
import { menuIdsFromSelection, selectionFromMenuIds, type Selection } from './_lib/menu-tree.logic'


// Menu-access hanya relevan untuk akun admin (role 0-4). Warga publik (role "5",
// login Google) diarahkan ke /profile tanpa menu dashboard, jadi tidak perlu
// muncul di sini.
const ADMIN_ROLE_IDS = ["0", "1", "2", "3", "4"];

// User & Role dan Pengaturan khusus role 0/1 (otomatis di sidebar mereka), jadi tidak
// bisa diberikan lewat halaman ini.
const MENU_TREE = withoutRestrictedSections(navBar);

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

function MenuAccessPage() {
  const stateUser = useProxy(user.userState)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Selection>(new Set())

  useShallowEffect(() => {
    stateUser.findMany.load()
  }, [])

  // Ambil data menu akses user
  const loadUserMenuAccess = async (userId: string) => {
    setSelected(new Set())
    try {
      const res = await fetch(`/api/admin/user-menu-access?userId=${encodeURIComponent(userId)}`)
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || `HTTP ${res.status}`)
      setSelected(selectionFromMenuIds(MENU_TREE, data.menuIds || []))
    } catch (error) {
      toast.error(`Gagal memuat menu akses: ${errorText(error)}`)
    }
  }

  useEffect(() => {
    if (selectedUserId) {
      loadUserMenuAccess(selectedUserId)
    }
  }, [selectedUserId])

  const handleSave = async () => {
    if (!selectedUserId) return

    try {
      const res = await fetch('/api/admin/user-menu-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, menuIds: menuIdsFromSelection(MENU_TREE, selected) }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || `HTTP ${res.status}`)
      toast.success('Menu akses berhasil disimpan')
    } catch (error) {
      toast.error(`Gagal menyimpan menu akses: ${errorText(error)}`)
    }
  }

  return (
    <Stack>
      <Title order={2}>Tampilan Menu</Title>
      <Paper p="xl" shadow="md" radius="md">
        <Stack gap="lg">
          <Group>
            <Text fw={500}>Pilih User:</Text>
            <Select
              placeholder="Pilih user"
              data={stateUser.findMany.data
                .filter(u => ADMIN_ROLE_IDS.includes(u.roleId))
                .map(u => ({
                  value: u.id,
                  label: `${u.username} (${u.email ?? '-'})`,
                }))}
              value={selectedUserId}
              onChange={setSelectedUserId}
              w={300}
            />
          </Group>

          {selectedUserId && (
            <>
              <Text fw={500}>Menu yang Bisa Diakses:</Text>
              <Text size="sm" c="dimmed">
                Kosongkan semua untuk memakai menu bawaan role.
              </Text>
              <MenuAccessTree tree={MENU_TREE} selected={selected} onChange={setSelected} />

              <Button onClick={handleSave} mt="md">
                Simpan
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  )
}

export default MenuAccessPage
