'use client'
import { useDebouncedValue } from '@mantine/hooks'
import { useEffect, useMemo, useState } from 'react'
import { buildOrgTree, filterOrgTree, type PegawaiItem, type PosisiItem } from './struktur.logic'
import { STRUKTUR_SEARCH_DEBOUNCE } from './struktur.meta'

/**
 * Sumber data bagan. Tiap struktur (PPID, Perangkat Desa, …) menyediakan adapternya sendiri; bagan tidak tahu
 * API/state mana yang dipakai. Loader yang gagal boleh melempar galat — bagan menampilkannya sebagai data kosong.
 */
export type StrukturSource = {
  /** Pegawai (aktif & nonaktif; bagan hanya menggambar yang aktif). */
  loadPegawai(): Promise<PegawaiItem[]>
  /** Daftar jabatan — dipakai untuk menggambar jabatan induk yang belum punya pegawai. */
  loadPosisi(): Promise<PosisiItem[]>
}

function settledOr<T>(result: PromiseSettledResult<T[]>, what: string): T[] {
  if (result.status === 'fulfilled') return result.value
  console.error(`Gagal memuat ${what} untuk bagan struktur:`, result.reason)
  return []
}

/**
 * Data bagan struktur organisasi: memuat pegawai + daftar jabatan dari `source` sekali, menyusun pohon, dan
 * menyaring dengan kata kunci (debounce). `source` harus stabil (konstanta modul) — dimuat hanya saat mount.
 */
export function useStrukturData(source: StrukturSource) {
  const [pegawai, setPegawai] = useState<PegawaiItem[]>([])
  const [posisi, setPosisi] = useState<PosisiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [query] = useDebouncedValue(search, STRUKTUR_SEARCH_DEBOUNCE)

  const reload = async () => {
    setLoading(true)
    const [pegawaiResult, posisiResult] = await Promise.allSettled([source.loadPegawai(), source.loadPosisi()])
    setPegawai(settledOr(pegawaiResult, 'pegawai'))
    setPosisi(settledOr(posisiResult, 'jabatan'))
    setLoading(false)
  }

  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- muat sekali saat bagan dibuka; source = konstanta modul
  }, [])

  const tree = useMemo(() => buildOrgTree(pegawai, posisi), [pegawai, posisi])
  const visible = useMemo(() => filterOrgTree(tree, query), [tree, query])

  return { loading, tree, visible, search, setSearch, query, reload }
}

export type StrukturData = ReturnType<typeof useStrukturData>
