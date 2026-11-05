"use client";
import navbarListMenu from "@/con/navbar-list-menu";
import { Box } from "@mantine/core";
import { NavbarMainMenu } from "./NavbarMainMenu";
import { NavbarMobile } from "./NavbarMobile";

/** Navbar publik: versi desktop mulai 992px (md), versi mobile di bawahnya (termasuk iPad Mini). */
export function Navbar() {
  return (
    <Box>
      <Box visibleFrom="md">
        <NavbarMainMenu listNavbar={navbarListMenu} />
      </Box>
      <Box hiddenFrom="md">
        <NavbarMobile listNavbar={navbarListMenu} />
      </Box>
    </Box>
  );
}
