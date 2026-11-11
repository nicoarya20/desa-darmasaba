'use client'

import stateNav from "@/state/state-nav"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useSnapshot } from "valtio"
import { MenuItem } from "../../../../types/menu-item"
import type { FlyoutView } from "./NavbarFlyout"

/** Hover intent: flyout baru dibuka bila cursor diam sejenak, bukan sekadar melintas. */
const OPEN_DELAY_MS = 100
/** Toleransi cursor keluar sesaat dari area navbar sebelum flyout ditutup. */
const CLOSE_DELAY_MS = 120
/** id view & `data-menu-id` tombol cari. */
export const SEARCH_VIEW_ID = "search"

/** State + interaksi flyout navbar desktop (hover intent, klik/keyboard, Escape, ganti route). */
export function useNavbarFlyout(listNavbar: MenuItem[]) {
  const { openMenuId, isSearch } = useSnapshot(stateNav)
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focusPanelOnOpen = useRef(false)

  const open = openMenuId !== null || isSearch
  const viewId = isSearch ? SEARCH_VIEW_ID : openMenuId

  // View terakhir dipertahankan saat menutup agar isi tetap ada selama animasi keluar.
  // `key` naik setiap kali view dibuka/diganti sehingga animasi reveal diputar ulang.
  const [view, setView] = useState<FlyoutView | null>(null)
  const [prevViewId, setPrevViewId] = useState<string | null>(null)
  if (viewId !== prevViewId) {
    setPrevViewId(viewId)
    const key = (view?.key ?? 0) + 1
    const menu = listNavbar.find((m) => m.id === viewId)
    if (viewId === SEARCH_VIEW_ID) setView({ kind: "search", key })
    else if (menu) setView({ kind: "menu", menu, key })
  }

  const cancelTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    openTimer.current = null
    closeTimer.current = null
  }

  const openMenu = (id: string) => {
    stateNav.isSearch = false
    stateNav.openMenuId = id
  }

  /** Cursor masuk ke item menu utama. Pencarian tidak terpengaruh hover (dibuka/tutup lewat klik). */
  const onItemEnter = (item: MenuItem) => {
    if (stateNav.isSearch) return
    cancelTimers()
    if (!item.children?.length) {
      stateNav.clear()
      return
    }
    if (stateNav.openMenuId) openMenu(item.id)
    else openTimer.current = setTimeout(() => openMenu(item.id), OPEN_DELAY_MS)
  }

  const onItemLeave = () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    openTimer.current = null
  }

  const onHeaderEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
  }

  const onHeaderLeave = () => {
    cancelTimers()
    if (stateNav.isSearch || !stateNav.openMenuId) return
    closeTimer.current = setTimeout(() => stateNav.clear(), CLOSE_DELAY_MS)
  }

  /** Klik (mouse/sentuh) atau Enter/Space (keyboard, `detail === 0`) pada menu utama. */
  const onItemClick = (item: MenuItem, viaKeyboard: boolean) => {
    cancelTimers()
    if (stateNav.openMenuId === item.id) {
      stateNav.clear()
      return
    }
    focusPanelOnOpen.current = viaKeyboard
    openMenu(item.id)
  }

  const toggleSearch = () => {
    cancelTimers()
    if (stateNav.isSearch) {
      stateNav.clear()
      return
    }
    focusPanelOnOpen.current = true
    stateNav.openMenuId = null
    stateNav.isSearch = true
  }

  const close = () => {
    cancelTimers()
    stateNav.clear()
  }

  // Tutup flyout setiap kali route berganti.
  useEffect(() => {
    stateNav.clear()
  }, [pathname])

  // Bersihkan timer saat komponen dilepas.
  useEffect(() => cancelTimers, [])

  // Fokus ke elemen pertama di panel bila dibuka lewat keyboard / tombol cari.
  useEffect(() => {
    if (!open || !focusPanelOnOpen.current) return
    focusPanelOnOpen.current = false
    panelRef.current?.querySelector<HTMLElement>("a, input")?.focus()
  }, [open, view?.key])

  // Escape menutup flyout dan mengembalikan fokus ke tombol pemicunya.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      const triggerId = stateNav.isSearch ? SEARCH_VIEW_ID : stateNav.openMenuId
      const trigger = headerRef.current?.querySelector<HTMLElement>(`[data-menu-id="${triggerId}"]`)
      const focusInside = headerRef.current?.contains(document.activeElement)
      stateNav.clear()
      if (focusInside) trigger?.focus()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  return {
    open, openMenuId, isSearch, view, pathname, headerRef, panelRef,
    onItemEnter, onItemLeave, onHeaderEnter, onHeaderLeave, onItemClick, toggleSearch, close,
  }
}
