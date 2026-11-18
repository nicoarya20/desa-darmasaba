"use client";
import { IconChevronRight } from "@tabler/icons-react";
import { Link } from "next-view-transitions";
import r from "../../link-reveal/link-reveal.module.css";
import { KabarBerita } from "./KabarBerita";
import { KabarPengumuman } from "./KabarPengumuman";
import { BERITA_LIST_HREF } from "./kabar.meta";
import s from "./kabar.module.css";
import { KABAR_TEXT } from "./kabar.text";
import { useKabarData } from "./use-kabar-data";

const TITLE_ID = "kabar-desa-title";

/** Section beranda Kabar Desa: berita terbaru (foto) + pengumuman terbaru (teks). */
function KabarDesa() {
  const { berita, pengumuman, loading, failed } = useKabarData();
  const empty = !loading && berita.length === 0 && pengumuman.length === 0;

  return (
    <section className={s.section} aria-labelledby={TITLE_ID}>
      <header className={s.header}>
        <h2 id={TITLE_ID} className={s.title}>
          {KABAR_TEXT.title}
        </h2>
        {berita.length > 0 ? (
          <Link href={BERITA_LIST_HREF} className={`${s.allLink} ${r.trigger}`}>
            <span className={r.cta} data-text={KABAR_TEXT.beritaAll}>
              {KABAR_TEXT.beritaAll}
            </span>
            <IconChevronRight className={r.chevron} size={18} stroke={2} aria-hidden />
          </Link>
        ) : null}
      </header>

      {empty ? (
        <p className={s.empty}>{failed ? KABAR_TEXT.error : KABAR_TEXT.empty}</p>
      ) : (
        <div className={s.content}>
          <KabarBerita items={berita} loading={loading} />
          <KabarPengumuman items={pengumuman} loading={loading} />
        </div>
      )}
    </section>
  );
}

export default KabarDesa;
