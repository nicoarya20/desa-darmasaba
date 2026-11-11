/** Elemen minimal yang dibaca keputusan "boleh dibacakan" (memudahkan test tanpa DOM). */
export type SpeakableTarget = Pick<HTMLElement, "tagName" | "innerText" | "closest">;

/**
 * Teks yang dibacakan saat kursor berada di atas `target`, atau `null` bila tidak dibaca.
 * Tombol dan ikon dilewati supaya tombol aksi (termasuk tombol mode baca suara sendiri) tidak dibacakan.
 */
export function getSpeakableText(target: SpeakableTarget | null): string | null {
  if (!target || !target.innerText) return null;
  const tag = target.tagName.toUpperCase();
  if (tag === "BUTTON" || tag === "SVG" || target.closest("button")) return null;
  const text = target.innerText.trim();
  return text ? text : null;
}
