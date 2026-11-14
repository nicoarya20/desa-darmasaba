"use client";

import { useMusic } from "@/app/context/MusicContext";
import colors from "@/con/colors";
import stateNav from "@/state/state-nav";
import { ActionIcon, Drawer, FocusTrap, Paper, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconMessageChatbot } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import { useSnapshot } from "valtio";
import classes from "./jenna.module.css";
import jennaState from "./jenna.state";
import { JennaPanel } from "./JennaPanel";

/** < breakpoint `sm` Mantine (48em): panel jadi Drawer bawah layar penuh. */
const MOBILE_QUERY = "(max-width: 47.99em)";
const PAGE_CONTEXT_MAX = 300;

/** Asisten Jenna publik: FAB kanan bawah + panel chat. Tidak dirender bila Jenna nonaktif/tidak siap. */
export default function JennaWidget() {
  const snap = useSnapshot(jennaState);
  const { mobileOpen } = useSnapshot(stateNav);
  const { currentSong } = useMusic();
  const isMobile = useMediaQuery(MOBILE_QUERY, false, { getInitialValueInEffect: false });
  const pathname = usePathname();
  const fabRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    void jennaState.loadStatus();
  }, []);

  if (snap.status !== "enabled") return null;

  // Status minimized FixedPlayerBar bersifat lokal; offset dinaikkan selama ada lagu (bar mungkin tampil).
  const playerBarVisible = !!currentSong;
  const getPageContext = () => ({
    route: pathname.slice(0, PAGE_CONTEXT_MAX),
    title: document.title.slice(0, PAGE_CONTEXT_MAX),
  });
  const close = () => {
    jennaState.open = false;
    requestAnimationFrame(() => fabRef.current?.focus());
  };

  return (
    <>
      {!snap.open && !mobileOpen && (
        <ActionIcon
          ref={fabRef}
          className={classes.fab}
          data-player={playerBarVisible}
          size={56}
          radius="xl"
          variant="filled"
          color={colors["blue-button"]}
          aria-label="Tanya Jenna"
          aria-haspopup="dialog"
          onClick={() => (jennaState.open = true)}
        >
          <IconMessageChatbot size={28} />
        </ActionIcon>
      )}

      {isMobile ? (
        <Drawer.Root opened={snap.open} onClose={close} position="bottom" size="100%">
          <Drawer.Overlay />
          <Drawer.Content>
            <Drawer.Body p={0} h="100%">
              <JennaPanel
                title={
                  <Drawer.Title style={{ fontSize: "var(--mantine-font-size-md)", fontWeight: 700 }}>
                    {snap.assistantName}
                  </Drawer.Title>
                }
                onClose={close}
                getPageContext={getPageContext}
              />
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Root>
      ) : (
        snap.open &&
        !mobileOpen && (
          <FocusTrap active>
            <Paper
              className={classes.panel}
              data-player={playerBarVisible}
              radius="lg"
              shadow="lg"
              role="dialog"
              aria-labelledby={titleId}
              onKeyDown={(e) => {
                if (e.key !== "Escape") return;
                e.stopPropagation();
                close();
              }}
            >
              <JennaPanel
                title={
                  <Text component="h2" id={titleId} fz="md" fw={700} m={0} truncate>
                    {snap.assistantName}
                  </Text>
                }
                onClose={close}
                getPageContext={getPageContext}
              />
            </Paper>
          </FocusTrap>
        )
      )}
    </>
  );
}
