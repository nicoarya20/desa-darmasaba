import { Textarea } from "@mantine/core";
import { IconArrowUp, IconMicrophone, IconPlayerStopFilled } from "@tabler/icons-react";
import type { Ref } from "react";
import classes from "./jenna.module.css";
import bar from "./jenna-bar.module.css";
import { JENNA_INPUT_PLACEHOLDER, showCounter } from "./jenna-bar.logic";
import typing from "./jenna-typing.module.css";
import { JennaTypingPlaceholder } from "./JennaTypingPlaceholder";

interface Props {
  draft: string;
  onDraftChange: (value: string) => void;
  maxChars: number;
  sending: boolean;
  /** Bar diam (idle): contoh pertanyaan diketik bergantian; selain itu tampil petunjuk "Tanya Jenna…". */
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
  const blank = draft === "";

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
      <div className={bar.field} data-blank={blank}>
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
        {/* Placeholder asli selalu transparan (tetap dibaca pembaca layar); dua hiasan ini bergantian memudar. */}
        {blank && <JennaTypingPlaceholder active={rotate} />}
        {blank && (
          <span className={typing.hint} aria-hidden="true" data-show={!rotate}>
            {JENNA_INPUT_PLACEHOLDER}
          </span>
        )}
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
