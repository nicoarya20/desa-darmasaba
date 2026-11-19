"use client";
import stateLayananDesa from "@/app/admin/(dashboard)/_state/desa/layananDesa";
import potensiDesaState from "@/app/admin/(dashboard)/_state/desa/potensi";
import { useDocumentVisibility, useReducedMotion } from "@mantine/hooks";
import startCase from "lodash/startCase";
import { useCallback, useEffect, useMemo, useState, type FocusEvent } from "react";
import { useSnapshot } from "valtio";
import { GalleryControls } from "./GalleryControls";
import { GalleryRow, type GalleryItem } from "./GalleryRow";
import { FETCH_ROOT_MARGIN, useNearViewport } from "../../lazy-load/use-near-viewport";
import s from "./gallery.module.css";
import { GALLERY_TEXT } from "./gallery.text";
import { useLoopCarousel } from "./use-loop-carousel";

type ApiItem = { id: string; name: string; image?: { link?: string } | null };

function toItems(data: readonly ApiItem[] | null, base: string, format: (name: string) => string): GalleryItem[] {
  return (data ?? []).map((item) => ({
    id: item.id,
    name: format(item.name),
    imageUrl: item.image?.link,
    href: `${base}/${item.id}`,
  }));
}

/** Section beranda: galeri Layanan (baris atas) + Potensi Desa (baris bawah), maju 1 kartu tiap 5 detik. */
function LayananPotensi() {
  const layananSnap = useSnapshot(stateLayananDesa.suratKeterangan.findMany);
  const potensiSnap = useSnapshot(potensiDesaState.potensiDesa.findMany);
  // Dua pengamat terpisah: data diminta lebih awal (FETCH_ROOT_MARGIN, dua layar) daripada foto (600px), supaya
  // daftar kartu sudah ada saat foto mulai dimuat. Pengamat data dipasang di judul karena `ref` foto memakai <section>.
  const [titleRef, dataNear] = useNearViewport<HTMLHeadingElement>(FETCH_ROOT_MARGIN);

  useEffect(() => {
    // Tunda sampai section mendekati layar: saat beranda dibuka jaringan diprioritaskan untuk hero (foto LCP).
    if (!dataNear) return;
    // load() menangani error sendiri (data → [] + log), jadi tidak perlu catch di sini.
    void stateLayananDesa.suratKeterangan.findMany.load();
    void potensiDesaState.potensiDesa.findMany.load();
  }, [dataNear]);

  const layanan = useMemo(
    () => toItems(layananSnap.data as ApiItem[] | null, "/pemerintahan/layanan", startCase),
    [layananSnap.data],
  );
  const potensi = useMemo(
    () => toItems(potensiSnap.data as ApiItem[] | null, "/pemerintahan/potensi", (n) => n),
    [potensiSnap.data],
  );
  const layananLoading = layananSnap.data === null;
  const potensiLoading = potensiSnap.data === null;

  const [sectionRef, nearViewport] = useNearViewport<HTMLElement>();
  const reducedMotion = useReducedMotion() ?? false;
  const visibility = useDocumentVisibility();
  const feature = useLoopCarousel(layanan.length, reducedMotion);
  const tile = useLoopCarousel(potensi.length, reducedMotion);

  const [userPaused, setUserPaused] = useState(false);
  const [keyboardInside, setKeyboardInside] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const { step: stepFeature } = feature;
  const { step: stepTile } = tile;

  // Geser manual (baris mana pun, sentuh/trackpad) atau klik titik → kedua baris bergeser bersama
  // sejauh `delta` kartu, lalu progress titik diulang dari 0.
  const stepAll = useCallback(
    (delta: number) => {
      stepFeature(delta);
      stepTile(delta);
      setRestartKey((k) => k + 1);
    },
    [stepFeature, stepTile],
  );

  // Titik indikator mengikuti Layanan; bila Layanan ≤ 1 item, ikut Potensi agar putar otomatis tetap jalan.
  const primary = layanan.length > 1 ? feature : tile;
  const primaryCount = layanan.length > 1 ? layanan.length : potensi.length;
  const canPlay = primaryCount > 1 && !reducedMotion;
  const running = canPlay && !userPaused && !keyboardInside && visibility === "visible";

  // Progress bar titik aktif penuh → kedua baris maju bersamaan.
  const onCycleEnd = () => {
    stepFeature(1);
    stepTile(1);
  };

  // Jeda selama fokus keyboard ada di kartu (WCAG 2.2.2); fokus dari klik/tap tidak menjeda.
  const onRowsFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (e.target.matches(":focus-visible")) setKeyboardInside(true);
  };
  const onRowsBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKeyboardInside(false);
  };

  const isEmpty = !layananLoading && !potensiLoading && layanan.length === 0 && potensi.length === 0;
  // Jumlah titik belum diketahui selama baris penentunya masih memuat (Layanan, atau Potensi bila Layanan ≤ 1).
  const controlsPending = layanan.length <= 1 && (layananLoading || potensiLoading);

  return (
    <section ref={sectionRef} className={s.section} aria-roledescription="carousel" aria-labelledby="layanan-potensi-title">
      <h2 ref={titleRef} id="layanan-potensi-title" className={s.title}>
        {GALLERY_TEXT.title}
      </h2>

      {isEmpty ? (
        <p style={{ textAlign: "center", color: "var(--c-muted)", margin: 0 }}>{GALLERY_TEXT.empty}</p>
      ) : (
        <>
          <div className={s.rows} onFocus={onRowsFocus} onBlur={onRowsBlur}>
            {layananLoading || layanan.length > 0 ? (
              <GalleryRow
                label={GALLERY_TEXT.rowLayanan}
                variant="feature"
                items={layanan}
                carousel={feature}
                ctaLabel={GALLERY_TEXT.ctaLayanan}
                preloadImages={nearViewport}
                onStep={stepAll}
              />
            ) : null}
            {potensiLoading || potensi.length > 0 ? (
              <GalleryRow
                label={GALLERY_TEXT.rowPotensi}
                variant="tile"
                items={potensi}
                carousel={tile}
                ctaLabel={GALLERY_TEXT.ctaPotensi}
                preloadImages={nearViewport}
                onStep={stepAll}
              />
            ) : null}
          </div>
          {controlsPending ? (
            // Cadangkan baris titik selama memuat: tanpa ini section bertambah 56px (min-height 36 + margin 20)
            // tepat saat data tiba, menggeser section di bawahnya.
            <div className={s.controls} aria-hidden />
          ) : (
            <GalleryControls
              count={primaryCount}
              active={primary.active}
              position={primary.position}
              progressKey={restartKey}
              autoplay={canPlay}
              running={running}
              onStep={stepAll}
              onCycleEnd={onCycleEnd}
              onTogglePause={() => setUserPaused((p) => !p)}
            />
          )}
        </>
      )}
    </section>
  );
}

export default LayananPotensi;
