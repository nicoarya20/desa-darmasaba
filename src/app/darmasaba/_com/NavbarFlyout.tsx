"use client";

import stateNav from "@/state/state-nav";
import { Link } from "next-view-transitions";
import { CSSProperties, RefObject, useLayoutEffect, useRef, useState } from "react";
import { MenuItem } from "../../../../types/menu-item";
import { isPathActive } from "./navbar-menu.logic";
import { NavbarSearch } from "./NavBarSearch";
import s from "./navbar.module.css";

/** Isi yang ditampilkan flyout: submenu dari satu menu utama, atau panel pencarian. */
export type FlyoutView =
  | { kind: "menu"; menu: MenuItem; key: number }
  | { kind: "search"; key: number };

/** Panel flyout desktop: latar yang mengembang mengikuti tinggi isi + isi yang reveal bertahap. */
export function NavbarFlyout({
  id,
  open,
  view,
  pathname,
  panelRef,
}: {
  id: string;
  open: boolean;
  view: FlyoutView | null;
  pathname: string;
  panelRef: RefObject<HTMLDivElement | null>;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Ukur tinggi isi agar latar (clip-path) mengembang/menyusut tepat setinggi isi,
  // termasuk saat pindah menu dengan jumlah item berbeda.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setContentHeight(el.offsetHeight);
    const observer = new ResizeObserver(() => setContentHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, [view?.key]);

  const style = { "--flyout-h": `${open ? contentHeight : 0}px` } as CSSProperties;

  return (
    <div id={id} ref={panelRef} className={s.flyout} style={style} inert={!open}>
      <div className={s.flyoutBg} />
      {view && (
        <div key={view.key} ref={contentRef} className={s.flyoutContent}>
          {view.kind === "search" ? (
            <div className={s.reveal}>
              <NavbarSearch />
            </div>
          ) : (
            <FlyoutMenu menu={view.menu} pathname={pathname} />
          )}
        </div>
      )}
    </div>
  );
}

function FlyoutMenu({ menu, pathname }: { menu: MenuItem; pathname: string }) {
  // Item tanpa href (grup bersarang) belum dipakai di menu publik, jadi tidak dirender.
  const links = (menu.children ?? []).flatMap((child) =>
    child.href ? [{ id: child.id, name: child.name, href: child.href }] : [],
  );

  return (
    <nav aria-label={`Submenu ${menu.name}`}>
      <p className={`${s.flyoutLabel} ${s.reveal}`}>{menu.name}</p>
      <ul className={s.flyoutList}>
        {links.map((link, index) => (
          <li key={link.id} className={s.reveal} style={{ "--i": index + 1 } as CSSProperties}>
            <Link
              href={link.href}
              className={s.flyoutLink}
              data-active={isPathActive(pathname, link.href)}
              onClick={() => stateNav.clear()}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
