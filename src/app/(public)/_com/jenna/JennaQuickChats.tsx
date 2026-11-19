import type { CSSProperties } from "react";
import classes from "./jenna.module.css";
import bar from "./jenna-bar.module.css";
import { JENNA_QUICK_CHATS } from "./jenna-bar.logic";

interface Props {
  onPick: (text: string) => void;
  disabled?: boolean;
}

/** Tiga pil pertanyaan cepat (kaca) di atas bar yang memanjang; muncul bertahap dari yang terdekat ke bar. */
export function JennaQuickChats({ onPick, disabled }: Props) {
  const last = JENNA_QUICK_CHATS.length - 1;
  return (
    <ul className={bar.quickList} aria-label="Pertanyaan cepat">
      {JENNA_QUICK_CHATS.map((text, i) => (
        <li key={text} style={{ display: "contents" }}>
          <button
            type="button"
            className={`${classes.glass} ${bar.quick}`}
            style={{ "--i": last - i } as CSSProperties}
            disabled={disabled}
            onClick={() => onPick(text)}
          >
            {text}
          </button>
        </li>
      ))}
    </ul>
  );
}
