import { Box, Loader, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconMicrophone, IconRefresh } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import type { Snapshot } from "valtio";
import classes from "./jenna.module.css";
import { ABORTED_CODE, type JennaMessage, RETRYABLE_CODES } from "./jenna.state";
import { JennaLink, JennaMarkdown } from "./JennaMarkdown";

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

function ErrorMessage({ message, isLast, sending, onRetry }: { message: Snapshot<JennaMessage>; isLast: boolean; sending: boolean; onRetry: () => void }) {
  const secondsLeft = useSecondsLeft(message.retryAt);
  const retryable = isLast && RETRYABLE_CODES.has(message.errorCode ?? "");
  return (
    <Box className={classes.msgError}>
      <Text fz="sm">{message.text}</Text>
      {secondsLeft > 0 && (
        <Text fz="xs" className={classes.msgMeta} mt={4}>
          Silakan coba lagi dalam {secondsLeft} detik.
        </Text>
      )}
      {retryable && (
        <UnstyledButton className={classes.msgRetry} disabled={sending || secondsLeft > 0} onClick={onRetry}>
          <IconRefresh size={14} aria-hidden="true" />
          Kirim ulang
        </UnstyledButton>
      )}
    </Box>
  );
}

function AssistantMessage({ message, assistantName, statusText }: { message: Snapshot<JennaMessage>; assistantName: string; statusText: string | null }) {
  if (message.status === "streaming" && !message.text) {
    return (
      <div className={`${classes.msgAssistant} ${classes.msgPending}`} role="status">
        <Loader size="xs" type="dots" color="currentColor" />
        <Text fz="sm">{statusText ?? `${assistantName} sedang menyiapkan jawaban…`}</Text>
      </div>
    );
  }
  const stopped = message.status === "error" && message.errorCode === ABORTED_CODE;
  return (
    <Box className={classes.msgAssistant}>
      {message.text && <JennaMarkdown text={message.text} />}
      {message.status === "streaming" && <span className={classes.caret} aria-hidden="true" />}
      {stopped && (
        <Text fz="xs" className={classes.msgMeta} mt={message.text ? 4 : 0}>
          Dihentikan sebelum selesai.
        </Text>
      )}
      {message.status === "done" && !!message.sources?.length && (
        <Box mt={8}>
          <Text fz="xs" fw={600} className={classes.msgMeta}>
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
}

/** Daftar pesan di room kaca: pengunjung = pil kanan, Jenna = teks polos; gulir otomatis ke pesan terakhir. */
export function JennaMessages({ messages, assistantName, sending, statusText, onRetry }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];

  // scrollTop langsung (bukan scrollIntoView): room fixed, jadi jangan sampai halaman di belakangnya ikut tergulir.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, last?.text, statusText]);

  const announced =
    last?.role === "assistant" && last.status !== "streaming"
      ? last.errorCode === ABORTED_CODE
        ? "Jawaban dihentikan."
        : toSpokenText(last.text)
      : "";

  return (
    <div ref={scrollRef} className={classes.roomScroll}>
      <div className={classes.srOnly} aria-live="polite">
        {announced}
      </div>
      <div className={classes.roomList}>
        {messages.map((m, i) =>
          m.role === "user" ? (
            <Text key={m.id} fz="sm" className={classes.msgUser}>
              {m.modality === "voice" && (
                <IconMicrophone size={14} className={classes.voiceMark} aria-label="Diucapkan" role="img" />
              )}
              {m.text}
            </Text>
          ) : m.status === "error" && m.errorCode !== ABORTED_CODE ? (
            <ErrorMessage key={m.id} message={m} isLast={i === messages.length - 1} sending={sending} onRetry={onRetry} />
          ) : (
            <AssistantMessage key={m.id} message={m} assistantName={assistantName} statusText={statusText} />
          ),
        )}
      </div>
    </div>
  );
}
