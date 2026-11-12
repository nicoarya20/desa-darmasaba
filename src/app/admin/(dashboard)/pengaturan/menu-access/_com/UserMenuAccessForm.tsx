'use client'

import { Button, Group, Select, Stack, Text } from '@mantine/core'
import { useShallowEffect } from '@mantine/hooks'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useProxy } from 'valtio/utils'
import user from '../../../_state/user/user-state'
import { MENU_TREE, errorText, fetchUserMenuIds, saveUserMenuIds } from '../_lib/menu-access.api'
import { menuIdsFromSelection, selectionFromMenuIds, type Selection } from '../_lib/menu-tree.logic'
import { MenuAccessTree } from './MenuAccessTree'

// Menu-access hanya relevan untuk akun admin (role 0-4). Warga publik (role "5",
// login Google) diarahkan ke /profile tanpa menu dashboard, jadi tidak perlu muncul di sini.
const ADMIN_ROLE_IDS = ['0', '1', '2', '3', '4']

/** Form Menu Access: pilih user admin lalu atur menu yang bisa ia akses. */
export function UserMenuAccessForm() {
  const stateUser = useProxy(user.userState)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Selection>(new Set())

  useShallowEffect(() => {
    stateUser.findMany.load()
  }, [])

  useEffect(() => {
    if (!selectedUserId) return
    // Abaikan respons user sebelumnya bila pilihan sudah berganti (hindari timpa data).
    let active = true
    setSelected(new Set())
    fetchUserMenuIds(selectedUserId)
      .then((ids) => active && setSelected(selectionFromMenuIds(MENU_TREE, ids)))
      .catch((error) => toast.error(`Gagal memuat menu akses: ${errorText(error)}`))
    return () => {
      active = false
    }
  }, [selectedUserId])

  const handleSave = async () => {
    if (!selectedUserId) return
    try {
      await saveUserMenuIds(selectedUserId, menuIdsFromSelection(MENU_TREE, selected))
      toast.success('Menu akses berhasil disimpan')
    } catch (error) {
      toast.error(`Gagal menyimpan menu akses: ${errorText(error)}`)
    }
  }

  return (
    <Stack gap="lg">
      <Group>
        <Text fw={500}>Pilih User:</Text>
        <Select
          placeholder="Pilih user"
          searchable
          data={stateUser.findMany.data
            .filter((u) => ADMIN_ROLE_IDS.includes(u.roleId))
            .map((u) => ({ value: u.id, label: `${u.username} (${u.email ?? '-'})` }))}
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
          <Button onClick={handleSave} mt="md" w="fit-content">
            Simpan
          </Button>
        </>
      )}
    </Stack>
  )
}
