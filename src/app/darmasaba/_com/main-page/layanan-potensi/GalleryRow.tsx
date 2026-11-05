"use client";
import { Image } from "@mantine/core";
import { Link } from "next-view-transitions";
import { useRef, useState, type FocusEvent, type MouseEvent, type PointerEvent } from "react";
import { buildLoopTrack, DRAG_CLICK_TOLERANCE_PX, loopStart, realIndex, swipeStep } from "./gallery.logic";
import s from "./gallery.module.css";
import type { LoopCarousel } from "./use-loop-carousel";
import { useWheelStep } from "./use-wheel-step";

export type GalleryItem = { id: string; name: string; imageUrl?: string; href: string };

type Props = {
  label: string;
  variant: "feature" | "tile";
  items: GalleryItem[];
  carousel: LoopCarousel;
  ctaLabel: string;
  /** User menggeser baris ini (sentuh/trackpad) sejauh `delta` kartu; induk menggeser SEMUA baris. */
  onStep: (delta: number) => void;
};

const PLACEHOLDER_COUNT = 5;

/** Geser track agar kartu `index` tepat di tengah viewport (persen = lebar viewport, lihat CSS). */
function trackTransform(index: number, dragX: number) {
  return `translate3d(calc(50% - var(--card-w) / 2 - ${index} * (var(--card-w) + var(--gap)) + ${dragX}px), 0, 0)`;
}

/** Satu baris galeri loop: kartu aktif di tengah, geser jari (sentuh) atau dua jari (trackpad). */
export function GalleryRow({ label, variant, items, carousel, ctaLabel, onStep }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [dragX, setDragX] = useState(0);

  const count = items.length;
  const track = buildLoopTrack(items);
  const start = loopStart(count);

  useWheelStep(viewportRef, onStep, count > 1);

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" || count <= 1) return;
    drag.current = { x: e.clientX, moved: false };
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > DRAG_CLICK_TOLERANCE_PX) drag.current.moved = true;
    setDragX(dx);
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!drag.current) return;
    const { x, moved } = drag.current;
    drag.current = null;
    setDragX(0);
    if (!moved) return;
    suppressClick.current = true;
    const delta = swipeStep(e.clientX - x);
    if (delta !== 0) onStep(delta);
  };
  // Browser mengambil alih untuk scroll vertikal: batalkan geser tanpa pindah kartu.
  const onPointerCancel = () => {
    drag.current = null;
    setDragX(0);
  };
  const onClickCapture = (e: MouseEvent) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };
  // Fokus keyboard ke kartu di samping → bawa kartu itu ke tengah.
  const onCardFocus = (e: FocusEvent<HTMLAnchorElement>, i: number) => {
    if (e.currentTarget.matches(":focus-visible")) carousel.goTo(realIndex(i, count));
  };

  return (
    <div
      ref={viewportRef}
      role="group"
      aria-label={label}
      className={`${s.viewport} ${s[variant]}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClickCapture={onClickCapture}
    >
      <div
        className={s.track}
        data-animate={carousel.animate && dragX === 0}
        style={{ transform: trackTransform(count === 0 ? 2 : carousel.index, dragX) }}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && e.propertyName === "transform") carousel.settle();
        }}
      >
        {count === 0
          ? Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
              <div key={i} className={`${s.card} ${s.placeholder}`} aria-hidden />
            ))
          : track.map((item, i) => {
              // Hanya salinan tengah yang terbaca screen reader & bisa di-Tab; sisanya duplikat visual loop.
              const isClone = count > 1 && (i < start || i >= start + count);
              return (
                <Link
                  key={`${item.id}-${i}`}
                  href={item.href}
                  className={s.card}
                  data-active={i === carousel.index || count === 1}
                  aria-hidden={isClone || undefined}
                  tabIndex={isClone ? -1 : undefined}
                  draggable={false}
                  onFocus={(e) => onCardFocus(e, i)}
                >
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt="" className={s.image} loading="eager" draggable={false} />
                  ) : null}
                  <span className={s.shade} />
                  <span className={s.caption}>
                    {variant === "feature" ? <span className={s.pill}>{ctaLabel}</span> : null}
                    <span className={s.name}>{item.name}</span>
                    {variant === "tile" ? <span className={s.pill}>{ctaLabel}</span> : null}
                  </span>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
