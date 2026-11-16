import colors from "@/con/colors";
import { ActionIcon, Button, Group, ThemeIcon } from "@mantine/core";
import { IconMessageChatbot, IconRefresh, IconX } from "@tabler/icons-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import type { JennaPageContext } from "./jenna.api";
import classes from "./jenna.module.css";
import jennaState from "./jenna.state";
import voiceState, { bindVoiceContext } from "./jenna-voice.state";
import { JennaComposer } from "./JennaComposer";
import { JennaMessages } from "./JennaMessages";
import { JennaVoiceConsent } from "./JennaVoiceConsent";
import { JennaVoiceControls, JennaVoiceNotice } from "./JennaVoiceControls";
import { isVoiceSupported } from "./voice/voice-devices";
import { VOICE_COPY } from "./voice/voice-copy";

interface Props {
  /** Judul ber-id (Drawer.Title / h2) supaya dialog punya nama aksesibel. */
  title: ReactNode;
  onClose: () => void;
  getPageContext: () => JennaPageContext;
}

/** Isi panel chat (header, pesan, composer) — dipakai Paper desktop maupun Drawer mobile. */
export function JennaPanel({ title, onClose, getPageContext }: Props) {
  const snap = useSnapshot(jennaState);
  const voice = useSnapshot(voiceState);
  const [website, setWebsite] = useState("");
  // Panel hanya dirender di klien (setelah FAB diklik), jadi deteksi langsung aman tanpa efek.
  const [voiceSupported] = useState(() => isVoiceSupported());
  const ctx = () => ({ pageContext: getPageContext(), website });
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  // Mode suara membaca konteks terbaru tiap giliran; menutup panel mengakhiri sesi suara.
  useEffect(() => {
    bindVoiceContext(() => ctxRef.current());
    return () => {
      voiceState.shutdown();
      bindVoiceContext(null);
    };
  }, []);

  const voiceOn = voice.status !== "off";
  const canStartVoice = snap.voiceEnabled && voiceSupported && !voiceOn && !voice.consentOpen;

  return (
    <div className={classes.body}>
      <Group
        justify="space-between"
        wrap="nowrap"
        px="md"
        py="sm"
        bg="white"
        style={{ borderBottom: `1px solid ${colors.grey[2]}` }}
      >
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
          <ThemeIcon radius="xl" size="md" color={colors["blue-button"]} aria-hidden="true">
            <IconMessageChatbot size={18} />
          </ThemeIcon>
          {title}
        </Group>
        <Group gap={4} wrap="nowrap">
          <Button
            size="compact-sm"
            variant="subtle"
            color={colors["blue-button"]}
            leftSection={<IconRefresh size={14} />}
            disabled={snap.messages.length === 0}
            onClick={jennaState.reset}
          >
            Mulai baru
          </Button>
          <ActionIcon variant="subtle" color="gray.8" size="lg" aria-label="Tutup chat Jenna" onClick={onClose}>
            <IconX size={18} />
          </ActionIcon>
        </Group>
      </Group>
      <JennaMessages
        messages={snap.messages}
        assistantName={snap.assistantName}
        sending={snap.sending}
        statusText={snap.statusText}
        onRetry={() => void jennaState.retry(ctx())}
        onSuggest={(text) => void jennaState.send(text, ctx())}
      />
      {voice.notice && !voiceOn && <JennaVoiceNotice text={voice.notice} onClose={voiceState.dismissNotice} />}
      {voice.consentOpen && (
        <JennaVoiceConsent
          assistantName={snap.assistantName}
          onAccept={voiceState.acceptConsent}
          onDecline={voiceState.declineConsent}
        />
      )}
      {voice.status !== "off" ? (
        <JennaVoiceControls
          assistantName={snap.assistantName}
          status={voice.status}
          transcript={voice.transcript}
          micLevel={voice.micLevel}
          beat={voice.beat}
          beatAt={voice.beatAt}
          now={voice.now}
          onStop={voiceState.stop}
        />
      ) : (
        <JennaComposer
          maxChars={snap.maxInputChars}
          sending={snap.sending}
          website={website}
          onWebsiteChange={setWebsite}
          onSend={(text) => void jennaState.send(text, ctx())}
          onStop={jennaState.abort}
          voiceLabel={VOICE_COPY.start.replace("{name}", snap.assistantName)}
          onVoice={canStartVoice ? voiceState.requestStart : undefined}
        />
      )}
    </div>
  );
}
