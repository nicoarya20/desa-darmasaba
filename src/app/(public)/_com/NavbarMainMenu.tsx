'use client'

import { authStore } from "@/store/authStore"
import { Image, Tooltip } from "@mantine/core"
import { IconSearch, IconUserCog } from "@tabler/icons-react"
import { Link } from "next-view-transitions"
import { useSnapshot } from "valtio"
import { MenuItem } from "../../../../types/menu-item"
import { NavbarFlyout } from "./NavbarFlyout"
import { isAdminRole, isMenuActive } from "./navbar-menu.logic"
import s from "./navbar.module.css"
import { SEARCH_VIEW_ID, useNavbarFlyout } from "./useNavbarFlyout"

const FLYOUT_ID = "darmasaba-nav-flyout"
const ADMIN_HOME = "/admin/landing-page/profile/program-inovasi"

/** Navbar desktop gaya apple.com: hover menu → flyout mengembang, teks reveal, halaman di-blur. */
export function NavbarMainMenu({ listNavbar }: { listNavbar: MenuItem[] }) {
  const { user } = useSnapshot(authStore)
  const nav = useNavbarFlyout(listNavbar)

  return (
    <div className={s.root}>
      <div className={s.overlay} data-open={nav.open} onClick={nav.close} aria-hidden />
      <header
        ref={nav.headerRef}
        className={s.header}
        data-open={nav.open}
        onMouseEnter={nav.onHeaderEnter}
        onMouseLeave={nav.onHeaderLeave}
      >
        <nav className={s.bar} aria-label="Menu utama">
          <div className={s.barInner}>
            <Tooltip label="Kembali ke Beranda" position="bottom" withArrow>
              <Link
                href="/"
                className={s.barItem}
                aria-label="Beranda Desa Darmasaba"
                onMouseEnter={() => !nav.isSearch && nav.close()}
              >
                <Image src="/assets/images/darmasaba-icon.png" alt="" className={s.logo} />
              </Link>
            </Tooltip>

            {listNavbar.map((item) =>
              item.children?.length ? (
                <button
                  key={item.id}
                  type="button"
                  className={s.barItem}
                  data-menu-id={item.id}
                  data-active={isMenuActive(item, nav.pathname)}
                  aria-expanded={nav.openMenuId === item.id}
                  aria-controls={FLYOUT_ID}
                  onMouseEnter={() => nav.onItemEnter(item)}
                  onMouseLeave={nav.onItemLeave}
                  onClick={(event) => nav.onItemClick(item, event.detail === 0)}
                >
                  {item.name}
                </button>
              ) : item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className={s.barItem}
                  data-active={isMenuActive(item, nav.pathname)}
                  onMouseEnter={() => nav.onItemEnter(item)}
                >
                  {item.name}
                </Link>
              ) : null,
            )}

            <Tooltip label="Cari Konten" position="bottom" withArrow>
              <button
                type="button"
                className={s.barItem}
                data-menu-id={SEARCH_VIEW_ID}
                aria-label="Cari konten"
                aria-expanded={nav.isSearch}
                aria-controls={FLYOUT_ID}
                onClick={nav.toggleSearch}
              >
                <IconSearch size={18} stroke={1.75} />
              </button>
            </Tooltip>

            {isAdminRole(user?.roleId) && (
              <Tooltip label="Kembali ke Admin" position="bottom" withArrow>
                <Link href={ADMIN_HOME} className={s.barItem} aria-label="Kembali ke Admin">
                  <IconUserCog size={20} stroke={1.75} />
                </Link>
              </Tooltip>
            )}
          </div>
        </nav>

        <NavbarFlyout
          id={FLYOUT_ID}
          open={nav.open}
          view={nav.view}
          pathname={nav.pathname}
          panelRef={nav.panelRef}
        />
      </header>
    </div>
  )
}
