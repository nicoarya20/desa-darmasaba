"use client";

import stateNav from "@/state/state-nav";
import { useSyncExternalStore } from "react";
import { useSnapshot } from "valtio";
import { isPageOverlayOpen, SCROLL_LOCK_ATTR } from "./jenna-bar.logic";

type LockObserver = Pick<MutationObserver, "observe" | "disconnect">;
type LockObserverCtor = new (callback: MutationCallback) => LockObserver;

/** Pantau kunci scroll di body: hanya atribut SCROLL_LOCK_ATTR (tanpa subtree/childList). Mengembalikan pelepas. */
export function watchScrollLock(
  body: Element,
  onChange: () => void,
  Observer: LockObserverCtor = MutationObserver,
): () => void {
  const observer = new Observer(() => onChange());
  observer.observe(body, { attributes: true, attributeFilter: [SCROLL_LOCK_ATTR] });
  return () => observer.disconnect();
}

const subscribe = (onChange: () => void) => watchScrollLock(document.body, onChange);
const getSnapshot = () => document.body.getAttribute(SCROLL_LOCK_ATTR);
const getServerSnapshot = () => null;

/** true selama overlay halaman terbuka: Modal/Drawer (kunci scroll body), flyout/cari navbar desktop, atau menu ponsel. */
export function usePageOverlayOpen(): boolean {
  const scrollLock = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { openMenuId, isSearch, mobileOpen } = useSnapshot(stateNav);
  return isPageOverlayOpen({ scrollLock, navMenuId: openMenuId, navSearch: isSearch, mobileMenu: mobileOpen });
}
