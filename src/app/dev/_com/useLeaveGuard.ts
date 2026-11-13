'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { isNewTabClick, shouldConfirmLeave } from './leave-guard.logic';

/**
 * Konfirmasi sebelum link internal meninggalkan halaman yang punya draf.
 * `guardClick` mengembalikan true bila navigasi ditahan (menunggu `confirmLeave`/`cancelLeave`).
 */
export function useLeaveGuard(hasUnsaved: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const guardClick = (e: React.MouseEvent, href: string): boolean => {
    if (isNewTabClick(e.nativeEvent) || !shouldConfirmLeave(pathname, href, hasUnsaved)) return false;
    e.preventDefault();
    setPendingHref(href);
    return true;
  };

  const confirmLeave = () => {
    if (pendingHref) router.push(pendingHref);
    setPendingHref(null);
  };

  return { pendingHref, guardClick, confirmLeave, cancelLeave: () => setPendingHref(null) };
}
