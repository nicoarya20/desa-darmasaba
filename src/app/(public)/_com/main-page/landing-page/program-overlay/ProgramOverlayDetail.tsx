import { Image, Modal } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { Link } from "next-view-transitions";
import r from "@/app/(public)/_com/link-reveal/link-reveal.module.css";
import rt from "@/app/(public)/_com/rich-text/rich-text.module.css";
import { sanitizeRichTextWithImages } from "@/lib/rich-text";
import l from "../landing.module.css";
import type { GalleryView, ProgramHead } from "./program-overlay.logic";
import s from "./program-overlay.module.css";
import { PROGRAM_OVERLAY_TEXT as T } from "./program-overlay.text";
import { ProgramOverlayGallery } from "./ProgramOverlayGallery";

type Props = {
  head: ProgramHead;
  gallery: GalleryView;
  onOpenPhoto: (index: number) => void;
  /** Halaman detail `/inovasi/program-inovasi/{id}`; null = tautan tidak dirender. */
  detailHref: string | null;
};

/** Isi overlay: ubin logo + label + nama (judul dialog) + tautan halaman lengkap, deskripsi tersanitasi, galeri dokumentasi. */
export function ProgramOverlayDetail({ head, gallery, onOpenPhoto, detailHref }: Props) {
  // Gambar sisipan admin ikut tampil di posisinya (hanya dari penyimpanan sendiri).
  const description = sanitizeRichTextWithImages(head.description, head.name);

  return (
    <div className={s.inner}>
      <header className={s.head}>
        {head.logo ? (
          <span className={s.logoTile}>
            <Image className={s.logo} src={head.logo} alt="" fit="contain" />
          </span>
        ) : null}
        <div className={s.titles}>
          <span className={s.eyebrow}>{T.eyebrow}</span>
          <Modal.Title className={s.title}>{head.name}</Modal.Title>
          {detailHref ? (
            <Link href={detailHref} className={`${s.fullLink} ${r.trigger}`}>
              <span className={r.cta} data-text={T.fullPage}>
                {T.fullPage}
              </span>
              <IconChevronRight className={r.chevron} size={16} stroke={2} aria-hidden />
            </Link>
          ) : null}
        </div>
      </header>
      {description ? (
        <div className={`${s.richText} ${rt.root}`} dangerouslySetInnerHTML={{ __html: description }} />
      ) : (
        <p className={`${s.richText} ${s.muted}`}>{T.emptyDescription}</p>
      )}
      <ProgramOverlayGallery gallery={gallery} onOpenPhoto={onOpenPhoto} />
    </div>
  );
}

const LINE_WIDTHS = ["100%", "96%", "92%", "58%"];

/** Kerangka berdenyut saat dibuka lewat tautan langsung (belum ada preview dari rel). */
export function ProgramOverlaySkeleton() {
  return (
    <div className={s.inner} aria-busy="true">
      <span className={s.srOnly}>{T.loading}</span>
      <div className={s.head} aria-hidden>
        <span className={`${s.logoTile} ${s.skeletonFill} ${l.pulse}`} />
        <div className={s.titles}>
          <span className={`${s.bar} ${s.barEyebrow} ${l.pulse}`} />
          <span className={`${s.bar} ${s.barTitle} ${l.pulse}`} />
        </div>
      </div>
      <div className={s.lines} aria-hidden>
        {LINE_WIDTHS.map((width) => (
          <span key={width} className={`${s.bar} ${s.barLine} ${l.pulse}`} style={{ width }} />
        ))}
      </div>
    </div>
  );
}
