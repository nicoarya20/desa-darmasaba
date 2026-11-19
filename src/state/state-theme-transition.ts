import { proxy } from "valtio"
import type { ThemeTarget } from "@/app/(public)/_com/theme-transition/theme-gate.timeline"

/**
 * Transisi tema Candi Bentar: tombol tema navbar (desktop & mobile) meminta, overlay di DarmasabaShell memutar.
 * `target` terisi = transisi sedang berjalan (kunci); `ready` = overlay sudah ter-mount (chunk-nya dimuat lazy).
 */
const stateThemeTransition = proxy<{ target: ThemeTarget | null; ready: boolean }>({ target: null, ready: false })

/** "animate" = overlay memutar & menukar tema; "direct" = pemanggil menukar tema sendiri; "busy" = ditolak. */
export type ThemeTransitionRequest = "animate" | "direct" | "busy"

/**
 * Minta transisi ke `target`. Ditolak selama transisi lain berjalan. Tanpa overlay (kurangi gerak, atau chunk
 * overlay belum/gagal dimuat) tema harus langsung ditukar pemanggil, supaya tombol tak pernah diam.
 */
export function requestThemeTransition(target: ThemeTarget, { reducedMotion }: { reducedMotion: boolean }): ThemeTransitionRequest {
  if (stateThemeTransition.target !== null) return "busy"
  if (reducedMotion || !stateThemeTransition.ready) return "direct"
  stateThemeTransition.target = target
  return "animate"
}

/** Overlay selesai (atau gagal setelah menukar tema): buka kunci. */
export function endThemeTransition() {
  stateThemeTransition.target = null
}

/** Overlay ter-mount / ter-unmount. */
export function setThemeTransitionReady(ready: boolean) {
  stateThemeTransition.ready = ready
}

export default stateThemeTransition
