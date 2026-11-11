"use client";

import { Tooltip } from "@mantine/core";
import { IconDisabled } from "@tabler/icons-react";
import { useSnapshot } from "valtio";
import stateHoverSpeech from "@/state/state-hover-speech";
import s from "./navbar.module.css";

export const SPEECH_LABEL_ON = "Matikan mode baca suara";
export const SPEECH_LABEL_OFF = "Aktifkan mode baca suara";

/** Tombol navbar (desktop & mobile) untuk menyalakan/mematikan mode baca suara aksesibilitas. */
export function NavbarSpeechToggle() {
  const { active } = useSnapshot(stateHoverSpeech);
  const label = active ? SPEECH_LABEL_ON : SPEECH_LABEL_OFF;

  return (
    <Tooltip label={label} position="bottom" withArrow>
      <button
        type="button"
        className={`${s.barItem} ${s.speechToggle}`}
        aria-label={label}
        aria-pressed={active}
        onClick={() => (stateHoverSpeech.active = !stateHoverSpeech.active)}
      >
        <span className={s.speechIcon}>
          <IconDisabled size={18} stroke={1.75} />
        </span>
      </button>
    </Tooltip>
  );
}
