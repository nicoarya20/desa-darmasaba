"use client";

import { useMusic } from "@/app/context/MusicContext";
import stateNav from "@/state/state-nav";
import { usePathname } from "next/navigation";
import { type KeyboardEvent, type MouseEvent, type PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import { isMusikAppPath } from "../musik-route";
import bar from "./jenna-bar.module.css";
import { barMode, canCollapseToIdle, JENNA_DISCLAIMER } from "./jenna-bar.logic";
import jennaState, { type JennaSendContext } from "./jenna.state";
import voiceState, { bindVoiceContext } from "./jenna-voice.state";
import { JennaComposer } from "./JennaComposer";
import { JennaQuickChats } from "./JennaQuickChats";
import { JennaRoom } from "./JennaRoom";
import { JennaVoiceConsent } from "./JennaVoiceConsent";
import { JennaVoiceControls, JennaVoiceNotice } from "./JennaVoiceControls";
import { isVoiceSupported } from "./voice/voice-devices";
import { VOICE_COPY } from "./voice/voice-copy";

const PAGE_CONTEXT_MAX = 300;
/** Celah antara tepi atas kartu bar dan dasar room. */
const ROOM_GAP_PX = 10;
const INTERACTIVE = "button, a, input, textarea, select, [role='button']";

/** Asisten Jenna publik: chat bar pil kanan bawah + room percakapan. Tidak dirender bila Jenna nonaktif/tidak siap. */
export default function JennaWidget() {
  const snap = useSnapshot(jennaState);
  const voice = useSnapshot(voiceState);
  const { mobileOpen } = useSnapshot(stateNav);
  const { currentSong } = useMusic();
  const pathname = usePathname();
  const [draft, setDraft] = useState("");
  const [website, setWebsite] = useState("");
  // Widget hanya dirender di klien (dynamic ssr:false), jadi deteksi langsung aman tanpa efek.
  const [voiceSupported] = useState(() => isVoiceSupported());
  const dockRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  /** Fokus terprogram (setelah Escape/perkecil) tidak boleh membuka room lagi lewat onFocus. */
  const silentFocus = useRef(false);

  const ctxRef = useRef<() => JennaSendContext>(() => ({}));
  ctxRef.current = () => ({
    pageContext: {
      route: pathname.slice(0, PAGE_CONTEXT_MAX),
      title: document.title.slice(0, PAGE_CONTEXT_MAX),
    },
    website,
  });
  const sendCtx = useCallback(() => ctxRef.current(), []);

  useEffect(() => {
    void jennaState.loadStatus();
  }, []);

  // Mode suara membaca konteks terbaru tiap giliran; widget dilepas (keluar shell publik) mengakhiri sesi suara.
  useEffect(() => {
    bindVoiceContext(sendCtx);
    return () => {
      voiceState.shutdown();
      bindVoiceContext(null);
    };
  }, [sendCtx]);

  const voiceOn = voice.status !== "off";
  const voiceBusy = voiceOn || voice.consentOpen;
  const messageCount = snap.messages.length;
  const mode = barMode(snap.open, snap.barExpanded);

  // Jarak dasar dock → tepi atas kartu bar (+ celah) untuk posisi room; ikut tinggi bar (autosize, suara) & disclaimer.
  useEffect(() => {
    const dock = dockRef.current;
    const barEl = barRef.current;
    if (!dock || !barEl) return;
    const update = () => {
      const offset = dock.getBoundingClientRect().bottom - barEl.getBoundingClientRect().top + ROOM_GAP_PX;
      dock.style.setProperty("--jenna-room-bottom", `${Math.round(offset)}px`);
    };
    const ro = new ResizeObserver(update);
    ro.observe(dock);
    ro.observe(barEl);
    update();
    return () => ro.disconnect();
  }, [snap.status]);

  // "Mulai baru" (atau percakapan dikosongkan) menutup room; bar tetap memanjang dengan quick chat.
  useEffect(() => {
    if (jennaState.open && messageCount === 0) jennaState.open = false;
  }, [messageCount]);

  // Giliran suara baru tampil di room: buka room saat jumlah pesan bertambah selama sesi suara.
  const prevCount = useRef(messageCount);
  useEffect(() => {
    if (voiceOn && messageCount > prevCount.current) jennaState.open = true;
    prevCount.current = messageCount;
  }, [voiceOn, messageCount]);

  const collapse = useCallback(() => {
    jennaState.barExpanded = false;
    voiceState.dismissNotice();
  }, []);

  // Klik di luar dock saat bar memanjang tanpa room, draf kosong, dan suara mati → kembali idle.
  const collapsible = mode === "expanded" && canCollapseToIdle({ roomOpen: false, draft, voiceBusy });
  useEffect(() => {
    if (!collapsible) return;
    const onPointerDown = (e: PointerEvent) => {
      if (dockRef.current?.contains(e.target as Node)) return;
      collapse();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [collapsible, collapse]);

  if (snap.status !== "enabled") return null;

  const focusInput = () => {
    silentFocus.current = true;
    inputRef.current?.focus();
    silentFocus.current = false;
  };
  /** Fokus/klik bar: memanjang; bila sudah ada percakapan, room dibuka lagi. */
  const expand = () => {
    jennaState.barExpanded = true;
    if (!silentFocus.current && jennaState.messages.length > 0) jennaState.open = true;
  };
  /** Kirim lalu buka room; draf hanya dikosongkan bila yang dikirim memang draf (bukan quick chat). */
  const send = (text: string, fromDraft = false) => {
    const message = text.trim();
    if (!message || jennaState.sending) return;
    jennaState.barExpanded = true;
    jennaState.open = true;
    void jennaState.send(message, sendCtx());
    if (fromDraft) setDraft("");
  };
  const collapseRoom = () => {
    jennaState.open = false;
    jennaState.barExpanded = true;
    requestAnimationFrame(focusInput);
  };

  const onBarMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest(INTERACTIVE)) return;
    // Klik padding pil: arahkan ke textarea tanpa kehilangan fokus.
    e.preventDefault();
    expand();
    inputRef.current?.focus();
  };
  // Klik textarea yang sudah terfokus (mis. setelah Escape) tidak memicu onFocus: buka lagi lewat pointerup.
  const onTextareaPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.target === inputRef.current) expand();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Escape") return;
    if (voice.consentOpen) voiceState.declineConsent();
    else if (jennaState.open) jennaState.open = false;
    else if (jennaState.barExpanded && !voiceOn) collapse();
    else return;
    e.stopPropagation();
    focusInput();
  };

  const canStartVoice = snap.voiceEnabled && voiceSupported && !voiceBusy;
  const hidden = mobileOpen;

  return (
    <div
      ref={dockRef}
      className={`${bar.dockOffset} ${bar.dock}`}
      data-mode={mode}
      data-player={!!currentSong}
      data-musik={isMusikAppPath(pathname)}
      data-hidden={hidden}
      inert={hidden}
      onKeyDown={onKeyDown}
    >
      <JennaRoom open={snap.open && !hidden} onCollapse={collapseRoom} sendCtx={sendCtx} />
      {mode === "expanded" && !voiceBusy && <JennaQuickChats onPick={send} disabled={snap.sending} />}
      <div ref={barRef} className={bar.bar} onMouseDown={onBarMouseDown} onPointerUp={onTextareaPointer}>
        {voice.notice && !voiceOn && mode !== "idle" && (
          <JennaVoiceNotice text={voice.notice} onClose={voiceState.dismissNotice} />
        )}
        {voice.consentOpen && (
          <JennaVoiceConsent
            assistantName={snap.assistantName}
            onAccept={voiceState.acceptConsent}
            onDecline={voiceState.declineConsent}
          />
        )}
        {voiceOn ? (
          <JennaVoiceControls
            assistantName={snap.assistantName}
            status={voice.status as Exclude<typeof voice.status, "off">}
            transcript={voice.transcript}
            micLevel={voice.micLevel}
            beat={voice.beat}
            beatAt={voice.beatAt}
            now={voice.now}
            onStop={voiceState.stop}
          />
        ) : (
          <JennaComposer
            draft={draft}
            onDraftChange={(value) => {
              setDraft(value);
              jennaState.barExpanded = true;
            }}
            maxChars={snap.maxInputChars}
            sending={snap.sending}
            rotate={mode === "idle"}
            website={website}
            onWebsiteChange={setWebsite}
            onSend={(text) => send(text, true)}
            onStop={jennaState.abort}
            onFocus={expand}
            inputRef={inputRef}
            voiceLabel={VOICE_COPY.start.replace("{name}", snap.assistantName)}
            onVoice={mode !== "idle" && canStartVoice ? voiceState.requestStart : undefined}
          />
        )}
      </div>
      <div className={bar.disclaimerWrap} aria-hidden={mode === "idle"}>
        <div className={bar.disclaimerInner}>
          <p className={bar.disclaimer}>{JENNA_DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
}
