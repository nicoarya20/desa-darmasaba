import { Image } from "@mantine/core";
import { Link } from "next-view-transitions";
import { PRESTASI_HERO_IMAGE, PRESTASI_LIST_HREF } from "./prestasi.meta";
import s from "./prestasi.module.css";
import { PRESTASI_TEXT } from "./prestasi.text";

/** Hero full-bleed section Prestasi: foto desa + judul, subtext, dan tombol ke daftar prestasi. */
export function PrestasiHero({ titleId }: { titleId: string }) {
  return (
    <div className={s.hero}>
      <Image
        src={PRESTASI_HERO_IMAGE.src}
        srcSet={PRESTASI_HERO_IMAGE.srcSet}
        sizes="100vw"
        alt=""
        className={s.heroImage}
        loading="lazy"
        decoding="async"
      />
      <span className={s.heroShade} aria-hidden />
      <div className={s.heroContent}>
        <h2 id={titleId} className={s.heroTitle}>
          {PRESTASI_TEXT.title}
        </h2>
        <p className={s.heroText}>{PRESTASI_TEXT.subtitle}</p>
        <Link href={PRESTASI_LIST_HREF} className={s.cta}>
          {PRESTASI_TEXT.cta}
        </Link>
      </div>
    </div>
  );
}
