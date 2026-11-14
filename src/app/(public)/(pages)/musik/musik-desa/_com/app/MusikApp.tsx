'use client';

import { Drawer } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Suspense, type ReactNode } from 'react';
import { useMusic } from '@/app/context/MusicContext';
import { NowPlayingBar } from '../player/NowPlayingBar';
import { QueuePanel } from '../player/QueuePanel';
import { MUSIK_APP_TEXT as T } from './musik-nav.meta';
import { MusikNavPills, MusikSidebar } from './MusikSidebar';
import { MusikTopbar } from './MusikTopbar';
import { MusikUiProvider, QUEUE_COLUMN_QUERY, useMusikUi } from './musik-ui.context';
import s from './musik-app.module.css';

/** Di bawah ini antrean jadi lembar dari bawah; 1069–1279px jadi Drawer kanan. */
const QUEUE_SHEET_QUERY = '(max-width: 1068px)';

/** Aplikasi Musik Desa gaya TIDAL: sidebar kiri, konten tengah, panel Antrean kanan, bar pemutar bawah. */
export function MusikApp({ children }: { children: ReactNode }) {
  return (
    <MusikUiProvider>
      <MusikAppFrame>{children}</MusikAppFrame>
    </MusikUiProvider>
  );
}

/** Grid aplikasi; dipisah dari provider supaya bisa membaca `useMusikUi()`. */
export function MusikAppFrame({ children }: { children: ReactNode }) {
  const { queueOpen, closeQueue } = useMusikUi();
  // Predikat sama dengan NowPlayingBar (`currentSong != null`): bar belum dirender → tanpa ruang bar.
  const barOn = useMusic().currentSong != null;
  // Nilai awal false (SSR & render pertama), dibaca ulang setelah mount bersama status antrean.
  const isColumn = useMediaQuery(QUEUE_COLUMN_QUERY, false);
  const isSheet = useMediaQuery(QUEUE_SHEET_QUERY, false);
  const inColumn = queueOpen && isColumn;

  return (
    <div className={s.app} data-queue={inColumn ? 'true' : 'false'} data-bar={barOn ? 'on' : 'off'}>
      <MusikSidebar />
      <MusikNavPills />
      <div className={s.center}>
        <Suspense fallback={<div className={s.topbar} aria-hidden><div className={s.searchFallback} /></div>}>
          <MusikTopbar />
        </Suspense>
        <main className={s.main}>{children}</main>
      </div>
      {inColumn && (
        <aside className={s.right} aria-label={T.queueLabel}>
          <QueuePanel onClose={closeQueue} />
        </aside>
      )}
      <QueueDrawer opened={queueOpen && !isColumn} sheet={isSheet} onClose={closeQueue} />
      <NowPlayingBar />
    </div>
  );
}

type QueueDrawerProps = { opened: boolean; sheet: boolean; onClose: () => void };

/**
 * Antrean sebagai Drawer (<1280px): kanan, atau lembar bawah di ≤1068px. Kelas latar dipasang lewat
 * `classNames.content`, BUKAN `className` di Drawer.Content: Mantine meneruskan className itu juga ke
 * elemen `inner` (fixed selebar layar) sehingga latar menutupi overlay & seluruh halaman.
 */
export function QueueDrawer({ opened, sheet, onClose }: QueueDrawerProps) {
  return (
    <Drawer.Root
      opened={opened}
      onClose={onClose}
      position={sheet ? 'bottom' : 'right'}
      size={sheet ? '85dvh' : 'calc(var(--m-right-w) + 16px)'}
      className={s.tokens}
      classNames={{ content: sheet ? `${s.drawerContent} ${s.drawerSheet}` : s.drawerContent, body: s.drawerBody }}
    >
      <Drawer.Overlay />
      <Drawer.Content aria-label={T.queueLabel}>
        <Drawer.Body>
          <QueuePanel onClose={onClose} />
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
}
