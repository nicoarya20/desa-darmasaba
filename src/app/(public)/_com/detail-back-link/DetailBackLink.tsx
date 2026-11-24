'use client';
import back from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-umkm/detail-umkm.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { IconChevronLeft } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';

/** Tautan kembali teks "‹ {label}" ke halaman daftar, dipakai di atas halaman detail (acuan: detail produk UMKM). */
export function DetailBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={`${back.back} ${r.trigger}`}>
      <IconChevronLeft className={r.chevronBack} size={16} stroke={2} aria-hidden />
      <span className={r.cta} data-text={label}>
        {label}
      </span>
    </Link>
  );
}
