"use client";
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react";
import { GALLERY_TEXT } from "./gallery.text";
import s from "./gallery.module.css";

type Props = {
  count: number;
  active: number;
  onSelect: (index: number) => void;
  /** null = tombol jeda disembunyikan (mis. reduced motion). */
  paused: boolean | null;
  onTogglePause: () => void;
};

/** Titik indikator baris Layanan + tombol jeda/lanjut putar otomatis. */
export function GalleryControls({ count, active, onSelect, paused, onTogglePause }: Props) {
  if (count <= 1 && paused === null) return null;
  return (
    <div className={s.controls}>
      {count > 1 ? (
        <div className={s.dots} role="group" aria-label={GALLERY_TEXT.dots}>
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              className={s.dot}
              aria-label={GALLERY_TEXT.dot(i + 1, count)}
              aria-current={i === active}
              onClick={() => onSelect(i)}
            />
          ))}
        </div>
      ) : null}
      {paused === null ? null : (
        <button
          type="button"
          className={s.pause}
          aria-label={paused ? GALLERY_TEXT.play : GALLERY_TEXT.pause}
          onClick={onTogglePause}
        >
          {paused ? <IconPlayerPlayFilled size={12} /> : <IconPlayerPauseFilled size={12} />}
        </button>
      )}
    </div>
  );
}
