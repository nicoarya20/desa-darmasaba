'use client';

import { IconX } from '@tabler/icons-react';
import { useId, useState, type KeyboardEvent } from 'react';
import { useMusic } from '@/app/context/MusicContext';
import { QueueRow } from './QueueRow';
import { PLAYER_TEXT } from './player.text';
import s from './queue-panel.module.css';

type Tab = 'queue' | 'recent';
const TABS: readonly Tab[] = ['queue', 'recent'];

/**
 * Panel kanan gaya TIDAL: tab Antrean (Sedang diputar + Berikutnya) | Baru diputar, tombol ×.
 * Tidak peduli wadahnya (kolom kanan atau Drawer); isi menggulir sendiri.
 */
export function QueuePanel({ onClose }: { onClose: () => void }) {
  const { currentSong, upNext, recentlyPlayed, playSong } = useMusic();
  const [tab, setTab] = useState<Tab>('queue');
  const baseId = useId();
  const tabId = (t: Tab) => `${baseId}-tab-${t}`;
  const panelId = (t: Tab) => `${baseId}-panel-${t}`;

  // Pola tablist WAI-ARIA: panah kiri/kanan pindah tab (tab nonaktif tidak ada di urutan Tab).
  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = TABS[(TABS.indexOf(tab) + step + TABS.length) % TABS.length];
    setTab(next);
    document.getElementById(tabId(next))?.focus();
  };

  const tabButton = (t: Tab, label: string) => (
    <button
      type="button"
      role="tab"
      id={tabId(t)}
      aria-selected={tab === t}
      aria-controls={panelId(t)}
      tabIndex={tab === t ? 0 : -1}
      className={s.tab}
      onClick={() => setTab(t)}
    >
      {label}
    </button>
  );

  return (
    <div className={s.panel}>
      <div className={s.head}>
        <div role="tablist" aria-label={PLAYER_TEXT.queue} className={s.tabs} onKeyDown={onTabKey}>
          {tabButton('queue', PLAYER_TEXT.tabQueue)}
          {tabButton('recent', PLAYER_TEXT.tabRecent)}
        </div>
        <button type="button" className={s.close} onClick={onClose} aria-label={PLAYER_TEXT.closeQueue}>
          <IconX size={18} aria-hidden="true" />
        </button>
      </div>

      <div role="tabpanel" id={panelId(tab)} aria-labelledby={tabId(tab)} className={s.body}>
        {tab === 'queue' ? (
          <>
            <h2 className={s.heading}>{PLAYER_TEXT.nowPlaying}</h2>
            {currentSong ? (
              <ul className={s.list}>
                <QueueRow song={currentSong} current onPlay={playSong} />
              </ul>
            ) : (
              <p className={s.empty}>{PLAYER_TEXT.nothingPlaying}</p>
            )}
            <h2 className={s.heading}>{PLAYER_TEXT.upNext}</h2>
            {upNext.length > 0 ? (
              <ul className={s.list}>
                {upNext.map((song) => (
                  <QueueRow key={song.id} song={song} onPlay={playSong} />
                ))}
              </ul>
            ) : (
              <p className={s.empty}>{PLAYER_TEXT.upNextEmpty}</p>
            )}
          </>
        ) : recentlyPlayed.length > 0 ? (
          <ul className={s.list}>
            {recentlyPlayed.map((song) => (
              <QueueRow key={song.id} song={song} current={song.id === currentSong?.id} onPlay={playSong} />
            ))}
          </ul>
        ) : (
          <p className={s.empty}>{PLAYER_TEXT.recentEmpty}</p>
        )}
      </div>
    </div>
  );
}
