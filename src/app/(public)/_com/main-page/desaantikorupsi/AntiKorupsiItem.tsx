import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import type { AntiKorupsiIndicator } from "./desaantikorupsi.logic";
import s from "./desaantikorupsi.module.css";
import { ANTIKORUPSI_TEXT } from "./desaantikorupsi.text";

/** Badge jumlah dokumen butir; tidak dirender bila data tidak membawa `jumlahDokumen`. */
function DokumenBadge({ jumlah }: { jumlah: number | undefined }) {
  if (jumlah == null) return null;
  if (jumlah > 0) return <span className={s.badge}>{ANTIKORUPSI_TEXT.jumlahDokumen(jumlah)}</span>;
  return <span className={s.badgeEmpty}>{ANTIKORUPSI_TEXT.belumAdaDokumen}</span>;
}

/** Satu butir indikator: teks biasa (beranda) atau seluruh baris bertaut bila `href` diberikan. */
export function AntiKorupsiItem({ item, href }: { item: AntiKorupsiIndicator; href?: string }) {
  if (!href) {
    return (
      <li className={s.item}>
        {item.number ? <span className={s.number}>{item.number}</span> : null}
        <span className={s.itemText}>{item.text}</span>
      </li>
    );
  }

  return (
    <li className={`${s.item} ${s.itemLinked}`}>
      <Link href={href} className={s.itemLink}>
        {item.number ? <span className={s.number}>{item.number}</span> : null}
        <span className={item.number ? s.itemBody : `${s.itemBody} ${s.itemBodyFull}`}>
          <span className={s.itemLinkText}>{item.text}</span>
          <DokumenBadge jumlah={item.jumlahDokumen} />
        </span>
        <IconChevronRight className={s.chevron} size={18} stroke={2} aria-hidden />
      </Link>
    </li>
  );
}
