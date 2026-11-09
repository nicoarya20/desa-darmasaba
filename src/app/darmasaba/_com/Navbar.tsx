"use client";
import navbarListMenu from "@/con/navbar-list-menu";
import { Box } from "@mantine/core";
import { NavbarMainMenu } from "./NavbarMainMenu";
import { NavbarMobile } from "./NavbarMobile";
import { visibleMenu } from "./navbar-menu.logic";

const visibleNavbarMenu = visibleMenu(navbarListMenu);

/** Navbar publik: versi desktop mulai 992px (md), versi mobile di bawahnya (termasuk iPad Mini). */
export function Navbar() {
  return (
    <Box>
      <Box visibleFrom="md">
        <NavbarMainMenu listNavbar={visibleNavbarMenu} />
      </Box>
      <Box hiddenFrom="md">
        <NavbarMobile listNavbar={visibleNavbarMenu} />
      </Box>
    </Box>
  );
}
