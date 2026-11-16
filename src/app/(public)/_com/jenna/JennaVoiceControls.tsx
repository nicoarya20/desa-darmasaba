import colors from "@/con/colors";
import { Box, Button, CloseButton, Group, Loader, Progress, Stack, Text } from "@mantine/core";
import { IconMicrophone, IconPlayerStopFilled } from "@tabler/icons-react";
import type { VoiceBeat, VoiceStatus } from "./voice/voice-logic";
import { VOICE_COPY } from "./voice/voice-copy";
import { formatClock, formatMinutesLeft, projectBeat, sessionSecondsLeft } from "./voice/voice-logic";

/** Pesan sesi suara yang baru berakhir / gagal dimulai (teks server ditampilkan apa adanya). */
export function JennaVoiceNotice({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <Group
      gap={4}
      px="sm"
      py={6}
      wrap="nowrap"
      align="flex-start"
      role="status"
      bg="var(--mantine-color-yellow-0)"
      style={{ borderTop: `1px solid ${colors.grey[2]}` }}
    >
      <Text fz="xs" c="gray.9" style={{ flex: 1 }}>
        {text}
      </Text>
      <CloseButton size="sm" aria-label={VOICE_COPY.dismiss} onClick={onClose} />
    </Group>
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

/** Pengganti composer selama sesi suara: status, level mic, sisa waktu, tombol Akhiri. */
export function JennaVoiceControls({ assistantName, status, transcript, micLevel, beat, beatAt, now, onStop }: Props) {
  const live = beat ? projectBeat(beat, (now - beatAt) / 1000) : null;
  const statusText = VOICE_COPY.status[status].replace("{name}", assistantName);

  return (
    <Box p="sm" bg="white" style={{ borderTop: `1px solid ${colors.grey[2]}` }}>
      <Group gap="sm" wrap="nowrap" align="center">
        <IconMicrophone
          size={20}
          color={status === "listening" ? colors["blue-button"] : "var(--mantine-color-gray-7)"}
          aria-hidden="true"
        />
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Group gap={6} wrap="nowrap">
            {status === "connecting" && <Loader size="xs" type="dots" color={colors["blue-button"]} aria-hidden="true" />}
            <Text fz="sm" fw={600} c="gray.9" aria-live="polite" truncate>
              {statusText}
            </Text>
          </Group>
          <Progress
            value={micLevel * 100}
            size="xs"
            radius="xl"
            color={colors["blue-button"]}
            aria-label={VOICE_COPY.micLevel}
            transitionDuration={80}
          />
          {live && (
            <Text fz="xs" c="gray.7">
              {VOICE_COPY.sessionLeft.replace("{waktu}", formatClock(sessionSecondsLeft(live)))} ·{" "}
              {VOICE_COPY.todayLeft.replace("{menit}", formatMinutesLeft(live.remainingTodaySeconds))}
            </Text>
          )}
        </Stack>
        <Button
          type="button"
          variant="light"
          color="red.8"
          radius="md"
          leftSection={<IconPlayerStopFilled size={14} />}
          aria-label={VOICE_COPY.stopLabel}
          onClick={onStop}
          style={{ flexShrink: 0 }}
        >
          {VOICE_COPY.stop}
        </Button>
      </Group>
      {transcript && (
        <Text fz="xs" fs="italic" c="gray.7" mt={4} lineClamp={2}>
          {transcript}
        </Text>
      )}
    </Box>
  );
}
