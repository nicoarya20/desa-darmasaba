'use client';

import { Drawer } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Suspense, type ReactNode } from 'react';
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
  // Nilai awal false (SSR & render pertama), dibaca ulang setelah mount bersama status antrean.
  const isColumn = useMediaQuery(QUEUE_COLUMN_QUERY, false);
  const isSheet = useMediaQuery(QUEUE_SHEET_QUERY, false);
  const inColumn = queueOpen && isColumn;

  return (
    <div className={s.app} data-queue={inColumn ? 'true' : 'false'}>
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
      <Drawer.Root
        opened={queueOpen && !isColumn}
        onClose={closeQueue}
        position={isSheet ? 'bottom' : 'right'}
        size={isSheet ? '85dvh' : 'calc(var(--m-right-w) + 16px)'}
        className={s.tokens}
      >
        <Drawer.Overlay />
        <Drawer.Content
          className={isSheet ? `${s.drawerContent} ${s.drawerSheet}` : s.drawerContent}
          aria-label={T.queueLabel}
        >
          <Drawer.Body className={s.drawerBody}>
            <QueuePanel onClose={closeQueue} />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
      <NowPlayingBar />
    </div>
  );
}
