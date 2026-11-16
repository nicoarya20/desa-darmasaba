import colors from "@/con/colors";
import { Box, Button, Group, Stack, Text } from "@mantine/core";
import { IconMicrophone } from "@tabler/icons-react";
import { useId } from "react";
import { VOICE_COPY } from "./voice/voice-copy";

interface Props {
  assistantName: string;
  onAccept: () => void;
  onDecline: () => void;
}

/** Persetujuan mikrofon sebelum sesi suara pertama di browser ini. */
export function JennaVoiceConsent({ assistantName, onAccept, onDecline }: Props) {
  const titleId = useId();
  return (
    <Box
      p="sm"
      bg="white"
      role="region"
      aria-labelledby={titleId}
      style={{ borderTop: `1px solid ${colors.grey[2]}` }}
    >
      <Stack gap="xs">
        <Group gap="xs" wrap="nowrap">
          <IconMicrophone size={16} color={colors["blue-button"]} aria-hidden="true" />
          <Text id={titleId} fz="sm" fw={700}>
            {VOICE_COPY.consent.title}
          </Text>
        </Group>
        <Text fz="xs" c="gray.8">
          {VOICE_COPY.consent.body.replace("{name}", assistantName)}
        </Text>
        <Group gap="xs" justify="flex-end" wrap="wrap">
          <Button size="xs" variant="subtle" color="gray.8" onClick={onDecline}>
            {VOICE_COPY.consent.decline}
          </Button>
          <Button size="xs" color={colors["blue-button"]} leftSection={<IconMicrophone size={14} />} onClick={onAccept} data-autofocus>
            {VOICE_COPY.consent.accept}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
