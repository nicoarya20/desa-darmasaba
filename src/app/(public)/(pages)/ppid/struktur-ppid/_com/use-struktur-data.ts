'use client'
import stateStrukturPPID from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID'
import { useDebouncedValue } from '@mantine/hooks'
import { useEffect, useMemo, useState } from 'react'
import { useProxy } from 'valtio/utils'
import { buildOrgTree, filterOrgTree, type PegawaiItem, type PosisiItem } from './struktur.logic'
import { STRUKTUR_PEGAWAI_LIMIT, STRUKTUR_SEARCH_DEBOUNCE } from './struktur.meta'

/**
 * Data bagan struktur organisasi: memuat pegawai aktif + daftar jabatan sekali, menyusun pohon, dan menyaring
 * dengan kata kunci (debounce). Dipakai Struktur PPID dan Struktur Perangkat Desa — sumber datanya sama.
 */
export function useStrukturData() {
  const pegawaiState = useProxy(stateStrukturPPID.pegawai)
  const posisiState = useProxy(stateStrukturPPID.posisiOrganisasi)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [query] = useDebouncedValue(search, STRUKTUR_SEARCH_DEBOUNCE)

  const reload = async () => {
    setLoading(true)
    // Kedua loader menangkap galatnya sendiri (data jadi kosong) — allSettled hanya menunggu keduanya selesai.
    await Promise.allSettled([
      pegawaiState.findMany.load(1, STRUKTUR_PEGAWAI_LIMIT),
      // Daftar jabatan dipakai untuk menggambar jabatan induk yang belum punya pegawai.
      posisiState.findManyAll.load(),
    ])
    setLoading(false)
  }

  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- muat sekali saat bagan dibuka; state proxy stabil
  }, [])

  const pegawai = pegawaiState.findMany.data
  const posisi = posisiState.findManyAll.data
  const tree = useMemo(
    () => buildOrgTree((pegawai ?? []) as PegawaiItem[], (posisi ?? []) as PosisiItem[]),
    [pegawai, posisi],
  )
  const visible = useMemo(() => filterOrgTree(tree, query), [tree, query])

  return { loading, tree, visible, search, setSearch, query, reload }
}

export type StrukturData = ReturnType<typeof useStrukturData>
