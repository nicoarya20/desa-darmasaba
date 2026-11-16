import { Image } from "@mantine/core";
import { useId } from "react";
import l from "../landing.module.css";
import type { GalleryView } from "./program-overlay.logic";
import s from "./program-overlay.module.css";
import { PROGRAM_OVERLAY_TEXT as T } from "./program-overlay.text";

type Props = { gallery: GalleryView; onOpenPhoto: (index: number) => void };

/** Bagian "Dokumentasi": grid foto 4:3 (klik → tampilan besar), kerangka berdenyut, atau kotak galat; kosong = tidak dirender. */
export function ProgramOverlayGallery({ gallery, onOpenPhoto }: Props) {
  const titleId = useId();
  if (gallery.kind === "none") return null;

  return (
    <section className={s.gallery} aria-labelledby={titleId} aria-busy={gallery.kind === "loading" || undefined}>
      <h3 id={titleId} className={s.galleryTitle}>
        {T.galleryTitle}
      </h3>
      {gallery.kind === "error" ? (
        <p className={s.notice}>{T.galleryError}</p>
      ) : gallery.kind === "loading" ? (
        <ul className={s.grid} aria-label={T.galleryLoading}>
          {Array.from({ length: gallery.count }, (_, i) => (
            <li key={i} className={`${s.thumbSkeleton} ${l.pulse}`} />
          ))}
        </ul>
      ) : (
        <ul className={s.grid}>
          {gallery.photos.map((photo, i) => (
            <li key={photo.key}>
              <button
                type="button"
                className={s.thumb}
                data-photo-index={i}
                aria-label={T.openPhoto(i + 1, gallery.photos.length)}
                onClick={() => onOpenPhoto(i)}
              >
                <Image className={s.thumbImg} src={photo.link} alt="" fit="cover" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
