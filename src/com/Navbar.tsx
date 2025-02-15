"use client";
import colors from "@/con/colors";
import navbarListMenu from "@/con/navbar-list-menu";
import stateNav from "@/state/state-nav";
import { Box, Burger, Group } from "@mantine/core";
import { useSnapshot } from "valtio";
import { NavbarMainMenu } from "./NavbarMainMenu";

export function Navbar() {
  const { item, isSearch } = useSnapshot(stateNav);
  return (
    <Box>
      <Box
        className="glass2"
        w={"100%"}
        pos={"fixed"}
        top={0}
        style={{
          zIndex: 100,
        }}
      >
        <NavbarMainMenu listNavbar={navbarListMenu} />
        <Group justify="end">
          <Box hiddenFrom="sm">
            <Burger color={colors["blue-button"]} />
          </Box>
        </Group>
      </Box>
      {(item || isSearch) && <Box className="glass" />}
    </Box>
  );
}
