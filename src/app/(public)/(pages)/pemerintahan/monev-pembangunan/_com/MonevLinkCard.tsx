import apb from "@/app/(public)/_com/main-page/apbdes/apbdes.module.css";
import { IconChevronRight, type Icon } from "@tabler/icons-react";
import Link from "next/link";
import type { ReactElement } from "react";
import { BRAND_ACCENT_VARS } from "./monev.meta";
import s from "./monev.module.css";

type Props = { icon: Icon; title: string; body: string; cta: string; href: string };

/** Panel tautan ke halaman lain: ikon, judul, satu kalimat, dan pil brand dengan chevron. */
export function MonevLinkCard({ icon: IconComponent, title, body, cta, href }: Props): ReactElement {
  return (
    <div className={`${apb.panel} ${s.linkCard}`} style={BRAND_ACCENT_VARS}>
      <span className={apb.icon} aria-hidden>
        <IconComponent size={22} stroke={1.75} />
      </span>
      <div className={s.linkCardText}>
        <h2 className={s.linkCardTitle}>{title}</h2>
        <p className={s.linkCardBody}>{body}</p>
      </div>
      <Link href={href} className={apb.ctaLink}>
        {cta}
        <IconChevronRight size={18} stroke={2} aria-hidden />
      </Link>
    </div>
  );
}
