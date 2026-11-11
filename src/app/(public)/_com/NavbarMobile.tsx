"use client";

import stateNav from "@/state/state-nav";
import { Burger, Image } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import { MenuItem } from "../../../../types/menu-item";
import { isMenuActive, isPathActive } from "./navbar-menu.logic";
import m from "./navbar-mobile.module.css";
import d from "./navbar.module.css";

const PANEL_ID = "darmasaba-nav-mobile";

const revealStyle = (index: number) => ({ "--i": index }) as CSSProperties;

/** Navbar mobile gaya apple.com: panel kaca berisi menu utama; submenu dibuka per menu (drill-down). */
export function NavbarMobile({ listNavbar }: { listNavbar: MenuItem[] }) {
  const { mobileOpen } = useSnapshot(stateNav);
  const pathname = usePathname();
  const levelRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  // `openCount` mengganti key level saat panel dibuka lagi, supaya animasi reveal diputar ulang.
  const [openCount, setOpenCount] = useState(0);
  const [prevOpen, setPrevOpen] = useState(mobileOpen);
  if (mobileOpen !== prevOpen) {
    setPrevOpen(mobileOpen);
    if (mobileOpen) {
      setOpenCount((n) => n + 1);
      setActiveId(null);
      setDirection("forward");
    }
  }

  const activeMenu = listNavbar.find((item) => item.id === activeId) ?? null;
  const close = () => {
    stateNav.mobileOpen = false;
  };
  const goTo = (id: string | null) => {
    setDirection(id ? "forward" : "back");
    setActiveId(id);
  };

  // Tutup panel setiap kali route berganti.
  useEffect(() => {
    stateNav.mobileOpen = false;
  }, [pathname]);

  // Kunci scroll halaman & dengarkan Escape selama panel terbuka.
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") stateNav.mobileOpen = false;
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  // Setelah pindah level, fokus ke elemen pertama level baru (navigasi keyboard / screen reader).
  const hasNavigated = useRef(false);
  useEffect(() => {
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      return;
    }
    levelRef.current?.querySelector<HTMLElement>("button, a")?.focus({ preventScroll: true });
  }, [activeId]);

  return (
    <div className={`${d.root} ${m.mobile}`} data-open={mobileOpen}>
      <div className={m.bar}>
        <Link href="/" aria-label="Beranda Desa Darmasaba" onClick={close}>
          <Image src="/assets/images/darmasaba-icon.png" alt="" className={m.logo} />
        </Link>
        <Burger
          opened={mobileOpen}
          onClick={() => (stateNav.mobileOpen = !stateNav.mobileOpen)}
          color="var(--nav-accent)"
          size="sm"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
          aria-controls={PANEL_ID}
        />
      </div>

      <nav id={PANEL_ID} className={m.panel} aria-label="Menu utama" inert={!mobileOpen}>
        <div
          key={`${openCount}-${activeId ?? "root"}`}
          ref={levelRef}
          className={m.level}
          data-direction={direction}
        >
          {activeMenu ? (
            <>
              <button type="button" className={`${m.back} ${m.reveal}`} onClick={() => goTo(null)}>
                <IconChevronLeft size={18} stroke={1.75} />
                Kembali
              </button>
              <p className={`${m.label} ${m.reveal}`} style={revealStyle(1)}>
                {activeMenu.name}
              </p>
              <ul className={m.list}>
                {(activeMenu.children ?? []).map((child, index) =>
                  child.href ? (
                    <li key={child.id} className={m.reveal} style={revealStyle(index + 2)}>
                      <Link
                        href={child.href}
                        className={m.item}
                        data-active={isPathActive(pathname, child.href)}
                        onClick={close}
                      >
                        {child.name}
                      </Link>
                    </li>
                  ) : null,
                )}
              </ul>
            </>
          ) : (
            <ul className={m.list}>
              {listNavbar.map((item, index) => (
                <li key={item.id} className={m.reveal} style={revealStyle(index)}>
                  {item.children?.length ? (
                    <button
                      type="button"
                      className={m.item}
                      data-active={isMenuActive(item, pathname)}
                      onClick={() => goTo(item.id)}
                    >
                      {item.name}
                      <IconChevronRight className={m.chevron} size={22} stroke={1.75} />
                    </button>
                  ) : item.href ? (
                    <Link
                      href={item.href}
                      className={m.item}
                      data-active={isMenuActive(item, pathname)}
                      onClick={close}
                    >
                      {item.name}
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
    </div>
  );
}
