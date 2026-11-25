'use client';

import { useMediaQuery } from '@mantine/hooks';
import { type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent, useEffect, useReducer, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { useMusic } from '@/app/context/MusicContext';
import type { Musik } from '@/app/context/music/music.types';
import { hasAudio } from '@/app/context/music/playable';
import glass from '../jenna/jenna.module.css';
import jennaState from '../jenna/jenna.state';
import { usePageOverlayOpen } from '../jenna/use-page-overlay-open';
import { EqualizerBars } from './EqualizerBars';
import { NowPlayingCard } from './NowPlayingCard';
import { NowPlayingCover } from './NowPlayingCover';
import {
  NOW_PLAYING_COLLAPSE_MS,
  NOW_PLAYING_DESKTOP_QUERY,
  shouldScheduleCollapse,
  WIDGET_INITIAL,
  widgetReducer,
} from './now-playing.logic';
import { NOW_PLAYING_TEXT as T } from './now-playing.text';
import s from './now-playing-widget.module.css';

/**
 * Pemutar situs desktop (navbar desktop, >= 62em) di luar aplikasi Musik: kartu Now Playing kanan atas di bawah
 * navbar yang mengecil jadi pil (sampul + equalizer) setelah 5 dtk tanpa hover/fokus atau saat halaman digulir.
 * Ponsel memakai kartu di panel menu (NavbarMobile). Tanpa lagu → null.
 */
export function NowPlayingWidget() {
  const { currentSong, isPlaying } = useMusic();
  const isDesktop = useMediaQuery(NOW_PLAYING_DESKTOP_QUERY, false, { getInitialValueInEffect: true });
  if (!currentSong || !isDesktop) return null;
  return <WidgetBody song={currentSong} playing={isPlaying && hasAudio(currentSong)} />;
}

function WidgetBody({ song, playing }: { song: Musik; playing: boolean }) {
  const [state, dispatch] = useReducer(widgetReducer, WIDGET_INITIAL);
  const overlayOpen = usePageOverlayOpen();
  const { open: jennaOpen } = useSnapshot(jennaState);
  const cardRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  /** Pindahkan fokus setelah lapisan bertukar (lapisan yang tersembunyi `inert`). */
  const focusAfter = useRef<'card' | 'pill' | null>(null);

  // Lagu berganti → kartu tampil lagi (timer mulai ulang lewat dependensi song.id di bawah).
  useEffect(() => {
    dispatch('open');
  }, [song.id]);

  useEffect(() => {
    if (!shouldScheduleCollapse(state)) return;
    const timer = window.setTimeout(() => dispatch('idle'), NOW_PLAYING_COLLAPSE_MS);
    return () => window.clearTimeout(timer);
  }, [state, song.id]);

  useEffect(() => {
    const onScroll = () => dispatch('scroll');
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Room Jenna (kanan bawah) bisa setinggi layar dan menindih kartu di layar pendek: kartu mengalah jadi pil.
  useEffect(() => {
    if (jennaOpen) dispatch('close');
  }, [jennaOpen]);

  useEffect(() => {
    const target = focusAfter.current;
    if (target === 'card' && state.expanded) cardRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    if (target === 'pill' && !state.expanded) pillRef.current?.focus();
    focusAfter.current = null;
  }, [state.expanded]);

  // Hover hanya dari mouse/pena; sentuhan membuka lewat klik pil.
  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') dispatch('enter');
  };
  // Hanya fokus keyboard (:focus-visible) yang menahan kartu; tombol yang diklik mouse tidak.
  const onCardFocus = (e: FocusEvent<HTMLDivElement>) => {
    if ((e.target as Element).matches(':focus-visible')) dispatch('focusin');
  };
  const onCardBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) dispatch('focusout');
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !state.expanded) return;
    focusAfter.current = 'pill';
    dispatch('close');
  };
  const onPillClick = (e: MouseEvent) => {
    // detail 0 = diaktifkan keyboard (Enter/Spasi): fokus ikut masuk ke kartu.
    if (e.detail === 0) focusAfter.current = 'card';
    dispatch('open');
  };

  return (
    <div
      className={s.root}
      data-expanded={state.expanded}
      data-hidden={overlayOpen}
      inert={overlayOpen}
      onPointerEnter={onPointerEnter}
      onPointerLeave={() => dispatch('leave')}
      onKeyDown={onKeyDown}
    >
      <div ref={cardRef} className={s.card} inert={!state.expanded} onFocus={onCardFocus} onBlur={onCardBlur}>
        <NowPlayingCard variant="widget" />
      </div>
      <button
        ref={pillRef}
        type="button"
        className={`${glass.glass} ${s.pill}`}
        inert={state.expanded}
        onClick={onPillClick}
        aria-label={T.expand(song.judul)}
        aria-expanded={state.expanded}
      >
        <NowPlayingCover src={song.coverImage?.link ?? null} className={s.pillCover} />
        <EqualizerBars playing={playing} />
      </button>
    </div>
  );
}
