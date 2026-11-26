'use client'
import { useWindowScroll } from '@mantine/hooks';
import { ActionIcon, Transition } from '@mantine/core';
import { IconArrowUp } from '@tabler/icons-react';
import { useSnapshot } from 'valtio';
import offset from './jenna/jenna-dock-offset.module.css';
import scrollTop from './jenna/jenna-scroll-top.module.css';
import jennaState from './jenna/jenna.state';
import { usePageOverlayOpen } from './jenna/use-page-overlay-open';

/**
 * Tombol kembali ke atas. Jenna aktif: duduk tepat di atas chat bar (rata kanan dock, ikut offset bilah kontak) dan
 * menyingkir saat bar memanjang atau room terbuka. Jenna nonaktif: posisi lama kanan bawah 24px.
 * Kedua mode menyingkir selama overlay halaman terbuka (Modal/Drawer, flyout/cari navbar, menu ponsel).
 */
function ScrollToTopButton() {
  const [scroll, scrollTo] = useWindowScroll();
  const jenna = useSnapshot(jennaState);
  const docked = jenna.status === 'enabled';
  const overlayOpen = usePageOverlayOpen();
  const hidden = docked && (jenna.open || jenna.barExpanded || overlayOpen);

  return (
    <Transition
      mounted={scroll.y > 300 && (docked || !overlayOpen)}
      transition="slide-up"
      duration={300}
      timingFunction="ease"
    >
      {(styles) =>
        docked ? (
          <div style={styles} className={`${offset.dockOffset} ${scrollTop.scrollTop}`}>
            <ActionIcon
              className={scrollTop.scrollTopButton}
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
