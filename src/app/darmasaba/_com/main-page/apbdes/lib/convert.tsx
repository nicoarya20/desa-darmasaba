export default function parseJumlah(value: string): number {
  if (!value) return 0;

  const cleaned = value.toUpperCase().trim().replace(",", ".");
  const num = parseFloat(cleaned);

  if (cleaned.includes("T")) return num * 1_000_000_000_000;
  if (cleaned.includes("M")) return num * 1_000_000_000;
  if (cleaned.includes("JT")) return num * 1_000_000;
  if (cleaned.includes("K")) return num * 1_000;

  return num;
}
