"use client";
import stateLayananDesa from "@/app/admin/(dashboard)/_state/desa/layananDesa";
import potensiDesaState from "@/app/admin/(dashboard)/_state/desa/potensi";
import colors from "@/con/colors";
import { useDocumentVisibility, useReducedMotion } from "@mantine/hooks";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState, type FocusEvent } from "react";
import { useSnapshot } from "valtio";
import { GalleryControls } from "./GalleryControls";
import { GalleryRow, type GalleryItem } from "./GalleryRow";
import { AUTO_ADVANCE_MS } from "./gallery.logic";
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

  useEffect(() => {
    // load() menangani error sendiri (data → [] + log), jadi tidak perlu catch di sini.
    void stateLayananDesa.suratKeterangan.findMany.load();
    void potensiDesaState.potensiDesa.findMany.load();
  }, []);

  const layanan = useMemo(
    () => toItems(layananSnap.data as ApiItem[] | null, "/darmasaba/desa/layanan", _.startCase),
    [layananSnap.data],
  );
  const potensi = useMemo(
    () => toItems(potensiSnap.data as ApiItem[] | null, "/darmasaba/desa/potensi", (n) => n),
    [potensiSnap.data],
  );
  const layananLoading = layananSnap.data === null;
  const potensiLoading = potensiSnap.data === null;

  const reducedMotion = useReducedMotion() ?? false;
  const visibility = useDocumentVisibility();
  const feature = useLoopCarousel(layanan.length, reducedMotion);
  const tile = useLoopCarousel(potensi.length, reducedMotion);

  const [userPaused, setUserPaused] = useState(false);
  const [keyboardInside, setKeyboardInside] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const restartTimer = useCallback(() => setRestartKey((k) => k + 1), []);

  const canPlay = Math.max(layanan.length, potensi.length) > 1 && !reducedMotion;
  const running = canPlay && !userPaused && !keyboardInside && visibility === "visible";
  const { next: nextFeature } = feature;
  const { next: nextTile } = tile;

  // Kedua baris maju bersamaan di detik yang sama.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      nextFeature();
      nextTile();
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [running, restartKey, nextFeature, nextTile]);

  // Jeda selama fokus keyboard ada di kartu (WCAG 2.2.2); fokus dari klik/tap tidak menjeda.
  const onRowsFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (e.target.matches(":focus-visible")) setKeyboardInside(true);
  };
  const onRowsBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKeyboardInside(false);
  };

  const isEmpty = !layananLoading && !potensiLoading && layanan.length === 0 && potensi.length === 0;

  return (
    <section className={s.section} aria-roledescription="carousel" aria-labelledby="layanan-potensi-title">
      <h2 id="layanan-potensi-title" className={s.title} style={{ color: colors["blue-button"] }}>
        {GALLERY_TEXT.title}
      </h2>

      {isEmpty ? (
        <p style={{ textAlign: "center", color: "#6e6e73", margin: 0 }}>{GALLERY_TEXT.empty}</p>
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
                onInteract={restartTimer}
              />
            ) : null}
            {potensiLoading || potensi.length > 0 ? (
              <GalleryRow
                label={GALLERY_TEXT.rowPotensi}
                variant="tile"
                items={potensi}
                carousel={tile}
                ctaLabel={GALLERY_TEXT.ctaPotensi}
                onInteract={restartTimer}
              />
            ) : null}
          </div>
          <GalleryControls
            count={layanan.length}
            active={feature.active}
            onSelect={(i) => {
              feature.goTo(i);
              restartTimer();
            }}
            paused={canPlay ? userPaused : null}
            onTogglePause={() => setUserPaused((p) => !p)}
          />
        </>
      )}
    </section>
  );
}

export default LayananPotensi;
