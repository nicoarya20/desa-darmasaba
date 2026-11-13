import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import { IconChartBar, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { APBDES_HREF, BRAND_ACCENT_VARS } from "./monev.meta";
import s from "./monev.module.css";
import { MONEV_TEXT } from "./monev.text";

/** Panel tautan ke halaman realisasi APBDes (selalu tampil, juga saat data monev kosong). */
export function MonevApbdesLink() {
  return (
    <div className={`${apb.panel} ${s.apbdes}`} style={BRAND_ACCENT_VARS}>
      <span className={apb.icon} aria-hidden>
        <IconChartBar size={22} stroke={1.75} />
      </span>
      <div className={s.apbdesText}>
        <h2 className={s.apbdesTitle}>{MONEV_TEXT.apbdesTitle}</h2>
        <p className={s.apbdesBody}>{MONEV_TEXT.apbdesBody}</p>
      </div>
      <Link href={APBDES_HREF} className={apb.ctaLink}>
        {MONEV_TEXT.apbdesCta}
        <IconChevronRight size={18} stroke={2} aria-hidden />
      </Link>
    </div>
  );
}
