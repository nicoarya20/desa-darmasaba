"use client";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { AntiKorupsiGroups } from "./AntiKorupsiGroups";
import { ANTIKORUPSI_BRAND_VARS, ANTIKORUPSI_DETAIL_HREF } from "./desaantikorupsi.meta";
import s from "./desaantikorupsi.module.css";
import { ANTIKORUPSI_TEXT } from "./desaantikorupsi.text";
import { useAntiKorupsiData } from "./use-antikorupsi-data";

const TITLE_ID = "desa-anti-korupsi-title";

/** Section beranda Desa Anti Korupsi: indikator terpilih dikelompokkan per kategori + tautan ke halaman detail. */
function DesaAntiKorupsi() {
  const { groups, loading } = useAntiKorupsiData();
  const empty = !loading && groups.length === 0;

  return (
    <section className={s.section} style={ANTIKORUPSI_BRAND_VARS} aria-labelledby={TITLE_ID}>
      <div className={s.inner}>
        <header className={s.header}>
          <h2 id={TITLE_ID} className={s.title}>
            {ANTIKORUPSI_TEXT.title}
          </h2>
          <p className={s.lead}>{ANTIKORUPSI_TEXT.lead}</p>
        </header>

        <div aria-busy={loading || undefined}>
          {loading ? <span className={s.srOnly}>{ANTIKORUPSI_TEXT.loading}</span> : null}
          {empty ? (
            <p className={s.empty}>{ANTIKORUPSI_TEXT.empty}</p>
          ) : (
            <AntiKorupsiGroups groups={groups} loading={loading} />
          )}
        </div>

        <div className={s.cta}>
          <Link href={ANTIKORUPSI_DETAIL_HREF} className={s.ctaLink}>
            {ANTIKORUPSI_TEXT.cta}
            <IconChevronRight size={18} stroke={2} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default DesaAntiKorupsi;
