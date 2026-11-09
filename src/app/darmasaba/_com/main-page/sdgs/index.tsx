"use client";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { SdgsCards, SdgsCardsSkeleton } from "./SdgsCards";
import { SDGS_BRAND_VARS, SDGS_DETAIL_HREF } from "./sdgs.meta";
import s from "./sdgs.module.css";
import { SDGS_TEXT } from "./sdgs.text";
import { useSdgsData } from "./use-sdgs-data";

const TITLE_ID = "sdgs-desa-title";

/** Section beranda SDGs Desa: empat tujuan berskor tertinggi + tautan ke halaman lengkap. */
function SDGS() {
  const { items, loading, failed } = useSdgsData();
  const empty = !loading && items.length === 0;

  return (
    <section className={s.section} style={SDGS_BRAND_VARS} aria-labelledby={TITLE_ID}>
      <div className={s.inner}>
        <header className={s.header}>
          <h2 id={TITLE_ID} className={s.title}>
            {SDGS_TEXT.title}
          </h2>
          <p className={s.lead}>{SDGS_TEXT.lead}</p>
        </header>

        {empty ? (
          <p className={s.empty}>{failed ? SDGS_TEXT.error : SDGS_TEXT.empty}</p>
        ) : (
          <>
            <p className={s.caption}>{SDGS_TEXT.topCaption}</p>
            {loading ? <SdgsCardsSkeleton /> : <SdgsCards items={items} />}
          </>
        )}

        <div className={s.cta}>
          <Link href={SDGS_DETAIL_HREF} className={s.ctaLink}>
            {SDGS_TEXT.cta}
            <IconChevronRight size={18} stroke={2} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default SDGS;
