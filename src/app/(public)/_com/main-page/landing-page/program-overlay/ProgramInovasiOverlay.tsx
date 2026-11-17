"use client";
import { Modal } from "@mantine/core";
import { useMediaQuery, useReducedMotion } from "@mantine/hooks";
import { IconX } from "@tabler/icons-react";
import { useRef, useState, type CSSProperties } from "react";
import { programInovasiDetailHref } from "@/app/(public)/(pages)/inovasi/program-inovasi/_com/program-inovasi.logic";
import colors from "@/con/colors";
import type { ProgramInovasiItem } from "../HeroPrograms";
import { overlayView } from "./program-overlay.logic";
import s from "./program-overlay.module.css";
import { PROGRAM_OVERLAY_TEXT as T } from "./program-overlay.text";
import { ProgramOverlayDetail, ProgramOverlaySkeleton } from "./ProgramOverlayDetail";
import { ProgramOverlayPhoto } from "./ProgramOverlayPhoto";
import { usePhotoViewer } from "./use-photo-viewer";
import { useProgramDetail } from "./use-program-detail";

type Props = { programId: string | null; preview?: ProgramInovasiItem; onClose: () => void };

/** Lebar ponsel (apple.com ≤734px): overlay jadi lembar layar penuh yang naik dari bawah. */
const SHEET_QUERY = "(max-width: 734px)";
/** Modal di portal (di luar akar beranda), jadi variabel warna brand dipasang di kotak dialog. */
const BRAND_VARS = { "--brand": colors["blue-button"], "--brand-hover": colors["blue-button-6"] } as CSSProperties;

/**
 * Overlay detail Program Inovasi di beranda (`/?program={id}`, `programId` null = tertutup) di atas latar blur.
 * Preview (item rel) tampil seketika; detail lengkap + galeri dimuat sendiri (findUnique). Tutup lewat ×, Esc,
 * atau klik latar; selama tampilan besar foto, Esc kembali ke detail dulu.
 */
export function ProgramInovasiOverlay({ programId, preview, onClose }: Props) {
  // Simpan id + preview terakhir agar isi tetap ada selama animasi tutup (programId sudah null).
  const [shown, setShown] = useState({ id: programId, preview });
  if (programId !== null && (programId !== shown.id || preview?.id !== shown.preview?.id)) {
    setShown({ id: programId, preview });
  }

  const detail = useProgramDetail(programId);
  const view = overlayView(shown.id, shown.preview, detail);
  const photos = view.kind === "detail" && view.gallery.kind === "photos" ? view.gallery.photos : [];
  const contentRef = useRef<HTMLDivElement>(null);
  const viewer = usePhotoViewer(programId, photos.length, contentRef);
  const sheet = useMediaQuery(SHEET_QUERY, false, { getInitialValueInEffect: false });
  const reduceMotion = useReducedMotion(false, { getInitialValueInEffect: false });
  const viewing = viewer.index !== null;

  return (
    <Modal.Root
      opened={programId !== null}
      onClose={onClose}
      centered
      fullScreen={sheet}
      size={880}
      padding={0}
      yOffset={32}
      closeOnEscape={!viewing}
      transitionProps={{ transition: sheet ? "slide-up" : "pop", duration: reduceMotion ? 0 : sheet ? 320 : 220 }}
      classNames={{ content: s.content, body: s.body }}
    >
      <Modal.Overlay backgroundOpacity={0.45} blur={10} />
      <Modal.Content
        ref={contentRef}
        style={BRAND_VARS}
        data-viewing={viewing || undefined}
        aria-label={view.kind === "detail" ? undefined : T.eyebrow}
      >
        <div className={s.topBar} inert={viewing}>
          <button type="button" className={s.close} aria-label={T.close} onClick={onClose}>
            <IconX size={20} stroke={2.2} aria-hidden />
          </button>
        </div>
        <Modal.Body inert={viewing}>
          {view.kind === "skeleton" ? (
            <ProgramOverlaySkeleton />
          ) : view.kind === "unavailable" ? (
            <div className={s.inner}>
              <p className={s.notice}>{T.unavailable}</p>
            </div>
          ) : (
            <ProgramOverlayDetail
              head={view.head}
              gallery={view.gallery}
              onOpenPhoto={viewer.open}
              detailHref={shown.id ? programInovasiDetailHref(shown.id) : null}
            />
          )}
        </Modal.Body>
        {viewer.index !== null && view.kind === "detail" ? (
          <ProgramOverlayPhoto
            photos={photos}
            index={viewer.index}
            name={view.head.name}
            onBack={viewer.back}
            onStep={viewer.step}
          />
        ) : null}
      </Modal.Content>
    </Modal.Root>
  );
}
