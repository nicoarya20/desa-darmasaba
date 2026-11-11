import { Image } from "@mantine/core";
import { Prisma } from "@prisma/client";
import { IconChevronLeft, IconChevronRight, IconPhotoOff } from "@tabler/icons-react";
import { Link } from "next-view-transitions";
import type { CSSProperties } from "react";
import s from "./landing.module.css";
import { LANDING_TEXT } from "./landing.text";
import p from "./programs.module.css";
import { getThumbStyle, RAIL_VISIBLE_TILES } from "./rail.logic";
import { useRailScroll } from "./use-rail-scroll";

export type ProgramInovasiItem = Prisma.ProgramInovasiGetPayload<{ include: { image: true } }>;

const TITLE_ID = "program-inovasi-title";

/** Rel program inovasi di kiri bawah hero: 4 ubin terlihat, sisanya digeser (seret, trackpad, atau panah). */
export function HeroPrograms({ items, loading }: { items: ProgramInovasiItem[]; loading: boolean }) {
  const { railRef, thumbRef, state, step } = useRailScroll(loading ? 0 : items.length);

  return (
    <div className={p.programs}>
      <div className={p.head}>
        <h2 id={TITLE_ID} className={p.title}>
          {LANDING_TEXT.programsTitle}
        </h2>
        {!loading && state.scrollable && (
          <div className={p.arrows}>
            <button
              type="button"
              className={p.arrow}
              onClick={() => step(-1)}
              disabled={!state.canPrev}
              aria-label={LANDING_TEXT.programsPrev}
            >
              <IconChevronLeft size={20} stroke={2} aria-hidden />
            </button>
            <button
              type="button"
              className={p.arrow}
              onClick={() => step(1)}
              disabled={!state.canNext}
              aria-label={LANDING_TEXT.programsNext}
            >
              <IconChevronRight size={20} stroke={2} aria-hidden />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <ul className={p.rail} aria-label={LANDING_TEXT.programsLoading}>
          {Array.from({ length: RAIL_VISIBLE_TILES }, (_, i) => (
            <li key={i} className={`${p.railItem} ${p.tileSkeleton} ${s.pulse}`} />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className={p.empty}>{LANDING_TEXT.programsEmpty}</p>
      ) : (
        <>
          <ul
            ref={railRef}
            className={p.rail}
            aria-labelledby={TITLE_ID}
            data-fade-start={state.canPrev || undefined}
            data-fade-end={state.canNext || undefined}
          >
            {items.map((item, index) => (
              <li key={item.id} className={p.railItem} style={{ "--i": index } as CSSProperties}>
                <Link href={`/program-inovasi/${item.id}`} className={p.tile} title={item.name}>
                  {item.image?.link ? (
                    <Image className={p.tileLogo} src={item.image.link} alt="" loading="lazy" fit="contain" />
                  ) : (
                    <span className={p.tileLogoEmpty} aria-hidden>
                      <IconPhotoOff size={28} stroke={1.5} />
                    </span>
                  )}
                  <span className={p.tileName}>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          {state.scrollable && (
            <div className={p.progress} aria-hidden>
              <span ref={thumbRef} className={p.thumb} style={getThumbStyle(state)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
