"use client";
import { Box } from "@mantine/core";
import { NavbarMainMenu } from "./NavbarMainMenu";
import { NavbarMobile } from "./NavbarMobile";
import { useMenuVisibility } from "./MenuVisibilityContext";

/** Navbar publik: versi desktop mulai 992px (md), versi mobile di bawahnya (termasuk iPad Mini). */
export function Navbar() {
  // Menu efektif (default config + override DB) dari MenuVisibilityProvider di layout publik.
  const { navbarMenu } = useMenuVisibility();
  return (
    <Box>
      <Box visibleFrom="md">
        <NavbarMainMenu listNavbar={navbarMenu} />
      </Box>
      <Box hiddenFrom="md">
        <NavbarMobile listNavbar={navbarMenu} />
      </Box>
    </Box>
  );
}
