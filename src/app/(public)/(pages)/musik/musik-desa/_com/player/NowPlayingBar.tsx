'use client';

import { IconDisc, IconPlaylist } from '@tabler/icons-react';
import { useMusic } from '@/app/context/MusicContext';
import { useMusikUi } from '../app/musik-ui.context';
import { TrackCover } from '../library/TrackCover';
import { NextButton, PlayPauseButton, PlayerControls } from './PlayerControls';
import { PlayerProgress, PlayerProgressLine } from './PlayerProgress';
import { VolumeControl } from './VolumeControl';
import { PLAYER_TEXT } from './player.text';
import controls from './player-controls.module.css';
import s from './now-playing-bar.module.css';

/** Baris kecil genre · tahun di bawah artis; kosong bila keduanya tidak ada. */
function songMeta(genre: string | null, tahun: number | null): string | null {
  const parts = [genre?.trim(), tahun ? String(tahun) : null].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : null;
}

/**
 * Bar pemutar bawah gaya TIDAL (fixed): latar sampul blur + kaca, info lagu kiri, transport + progres
 * tengah, Antrean + volume kanan. Tanpa tombol Preview/suka/lainnya. Dirender sekali oleh MusikApp.
 * Seperti TIDAL, bar baru muncul setelah lagu pertama dipilih dan tetap tampil walau dijeda; ruang
 * layout di MusikApp memakai predikat yang sama (`currentSong != null`).
 */
export function NowPlayingBar() {
  const { currentSong } = useMusic();
  const { queueOpen, toggleQueue } = useMusikUi();
  if (!currentSong) return null;
  const coverUrl = currentSong.coverImage?.link ?? null;
  const meta = songMeta(currentSong.genre, currentSong.tahunRilis);

  return (
    <section className={s.bar} aria-label={PLAYER_TEXT.barLabel}>
      {coverUrl && (
        // key = url: gambar baru dipasang ulang supaya animasi pudar 300ms berjalan saat lagu berganti.
        // eslint-disable-next-line @next/next/no-img-element -- latar dekoratif blur, bukan konten
        <img key={coverUrl} src={coverUrl} alt="" aria-hidden="true" className={s.art} />
      )}
      <span className={s.tint} aria-hidden="true" />
      <span className={s.mobileOnly}>
        <PlayerProgressLine />
      </span>

      <div className={s.inner}>
        <div className={s.left}>
          <span className={s.cover}>
            <TrackCover src={coverUrl} alt={`Sampul ${currentSong.judul}`} seed={currentSong.id} />
          </span>
          <div className={s.text}>
            <p className={s.title}>{currentSong.judul}</p>
            <p className={s.artist}>{currentSong.artis}</p>
            {!currentSong.audioFile?.link ? (
              <p className={s.meta}>{PLAYER_TEXT.noAudio}</p>
            ) : (
              meta && (
                <p className={s.meta}>
                  <IconDisc size={13} aria-hidden="true" />
                  <span>{meta}</span>
                </p>
              )
            )}
          </div>
        </div>

        <div className={s.center}>
          <PlayerControls />
          <PlayerProgress />
        </div>

        <div className={s.right}>
          <span className={s.mobileOnly}>
            <PlayPauseButton size={28} />
            <NextButton />
          </span>
          <button
            type="button"
            className={controls.btn}
            onClick={toggleQueue}
            aria-label={PLAYER_TEXT.queue}
            aria-pressed={queueOpen}
            data-active={queueOpen}
          >
            <IconPlaylist size={22} aria-hidden="true" />
          </button>
          <VolumeControl />
        </div>
      </div>
    </section>
  );
}
