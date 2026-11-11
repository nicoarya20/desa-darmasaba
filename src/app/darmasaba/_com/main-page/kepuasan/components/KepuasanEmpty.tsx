import s from "../kepuasan.module.css";
import { KEPUASAN_TEXT } from "../kepuasan.text";
import { CtaButton } from "./CtaButton";

/** Keadaan 0 responden: satu kartu pesan + tombol isi survei (tanpa grafik kosong). */
export function KepuasanEmpty({ onCta }: { onCta: () => void }) {
  return (
    <div className={s.empty}>
      <p className={s.emptyTitle}>{KEPUASAN_TEXT.emptyTitle}</p>
      <p className={s.emptyBody}>{KEPUASAN_TEXT.emptyBody}</p>
      <CtaButton onClick={onCta} />
    </div>
  );
}
