import { IconChevronRight } from "@tabler/icons-react";
import s from "../kepuasan.module.css";
import { KEPUASAN_TEXT } from "../kepuasan.text";

/** Tombol pil "Ajukan Responden" (gaya .ctaLink APBDes) yang membuka form responden. */
export function CtaButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={s.ctaButton} onClick={onClick} aria-haspopup="dialog">
      {KEPUASAN_TEXT.cta}
      <IconChevronRight size={18} stroke={2} aria-hidden />
    </button>
  );
}
