'use client'
import { useWindowScroll } from '@mantine/hooks';
import { ActionIcon, Transition } from '@mantine/core';
import { IconArrowUp } from '@tabler/icons-react';
import { useSnapshot } from 'valtio';
import { useMusic } from '@/app/context/MusicContext';
import bar from './jenna/jenna-bar.module.css';
import jennaState from './jenna/jenna.state';

/**
 * Tombol kembali ke atas. Jenna aktif: duduk tepat di atas chat bar (rata kanan dock, ikut offset pemutar) dan
 * menyingkir saat bar memanjang atau room terbuka. Jenna nonaktif: posisi lama kanan bawah 24px.
 */
function ScrollToTopButton() {
  const [scroll, scrollTo] = useWindowScroll();
  const jenna = useSnapshot(jennaState);
  const { currentSong } = useMusic();
  const docked = jenna.status === 'enabled';
  const hidden = docked && (jenna.open || jenna.barExpanded);

  return (
    <Transition
      mounted={scroll.y > 300}
      transition="slide-up"
      duration={300}
      timingFunction="ease"
    >
      {(styles) =>
        docked ? (
          <div style={styles} className={`${bar.dockOffset} ${bar.scrollTop}`} data-player={!!currentSong}>
            <ActionIcon
              className={bar.scrollTopButton}
              data-hidden={hidden}
              size="xl"
              radius="xl"
              variant="filled"
              color="var(--c-brand-fill)"
              onClick={() => scrollTo({ y: 0 })}
              aria-label="Kembali ke atas"
            >
              <IconArrowUp size={20} />
            </ActionIcon>
          </div>
        ) : (
          <ActionIcon
            style={styles}
            size="xl"
            radius="xl"
            variant="filled"
            color="var(--c-brand-fill)" // terang = colors['blue-button']; gelap ikut token
            onClick={() => scrollTo({ y: 0 })}
            pos="fixed"
            bottom={24}
            right={24}
            aria-label="Kembali ke atas"
          >
            <IconArrowUp size={20} />
          </ActionIcon>
        )
      }
    </Transition>
  );
}
export default ScrollToTopButton
