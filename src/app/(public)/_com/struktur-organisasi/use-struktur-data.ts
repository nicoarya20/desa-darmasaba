'use client'
import { useDebouncedValue } from '@mantine/hooks'
import { useEffect, useMemo, useState } from 'react'
import { buildOrgTree, filterOrgTree, type OrgTreeOptions, type PegawaiItem, type PosisiItem } from './struktur.logic'
import { STRUKTUR_SEARCH_DEBOUNCE } from './struktur.meta'

/**
 * Sumber data bagan. Tiap struktur (PPID, Perangkat Desa, …) menyediakan adapternya sendiri; bagan tidak tahu
 * API/state mana yang dipakai. Loader yang gagal boleh melempar galat: datanya dibaca sebagai daftar kosong dan
 * `failed` di hasil `useStrukturData` menjadi `true` (pemakai memilih tampil galat atau perlakukan sebagai kosong).
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
 * `options` diteruskan ke `buildOrgTree` (mis. `showVacant` BUMDes). `failed` = salah satu loader melempar galat
 * (datanya tetap dibaca sebagai daftar kosong), agar halaman bisa membedakan galat dari data yang memang kosong.
 */
export function useStrukturData(source: StrukturSource, options: OrgTreeOptions = {}) {
  const [pegawai, setPegawai] = useState<PegawaiItem[]>([])
  const [posisi, setPosisi] = useState<PosisiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [search, setSearch] = useState('')
  const [query] = useDebouncedValue(search, STRUKTUR_SEARCH_DEBOUNCE)

  const reload = async () => {
    setLoading(true)
    const [pegawaiResult, posisiResult] = await Promise.allSettled([source.loadPegawai(), source.loadPosisi()])
    setPegawai(settledOr(pegawaiResult, 'pegawai'))
    setPosisi(settledOr(posisiResult, 'jabatan'))
    setFailed(pegawaiResult.status === 'rejected' || posisiResult.status === 'rejected')
    setLoading(false)
  }

  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- muat sekali saat bagan dibuka; source = konstanta modul
  }, [])

  const { showVacant } = options
  const tree = useMemo(() => buildOrgTree(pegawai, posisi, { showVacant }), [pegawai, posisi, showVacant])
  const visible = useMemo(() => filterOrgTree(tree, query), [tree, query])

  return { loading, failed, tree, visible, search, setSearch, query, reload }
}

export type StrukturData = ReturnType<typeof useStrukturData>
