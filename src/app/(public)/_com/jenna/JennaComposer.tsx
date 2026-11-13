import colors from "@/con/colors";
import { ActionIcon, Box, Button, Group, Text, Textarea } from "@mantine/core";
import { IconPlayerStopFilled, IconSend } from "@tabler/icons-react";
import { useState } from "react";
import classes from "./jenna.module.css";

interface Props {
  maxChars: number;
  sending: boolean;
  /** Nilai honeypot `website`, dipegang induk agar ikut terkirim dari chip saran & kirim ulang. */
  website: string;
  onWebsiteChange: (value: string) => void;
  onSend: (text: string) => void;
  onStop: () => void;
}

export function JennaComposer({ maxChars, sending, website, onWebsiteChange, onSend, onStop }: Props) {
  const [draft, setDraft] = useState("");
  const empty = draft.trim() === "";

  const submit = () => {
    if (empty || sending) return;
    onSend(draft.trim());
    setDraft("");
  };

  return (
    <Box
      component="form"
      p="sm"
      bg="white"
      style={{ borderTop: `1px solid ${colors.grey[2]}` }}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {/* Honeypot anti-bot: tak terlihat & tak terjangkau keyboard; manusia selalu mengirim kosong. */}
      <div className={classes.honeypot} aria-hidden="true">
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => onWebsiteChange(e.currentTarget.value)}
          />
        </label>
      </div>
      <Group gap="xs" align="flex-end" wrap="nowrap">
        <Textarea
          flex={1}
          autosize
          minRows={1}
          maxRows={5}
          radius="md"
          maxLength={maxChars}
          placeholder="Tulis pertanyaan Anda…"
          aria-label="Pertanyaan untuk Jenna"
          data-autofocus
          value={draft}
          onChange={(e) => setDraft(e.currentTarget.value)}
          onKeyDown={(e) => {
            // Enter kirim, Shift+Enter baris baru; Enter yang memilih kandidat IME diabaikan.
            if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
            e.preventDefault();
            submit();
          }}
        />
        {sending ? (
          <Button
            type="button"
            variant="light"
            color="red.8"
            radius="md"
            leftSection={<IconPlayerStopFilled size={14} />}
            onClick={onStop}
          >
            Berhenti
          </Button>
        ) : (
          <ActionIcon
            type="submit"
            size={36}
            radius="xl"
            variant="filled"
            color={colors["blue-button"]}
            aria-label="Kirim pertanyaan"
            disabled={empty}
          >
            <IconSend size={18} />
          </ActionIcon>
        )}
      </Group>
      <Text fz="xs" c={draft.length >= maxChars ? "red.8" : "gray.7"} ta="right" mt={4}>
        {draft.length}/{maxChars}
      </Text>
    </Box>
  );
}
