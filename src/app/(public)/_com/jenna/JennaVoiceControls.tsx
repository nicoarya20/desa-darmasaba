import { Button, CloseButton, Loader, Progress, Stack, Text } from "@mantine/core";
import { IconMicrophone, IconPlayerStopFilled } from "@tabler/icons-react";
import bar from "./jenna-bar.module.css";
import type { VoiceBeat, VoiceStatus } from "./voice/voice-logic";
import { VOICE_COPY } from "./voice/voice-copy";
import { formatClock, formatMinutesLeft, projectBeat, sessionSecondsLeft } from "./voice/voice-logic";

/** Pesan sesi suara yang baru berakhir / gagal dimulai (teks server ditampilkan apa adanya), di puncak kartu bar. */
export function JennaVoiceNotice({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className={bar.notice} role="status">
      <Text fz="xs" c="var(--jb-ink)" style={{ flex: 1, paddingTop: 3 }}>
        {text}
      </Text>
      <CloseButton size="sm" aria-label={VOICE_COPY.dismiss} onClick={onClose} />
    </div>
  );
}

interface Props {
  assistantName: string;
  status: Exclude<VoiceStatus, "off">;
  transcript: string;
  micLevel: number;
  beat: VoiceBeat | null;
  beatAt: number;
  now: number;
  onStop: () => void;
}

/** Pengganti isi pil selama sesi suara: status, level mic, sisa waktu, tombol Akhiri. */
export function JennaVoiceControls({ assistantName, status, transcript, micLevel, beat, beatAt, now, onStop }: Props) {
  const live = beat ? projectBeat(beat, (now - beatAt) / 1000) : null;
  const statusText = VOICE_COPY.status[status].replace("{name}", assistantName);

  return (
    <div className={bar.voiceRow}>
      <IconMicrophone
        size={20}
        color={status === "listening" ? "var(--c-brand)" : "var(--jb-muted)"}
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      />
      <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
        <Text component="div" fz="sm" fw={600} c="var(--jb-ink)" aria-live="polite" truncate>
          {status === "connecting" && (
            <Loader size="xs" type="dots" color="var(--c-brand)" aria-hidden="true" mr={6} display="inline-block" />
          )}
          {statusText}
        </Text>
        <Progress
          value={micLevel * 100}
          size="xs"
          radius="xl"
          color="var(--c-brand)"
          aria-label={VOICE_COPY.micLevel}
          transitionDuration={80}
        />
        {live && (
          <Text fz="xs" c="var(--jb-muted)">
            {VOICE_COPY.sessionLeft.replace("{waktu}", formatClock(sessionSecondsLeft(live)))} ·{" "}
            {VOICE_COPY.todayLeft.replace("{menit}", formatMinutesLeft(live.remainingTodaySeconds))}
          </Text>
        )}
        {transcript && (
          <Text fz="xs" fs="italic" c="var(--jb-muted)" lineClamp={2}>
            {transcript}
          </Text>
        )}
      </Stack>
      <Button
        type="button"
        variant="light"
        color="red.8"
        radius="xl"
        size="sm"
        leftSection={<IconPlayerStopFilled size={14} />}
        aria-label={VOICE_COPY.stopLabel}
        onClick={onStop}
        style={{ flexShrink: 0 }}
      >
        {VOICE_COPY.stop}
      </Button>
    </div>
  );
}
