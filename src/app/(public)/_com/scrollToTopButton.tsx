'use client'
import { useWindowScroll } from '@mantine/hooks';
import { ActionIcon, Transition } from '@mantine/core';
import { IconArrowUp } from '@tabler/icons-react';
import colors from '@/con/colors';

function ScrollToTopButton() {
  const [scroll, scrollTo] = useWindowScroll();

  return (
    <Transition
      mounted={scroll.y > 300}
      transition="slide-up"
      duration={300}
      timingFunction="ease"
    >
      {(styles) => (
        <ActionIcon
          style={styles}
          size="xl"
          radius="xl"
          variant="filled"
          color={colors['blue-button']}
          onClick={() => scrollTo({ y: 0 })}
          pos="fixed"
          bottom={24}
          right={24}
          aria-label="Kembali ke atas"
        >
          <IconArrowUp size={20} />
        </ActionIcon>
      )}
    </Transition>
  );
}
export default ScrollToTopButton