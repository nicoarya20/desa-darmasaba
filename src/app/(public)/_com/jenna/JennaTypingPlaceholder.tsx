import { useReducedMotion } from "@mantine/hooks";
import { useEffect, useRef } from "react";
import { JENNA_QUICK_CHATS, typingFrame } from "./jenna-bar.logic";
import typing from "./jenna-typing.module.css";

/** Contoh pertanyaan diketik huruf demi huruf (hiasan aria-hidden). Satu timer, menulis satu text node lewat ref
    (tanpa render ulang React per huruf); berhenti saat tak aktif atau tab tersembunyi. Gerak dikurangi = teks pertama statis. */
export function JennaTypingPlaceholder({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = textRef.current;
    if (!node) return;
    if (reduce) {
      node.textContent = JENNA_QUICK_CHATS[0];
      return;
    }
    // Tak aktif: teks terakhir dibiarkan supaya ikut memudar; animasi mulai dari awal saat aktif lagi.
    if (!active) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let elapsed = 0;
    let startedAt = 0;
    const tick = () => {
      const frame = typingFrame(JENNA_QUICK_CHATS, elapsed + performance.now() - startedAt);
      if (node.textContent !== frame.text) node.textContent = frame.text;
      timer = setTimeout(tick, frame.nextIn);
    };
    const run = () => {
      startedAt = performance.now();
      tick();
    };
    const pause = () => {
      clearTimeout(timer);
      elapsed += performance.now() - startedAt;
    };
    const onVisibility = () => (document.hidden ? pause() : run());
    node.textContent = "";
    if (!document.hidden) run();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(timer);
    };
  }, [active, reduce]);

  return (
    <span ref={textRef} className={typing.typing} aria-hidden="true" data-show={active} />
  );
}
