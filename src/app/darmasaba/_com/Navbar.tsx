"use client";
import colors from "@/con/colors";
import navbarListMenu from "@/con/navbar-list-menu";
import stateNav from "@/state/state-nav";
import { ActionIcon, Box, Burger, Group, Image, Stack, Text } from "@mantine/core";
import { IconSquareArrowRight } from "@tabler/icons-react";
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSnapshot } from "valtio";
import { MenuItem } from "../../../../types/menu-item";
import { NavbarMainMenu } from "./NavbarMainMenu";

export function Navbar() {
  const { item, isSearch, mobileOpen } = useSnapshot(stateNav);
  const router = useRouter()
  return (
    <Box>
      <Box
        className="glass2"
        w={"100%"}
        pos={"fixed"}
        top={0}
        style={{
          zIndex: 100,
          overflow: "scroll"
        }}
      >
        <NavbarMainMenu listNavbar={navbarListMenu} />
    
        <Stack hiddenFrom="sm" bg={colors.grey[2]}>
          <Group justify="space-between">
            <ActionIcon variant="transparent" onClick={() => {
              router.push("/darmasaba")
              stateNav.mobileOpen = false
            }}
              size={80} radius={"xl"}
            >
              <Image src="/darmasaba-icon.png" alt="Logo Desa" width={50} height={50} />
            </ActionIcon>
            <Burger onClick={() => stateNav.mobileOpen = !stateNav.mobileOpen} color={colors["blue-button"]} opened={mobileOpen} />
          </Group>
          {mobileOpen && <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.1 }}
            style={{
              height: "100vh",
              overflow: "scroll"
            }}
          >
            <NavbarMobile listNavbar={navbarListMenu} />
          </motion.div>}
        </Stack>

      </Box>
      {(item || isSearch) && <Box className="glass" />}
    </Box>
  );
}

function NavbarMobile({ listNavbar }: { listNavbar: MenuItem[] }) {
  const router = useRouter()
  return <Stack p={"md"} style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}>
    {listNavbar.map((item, k) => {
      return <Stack key={k}>
        <Group justify="space-between" onClick={() => {
          router.push(item.href)
          stateNav.mobileOpen = false
        }}>
          <Text c="dark.9"
            style={{ fontWeight: "bold" }}
          >{item.name}</Text>
          <IconSquareArrowRight />
        </Group>
        {item.children && <NavbarMobile listNavbar={item.children} />}
      </Stack>
    })}
  </Stack>
}
