"use client";

import { LOGO_DESA_LARGE_SRC } from "@/app/(public)/_com/logo-desa.meta";
import stateThemeTransition, { endThemeTransition, setThemeTransitionReady } from "@/state/state-theme-transition";
import { Image, useMantineColorScheme } from "@mantine/core";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import { GATE_PATH_D, GATE_PATH_TRANSFORM, GATE_VIEWBOX } from "../splash/gate-splash.path";
import art from "./theme-gate-scene.module.css";
import s from "./theme-gate.module.css";
import { playThemeGate } from "./theme-gate.player";
import { sceneFor } from "./theme-gate.timeline";

/** Beda dengan id siluet splash: keduanya bisa ada di DOM beranda sekaligus. */
const GATE_SHAPE_ID = "darmasaba-theme-gate-shape";
const GATE_VIEWBOX_ATTR = `0 0 ${GATE_VIEWBOX.width} ${GATE_VIEWBOX.height}`;

const LABEL = {
  sub: "Pemerintah Desa",
  name: "DARMASABA",
} as const;

function GateShape({ className }: { className: string }) {
  return (
    <svg className={className} viewBox={GATE_VIEWBOX_ATTR} preserveAspectRatio="none">
      <use href={`#${GATE_SHAPE_ID}`} />
    </svg>
  );
}

/** Gerbang + tembok satu sisi: satu kelompok yang meluncur masuk (satu layer, tak ada celah di sambungan). */
function GateSide({ side }: { side: "l" | "r" }) {
  return (
    <div className={`${s.side} ${side === "l" ? s.sideL : s.sideR}`} data-part={`side-${side}`}>
      {/* Yang dianimasikan <div> pembungkus, bukan <svg>: transform pada <svg> berjalan di main thread. */}
      <div className={s.gate} data-part={`gate-${side}`}>
        <GateShape className={s.gateShape} />
        {/* Garis tepi di layer sendiri agar opacity-nya dianimasikan di compositor. */}
        <div className={s.gateRim} data-part="rim">
          <GateShape className={s.gateShape} />
        </div>
      </div>
      <div className={s.wall} data-part={`wall wall-${side}`} />
    </div>
  );
}

/**
 * Dunia di atas air; dirender dua kali (asli + pantulan). Latar hanya ditandai "backdrop" di dunia asli:
 * salinan di pantulan ikut pudar lewat air.
 */
function GateWorld({ reflected }: { reflected: boolean }) {
  const backdrop = reflected ? undefined : "backdrop";
  return (
    <div className={s.world}>
      <div className={s.glow} data-part={reflected ? "glow" : "glow backdrop"} />
      <div className={s.halo} data-part={backdrop} />
      {/* Geometri & seni bulan/bintang milik modul seni (seni di ::before), jadi elemennya bebas dipudarkan. */}
      <div className={art.moon} data-part={backdrop} />
      <div className={art.stars} data-part={backdrop} />
      <GateSide side="l" />
      <GateSide side="r" />
      <div className={s.floor} data-part={backdrop} />
    </div>
  );
}

/**
 * Overlay transisi tema: gerbang Candi Bentar menutup halaman, tema ditukar di balik langit, lalu kamera
 * menembus celah ke halaman bertema baru. Ter-mount sekali di DarmasabaShell; tersembunyi saat tak dipakai.
 */
export default function ThemeGateTransition() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { target } = useSnapshot(stateThemeTransition);
  const { setColorScheme } = useMantineColorScheme();
  // setColorScheme Mantine berganti identitas tiap render (termasuk setelah tema ditukar di tengah transisi);
  // lewat ref supaya efek pemutar tak dijalankan ulang.
  const setSchemeRef = useRef(setColorScheme);
  useEffect(() => {
    setSchemeRef.current = setColorScheme;
  });

  useEffect(() => {
    setThemeTransitionReady(true);
    return () => setThemeTransitionReady(false);
  }, []);

  // Layout effect: overlay sudah tampil (data-playing) dan terukur sebelum paint pertama.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !target) return;
    return playThemeGate(root, { onSwap: () => setSchemeRef.current(target), onDone: endThemeTransition });
  }, [target]);

  return (
    <div
      ref={rootRef}
      className={`${s.root} ${art.scene}`}
      data-scene={sceneFor(target ?? "light")}
      data-playing={target ? "" : undefined}
      aria-hidden="true"
    >
      <div className={s.scene} data-part="scene">
        <div className={s.sky} data-part="sky" />
        <GateWorld reflected={false} />
        <div className={s.water} data-part="backdrop">
          <div className={s.reflection} data-part="reflection">
            <GateWorld reflected />
          </div>
          <div className={`${s.ripple} ${s.rippleA}`} data-part="ripple-a" />
          <div className={`${s.ripple} ${s.rippleB}`} data-part="ripple-b" />
        </div>
        <div className={s.brand} data-part="brand">
          {/* Lebar lewat prop `w` (inline) agar mengalahkan width:100% bawaan Mantine Image. */}
          <Image src={LOGO_DESA_LARGE_SRC} alt="" w="calc(var(--gap) * 0.36)" h="auto" fit="contain" className={s.logo} />
          <div className={s.brandSub}>{LABEL.sub}</div>
          <div className={s.brandName}>{LABEL.name}</div>
        </div>
      </div>
      <div className={s.flash} data-part="flash" />
      <svg className={s.defs} width="0" height="0" aria-hidden="true">
        <defs>
          <g id={GATE_SHAPE_ID} transform={GATE_PATH_TRANSFORM}>
            <path d={GATE_PATH_D} strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
          </g>
        </defs>
      </svg>
    </div>
  );
}
