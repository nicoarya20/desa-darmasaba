import { Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconMessageChatbot, IconRefresh } from "@tabler/icons-react";
import { useId } from "react";
import { useSnapshot } from "valtio";
import classes from "./jenna.module.css";
import jennaState, { type JennaSendContext } from "./jenna.state";
import { JennaMessages } from "./JennaMessages";

interface Props {
  open: boolean;
  onCollapse: () => void;
  sendCtx: () => JennaSendContext;
}

/** Room percakapan Jenna: panel kaca yang terbuka dari chat bar (bar & composer milik JennaWidget). */
export function JennaRoom({ open, onCollapse, sendCtx }: Props) {
  const snap = useSnapshot(jennaState);
  const titleId = useId();

  return (
    // Selalu ter-mount agar animasi tutup berjalan; saat tertutup `inert` (tak bisa difokus/diklik) + aria-hidden.
    <section
      className={`${classes.glass} ${classes.room}`}
      data-open={open}
      aria-labelledby={titleId}
      aria-hidden={!open}
      inert={!open}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.stopPropagation();
        onCollapse();
      }}
    >
      <header className={classes.roomHeader}>
        <IconMessageChatbot size={24} stroke={1.75} className={classes.roomGlyph} aria-hidden="true" />
        <div className={classes.roomTitles}>
          <Text component="h2" id={titleId} className={classes.roomTitle} fz={15} fw={600} lh={1.25} truncate>
            {snap.assistantName}
          </Text>
          <Text className={classes.roomSubtitle} fz={12} lh={1.3} truncate>
            Asisten Desa Darmasaba
          </Text>
        </div>
        <UnstyledButton
          className={classes.roomIconBtn}
          aria-label="Mulai percakapan baru"
          disabled={snap.messages.length === 0}
          onClick={jennaState.reset}
        >
          <IconRefresh size={18} aria-hidden="true" />
        </UnstyledButton>
        <UnstyledButton className={classes.roomIconBtn} aria-label="Perkecil percakapan" onClick={onCollapse}>
          <IconChevronDown size={20} aria-hidden="true" />
        </UnstyledButton>
      </header>
      <JennaMessages
        messages={snap.messages}
        assistantName={snap.assistantName}
        sending={snap.sending}
        statusText={snap.statusText}
        onRetry={() => void jennaState.retry(sendCtx())}
      />
    </section>
  );
}
