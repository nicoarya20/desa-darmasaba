'use client'

import { Button, Loader, Stack, Text } from '@mantine/core'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { MENU_TREE, errorText, fetchPublicMenuIds, savePublicMenuIds } from '../_lib/menu-access.api'
import { menuIdsFromSelection, selectionFromMenuIds, type Selection } from '../_lib/menu-tree.logic'
import { MenuAccessTree } from './MenuAccessTree'

/** Tab "Publik": menu admin yang terbuka untuk semua admin, di atas akses per user/role. */
export function PublicMenuTab() {
  const [selected, setSelected] = useState<Selection | null>(null)

  useEffect(() => {
    fetchPublicMenuIds()
      .then((ids) => setSelected(selectionFromMenuIds(MENU_TREE, ids)))
      .catch((error) => {
        toast.error(`Gagal memuat menu publik: ${errorText(error)}`)
        setSelected(new Set())
      })
  }, [])

  const handleSave = async () => {
    if (!selected) return
    try {
      await savePublicMenuIds(menuIdsFromSelection(MENU_TREE, selected))
      toast.success('Menu publik berhasil disimpan')
    } catch (error) {
      toast.error(`Gagal menyimpan menu publik: ${errorText(error)}`)
    }
  }

  if (!selected) return <Loader size="sm" />

  return (
    <Stack gap="lg">
      <Text size="sm" c="dimmed">
        Menu yang dicentang terbuka untuk <b>semua admin</b>, ditambahkan ke menu per user atau
        menu bawaan role masing-masing. Menu Publik tidak pernah mengurangi akses siapa pun.
      </Text>
      <MenuAccessTree tree={MENU_TREE} selected={selected} onChange={setSelected} />
      <Button onClick={handleSave} mt="md" w="fit-content">
        Simpan
      </Button>
    </Stack>
  )
}
