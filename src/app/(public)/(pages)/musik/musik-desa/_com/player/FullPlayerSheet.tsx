'use client';

import { Drawer } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import { IconChevronDown, IconPlaylist } from '@tabler/icons-react';
import { useMusic } from '@/app/context/MusicContext';
import { TrackCover } from '../library/TrackCover';
import { PlayerControls } from './PlayerControls';
import { PlayerProgress } from './PlayerProgress';
import { PLAYER_TEXT } from './player.text';
import app from '../app/musik-app.module.css';
import s from './full-player.module.css';

/** Durasi geser lembar (ms); kurva mengikuti lembar iOS (cepat lalu melambat). */
const SHEET_TRANSITION_MS = 280;

/** Transisi lembar: prefers-reduced-motion → tanpa animasi geser (durasi 0). */
export function fullPlayerTransition(reduceMotion: boolean) {
  return { duration: reduceMotion ? 0 : SHEET_TRANSITION_MS, timingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' };
}

type Props = {
  opened: boolean;
  onClose: () => void;
  /** Tombol Antrean: NowPlayingBar menutup lembar lalu membuka antrean (keduanya Drawer, tidak bertumpuk). */
  onOpenQueue: () => void;
  /** false saat menyerahkan ke antrean: fokus tidak dikembalikan ke bar, karena Drawer antrean mengambilnya. */
  returnFocus: boolean;
};

/**
 * Pemutar layar penuh di ponsel (≤734px), dibuka dari info lagu di bar: sampul besar, judul/artis,
 * progres, transport lengkap, dan Antrean. Fokus terkunci & Escape menutup (bawaan Drawer Mantine).
 */
export function FullPlayerSheet({ opened, onClose, onOpenQueue, returnFocus }: Props) {
  const { currentSong } = useMusic();
  const reduceMotion = useReducedMotion();
  if (!currentSong) return null;

  return (
    <Drawer.Root
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="100%"
      returnFocus={returnFocus}
      // Token --m-* ikut dipasang: Drawer dirender lewat portal di luar `.app`.
      className={`${app.tokens} ${s.root}`}
      classNames={{ content: s.content, body: s.body }}
      transitionProps={fullPlayerTransition(reduceMotion)}
    >
      <Drawer.Overlay />
      <Drawer.Content aria-label={PLAYER_TEXT.barLabel}>
        <Drawer.Body>
          <div className={s.head}>
            <button type="button" className={s.iconBtn} onClick={onClose} aria-label={PLAYER_TEXT.closePlayer}>
              <IconChevronDown size={26} aria-hidden="true" />
            </button>
            <p className={s.kicker}>{PLAYER_TEXT.nowPlaying}</p>
          </div>

          <div className={s.cover}>
            <TrackCover
              src={currentSong.coverImage?.link ?? null}
              alt={`Sampul ${currentSong.judul}`}
              seed={currentSong.id}
              radius={12}
            />
          </div>

          <div className={s.info}>
            <h2 className={s.title}>{currentSong.judul}</h2>
            <p className={s.artist}>{currentSong.artis}</p>
            {!currentSong.audioFile?.link && <p className={s.note}>{PLAYER_TEXT.noAudio}</p>}
          </div>

          <div className={s.transport}>
            <PlayerProgress />
            <PlayerControls />
          </div>

          <button type="button" className={s.queueBtn} onClick={onOpenQueue}>
            <IconPlaylist size={20} aria-hidden="true" />
            <span>{PLAYER_TEXT.queue}</span>
          </button>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
}
