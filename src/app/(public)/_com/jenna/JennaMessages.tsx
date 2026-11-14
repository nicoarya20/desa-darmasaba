import colors from "@/con/colors";
import { Box, Button, Group, Loader, ScrollArea, Stack, Text } from "@mantine/core";
import { IconMicrophone, IconRefresh } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import type { Snapshot } from "valtio";
import classes from "./jenna.module.css";
import { ABORTED_CODE, type JennaMessage, RETRYABLE_CODES } from "./jenna.state";
import { JennaLink, JennaMarkdown } from "./JennaMarkdown";

export const JENNA_DISCLAIMER =
  "Jenna menjawab dari informasi resmi website Desa Darmasaba. Jangan kirim NIK, nomor KK, atau data pribadi.";

export const JENNA_SUGGESTIONS = [
  "Jam pelayanan kantor desa?",
  "Apa syarat membuat surat keterangan?",
  "Apa berita terbaru desa?",
  "Agenda desa bulan ini?",
];

/** Teks polos jawaban untuk diumumkan pembaca layar (tanpa sintaks markdown). */
export const toSpokenText = (text: string) =>
  text.replace(/\[([^\]\n]+)\]\([^()\s]+\)/g, "$1").replace(/[*`#]/g, "").trim();

function useSecondsLeft(until?: number) {
  const [now, setNow] = useState(() => Date.now());
  const active = !!until && until > now;
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return until ? Math.max(0, Math.ceil((until - now) / 1000)) : 0;
}

function ErrorBubble({ message, isLast, sending, onRetry }: { message: Snapshot<JennaMessage>; isLast: boolean; sending: boolean; onRetry: () => void }) {
  const secondsLeft = useSecondsLeft(message.retryAt);
  const retryable = isLast && RETRYABLE_CODES.has(message.errorCode ?? "");
  return (
    <Box className={classes.bubbleAssistant} style={{ borderColor: "var(--mantine-color-red-3)", background: "var(--mantine-color-red-0)" }}>
      <Text fz="sm" c="red.9">
        {message.text}
      </Text>
      {secondsLeft > 0 && (
        <Text fz="xs" c="gray.7" mt={4}>
          Silakan coba lagi dalam {secondsLeft} detik.
        </Text>
      )}
      {retryable && (
        <Button
          mt="xs"
          size="xs"
          variant="light"
          color="red.8"
          leftSection={<IconRefresh size={14} />}
          disabled={sending || secondsLeft > 0}
          onClick={onRetry}
        >
          Kirim ulang
        </Button>
      )}
    </Box>
  );
}

function AssistantBubble({ message, assistantName, statusText }: { message: Snapshot<JennaMessage>; assistantName: string; statusText: string | null }) {
  if (message.status === "streaming" && !message.text) {
    return (
      <Group gap="xs" className={classes.bubbleAssistant} role="status" wrap="nowrap">
        <Loader size="xs" type="dots" color={colors["blue-button"]} />
        <Text fz="sm" c="gray.7">
          {statusText ?? `${assistantName} sedang menyiapkan jawaban…`}
        </Text>
      </Group>
    );
  }
  const stopped = message.status === "error" && message.errorCode === ABORTED_CODE;
  return (
    <Box className={classes.bubbleAssistant}>
      {message.text && <JennaMarkdown text={message.text} />}
      {message.status === "streaming" && <span className={classes.caret} aria-hidden="true" />}
      {stopped && (
        <Text fz="xs" c="gray.7" mt={message.text ? 4 : 0}>
          Dihentikan sebelum selesai.
        </Text>
      )}
      {message.status === "done" && !!message.sources?.length && (
        <Box mt={6}>
          <Text fz="xs" fw={600} c="gray.7">
            Sumber
          </Text>
          <Stack component="ul" gap={2} m={0} pl="md">
            {message.sources.map((s) => (
              <Text component="li" key={s.url} fz="xs">
                <JennaLink href={s.url}>{s.title}</JennaLink>
              </Text>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

interface Props {
  messages: Snapshot<JennaMessage[]>;
  assistantName: string;
  sending: boolean;
  statusText: string | null;
  onRetry: () => void;
  onSuggest: (text: string) => void;
}

export function JennaMessages({ messages, assistantName, sending, statusText, onRetry, onSuggest }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, last?.text, statusText]);

  const announced =
    last?.role === "assistant" && last.status !== "streaming"
      ? last.errorCode === ABORTED_CODE
        ? "Jawaban dihentikan."
        : toSpokenText(last.text)
      : "";

  return (
    <Box style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div className={classes.srOnly} aria-live="polite">
        {announced}
      </div>
      {messages.length === 0 ? (
        <Stack gap="md" p="md" justify="flex-end" style={{ flex: 1 }}>
          <Text fz="sm" c="gray.8">
            {JENNA_DISCLAIMER}
          </Text>
          <Group gap="xs">
            {JENNA_SUGGESTIONS.map((s) => (
              <Button
                key={s}
                size="xs"
                radius="xl"
                variant="outline"
                color={colors["blue-button"]}
                bg="white"
                disabled={sending}
                onClick={() => onSuggest(s)}
              >
                {s}
              </Button>
            ))}
          </Group>
        </Stack>
      ) : (
        <ScrollArea style={{ flex: 1 }} type="auto" offsetScrollbars>
          <Stack gap="sm" p="md">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <Text key={m.id} fz="sm" className={classes.bubbleUser}>
                  {m.modality === "voice" && (
                    <IconMicrophone size={14} className={classes.voiceMark} aria-label="Diucapkan" role="img" />
                  )}
                  {m.text}
                </Text>
              ) : m.status === "error" && m.errorCode !== ABORTED_CODE ? (
                <ErrorBubble key={m.id} message={m} isLast={i === messages.length - 1} sending={sending} onRetry={onRetry} />
              ) : (
                <AssistantBubble key={m.id} message={m} assistantName={assistantName} statusText={statusText} />
              ),
            )}
            <div ref={endRef} />
          </Stack>
        </ScrollArea>
      )}
    </Box>
  );
}
