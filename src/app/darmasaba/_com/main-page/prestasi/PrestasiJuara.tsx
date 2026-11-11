import { Text } from "@mantine/core";

/** Capaian/peringkat di halaman detail prestasi; tidak dirender bila juara kosong. */
export function PrestasiJuara({ juara }: { juara?: string | null }) {
  const text = juara?.trim();
  if (!text) return null;
  return (
    <Text ta="center" fw={600} fz="1.15rem" c="dimmed" mt={4}>
      {text}
    </Text>
  );
}
