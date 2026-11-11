import { Box } from "@mantine/core";
import GlobalSearch from "./globalSearch";

/**
 * Panel pencarian di dalam flyout navbar desktop.
 * Menutup panel ditangani flyout (klik overlay, Escape, atau tombol cari lagi).
 */
export function NavbarSearch() {
  return (
    <Box maw={680}>
      <GlobalSearch />
    </Box>
  );
}
