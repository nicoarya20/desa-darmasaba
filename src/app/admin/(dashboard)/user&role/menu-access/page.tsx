/* eslint-disable react-hooks/exhaustive-deps */
// src/app/admin/user&role/menu-access/page.tsx

'use client'

import { navBar } from '@/app/admin/_com/list_PageAdmin'
import { Button, Checkbox, Group, Paper, Select, Stack, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'
import { useProxy } from 'valtio/utils'
import user from '../../_state/user/user-state'
import { useShallowEffect } from '@mantine/hooks'


// Menu-access hanya relevan untuk akun admin (role 0-4). Warga publik (role "5",
// login Google) diarahkan ke /profile tanpa menu dashboard, jadi tidak perlu
// muncul di sini.
const ADMIN_ROLE_IDS = ["0", "1", "2", "3", "4"];

// ✅ Helper: ekstrak semua menu ID dari struktur navBar
const extractMenuIds = (navSections: typeof navBar) => {
  return navSections.map(section => ({
    value: section.id,      // "Landing Page", "Kesehatan", dll
    label: section.name     // "Landing Page", "Kesehatan", dll
  }));
};

function MenuAccessPage() {
  const stateUser = useProxy(user.userState)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [userMenus, setUserMenus] = useState<string[]>([])

  useShallowEffect(() => {
    stateUser.findMany.load()
  }, [])

  // ✅ Gunakan helper untuk ekstrak menu
  const availableMenus = extractMenuIds(navBar);

  // Ambil data menu akses user
  const loadUserMenuAccess = async () => {
    if (!selectedUserId) return

    try {
      // ✅ Perbaiki URL: gunakan query string bukan dynamic route
      const res = await fetch(`/api/admin/user-menu-access?userId=${selectedUserId}`)
      const data = await res.json()

      if (data.success) {
        setUserMenus(data.menuIds || [])
      }
    } catch (error) {
      console.error('Gagal memuat menu akses:', error)
    }
  }

  useEffect(() => {
    if (selectedUserId) {
      loadUserMenuAccess()
    }
  }, [selectedUserId])

  const handleToggleMenu = (menuId: string) => {
    setUserMenus(prev => 
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  const handleSave = async () => {
    if (!selectedUserId) return

    try {
      const res = await fetch('/api/admin/user-menu-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, menuIds: userMenus }),
      })

      const data = await res.json()
      if (data.success) {
        alert('Menu akses berhasil disimpan')
      }
    } catch (error) {
      console.error('Gagal menyimpan menu akses:', error)
      alert('Terjadi kesalahan')
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
              <Stack>
                {availableMenus.map(menu => (
                  <Checkbox
                    key={menu.value}
                    label={menu.label}
                    checked={userMenus.includes(menu.value)}
                    onChange={() => handleToggleMenu(menu.value)}
                  />
                ))}
              </Stack>

              <Button onClick={handleSave} mt="md">
                Simpan Perubahan
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  )
}

export default MenuAccessPage