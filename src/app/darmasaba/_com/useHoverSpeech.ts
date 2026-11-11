"use client";

import { useEffect } from "react";
import { useSnapshot } from "valtio";
import stateHoverSpeech from "@/state/state-hover-speech";
import { getSpeakableText } from "./hover-speech.logic";

/** Jeda sebelum membaca, memberi waktu kursor berpindah supaya tidak membaca setiap elemen yang dilewati. */
const SPEAK_DELAY_MS = 250;
/** Jeda sebelum menghentikan suara saat kursor keluar, supaya tidak terpotong kasar. */
const CANCEL_DELAY_MS = 150;

/**
 * Membacakan teks yang diarahkan kursor (di layar sentuh: yang diketuk) selama mode baca suara aktif.
 * Dipasang sekali di Navbar sehingga berlaku di semua halaman publik.
 */
export function useHoverSpeech() {
  const { active } = useSnapshot(stateHoverSpeech);

  useEffect(() => {
    if (!active || !("speechSynthesis" in window)) return;

    const root = document.body;
    const synth = window.speechSynthesis;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let lastText = "";

    const speak = (text: string) => {
      // Jangan baca ulang kalau teksnya sama.
      if (lastText === text) return;
      lastText = text;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      synth.speak(utterance);
    };

    const handleMouseOver = (event: MouseEvent) => {
      const text = getSpeakableText(event.target as HTMLElement | null);
      if (!text) return;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => speak(text), SPEAK_DELAY_MS);
    };

    const handleMouseOut = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        synth.cancel();
        lastText = "";
      }, CANCEL_DELAY_MS);
    };

    const previousCursor = root.style.cursor;
    root.style.cursor = "pointer";
    root.addEventListener("mouseover", handleMouseOver);
    root.addEventListener("mouseout", handleMouseOut);

    return () => {
      root.removeEventListener("mouseover", handleMouseOver);
      root.removeEventListener("mouseout", handleMouseOut);
      root.style.cursor = previousCursor;
      if (timeout) clearTimeout(timeout);
      synth.cancel();
    };
  }, [active]);
}
