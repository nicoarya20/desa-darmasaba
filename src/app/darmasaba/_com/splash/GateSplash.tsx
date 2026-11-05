"use client";

import images from "@/con/images";
import { Image } from "@mantine/core";
import { useLayoutEffect, useRef } from "react";
import { GATE_PATH_D, GATE_PATH_TRANSFORM, GATE_VIEWBOX } from "./gate-splash.path";
import { playGateSplash } from "./gate-splash.player";
import { readGateSplashState } from "./gate-splash.session";
import s from "./gate-splash.module.css";

const GATE_SHAPE_ID = "darmasaba-gate-shape";
const GATE_VIEWBOX_ATTR = `0 0 ${GATE_VIEWBOX.width} ${GATE_VIEWBOX.height}`;

const LABEL = {
  sub: "Pemerintah Desa",
  name: "DARMASABA",
  logoAlt: "Logo Desa Darmasaba",
} as const;

/** Dunia di atas air (cahaya, gerbang, tembok, lantai); dirender dua kali: asli + pantulan. */
function GateWorld() {
  return (
    <div className={s.world}>
      <div className={s.dawn} data-part="glow" />
      <div className={`${s.curtain} ${s.curtainL}`} data-part="curtain-l" />
      <div className={`${s.curtain} ${s.curtainR}`} data-part="curtain-r" />
      <div className={s.halo} data-part="glow" />
      <svg className={`${s.gate} ${s.gateL}`} data-part="gate-l" viewBox={GATE_VIEWBOX_ATTR} preserveAspectRatio="none">
        <use href={`#${GATE_SHAPE_ID}`} />
      </svg>
      <svg className={`${s.gate} ${s.gateR}`} data-part="gate-r" viewBox={GATE_VIEWBOX_ATTR} preserveAspectRatio="none">
        <use href={`#${GATE_SHAPE_ID}`} />
      </svg>
      <div className={`${s.wall} ${s.wallL}`} data-part="wall-l" />
      <div className={`${s.wall} ${s.wallR}`} data-part="wall-r" />
      <div className={s.floor} />
    </div>
  );
}

/**
 * Splash pembuka beranda: kamera menembus celah Candi Bentar menuju cahaya fajar.
 * Hanya tampil saat skrip <head> menandai "play" (lihat gate-splash.session.ts).
 */
export default function GateSplash() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Layout effect: putuskan & mulai sebelum paint, supaya tak ada frame splash yang "diam".
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || readGateSplashState() !== "play") return;
    return playGateSplash(root);
  }, []);

  return (
    <div ref={rootRef} className={s.root} aria-hidden="true">
      <div className={s.scene} data-part="scene">
        <div className={s.sky} />
        <GateWorld />
        <div className={s.water}>
          <div className={s.reflection} data-part="reflection">
            <GateWorld />
          </div>
          <div className={`${s.ripple} ${s.rippleA}`} data-part="ripple-a" />
          <div className={`${s.ripple} ${s.rippleB}`} data-part="ripple-b" />
        </div>
        <div className={s.brand} data-part="brand">
          {/* Lebar lewat prop `w` (inline) agar mengalahkan width:100% bawaan Mantine Image. */}
          <Image src={images["darmasaba-icon"]} alt={LABEL.logoAlt} w="calc(var(--gap) * 0.36)" h="auto" fit="contain" className={s.logo} />
          <div className={s.sub}>{LABEL.sub}</div>
          <div className={s.name}>{LABEL.name}</div>
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
