"use client";
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react";
import type { CSSProperties } from "react";
import { AUTO_ADVANCE_MS, DOT, DOT_WINDOW, dotCenterX, realIndex } from "./gallery.logic";
import s from "./gallery.module.css";
import { GALLERY_TEXT } from "./gallery.text";

type Props = {
  count: number;
  /** Item asli yang aktif (0..count-1). */
  active: number;
  /** Langkah kumulatif baris; kunci titik agar strip bergeser, bukan dirender ulang. */
  position: number;
  /** Berubah saat user berinteraksi → progress diulang dari 0. */
  progressKey: number;
  autoplay: boolean;
  running: boolean;
  onStep: (delta: number) => void;
  /** Progress penuh (5 detik) → maju 1 kartu. */
  onCycleEnd: () => void;
  onTogglePause: () => void;
};

const HIT_PADDING = DOT.gap / 2;
const OFFSETS = Array.from({ length: (DOT_WINDOW + 1) * 2 + 1 }, (_, i) => i - DOT_WINDOW - 1);
const STRIP_WIDTH = 2 * (dotCenterX(DOT_WINDOW) + DOT.size / 2 + HIT_PADDING);

/**
 * 5 titik dengan titik aktif (panjang) selalu di tengah. Titik aktif berisi progress bar yang terisi
 * selama AUTO_ADVANCE_MS dan menjadi jam putar otomatis: `animationend` → maju. Satu titik ekstra di
 * tiap sisi (transparan) membuat titik baru meluncur masuk saat strip bergeser.
 */
export function GalleryControls(props: Props) {
  const { count, active, position, progressKey, autoplay, running, onStep, onCycleEnd, onTogglePause } = props;
  if (count <= 1) return null;

  return (
    <div className={s.controls}>
      <div
        className={s.dots}
        role="group"
        aria-label={GALLERY_TEXT.dots}
        style={{ width: STRIP_WIDTH, "--cycle-ms": `${AUTO_ADVANCE_MS}ms` } as CSSProperties}
      >
        {OFFSETS.map((offset) => {
          const isActive = offset === 0;
          const hidden = Math.abs(offset) > DOT_WINDOW;
          const width = (isActive ? DOT.activeWidth : DOT.size) + HIT_PADDING * 2;
          const item = realIndex(active + offset, count);
          return (
            <button
              key={position + offset}
              type="button"
              className={s.dot}
              data-hidden={hidden}
              aria-hidden={hidden || undefined}
              tabIndex={hidden ? -1 : undefined}
              aria-label={GALLERY_TEXT.dot(item + 1, count)}
              aria-current={isActive}
              style={{ width, transform: `translateX(${dotCenterX(offset) - width / 2}px)` }}
              onClick={() => onStep(offset)}
            >
              <span className={s.dotBar}>
                {isActive ? (
                  <span
                    key={progressKey}
                    className={s.dotFill}
                    data-autoplay={autoplay}
                    style={{ animationPlayState: running ? "running" : "paused" }}
                    onAnimationEnd={(e) => {
                      if (e.target === e.currentTarget && autoplay) onCycleEnd();
                    }}
                  />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      {autoplay ? (
        <button
          type="button"
          className={s.pause}
          aria-label={running ? GALLERY_TEXT.pause : GALLERY_TEXT.play}
          onClick={onTogglePause}
        >
          {running ? <IconPlayerPauseFilled size={12} /> : <IconPlayerPlayFilled size={12} />}
        </button>
      ) : null}
    </div>
  );
}
