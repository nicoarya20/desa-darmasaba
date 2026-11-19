import { Textarea } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { IconArrowUp, IconMicrophone, IconPlayerStopFilled } from "@tabler/icons-react";
import { type Ref, useEffect, useState } from "react";
import classes from "./jenna.module.css";
import bar from "./jenna-bar.module.css";
import {
  JENNA_INPUT_PLACEHOLDER,
  JENNA_QUICK_CHATS,
  nextPlaceholderIndex,
  PLACEHOLDER_ROTATE_MS,
  showCounter,
} from "./jenna-bar.logic";

interface Props {
  draft: string;
  onDraftChange: (value: string) => void;
  maxChars: number;
  sending: boolean;
  /** Bar diam (idle) dan draf kosong: placeholder bergilir menggantikan placeholder asli. */
  rotate: boolean;
  /** Nilai honeypot `website`, dipegang induk agar ikut terkirim dari quick chat & kirim ulang di room. */
  website: string;
  onWebsiteChange: (value: string) => void;
  onSend: (text: string) => void;
  onStop: () => void;
  onFocus: () => void;
  inputRef?: Ref<HTMLTextAreaElement>;
  /** Label tombol mikrofon; tombol hanya tampil bila `onVoice` ada. */
  voiceLabel?: string;
  onVoice?: () => void;
}

/** Teks contoh bergilir (hiasan aria-hidden) dengan crossfade; gerak dikurangi = teks pertama statis. */
function RotatingPlaceholder() {
  const reduce = useReducedMotion();
  const [rot, setRot] = useState<{ idx: number; prev: number | null }>({ idx: 0, prev: null });

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(
      () => setRot((r) => ({ idx: nextPlaceholderIndex(r.idx, JENNA_QUICK_CHATS.length), prev: r.idx })),
      PLACEHOLDER_ROTATE_MS,
    );
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <span className={bar.rotator} aria-hidden="true">
      {rot.prev !== null && (
        <span key={`out-${rot.prev}-${rot.idx}`} className={bar.rotatorItem} data-out="true">
          {JENNA_QUICK_CHATS[rot.prev]}
        </span>
      )}
      <span key={`in-${rot.idx}`} className={bar.rotatorItem}>
        {JENNA_QUICK_CHATS[rot.idx]}
      </span>
    </span>
  );
}

/** Isi pil chat bar: textarea autosize 1-4 baris, mikrofon (opsional), tombol kirim/berhenti bulat. */
export function JennaComposer({
  draft,
  onDraftChange,
  maxChars,
  sending,
  rotate,
  website,
  onWebsiteChange,
  onSend,
  onStop,
  onFocus,
  inputRef,
  voiceLabel,
  onVoice,
}: Props) {
  const empty = draft.trim() === "";
  const rotating = rotate && draft === "";

  const submit = () => {
    if (empty || sending) return;
    onSend(draft.trim());
  };

  return (
    <form
      className={bar.row}
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
      <div className={bar.field} data-rotating={rotating}>
        <Textarea
          ref={inputRef}
          variant="unstyled"
          classNames={{ input: bar.input }}
          autosize
          minRows={1}
          maxRows={4}
          maxLength={maxChars || undefined}
          placeholder={JENNA_INPUT_PLACEHOLDER}
          aria-label="Pertanyaan untuk Jenna"
          enterKeyHint="send"
          value={draft}
          onFocus={onFocus}
          onChange={(e) => onDraftChange(e.currentTarget.value)}
          onKeyDown={(e) => {
            // Enter kirim, Shift+Enter baris baru; Enter yang memilih kandidat IME diabaikan.
            if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
            e.preventDefault();
            submit();
          }}
        />
        {rotating && <RotatingPlaceholder />}
      </div>
      {showCounter(draft.length, maxChars) && (
        <span className={bar.counter} data-full={draft.length >= maxChars}>
          {draft.length}/{maxChars}
        </span>
      )}
      {onVoice && !sending && (
        <button
          type="button"
          className={`${bar.round} ${bar.mic}`}
          aria-label={voiceLabel}
          title={voiceLabel}
          onClick={onVoice}
        >
          <IconMicrophone size={19} stroke={1.8} />
        </button>
      )}
      {sending ? (
        <button
          type="button"
          className={`${bar.round} ${bar.send}`}
          data-stop="true"
          aria-label="Hentikan jawaban"
          title="Hentikan jawaban"
          onClick={onStop}
        >
          <IconPlayerStopFilled size={14} />
        </button>
      ) : (
        <button
          type="submit"
          className={`${bar.round} ${bar.send}`}
          data-ready={!empty}
          aria-label="Kirim pertanyaan"
          disabled={empty}
        >
          <IconArrowUp size={18} stroke={2.2} />
        </button>
      )}
    </form>
  );
}
