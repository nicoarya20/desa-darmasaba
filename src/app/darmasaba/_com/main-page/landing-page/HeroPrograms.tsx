import { Image } from "@mantine/core";
import { Prisma } from "@prisma/client";
import { IconPhotoOff } from "@tabler/icons-react";
import { Link } from "next-view-transitions";
import s from "./landing.module.css";
import { LANDING_TEXT } from "./landing.text";

export type ProgramInovasiItem = Prisma.ProgramInovasiGetPayload<{ include: { image: true } }>;

const TITLE_ID = "program-inovasi-title";
/** Hero hanya memuat 4 program pertama (urutan dari API), supaya foto Perbekel bisa setinggi hero. */
export const HERO_PROGRAM_LIMIT = 4;

/** Rel program inovasi di dasar kolom kiri hero: 4 ubin seragam (logo + nama) menuju halaman detail program. */
export function HeroPrograms({ items, loading }: { items: ProgramInovasiItem[]; loading: boolean }) {
  const shown = items.slice(0, HERO_PROGRAM_LIMIT);
  return (
    <div className={s.programs}>
      <h2 id={TITLE_ID} className={s.programsTitle}>
        {LANDING_TEXT.programsTitle}
      </h2>

      {loading ? (
        <ul className={s.rail} aria-label={LANDING_TEXT.programsLoading}>
          {Array.from({ length: HERO_PROGRAM_LIMIT }, (_, i) => (
            <li key={i} className={`${s.tileSkeleton} ${s.pulse}`} />
          ))}
        </ul>
      ) : shown.length === 0 ? (
        <p className={s.programsEmpty}>{LANDING_TEXT.programsEmpty}</p>
      ) : (
        <ul className={s.rail} aria-labelledby={TITLE_ID}>
          {shown.map((item) => (
            <li key={item.id} className={s.railItem}>
              <Link href={`/darmasaba/program-inovasi/${item.id}`} className={s.tile} title={item.name}>
                {item.image?.link ? (
                  <Image className={s.tileLogo} src={item.image.link} alt="" loading="lazy" fit="contain" />
                ) : (
                  <span className={s.tileLogoEmpty} aria-hidden>
                    <IconPhotoOff size={28} stroke={1.5} />
                  </span>
                )}
                <span className={s.tileName}>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
