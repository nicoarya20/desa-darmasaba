import { Image } from "@mantine/core";
import { useWindowEvent } from "@mantine/hooks";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useEffect, useRef, type TouchEvent } from "react";
import { swipeStep, type OverlayPhoto } from "./program-overlay.logic";
import s from "./program-overlay-photo.module.css";
import { PROGRAM_OVERLAY_TEXT as T } from "./program-overlay.text";

type Props = {
  photos: OverlayPhoto[];
  index: number;
  name: string;
  onBack: () => void;
  onStep: (delta: -1 | 1) => void;
};

/**
 * Tampilan besar foto di atas detail (lapisan dalam overlay yang sama, bukan Modal bertumpuk): "‹ Kembali",
 * penghitung, foto `contain`, tombol sebelumnya/berikutnya + geser sentuh + panah keyboard. Esc = kembali ke detail.
 * Tombol keyboard didengar di window (fokus bisa di mana saja di dialog); Modal sudah `closeOnEscape={false}` selama
 * lapisan ini tampil. Tombol di ujung memakai `aria-disabled` (bukan `disabled`) agar fokus tidak lepas.
 */
export function ProgramOverlayPhoto({ photos, index, name, onBack, onStep }: Props) {
  const backRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const photo = photos[index];
  const total = photos.length;
  const atStart = index === 0;
  const atEnd = index === total - 1;

  useEffect(() => {
    backRef.current?.focus();
  }, []);

  useWindowEvent("keydown", (event) => {
    if (event.isComposing) return;
    if (event.key === "Escape") {
      event.preventDefault();
      onBack();
    } else if (event.key === "ArrowLeft") {
      onStep(-1);
    } else if (event.key === "ArrowRight") {
      onStep(1);
    }
  });

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!start || !touch) return;
    const step = swipeStep(touch.clientX - start.x, touch.clientY - start.y);
    if (step !== 0) onStep(step);
  };

  if (!photo) return null;

  return (
    <div className={s.photoView} role="group" aria-label={T.photoView(name)}>
      <div className={s.photoBar}>
        <button ref={backRef} type="button" className={s.back} onClick={onBack}>
          <span aria-hidden>‹</span> {T.back}
        </button>
        <span className={s.counter} aria-live="polite">
          {T.counter(index + 1, total)}
        </span>
      </div>
      <div className={s.stage} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <Image key={photo.key} className={s.stageImg} src={photo.link} alt={T.photoAlt(name, index + 1)} fit="contain" />
        {total > 1 ? (
          <>
            <button
              type="button"
              className={`${s.nav} ${s.navPrev}`}
              aria-label={T.prevPhoto}
              aria-disabled={atStart || undefined}
              onClick={() => onStep(-1)}
            >
              <IconChevronLeft size={22} stroke={2} aria-hidden />
            </button>
            <button
              type="button"
              className={`${s.nav} ${s.navNext}`}
              aria-label={T.nextPhoto}
              aria-disabled={atEnd || undefined}
              onClick={() => onStep(1)}
            >
              <IconChevronRight size={22} stroke={2} aria-hidden />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
