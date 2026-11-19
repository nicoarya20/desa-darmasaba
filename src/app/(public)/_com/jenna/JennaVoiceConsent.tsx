import { Button, Group, Stack, Text } from "@mantine/core";
import { IconMicrophone } from "@tabler/icons-react";
import { useId } from "react";
import bar from "./jenna-bar.module.css";
import { VOICE_COPY } from "./voice/voice-copy";

interface Props {
  assistantName: string;
  onAccept: () => void;
  onDecline: () => void;
}

/** Persetujuan mikrofon sebelum sesi suara pertama di browser ini, di puncak kartu bar. */
export function JennaVoiceConsent({ assistantName, onAccept, onDecline }: Props) {
  const titleId = useId();
  return (
    <div className={bar.consent} role="region" aria-labelledby={titleId}>
      <Stack gap="xs">
        <Group gap="xs" wrap="nowrap">
          <IconMicrophone size={16} color="var(--c-brand)" aria-hidden="true" />
          <Text id={titleId} fz="sm" fw={700} c="var(--jb-ink)">
            {VOICE_COPY.consent.title}
          </Text>
        </Group>
        <Text fz="xs" c="var(--jb-ink-2)">
          {VOICE_COPY.consent.body.replace("{name}", assistantName)}
        </Text>
        <Group gap="xs" justify="flex-end" wrap="wrap">
          <Button size="xs" radius="xl" variant="subtle" color="gray" c="var(--jb-ink-2)" onClick={onDecline}>
            {VOICE_COPY.consent.decline}
          </Button>
          <Button
            size="xs"
            radius="xl"
            color="var(--c-brand-fill)"
            leftSection={<IconMicrophone size={14} />}
            onClick={onAccept}
            data-autofocus
          >
            {VOICE_COPY.consent.accept}
          </Button>
        </Group>
      </Stack>
    </div>
  );
}
