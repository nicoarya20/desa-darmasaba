/** Inisial nama program sebagai pengganti logo yang tidak ada: 2 kata pertama, singkatan kapital ≤4 huruf utuh, atau 1 huruf. */
export function programInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";

  const firstLetter = (word: string) => (Array.from(word)[0] ?? "").toUpperCase();

  if (words.length >= 2) return firstLetter(words[0]) + firstLetter(words[1]);

  const [word] = words;
  // Singkatan yang memang ditulis kapital (PDKT, GM) dipertahankan utuh; kata biasa cukup huruf pertamanya.
  if (/^\p{Lu}{1,4}$/u.test(word)) return word;
  return firstLetter(word);
}
